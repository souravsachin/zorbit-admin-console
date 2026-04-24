/**
 * Platform tour video manifests
 *
 * Scavenged from the retired `pages/support-center/SupportCenterPage.tsx`
 * (deleted 2026-04-23 by Soldier AX per owner directive J62, decision #7).
 * The canonical Support Center UI now lives in the `zorbit-adm-help_support`
 * registered module's feComponent. Any module (including that one once
 * scaffolded) can import these manifests via:
 *
 *   import { ALL_RECORDINGS } from '../../data/video-manifests/platform-tour';
 *
 * or cross-module via the unified console's shared data layer.
 *
 * Preserving these entries avoids re-capturing the narration/chapter metadata
 * that was accumulated across multiple recording sessions (see timestamps).
 */

import type { ManifestEntry } from '../../components/shared/DemoTourPlayer';

/* ------------------------------------------------------------------ */
/*  Full Platform Tour (v3 — 2026-04-03, comprehensive narrated tour) */
/* ------------------------------------------------------------------ */

export const FULL_TOUR: ManifestEntry[] = [
  {
    file: 'full-tour/zorbit-full-tour-narrated.mp4',
    title: 'Complete Platform Tour — All Features (Narrated)',
    thumbnail: '',
    timestamp: '2026-04-03T08:30:00Z',
    duration: 109,
    chapters: [
      { title: 'Login with MFA', startMs: 0 },
      { title: 'DataTable LIVE Demo', startMs: 10000 },
      { title: 'FormBuilder Rendering', startMs: 20000 },
      { title: 'FQP Workflow Engine', startMs: 30000 },
      { title: 'Secrets Vault', startMs: 45000 },
      { title: 'Voice Engine TTS', startMs: 55000 },
      { title: 'Jayna AI Calling', startMs: 60000 },
      { title: 'UW Workflow & Decisioning', startMs: 70000 },
      { title: 'Security & Developer Tools', startMs: 85000 },
      { title: 'Support Center', startMs: 100000 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Narrated Journey Playlist (v2 — 2026-04-03, with voice narration)*/
/* ------------------------------------------------------------------ */

export const NARRATED_JOURNEY: ManifestEntry[] = [
  { file: 'segments-v2/desktop/01-login-mfa.mp4', title: 'Login with MFA (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:30:00Z', duration: 40, chapters: [{ title: 'Login + TOTP', startMs: 0 }] },
  { file: 'segments-v2/desktop/02-product-config.mp4', title: 'Product Configuration (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:31:00Z', duration: 45, chapters: [{ title: 'PCG4 Wizard', startMs: 0 }] },
  { file: 'segments-v2/desktop/03-rate-tables.mp4', title: 'Rate Tables & Calculator (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:32:00Z', duration: 35, chapters: [{ title: 'Rate Lookup', startMs: 0 }] },
  { file: 'segments-v2/desktop/04-uw-workflow.mp4', title: 'UW Workflow Queues (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:33:00Z', duration: 45, chapters: [{ title: 'Queue Engine', startMs: 0 }] },
  { file: 'segments-v2/desktop/05-decisioning.mp4', title: 'Decisioning Rules Engine (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:34:00Z', duration: 60, chapters: [{ title: 'Rules + STP', startMs: 0 }] },
  { file: 'segments-v2/desktop/06-payment.mp4', title: 'Payment Collection (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:35:00Z', duration: 40, chapters: [{ title: 'Payment Gateway', startMs: 0 }] },
  { file: 'segments-v2/desktop/07-jayna-ai.mp4', title: 'Jayna AI Calling (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:36:00Z', duration: 50, chapters: [{ title: 'Agents + Workflows', startMs: 0 }] },
  { file: 'segments-v2/desktop/08-voice-engine.mp4', title: 'Voice Engine TTS/STT (Narrated)', thumbnail: '', timestamp: '2026-04-03T02:37:00Z', duration: 40, chapters: [{ title: 'TTS Demo', startMs: 0 }] },
];

/* ------------------------------------------------------------------ */
/*  Desktop Journey Playlist (v1 — 2026-04-02, silent screencasts)   */
/* ------------------------------------------------------------------ */

export const DESKTOP_JOURNEY: ManifestEntry[] = [
  { file: 'segments/desktop/01-login-mfa.mp4', title: 'Login with MFA', thumbnail: '', timestamp: '2026-04-02T12:01:00Z', duration: 66, chapters: [{ title: 'Login + TOTP', startMs: 0 }] },
  { file: 'segments/desktop/02-create-org.mp4', title: 'Create Organization', thumbnail: '', timestamp: '2026-04-02T12:02:00Z', duration: 63, chapters: [{ title: 'Organizations', startMs: 0 }] },
  { file: 'segments/desktop/03-users-roles.mp4', title: 'Users & Roles Management', thumbnail: '', timestamp: '2026-04-02T12:03:00Z', duration: 64, chapters: [{ title: 'Roles', startMs: 0 }, { title: 'Users', startMs: 30000 }] },
  { file: 'segments/desktop/04-product-config.mp4', title: 'Product Configuration (PCG4)', thumbnail: '', timestamp: '2026-04-02T12:04:00Z', duration: 68, chapters: [{ title: 'Configurations', startMs: 0 }, { title: 'AWNIC Steps', startMs: 15000 }] },
  { file: 'segments/desktop/05-rate-tables.mp4', title: 'Product Pricing & Rate Tables', thumbnail: '', timestamp: '2026-04-02T12:05:00Z', duration: 63, chapters: [{ title: 'Rate Tables', startMs: 0 }, { title: 'Rate Grid', startMs: 15000 }] },
  { file: 'segments/desktop/06-hi-quotation.mp4', title: 'Health Insurance Quotation', thumbnail: '', timestamp: '2026-04-02T12:06:00Z', duration: 33, chapters: [{ title: 'Applications', startMs: 0 }, { title: 'New Application', startMs: 15000 }] },
  { file: 'segments/desktop/07-uw-workflow-dashboard.mp4', title: 'UW Workflow Dashboard', thumbnail: '', timestamp: '2026-04-02T12:07:00Z', duration: 60, chapters: [{ title: 'Queue Summary', startMs: 0 }] },
  { file: 'segments/desktop/08-uw-workflow-queues.mp4', title: 'UW Workflow Queues & Detail', thumbnail: '', timestamp: '2026-04-02T12:08:00Z', duration: 67, chapters: [{ title: 'New Quotations', startMs: 0 }, { title: 'STP Approved', startMs: 15000 }, { title: 'Detail Panel', startMs: 35000 }] },
  { file: 'segments/desktop/09-payment.mp4', title: 'Payment Collection', thumbnail: '', timestamp: '2026-04-02T12:09:00Z', duration: 59, chapters: [{ title: 'Approved Queue', startMs: 0 }, { title: 'Payment Link', startMs: 20000 }] },
  { file: 'segments/desktop/10-decisioning-rules.mp4', title: 'Decisioning Rules Engine', thumbnail: '', timestamp: '2026-04-02T12:10:00Z', duration: 67, chapters: [{ title: 'Rules List', startMs: 0 }, { title: 'Rule Details', startMs: 15000 }] },
  { file: 'segments/desktop/11-decisioning-stp.mp4', title: 'STP Criteria & Evaluations', thumbnail: '', timestamp: '2026-04-02T12:11:00Z', duration: 37, chapters: [{ title: 'STP Criteria', startMs: 0 }, { title: 'Evaluations', startMs: 18000 }] },
  { file: 'segments/desktop/12-notifications.mp4', title: 'Notifications', thumbnail: '', timestamp: '2026-04-02T12:12:00Z', duration: 61, chapters: [{ title: 'Bell & Dropdown', startMs: 0 }] },
  { file: 'segments/desktop/13-pii-visibility.mp4', title: 'PII Role-Based Visibility', thumbnail: '', timestamp: '2026-04-02T12:13:00Z', duration: 57, chapters: [{ title: 'Role Switching', startMs: 0 }] },
  { file: 'segments/desktop/14-demo-data-gen.mp4', title: 'AI Demo Data Generator', thumbnail: '', timestamp: '2026-04-02T12:14:00Z', duration: 62, chapters: [{ title: 'Setup Page', startMs: 0 }, { title: 'Generator UI', startMs: 20000 }] },
  { file: 'segments/desktop/15-guide-sections.mp4', title: 'Module Guide Pages', thumbnail: '', timestamp: '2026-04-02T12:15:00Z', duration: 67, chapters: [{ title: 'PCG4', startMs: 0 }, { title: 'Pricing', startMs: 15000 }, { title: 'UW Workflow', startMs: 30000 }, { title: 'Decisioning', startMs: 45000 }] },
  { file: 'segments/desktop/16-mfa-settings.mp4', title: 'MFA Security Settings', thumbnail: '', timestamp: '2026-04-02T12:16:00Z', duration: 32, chapters: [{ title: 'Security Page', startMs: 0 }] },
];

/* ------------------------------------------------------------------ */
/*  Mobile Journey Playlist (v1 — 2026-04-02)                        */
/* ------------------------------------------------------------------ */

export const MOBILE_JOURNEY: ManifestEntry[] = DESKTOP_JOURNEY.map((entry) => ({
  ...entry,
  file: entry.file.replace('desktop/', 'mobile/'),
  title: `${entry.title} (Mobile)`,
  timestamp: entry.timestamp.replace('T12:', 'T13:'),
}));

/* ------------------------------------------------------------------ */
/*  Full Workflow Demo (v1 — 2026-04-02)                             */
/* ------------------------------------------------------------------ */

export const FULL_WORKFLOW_DEMO: ManifestEntry[] = [
  {
    file: 'workflow-demo/zorbit-workflow-demo-narrated.mp4',
    title: 'Complete Insurance Workflow — End-to-End Demo (v1)',
    thumbnail: '',
    timestamp: '2026-04-02T06:00:00.000Z',
    duration: 155,
    chapters: [
      { title: 'Login & MFA Security', startMs: 0 },
      { title: 'Product Configuration (PCG4)', startMs: 25000 },
      { title: 'Product Pricing & Rate Tables', startMs: 85000 },
      { title: 'Health Insurance Quotation', startMs: 115000 },
      { title: 'UW Workflow — Queue Engine', startMs: 130000 },
      { title: 'Decisioning — Rules Engine', startMs: 145000 },
      { title: 'Closing', startMs: 150000 },
    ],
  },
];

/**
 * Auto-generate thumbnail path from video file path:
 *   foo/bar.mp4 -> foo/bar-thumb.jpg
 */
export function withThumbnails(entries: ManifestEntry[]): ManifestEntry[] {
  return entries.map((e) => ({
    ...e,
    thumbnail: e.thumbnail || e.file.replace('.mp4', '-thumb.jpg'),
  }));
}

/**
 * All recordings combined (latest first — DemoTourPlayer sorts by timestamp desc).
 * Use this for the Support Center / Help hub pages.
 */
export const ALL_RECORDINGS: ManifestEntry[] = withThumbnails([
  ...FULL_TOUR,
  ...NARRATED_JOURNEY,
  ...DESKTOP_JOURNEY,
  ...MOBILE_JOURNEY,
  ...FULL_WORKFLOW_DEMO,
]);
