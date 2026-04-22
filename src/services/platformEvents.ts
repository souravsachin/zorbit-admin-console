/**
 * platformEvents.ts
 *
 * Listens for platform-level WebSocket events from the module registry service.
 * Handles two event types:
 *
 *   MODULE_REGISTERED — a new module has been registered in the platform.
 *     Action: evict the registry cache entry (force re-fetch on next navigation)
 *             and show a toast notification.
 *
 *   MODULE_UPDATED — an existing module has a new bundle version.
 *     Action: evict both the registry cache AND the loaded bundle cache.
 *             Show a persistent notification banner prompting the user to refresh.
 *             Do NOT auto-reload.
 *
 * The WebSocket endpoint is read from VITE_PLATFORM_WS_URL (falls back to
 * /api/module_registry/events for same-origin deployments).
 *
 * This module is a singleton: call initPlatformEvents() once at app startup
 * (e.g. in main.tsx or App.tsx). Subsequent calls are no-ops.
 *
 * It does NOT use socket.io — the module registry service exposes a plain
 * WebSocket endpoint. The shell uses socket.io-client for realtime/chat, but
 * those are separate connections to separate services.
 */

import { evictModuleFromCache } from './moduleLoader';
import {
  evictFromModuleRegistryCache,
} from '../hooks/useModuleRegistry';

// ── Event shapes ──────────────────────────────────────────────────────────────

export interface ModuleRegisteredEvent {
  type: 'MODULE_REGISTERED';
  moduleId: string;
  label: string;
  version: string;
}

export interface ModuleUpdatedEvent {
  type: 'MODULE_UPDATED';
  moduleId: string;
  moduleName?: string;
  version: string;
}

type PlatformEvent = ModuleRegisteredEvent | ModuleUpdatedEvent;

// ── Notification callbacks ────────────────────────────────────────────────────

type ToastFn = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
type BannerFn = (message: string) => void;

let _toastFn: ToastFn | null = null;
let _bannerFn: BannerFn | null = null;

/**
 * Register a toast function (e.g. from useToast()) so platformEvents can
 * surface notifications. Call this once after the ToastProvider mounts.
 */
export function registerToastFn(fn: ToastFn): void {
  _toastFn = fn;
}

/**
 * Register a banner/notification function for update prompts.
 * If not provided, falls back to console.warn.
 */
export function registerBannerFn(fn: BannerFn): void {
  _bannerFn = fn;
}

// ── Singleton WebSocket state ─────────────────────────────────────────────────

let ws: WebSocket | null = null;
let initialised = false;
let retryCount = 0;
const MAX_RETRIES = 5;

function getWsUrl(): string {
  // Allow override via env var (e.g. wss://module-registry.scalatics.com/events)
  const envUrl = import.meta.env.VITE_PLATFORM_WS_URL as string | undefined;
  if (envUrl) return envUrl;

  // Same-origin: use relative path proxied by nginx
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/api/module_registry/events`;
}

function handleEvent(event: PlatformEvent): void {
  switch (event.type) {
    case 'MODULE_REGISTERED': {
      // Evict registry cache so next navigation re-fetches the new entry
      evictFromModuleRegistryCache(event.moduleId);

      const message = `New module available: ${event.label} — navigate to it to load.`;
      console.info('[platformEvents] MODULE_REGISTERED', event);

      if (_toastFn) {
        _toastFn(message, 'info');
      } else {
        console.info('[platformEvents]', message);
      }
      break;
    }

    case 'MODULE_UPDATED': {
      // Evict both caches: registry metadata AND the loaded bundle
      evictFromModuleRegistryCache(event.moduleId);
      evictModuleFromCache(event.moduleId);

      const name = event.moduleName ?? event.moduleId;
      const message =
        `Module "${name}" has been updated to v${event.version}. ` +
        `Refresh the page to load the latest version.`;

      console.info('[platformEvents] MODULE_UPDATED', event);

      if (_bannerFn) {
        _bannerFn(message);
      } else if (_toastFn) {
        _toastFn(message, 'warning');
      } else {
        console.warn('[platformEvents]', message);
      }
      break;
    }

    default:
      // Unknown event type — ignore silently
      break;
  }
}

function connectWebSocket(): void {
  const url = getWsUrl();

  try {
    ws = new WebSocket(url);
  } catch (err) {
    // If the URL scheme is invalid (e.g. in test environments) abort silently
    console.warn('[platformEvents] Could not open WebSocket:', err);
    return;
  }

  ws.addEventListener('open', () => {
    retryCount = 0; // reset on successful connection
    console.info('[platformEvents] WebSocket connected:', url);
    // Authenticate: send the JWT token so the server can scope events
    const token =
      localStorage.getItem('zorbit_access_token') ||
      localStorage.getItem('zorbit_token');
    if (token && ws) {
      ws.send(JSON.stringify({ type: 'AUTH', token }));
    }
  });

  ws.addEventListener('message', (e: MessageEvent) => {
    try {
      const event = JSON.parse(e.data as string) as PlatformEvent;
      handleEvent(event);
    } catch {
      // Non-JSON frame (ping/pong/etc.) — ignore
    }
  });

  ws.addEventListener('close', (e: CloseEvent) => {
    ws = null;
    retryCount++;
    if (!initialised || retryCount > MAX_RETRIES) {
      console.warn(
        `[platformEvents] WebSocket closed (code=${e.code}). ` +
        (retryCount > MAX_RETRIES
          ? `Giving up after ${MAX_RETRIES} retries — module registry events unavailable.`
          : 'Not reconnecting (destroyed).'),
      );
      return;
    }
    // Exponential backoff: 5s, 10s, 20s, 40s, 80s
    const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 80000);
    console.info(`[platformEvents] WebSocket closed (code=${e.code}). Retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s...`);
    setTimeout(() => { if (initialised) connectWebSocket(); }, delay);
  });

  ws.addEventListener('error', () => {
    // 'error' is always followed by 'close' in the browser — no extra action needed
    console.warn('[platformEvents] WebSocket error — will attempt reconnect after close.');
  });
}

/**
 * Initialise the platform events WebSocket connection.
 * Safe to call multiple times — only connects once.
 *
 * Call from App.tsx useEffect or main.tsx after the app mounts.
 *
 * @param options.toast  Optional toast function from useToast()
 * @param options.banner Optional banner function for update prompts
 */
export function initPlatformEvents(options?: {
  toast?: ToastFn;
  banner?: BannerFn;
}): void {
  if (initialised) return;
  initialised = true;

  if (options?.toast) _toastFn = options.toast;
  if (options?.banner) _bannerFn = options.banner;

  connectWebSocket();
}

/**
 * Tear down the connection (for testing or logout cleanup).
 */
export function destroyPlatformEvents(): void {
  initialised = false;
  if (ws) {
    ws.close();
    ws = null;
  }
}
