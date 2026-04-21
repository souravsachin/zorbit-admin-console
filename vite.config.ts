import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function getGitSha(): string {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'unknown'; }
}

function getPkgVersion(): string {
  try { return JSON.parse(readFileSync('package.json', 'utf-8')).version; }
  catch { return '0.0.0'; }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getPkgVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __GIT_SHA__: JSON.stringify(getGitSha()),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/identity': {
        target: 'http://localhost:3099',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/identity/, ''),
      },
      '/api/authorization': {
        target: 'http://localhost:3098',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/authorization/, ''),
      },
      '/api/datatable': {
        target: 'http://localhost:3013',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/datatable/, ''),
      },
      '/api/navigation': {
        target: 'http://localhost:3097',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/navigation/, ''),
      },
      '/api/messaging': {
        target: 'http://localhost:3096',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/messaging/, ''),
      },
      '/api/pii-vault': {
        target: 'http://localhost:3095',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pii-vault/, ''),
      },
      '/api/audit': {
        target: 'http://localhost:3094',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/audit/, ''),
      },
      '/api/customer': {
        target: 'http://localhost:3093',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/customer/, ''),
      },
      '/api/unified-console': {
        target: 'http://localhost:3020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/unified-console/, ''),
      },
      '/api/app/pcg4': {
        target: 'http://localhost:3011',
        changeOrigin: true,
      },
      '/api/chat': {
        target: 'http://localhost:3108',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, ''),
      },
      '/api/rtc': {
        target: 'http://localhost:3107',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rtc/, ''),
      },
      '/api/uw-workflow': {
        target: 'http://localhost:3115',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uw-workflow/, ''),
      },
      '/api/hi-uw-decisioning': {
        target: 'http://localhost:3116',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hi-uw-decisioning/, ''),
      },
      '/api/hi-quotation': {
        target: 'http://localhost:3117',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hi-quotation/, ''),
      },
      '/api/mi-quotation': {
        target: 'http://localhost:3123',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mi-quotation/, ''),
      },
      '/api/product-pricing': {
        target: 'http://localhost:3125',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/product-pricing/, ''),
      },
      '/api/form-builder': {
        target: 'http://localhost:3114',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/form-builder/, ''),
      },
      '/api/white-label': {
        target: 'http://localhost:3034',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/white-label/, ''),
      },
      '/api/doc-generator': {
        target: 'http://localhost:3026',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doc-generator/, ''),
      },
      '/api/file-viewer': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/file-viewer/, ''),
      },
      '/api/notification': {
        target: 'http://localhost:3026',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notification/, ''),
      },
      '/api/jayna': {
        target: 'http://localhost:3028',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jayna/, ''),
      },
      '/api/realtime': {
        target: 'http://localhost:3029',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/realtime/, ''),
      },
      '/api/integration': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/integration/, ''),
      },
      '/api/workflow-engine': {
        target: 'http://localhost:3031',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/workflow-engine/, ''),
      },
      '/api/module-registry': {
        target: 'http://localhost:3032',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/module-registry/, ''),
        ws: true,
      },
      '/socket.io/realtime': {
        target: 'http://localhost:3029',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket\.io\/realtime/, '/socket.io'),
      },
      '/socket.io/chat': {
        target: 'http://localhost:3108',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket\.io\/chat/, '/socket.io'),
      },
      '/socket.io/rtc': {
        target: 'http://localhost:3107',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket\.io\/rtc/, '/socket.io'),
      },
    },
  },
});
