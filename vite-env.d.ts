/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __GIT_SHA__: string;

// FileViewer third-party deps that ship no types.
declare module 'sql.js';
declare module 'docx-preview';
declare module 'pdfjs-dist/build/pdf.worker.min.mjs?url' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_IDENTITY_URL: string;
  readonly VITE_AUTHORIZATION_URL: string;
  readonly VITE_NAVIGATION_URL: string;
  readonly VITE_MESSAGING_URL: string;
  readonly VITE_PII_VAULT_URL: string;
  readonly VITE_AUDIT_URL: string;
  readonly VITE_CUSTOMER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
