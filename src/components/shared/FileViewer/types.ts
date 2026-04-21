/**
 * Shared types for the FileViewer component family.
 *
 * This is the manifest-facing contract — every renderer in this
 * family consumes a subset of `FileViewerProps`.
 */

export type FileFormat =
  | 'markdown'
  | 'html'
  | 'json'
  | 'csv'
  | 'tsv'
  | 'code'
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'docx'
  | 'sqlite'
  | 'text'
  | 'unknown';

export interface FileViewerSource {
  /** BE route to fetch the file bytes. JWT-authed via shared axios. */
  beRoute: string;
  /** Optional hint; if omitted the dispatcher auto-detects. */
  format?: FileFormat;
  /** Optional code language hint when format='code'. */
  language?: string;
  /** Optional filename override (used for Content-Disposition + extension
   *  parsing when the URL alone doesn't carry a useful extension). */
  filename?: string;
}

export interface FileViewerToolbar {
  download?: boolean;
  print?: boolean;
  export?: Array<'pdf' | 'html'>;
}

export interface FileViewerPii {
  /** Dotted-path rules that should be masked, e.g. "customer.phone". */
  applyRedactionRules?: string[];
  /** Mask character (defaults to "•"). */
  maskChar?: string;
}

export interface FileViewerAudit {
  /** Caller-declared audit eventType, e.g. "{moduleSlug}.{entityType}.viewed".
   *  When present, the component POSTs a view-event to the file_viewer BE on
   *  successful render. The canonical `platform.file.viewed` event is
   *  always emitted — this adds the caller's eventType on top of that. */
  eventType?: string;
}

export interface FileViewerProps {
  /** Optional stable pageId used in audit events. */
  pageId?: string;

  /** Where the file bytes live + optional format hint. */
  source: FileViewerSource;

  /** Toolbar actions to render above the viewer. */
  toolbar?: FileViewerToolbar;

  /** Phase 1: always true. Reserved for Phase 2 editing. */
  readOnly?: boolean;

  /** Best-effort PII masking (Markdown / CSV / JSON only in Phase 1). */
  pii?: FileViewerPii;

  /** Audit hook — caller's additional eventType. */
  audit?: FileViewerAudit;

  /** Fallback context for `viewEvents` POST when the component is embedded
   *  in a page where the `orgHashId` isn't on the JWT claims (shouldn't
   *  happen, but keeps the contract permissive). */
  orgHashId?: string;
}

export interface RendererProps {
  /** Already-fetched response body. For text formats, `text` is set.
   *  For binary formats, `blob` and `objectUrl` are set. */
  text?: string;
  blob?: Blob;
  objectUrl?: string;
  mimeType: string;
  filename: string;
  format: FileFormat;
  language?: string;
  pii?: FileViewerPii;
  toolbar?: FileViewerToolbar;
  readOnly?: boolean;
}
