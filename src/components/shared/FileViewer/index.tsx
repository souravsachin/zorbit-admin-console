/* FileViewer — the cross-module exported component.
 *
 *   <FileViewer source={{ beRoute: "...", format: "pdf" }} />
 *
 * Registered in componentRegistry.ts as `zorbit-pfs-file_viewer:FileViewer`.
 * Any module can declare it in a manifest nav item:
 *
 *   {
 *     "feComponent": "zorbit-pfs-file_viewer:FileViewer",
 *     "feProps": {
 *       "source": { "beRoute": "/api/.../policy.pdf" },
 *       "audit": { "eventType": "hi_retail_quotation.policy.viewed" },
 *       "pii": { "applyRedactionRules": ["customer.phone"] }
 *     }
 *   }
 *
 * Responsibilities:
 *   - Fetch the bytes via the shared axios instance (JWT auto-attached)
 *   - Detect the format (props.format > Content-Type > URL extension)
 *   - Route to the appropriate lazy-loaded renderer
 *   - Emit audit events on first successful render
 *   - Provide download/print toolbar
 *
 * Phase 1: always read-only; editing is Phase 2.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  Download,
  Loader2,
  Printer,
} from 'lucide-react';
import api from '../../../services/api';
import type { FileFormat, FileViewerProps, RendererProps } from './types';
import {
  detectFormatFromMime,
  detectFormatFromUrl,
  detectLanguageFromUrl,
} from './detectFormat';

// Lazy-load every renderer so the initial SPA bundle stays slim. Each
// renderer internally further lazy-loads heavy deps (pdfjs, docx-preview,
// sql.js, highlight.js, mermaid) only when it actually mounts.
const MarkdownViewer = React.lazy(() => import('./MarkdownViewer'));
const CsvViewer = React.lazy(() => import('./CsvViewer'));
const JsonViewer = React.lazy(() => import('./JsonViewer'));
const CodeViewer = React.lazy(() => import('./CodeViewer'));
const ImageViewer = React.lazy(() => import('./ImageViewer'));
const AudioViewer = React.lazy(() => import('./AudioViewer'));
const VideoViewer = React.lazy(() => import('./VideoViewer'));
const PdfViewer = React.lazy(() => import('./PdfViewer'));
const DocxViewer = React.lazy(() => import('./DocxViewer'));
const SqliteViewer = React.lazy(() => import('./SqliteViewer'));

const TEXT_FORMATS: FileFormat[] = ['markdown', 'html', 'json', 'csv', 'tsv', 'code', 'text'];

interface FetchedBytes {
  mimeType: string;
  filename: string;
  blob: Blob;
  text?: string;
  objectUrl?: string;
  format: FileFormat;
  language?: string;
}

export const FileViewer: React.FC<FileViewerProps> = (props) => {
  const { source, toolbar, pii, audit, pageId, readOnly = true } = props;
  const [state, setState] = useState<{
    status: 'loading' | 'loaded' | 'error';
    error?: string;
    data?: FetchedBytes;
  }>({ status: 'loading' });
  const auditFiredRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  // --- Fetch + detect -------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let localObjectUrl: string | null = null;
    startedAtRef.current = Date.now();

    (async () => {
      try {
        setState({ status: 'loading' });
        auditFiredRef.current = false;

        const resp = await api.get(source.beRoute, {
          responseType: 'blob',
          // Let the browser figure out caching; this is a one-off fetch.
        });
        if (cancelled) return;

        const mimeFromHeader =
          (resp.headers['content-type'] as string | undefined) ??
          (resp.headers['Content-Type'] as string | undefined) ??
          '';
        const blob: Blob = resp.data instanceof Blob
          ? resp.data
          : new Blob([resp.data]);

        const format: FileFormat =
          source.format ??
          detectFormatFromMime(mimeFromHeader) ??
          detectFormatFromUrl(source.beRoute) ??
          'unknown';

        const language =
          source.language ??
          (format === 'code' ? detectLanguageFromUrl(source.beRoute) : undefined);

        // Derive filename — Content-Disposition beats URL inference.
        const disposition =
          (resp.headers['content-disposition'] as string | undefined) ??
          (resp.headers['Content-Disposition'] as string | undefined) ??
          '';
        const dispMatch = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
        const filename =
          source.filename ??
          (dispMatch ? decodeURIComponent(dispMatch[1]) : null) ??
          inferFilenameFromUrl(source.beRoute) ??
          'file';

        const payload: FetchedBytes = {
          mimeType: mimeFromHeader.split(';')[0].trim() || 'application/octet-stream',
          filename,
          blob,
          format,
          language,
        };

        if (TEXT_FORMATS.includes(format) || format === 'unknown') {
          payload.text = await blob.text();
        }
        if (!TEXT_FORMATS.includes(format) && format !== 'unknown') {
          localObjectUrl = URL.createObjectURL(blob);
          payload.objectUrl = localObjectUrl;
        }

        setState({ status: 'loaded', data: payload });
      } catch (err: any) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[FileViewer] fetch error:', err);
        setState({
          status: 'error',
          error:
            err?.response?.data?.message ??
            err?.message ??
            'Failed to load file.',
        });
      }
    })();

    return () => {
      cancelled = true;
      if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
    };
  }, [source.beRoute, source.format, source.language, source.filename]);

  // --- Audit hook (fires once per successful load) --------------------------
  useEffect(() => {
    if (state.status !== 'loaded' || auditFiredRef.current) return;
    auditFiredRef.current = true;
    const durationMs = Date.now() - startedAtRef.current;
    // fire-and-forget; never block render on audit
    void recordViewEvent({
      pageId,
      sourceRoute: source.beRoute,
      format: state.data?.format,
      viewerEventType: audit?.eventType,
      durationMs,
      orgHashId: props.orgHashId,
    });
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Toolbar actions ------------------------------------------------------
  const onDownload = useCallback(() => {
    if (!state.data) return;
    const url =
      state.data.objectUrl ?? URL.createObjectURL(state.data.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!state.data.objectUrl) URL.revokeObjectURL(url);
  }, [state.data]);

  const onPrint = useCallback(() => {
    window.print();
  }, []);

  // --- Render ---------------------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading file…</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded border border-red-200 p-6">
        <AlertCircle className="w-8 h-8 mb-2" />
        <div className="text-sm font-medium">Could not load file</div>
        <div className="text-xs text-red-500 mt-1">{state.error}</div>
        <div className="text-xs text-red-400 mt-2">{source.beRoute}</div>
      </div>
    );
  }

  const data = state.data!;
  const rendererProps: RendererProps = {
    text: data.text,
    blob: data.blob,
    objectUrl: data.objectUrl,
    mimeType: data.mimeType,
    filename: data.filename,
    format: data.format,
    language: data.language,
    pii,
    toolbar,
    readOnly,
  };

  const showToolbar =
    toolbar && (toolbar.download || toolbar.print);

  return (
    <div className="fv-root flex flex-col gap-3">
      {showToolbar && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2">
          <span className="text-xs text-gray-600 flex-1 truncate" title={data.filename}>
            {data.filename}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 mr-2">
            {data.format}
          </span>
          {toolbar?.download && (
            <button
              type="button"
              onClick={onDownload}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
          {toolbar?.print && (
            <button
              type="button"
              onClick={onPrint}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          )}
        </div>
      )}

      <Suspense fallback={<RendererFallback />}>
        {pickRenderer(data.format, rendererProps)}
      </Suspense>
    </div>
  );
};

function RendererFallback() {
  return (
    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Rendering…
    </div>
  );
}

function pickRenderer(format: FileFormat, p: RendererProps): React.ReactElement {
  switch (format) {
    case 'markdown':
      return <MarkdownViewer {...p} />;
    case 'csv':
    case 'tsv':
      return <CsvViewer {...p} />;
    case 'json':
      return <JsonViewer {...p} />;
    case 'code':
    case 'html':
    case 'text':
      return <CodeViewer {...p} />;
    case 'image':
      return <ImageViewer {...p} />;
    case 'audio':
      return <AudioViewer {...p} />;
    case 'video':
      return <VideoViewer {...p} />;
    case 'pdf':
      return <PdfViewer {...p} />;
    case 'docx':
      return <DocxViewer {...p} />;
    case 'sqlite':
      return <SqliteViewer {...p} />;
    default:
      return <UnknownFormat {...p} />;
  }
}

function UnknownFormat({ filename, mimeType }: RendererProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 text-sm text-gray-600">
      <div className="font-medium mb-1">{filename}</div>
      <div className="text-gray-500">
        No viewer available for <code className="text-xs bg-gray-100 px-1 rounded">{mimeType}</code>.
        Use the download toolbar above or declare a <code className="text-xs bg-gray-100 px-1 rounded">format</code> hint in the manifest.
      </div>
    </div>
  );
}

function inferFilenameFromUrl(url: string): string | null {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://x');
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : null;
  } catch {
    return null;
  }
}

/** Fire-and-forget audit event — never throws, never blocks render. */
async function recordViewEvent(body: {
  pageId?: string;
  sourceRoute: string;
  format?: string;
  viewerEventType?: string;
  durationMs?: number;
  orgHashId?: string;
}): Promise<void> {
  try {
    // Try to pull the org context from the persisted auth user; fall back
    // to whatever the caller supplied. If neither is available we use
    // "G" which forces the BE to use the token's scope.
    let orgId = body.orgHashId;
    if (!orgId) {
      try {
        const raw = localStorage.getItem('zorbit.user');
        if (raw) {
          const parsed = JSON.parse(raw);
          orgId =
            parsed?.organizationHashId ??
            parsed?.orgHashId ??
            parsed?.user?.organizationHashId ??
            undefined;
        }
      } catch {
        /* ignore */
      }
    }
    const scope = orgId ? `O/${orgId}` : 'G';
    await api.post(`/api/file-viewer/api/v1/${scope}/view-events`, {
      pageId: body.pageId,
      sourceRoute: body.sourceRoute,
      format: body.format,
      viewerEventType: body.viewerEventType,
      durationMs: body.durationMs,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[FileViewer] view-event audit failed (non-fatal):', err);
  }
}

export default FileViewer;
