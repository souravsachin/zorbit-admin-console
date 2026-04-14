import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Info,
  Play,
  Layers,
  ArrowRight,
  Code2,
  Boxes,
  ShieldCheck,
  Zap,
  GitBranch,
  FileJson,
} from 'lucide-react';
import { DemoTourPlayer } from '../../components/shared/DemoTourPlayer';
import type { ManifestEntry } from '../../components/shared/DemoTourPlayer';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabKey = 'introduction' | 'tutorials' | 'architecture' | 'resources';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'introduction', label: 'Introduction', icon: Info },
  { key: 'tutorials', label: 'Video Tutorials', icon: Play },
  { key: 'architecture', label: 'Architecture', icon: Layers },
  { key: 'resources', label: 'Resources', icon: FileJson },
];

// ---------------------------------------------------------------------------
// ZMB tutorial recordings
// ---------------------------------------------------------------------------

const ZMB_TUTORIALS: ManifestEntry[] = [
  {
    file: 'ZMB-Tutorial-Claims-Intake.mp4',
    title: 'Building a Module: Claims Intake',
    timestamp: '2026-04-01T00:00:00.000Z',
    duration: 66,
    chapters: [
      { title: 'Introduction', startMs: 0 },
      { title: 'The 4 Platform Capabilities', startMs: 5000 },
      { title: 'Login to Console', startMs: 13000 },
      { title: 'Design the Form', startMs: 19000 },
      { title: 'Generate Access Token', startMs: 28000 },
      { title: 'White Label Theme', startMs: 35000 },
      { title: 'Generate Module (CLI)', startMs: 41000 },
      { title: 'Generate Module (UI)', startMs: 49000 },
      { title: 'Inside Generated Code', startMs: 55000 },
      { title: 'Power of Configuration', startMs: 62000 },
    ],
  },
  {
    file: 'ZMB-Tutorial-Prospect-Portal.mp4',
    title: 'Prospect Portal: Distribution Side',
    timestamp: '2026-04-01T00:00:00.000Z',
    duration: 66,
    chapters: [
      { title: 'Introduction', startMs: 0 },
      { title: 'Distribution vs Servicing', startMs: 5000 },
      { title: 'The Form in Form Builder', startMs: 12000 },
      { title: 'Portal in Action', startMs: 25000 },
      { title: 'Resolution Precedence', startMs: 33000 },
      { title: 'PII Visibility', startMs: 40000 },
      { title: 'FQP Queue', startMs: 48000 },
      { title: 'Same Pattern, Different Domain', startMs: 55000 },
      { title: 'Key Takeaways', startMs: 62000 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Capability cards
// ---------------------------------------------------------------------------

interface Capability {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: Boxes,
    title: 'ZMB Factory',
    description:
      'Zorbit Module Builder generates complete NestJS + React modules from a form schema. ' +
      'One command, full CRUD, PII-safe, event-driven.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
  },
  {
    icon: ShieldCheck,
    title: 'Platform Services',
    description:
      'Every generated module integrates with Identity, Authorization, PII Vault, Audit, ' +
      'and Messaging out of the box — no boilerplate required.',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    icon: Zap,
    title: 'Event-Driven',
    description:
      'Modules publish domain events to Kafka automatically. Downstream services subscribe ' +
      'without tight coupling.',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  },
  {
    icon: GitBranch,
    title: 'Schema-First',
    description:
      'Define your data model in Form Builder. ZMB derives the API, database schema, ' +
      'and UI from a single source of truth.',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
  },
  {
    icon: Code2,
    title: 'SDK & CLI',
    description:
      'Use zorbit-sdk-node for middleware, or the Zorbit CLI to scaffold services, ' +
      'register events, and generate APIs — all from the terminal.',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
  },
  {
    icon: FileJson,
    title: 'API-First',
    description:
      'Every resource follows strict REST grammar: /api/v1/{namespace}/{id}/resource. ' +
      'Swagger docs are generated automatically.',
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30',
  },
];

// ---------------------------------------------------------------------------
// Architecture layers
// ---------------------------------------------------------------------------

interface ArchLayer {
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    label: 'Application Layer',
    desc: 'Business modules (HI, Motor, Claims, Prospects). Each module is generated by ZMB and deployed independently.',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  {
    label: 'Platform Services',
    desc: 'Identity, Authorization, Navigation, Messaging, PII Vault, Audit — the shared infrastructure every module uses.',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  {
    label: 'Data Layer',
    desc: 'PostgreSQL per service (no cross-service DB access). PII Vault runs on a separate host. Kafka for async events.',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  {
    label: 'Infrastructure',
    desc: 'Docker + Kubernetes, PM2 for process management, OpenTelemetry for observability, nginx for reverse proxying.',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-300 dark:border-gray-700',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DevCenterGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('introduction');
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dev Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Developer documentation, video tutorials, and architecture reference for the Zorbit platform
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'introduction' && <IntroductionTab navigate={navigate} />}
      {activeTab === 'tutorials' && <TutorialsTab />}
      {activeTab === 'architecture' && <ArchitectureTab navigate={navigate} />}
      {activeTab === 'resources' && <ResourcesTab navigate={navigate} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Introduction Tab
// ---------------------------------------------------------------------------

function IntroductionTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">What is the Zorbit Platform?</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Zorbit is a MACH-compliant shared platform infrastructure for building enterprise
          applications. Platform services (Identity, Authorization, PII Vault, Audit, Messaging,
          Navigation) are independently deployed microservices. Business applications are built
          on top using the ZMB (Zorbit Module Builder) factory, which generates production-ready
          modules from a form schema — complete with REST API, database, events, and UI.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="card p-5">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${cap.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold mb-1">{cap.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              title: 'Design a Form',
              desc: 'Use Form Builder to define your data model — fields, steps, PII flags, validation.',
              action: () => navigate('/form-builder'),
              label: 'Open Form Builder',
            },
            {
              step: '2',
              title: 'Run ZMB',
              desc: 'Execute `zorbit zmb generate --form <slug>` to generate a full module.',
              action: () => navigate('/dev-center/guide'),
              label: 'Watch Tutorial',
            },
            {
              step: '3',
              title: 'Deploy',
              desc: 'Build locally, rsync dist/ to server, run PM2. Module is live in minutes.',
              action: () => navigate('/dev-center/guide'),
              label: 'View Docs',
            },
          ].map(({ step, title, desc, action, label }) => (
            <div key={step} className="card p-4 flex flex-col">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {step}
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{desc}</p>
              <button
                onClick={action}
                className="mt-3 flex items-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {label}
                <ArrowRight size={12} className="ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tutorials Tab — uses DemoTourPlayer
// ---------------------------------------------------------------------------

function TutorialsTab() {
  return (
    <div className="space-y-4">
      <DemoTourPlayer
        recordings={ZMB_TUTORIALS}
        baseUrl="/videos/"
        title="ZMB Tutorial Series"
        defaultLayout="chapters"
        layouts={['youtube', 'chapters', 'podcast']}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Architecture Tab
// ---------------------------------------------------------------------------

function ArchitectureTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Platform Architecture</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Zorbit follows MACH principles: Microservices, API-first, Cloud-native, Headless.
          Each layer is independently deployable.
        </p>

        <div className="flex flex-col gap-3">
          {ARCH_LAYERS.map((layer) => (
            <div
              key={layer.label}
              className={`rounded-lg border-2 ${layer.borderColor} ${layer.bgColor} p-4`}
            >
              <p className={`font-semibold text-sm mb-1 ${layer.color}`}>{layer.label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Key Design Rules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { rule: 'Namespace Isolation', desc: 'Every API enforces G/O/D/U namespace boundaries.' },
            { rule: 'Short Hash IDs', desc: 'All identifiers follow PREFIX-HASH (e.g. O-92AF). Immutable, non-sequential.' },
            { rule: 'No Cross-DB Access', desc: 'Services never query another service\'s database. REST only.' },
            { rule: 'PII Tokenization', desc: 'Raw PII never stored in operational DBs. Token only (e.g. PII-92AF).' },
            { rule: 'Event-Driven', desc: 'domain.entity.action naming. Published to Kafka via canonical envelope.' },
            { rule: 'JWT + RBAC', desc: 'Every request validated by Identity. Authorization enforces privileges.' },
          ].map(({ rule, desc }) => (
            <div key={rule} className="flex items-start space-x-3">
              <div className="mt-0.5 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
              <div>
                <p className="font-medium">{rule}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Full Architecture Reference</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Detailed service topology, event flows, and deployment diagrams
          </p>
        </div>
        <button
          onClick={() => navigate('/dev-center/architecture')}
          className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          View <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resources Tab
// ---------------------------------------------------------------------------

interface ResourceItem {
  label: string;
  desc: string;
  href: string | null;
  action?: () => void;
}

interface ResourceGroup {
  category: string;
  items: ResourceItem[];
}

function ResourcesTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const resources: ResourceGroup[] = [
    {
      category: 'SDK & Tools',
      items: [
        { label: 'zorbit-sdk-node', desc: 'Identity middleware, auth, Kafka client, observability.', href: 'https://github.com/souravsachin/zorbit-sdk-node' },
        { label: 'Zorbit CLI', desc: 'create-service, register-event, generate-api commands.', href: 'https://github.com/souravsachin/zorbit-cli' },
        { label: 'ZMB Factory', desc: 'Module generator — form schema to full stack module.', href: null, action: () => navigate('/dev-center') },
      ],
    },
    {
      category: 'Platform Services',
      items: [
        { label: 'Identity API', desc: 'Authentication, OAuth, SAML, RADIUS, JWT.', href: null, action: () => navigate('/identity/guide') },
        { label: 'Form Builder API', desc: 'Form schema management, submissions, versioning.', href: null, action: () => navigate('/form-builder/guide') },
        { label: 'PII Vault API', desc: 'Tokenization, detokenization, audit.', href: null, action: () => navigate('/pii-vault/guide') },
      ],
    },
    {
      category: 'Reference',
      items: [
        { label: 'REST Grammar', desc: '/api/v1/{namespace}/{namespace_id}/resource', href: null },
        { label: 'Event Naming', desc: 'domain.entity.action — e.g. identity.user.created', href: null },
        { label: 'Identifier Rules', desc: 'PREFIX-HASH pattern, immutable, globally unique', href: null },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {resources.map((group) => (
        <div key={group.category}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {group.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {group.items.map((item) => (
              <div
                key={item.label}
                className="card p-4 flex flex-col"
              >
                <p className="font-semibold text-sm mb-1">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{item.desc}</p>
                {(item.href || item.action) && (
                  item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Open <ArrowRight size={11} className="ml-1" />
                    </a>
                  ) : (
                    <button
                      onClick={item.action}
                      className="mt-2 flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Open <ArrowRight size={11} className="ml-1" />
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card p-6 bg-gray-50 dark:bg-gray-800/50 border-dashed">
        <h3 className="font-semibold text-sm mb-1">Coming Soon</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Interactive API playground, downloadable Postman collection, OpenAPI spec browser,
          and hands-on sandbox environment.
        </p>
      </div>
    </div>
  );
}

export default DevCenterGuidePage;
