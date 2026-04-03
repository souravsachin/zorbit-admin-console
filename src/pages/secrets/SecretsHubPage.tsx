import React from 'react';
import {
  KeyRound,
  Shield,
  Lock,
  Eye,
  RotateCw,
  FileText,
  Database,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';
import type { Slide } from '../../components/shared/SlidePlayer';

// ---------------------------------------------------------------------------
// Secrets Vault Presentation Slides
// ---------------------------------------------------------------------------

const SECRETS_SLIDES: Slide[] = [
  {
    id: 'title',
    title: 'Secrets Vault',
    subtitle: 'Enterprise-Grade Secrets Management for the Zorbit Platform',
    icon: <KeyRound size={32} />,
    audioSrc: '/audio/secrets/slide_01.mp3',
    background: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
    content: (
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">AES-256-GCM</p>
          <p className="text-white/60 text-xs mt-1">Military-grade encryption at rest</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Audit Trail</p>
          <p className="text-white/60 text-xs mt-1">Every access is logged</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Key Rotation</p>
          <p className="text-white/60 text-xs mt-1">Rotate secrets with zero downtime</p>
        </div>
      </div>
    ),
  },
  {
    id: 'encryption-flow',
    title: 'Encryption Flow',
    subtitle: 'Plaintext in, encrypted at rest, decrypted on authorized read',
    icon: <Lock size={32} />,
    audioSrc: '/audio/secrets/slide_02.mp3',
    background: 'bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-900',
    content: (
      <div className="flex items-center justify-center gap-3 mt-4 text-sm">
        {[
          { step: 'Secret Value', desc: 'sk-abc123...', color: 'bg-red-500/30 border-red-400' },
          { step: 'AES-256-GCM', desc: 'Encrypt + Auth Tag', color: 'bg-amber-500/30 border-amber-400' },
          { step: 'MongoDB', desc: 'Encrypted blob', color: 'bg-emerald-500/30 border-emerald-400' },
        ].map((s, i) => (
          <React.Fragment key={s.step}>
            {i > 0 && <ArrowRight size={20} className="text-white/40" />}
            <div className={`${s.color} border backdrop-blur rounded-lg p-4 text-center min-w-[130px]`}>
              <p className="font-bold text-white">{s.step}</p>
              <p className="text-white/60 text-xs mt-1 font-mono">{s.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    id: 'audit-logging',
    title: 'Audit Logging',
    subtitle: 'Immutable record of every secret access',
    icon: <Eye size={32} />,
    audioSrc: '/audio/secrets/slide_03.mp3',
    background: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800',
    content: (
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        {[
          'Who accessed',
          'When accessed',
          'Which secret',
          'Source IP',
          'Source Module',
          'User Agent',
        ].map((field) => (
          <div key={field} className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <p className="font-medium text-white text-[11px]">{field}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'categories',
    title: 'Secret Categories',
    subtitle: 'Organize secrets by type for easy management',
    icon: <Database size={32} />,
    audioSrc: '/audio/secrets/slide_04.mp3',
    background: 'bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800',
    content: (
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        {['API Keys', 'OAuth Secrets', 'Database Creds', 'SFTP Keys', 'SMTP Creds', 'Custom'].map((cat) => (
          <div key={cat} className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <p className="font-medium text-white text-[11px]">{cat}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'rotation',
    title: 'Secret Rotation',
    subtitle: 'Rotate secrets without downtime',
    icon: <RotateCw size={32} />,
    audioSrc: '/audio/secrets/slide_05.mp3',
    background: 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800',
    content: (
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-left">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold text-cyan-300">Manual Rotation</p>
          <p className="text-white/60 text-xs mt-1">
            Admin provides a new value. The old value is re-encrypted and the
            rotation timestamp is recorded.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold text-amber-300">Expiry Tracking</p>
          <p className="text-white/60 text-xs mt-1">
            Set expiration dates on secrets. Dashboard shows upcoming expirations
            so you can rotate before they expire.
          </p>
        </div>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SecretsHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="secrets"
      moduleName="Secrets Vault"
      moduleDescription="Enterprise-grade secrets management with AES-256-GCM encryption"
      moduleIntro="The Secrets Vault is a dedicated service for managing all API keys, OAuth credentials, database passwords, and other secrets. Every secret value is encrypted with AES-256-GCM before storage in MongoDB. The master encryption key is stored as an environment variable and never exposed via the API. Every access to a secret is audit-logged with full context: who, when, which secret, from which IP, and which module."
      icon={KeyRound}
      slides={SECRETS_SLIDES}
      capabilities={[
        {
          icon: Lock,
          title: 'AES-256-GCM Encryption',
          description: 'All secret values are encrypted at rest using AES-256-GCM with unique initialization vectors. Plaintext is never stored in the database.',
        },
        {
          icon: Eye,
          title: 'Audit Trail',
          description: 'Every secret access (create, read, update, delete, rotate) is logged with who, when, source IP, user agent, and requesting module.',
        },
        {
          icon: RotateCw,
          title: 'Secret Rotation',
          description: 'Rotate secrets with a single API call. The old value is replaced, rotation timestamp is recorded, and an audit entry is created.',
        },
        {
          icon: Shield,
          title: 'Access Control',
          description: 'JWT authentication required for all endpoints. Org-scoped secrets ensure namespace isolation. Admin roles for write operations.',
        },
        {
          icon: Database,
          title: 'Category Management',
          description: 'Organize secrets by category: API keys, OAuth credentials, database passwords, SFTP keys, SMTP credentials, or custom.',
        },
        {
          icon: AlertTriangle,
          title: 'Expiry Tracking',
          description: 'Set expiration dates on secrets. Track which secrets need rotation. Monitor usage patterns across modules.',
        },
      ]}
      targetUsers={[
        { role: 'Platform Administrators', desc: 'Create, update, and rotate secrets. Monitor audit logs and usage.' },
        { role: 'DevOps Engineers', desc: 'Configure service secrets and manage rotation schedules.' },
        { role: 'Security Officers', desc: 'Review audit trails and enforce secret management policies.' },
        { role: 'Module Developers', desc: 'Read secrets via API for their services (audit-logged).' },
      ]}
      lifecycleStages={[
        { label: 'Create', description: 'Admin creates a secret. The value is encrypted with AES-256-GCM and stored in MongoDB.', color: '#3b82f6' },
        { label: 'Store', description: 'Only the encrypted blob, IV, and auth tag are persisted. Plaintext never touches disk.', color: '#f59e0b' },
        { label: 'Read', description: 'Authorized service requests the secret. Value is decrypted on-the-fly and the access is audit-logged.', color: '#8b5cf6' },
        { label: 'Rotate', description: 'Admin provides a new value. Re-encrypted and stored. Rotation timestamp is recorded.', color: '#10b981' },
        { label: 'Audit', description: 'Every operation is recorded in an immutable audit log with full context.', color: '#64748b' },
      ]}
      recordings={[]}
      videosBaseUrl="/demos/secrets/"
      swaggerUrl="https://zorbit.scalatics.com/api/secrets/api-docs"
      faqs={[
        { question: 'How are secrets encrypted?', answer: 'All secret values are encrypted using AES-256-GCM. A master key (from SECRETS_MASTER_KEY env var) is derived via scrypt to produce a 256-bit key. Each encryption uses a unique random 16-byte IV. The GCM auth tag provides authenticated encryption.' },
        { question: 'Who can read secrets?', answer: 'Any authenticated user in the organization can read secrets via the API. However, every read is audit-logged with full context (user, IP, module, timestamp). Write operations (create, update, delete, rotate) require admin roles.' },
        { question: 'What happens if the master key is lost?', answer: 'If the SECRETS_MASTER_KEY is lost, all encrypted secrets become unrecoverable. This is by design. The master key must be backed up securely (e.g., in a hardware security module or offline safe).' },
        { question: 'Are secret values ever logged?', answer: 'Never. Secret values are redacted from all log statements. API responses for list operations exclude encrypted fields entirely. Only the GET /secrets/:name endpoint returns the decrypted value, with no-cache headers.' },
      ]}
      resources={[
        { label: 'Secrets API (Swagger)', url: 'https://zorbit.scalatics.com/api/secrets/api-docs', icon: FileText },
        { label: 'Secrets List', url: '/secrets/list', icon: KeyRound },
        { label: 'Audit Log', url: '/secrets/audit', icon: Eye },
        { label: 'Create Secret', url: '/secrets/new', icon: Lock },
      ]}
    />
  );
};

export default SecretsHubPage;
