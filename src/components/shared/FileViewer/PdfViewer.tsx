/* PdfViewer — pdf.js-powered multi-page render.
 *
 * pdf.js is lazy-loaded so it doesn't bloat the initial bundle. Each
 * page is rendered to its own <canvas>. Phase 1 is a simple
 * scroll-all-pages view; Phase 2 can add page navigation, zoom,
 * text-layer selection, and PDF redaction.
 *
 * NOTE: pdf.js needs a worker script; for Vite we inline it via the
 * `?url` import and wire it into GlobalWorkerOptions.workerSrc.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import type { RendererProps } from './types';

let pdfjsLoader: Promise<any> | null = null;
async function loadPdfjs(): Promise<any> {
  if (!pdfjsLoader) {
    pdfjsLoader = (async () => {
      const pdfjs: any = await import('pdfjs-dist');
      // Vite-specific worker URL import — resolved at build-time.
      const worker: any = await import(
        /* @vite-ignore */ 'pdfjs-dist/build/pdf.worker.min.mjs?url'
      );
      pdfjs.GlobalWorkerOptions.workerSrc = worker?.default ?? worker;
      return pdfjs;
    })();
  }
  return pdfjsLoader;
}

export const PdfViewer: React.FC<RendererProps> = ({ blob, filename }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPages, setLoadedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!blob) return;
        const pdfjs = await loadPdfjs();
        const arrayBuf = await blob.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuf }).promise;
        if (cancelled) return;
        setTotalPages(pdf.numPages);
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className =
            'fv-pdf-page shadow-md bg-white mb-4 max-w-full h-auto';
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          container.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport }).promise;
          setLoadedPages(pageNum);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[FileViewer] pdf render error:', err);
        setError(err?.message ?? String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blob]);

  return (
    <div className="fv-pdf bg-gray-100 rounded border border-gray-200 p-4 overflow-auto">
      {error ? (
        <div className="text-sm text-red-600 p-3 bg-red-50 rounded">
          Failed to render PDF: {error}
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-600 mb-2">
            {filename} — {loadedPages}/{totalPages || '?'} pages rendered
          </div>
          <div ref={containerRef} className="flex flex-col items-center" />
        </>
      )}
    </div>
  );
};

export default PdfViewer;
