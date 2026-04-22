/**
 * zorbit-unified-console — ZMB Compose service client
 *
 * Wraps the HTTP surface of zorbit-pfs-zmb_factory's /api/v1/G/compose/*
 * endpoints. Added 2026-04-22 by Soldier AU for the Compose authoring UI.
 */
import api from './api';

const BASE = (import.meta.env.VITE_ZMB_FACTORY_URL as string | undefined) || '/api/zmb-factory';

export interface ComposeValidationIssue {
  level: 'error' | 'warning';
  path: string;
  message: string;
}

export interface ComposeValidationResult {
  valid: boolean;
  issues: ComposeValidationIssue[];
}

export interface ComposePreviewResult {
  moduleId: string;
  summary: {
    navigationItems: number;
    guideSlides: number;
    privilegeCount: number;
    entityCount: number;
  };
  manifest: any;
}

export interface ExportToServerResult {
  modulePath: string;
  fileCount: number;
  files: string[];
  audioBundleCount?: number;
}

export interface SynthNarrationItem {
  id: string;
  text: string;
  voice?: string;
}

export interface SynthNarrationResult {
  items: Array<{
    id: string;
    ok: boolean;
    dataUrl?: string;
    fallback?: 'browser-speech-synthesis';
    error?: string;
  }>;
  synthesiser: 'voice-engine' | 'browser-fallback';
}

export const zmbComposeService = {
  validate: async (manifest: any): Promise<ComposeValidationResult> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/validate`, { manifest });
    return data;
  },

  preview: async (manifest: any): Promise<ComposePreviewResult> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/preview`, { manifest });
    return data;
  },

  deriveConfig: async (manifest: any): Promise<any> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/derive-config`, { manifest });
    return data;
  },

  exportToServer: async (
    manifest: any,
    config?: any,
    targetRoot?: string,
  ): Promise<ExportToServerResult> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/export-to-server`, {
      manifest,
      config,
      targetRoot,
    });
    return data;
  },

  downloadZip: async (manifest: any, config?: any): Promise<{ blob: Blob; fileName: string }> => {
    const rsp = await api.post(
      `${BASE}/api/v1/G/compose/download-zip`,
      { manifest, config },
      { responseType: 'blob' },
    );
    const disposition: string = rsp.headers['content-disposition'] || '';
    const match = /filename="([^"]+)"/.exec(disposition);
    const fileName = match?.[1] || `${manifest?.moduleId || 'module'}-scaffold.zip`;
    return { blob: rsp.data as Blob, fileName };
  },

  synthNarrations: async (
    narrations: SynthNarrationItem[],
    opts?: { voiceEngineUrl?: string; orgId?: string },
  ): Promise<SynthNarrationResult> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/synth-narrations`, {
      narrations,
      ...opts,
    });
    return data;
  },

  importManifest: async (manifest: any): Promise<{
    manifest: any;
    derivedConfig: any;
    validation: ComposeValidationResult;
    hash: string;
  }> => {
    const { data } = await api.post(`${BASE}/api/v1/G/compose/import`, { manifest });
    return data;
  },
};

/**
 * Browser-side narration player. Plays a text string via the platform TTS
 * (voice_engine) if reachable, else falls back to window.speechSynthesis.
 *
 * Returns a Promise that resolves when playback finishes.
 */
export async function playNarration(
  text: string,
  opts?: { voice?: string; onFinish?: () => void },
): Promise<'voice-engine' | 'browser-fallback'> {
  const result = await zmbComposeService.synthNarrations(
    [{ id: 'inline', text, voice: opts?.voice }],
  );
  const first = result.items[0];

  if (first?.ok && first.dataUrl) {
    const audio = new Audio(first.dataUrl);
    await new Promise<void>((resolve) => {
      audio.addEventListener('ended', () => resolve(), { once: true });
      audio.addEventListener('error', () => resolve(), { once: true });
      audio.play().catch(() => resolve());
    });
    opts?.onFinish?.();
    return 'voice-engine';
  }

  // Fallback — browser's built-in speech synth.
  return new Promise<'browser-fallback'>((resolve) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (opts?.voice) {
        const v = window.speechSynthesis.getVoices().find((vv) => vv.name === opts.voice);
        if (v) u.voice = v;
      }
      u.onend = () => {
        opts?.onFinish?.();
        resolve('browser-fallback');
      };
      u.onerror = () => {
        opts?.onFinish?.();
        resolve('browser-fallback');
      };
      window.speechSynthesis.speak(u);
    } catch {
      opts?.onFinish?.();
      resolve('browser-fallback');
    }
  });
}
