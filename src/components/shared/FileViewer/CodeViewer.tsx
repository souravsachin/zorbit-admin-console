/* CodeViewer — highlight.js-powered read-only code render.
 *
 * Lazy-loads highlight.js only when a code file is actually rendered,
 * so the initial bundle stays slim.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import type { RendererProps } from './types';

let hljsLoader: Promise<any> | null = null;
function loadHljs(): Promise<any> {
  if (!hljsLoader) {
    hljsLoader = import('highlight.js').then((m: any) => m.default ?? m);
  }
  return hljsLoader;
}

export const CodeViewer: React.FC<RendererProps> = ({ text, language }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hljs = await loadHljs();
      let rendered: string;
      try {
        if (language && hljs.getLanguage(language)) {
          rendered = hljs.highlight(text ?? '', { language }).value;
        } else {
          rendered = hljs.highlightAuto(text ?? '').value;
        }
      } catch {
        rendered = escapeHtml(text ?? '');
      }
      if (!cancelled) setHtml(rendered);
    })();
    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return (
    <pre className="fv-code hljs bg-gray-900 rounded border border-gray-700 p-4 overflow-auto text-xs leading-5">
      <code
        className={`hljs ${language ?? ''}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
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

export default CodeViewer;
