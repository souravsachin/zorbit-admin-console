/* DocxViewer — docx-preview-powered read-only DOCX rendering.
 *
 * docx-preview is lazy-loaded only when a DOCX actually needs rendering.
 * Phase 1: plain render-to-HTML. No page break / header styling tweaks
 * beyond the library defaults.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import type { RendererProps } from './types';

let docxLoader: Promise<any> | null = null;
function loadDocx(): Promise<any> {
  if (!docxLoader) {
    docxLoader = import('docx-preview');
  }
  return docxLoader;
}

export const DocxViewer: React.FC<RendererProps> = ({ blob, filename }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!blob || !containerRef.current) return;
        const docx: any = await loadDocx();
        containerRef.current.innerHTML = '';
        await docx.renderAsync(blob, containerRef.current, null, {
          className: 'fv-docx-doc',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
        });
        if (cancelled) return;
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[FileViewer] docx render error:', err);
        setError(err?.message ?? String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blob]);

  return (
    <div className="fv-docx bg-gray-100 rounded border border-gray-200 p-4 overflow-auto">
      {error ? (
        <div className="text-sm text-red-600 p-3 bg-red-50 rounded">
          Failed to render DOCX: {error}
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-600 mb-2">{filename}</div>
          <div ref={containerRef} />
        </>
      )}
    </div>
  );
};

export default DocxViewer;
