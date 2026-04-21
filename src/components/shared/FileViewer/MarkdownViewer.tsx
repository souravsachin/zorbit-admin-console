/* MarkdownViewer — renders Markdown with mermaid diagrams + auto-TOC.
 *
 * Ported from OZ Peek (md-viewer) v2.0.0 but trimmed:
 *  - no editor / split-pane (Phase 2)
 *  - mermaid is lazy-loaded on demand
 *  - highlight.js is lazy-loaded on demand
 *  - PII masking runs on raw text before `marked` renders it
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import type { RendererProps } from './types';
import { maskMarkdown } from './piiMasker';

/** Lazy-load highlight.js on first use so the initial bundle stays slim. */
let hljsLoader: Promise<any> | null = null;
function loadHljs(): Promise<any> {
  if (!hljsLoader) {
    hljsLoader = import('highlight.js').then((m: any) => m.default ?? m);
  }
  return hljsLoader;
}

/** Lazy-load mermaid on first use. */
let mermaidLoader: Promise<any> | null = null;
function loadMermaid(): Promise<any> {
  if (!mermaidLoader) {
    mermaidLoader = import('mermaid').then((m: any) => m.default ?? m);
  }
  return mermaidLoader;
}

export const MarkdownViewer: React.FC<RendererProps> = ({ text, pii }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>('');

  const prepped = useMemo(
    () => maskMarkdown(text ?? '', pii?.applyRedactionRules, pii?.maskChar),
    [text, pii?.applyRedactionRules, pii?.maskChar],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hljs = await loadHljs();
      marked.setOptions({
        gfm: true,
        breaks: false,
      });
      // marked v12 uses `renderer.code({ text, lang })` shape.
      const renderer = new marked.Renderer();
      (renderer as any).code = ({ text: codeText, lang }: { text: string; lang?: string }) => {
        if (lang === 'mermaid') {
          return `<div class="mermaid">${escapeHtml(codeText)}</div>`;
        }
        let highlighted = escapeHtml(codeText);
        if (lang && hljs.getLanguage(lang)) {
          try {
            highlighted = hljs.highlight(codeText, { language: lang }).value;
          } catch {
            /* fall through */
          }
        } else {
          try {
            highlighted = hljs.highlightAuto(codeText).value;
          } catch {
            /* fall through */
          }
        }
        return `<pre class="fv-code hljs"><code class="hljs ${lang ?? ''}">${highlighted}</code></pre>`;
      };
      const rendered = await marked.parse(prepped, { renderer });
      if (cancelled) return;
      setHtml(rendered as string);
    })();
    return () => {
      cancelled = true;
    };
  }, [prepped]);

  // After HTML updates, run mermaid over any .mermaid blocks.
  useEffect(() => {
    if (!containerRef.current) return;
    const mermaidEls = containerRef.current.querySelectorAll('.mermaid');
    if (mermaidEls.length === 0) return;
    (async () => {
      const mermaid = await loadMermaid();
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      try {
        await mermaid.run({ nodes: Array.from(mermaidEls) as HTMLElement[] });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[FileViewer] mermaid render error:', err);
      }
    })();
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="fv-markdown prose prose-sm max-w-none bg-white p-6 rounded border border-gray-200 overflow-auto"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default MarkdownViewer;
