import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Palette,
  Key,
  FormInput,
  Rocket,
  Settings,
  Copy,
  Check,
} from 'lucide-react';

interface Step {
  number: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  detail: string;
  code?: string;
  link?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Design Your Form in Form Builder',
    icon: <FormInput size={18} />,
    description:
      'Use the Zorbit Form Builder to design your module\'s data entry form visually. Drag-and-drop fields, set validation rules, and configure field types.',
    detail:
      'Navigate to Form Builder → Templates → Create New. Add fields for your domain (e.g., name, policy number, claim type). Save with a memorable slug — this becomes your module identifier.',
    link: { label: 'Open Form Builder', href: '/form-builder/templates' },
  },
  {
    number: 2,
    title: 'Create an Access Token',
    icon: <Key size={18} />,
    description:
      'Generate a Zorbit API access token so the ZMB CLI can authenticate and pull your form schema during module generation.',
    detail:
      'Go to Settings → Security → API Tokens → Create Token. Copy the token — you\'ll need it for the CLI command. Tokens are scoped to your organization namespace.',
    code: `# Set your token as an environment variable
export ZORBIT_TOKEN="zrb_live_xxxxxxxxxxxx"
export ZORBIT_ORG="O-92AF"`,
    link: { label: 'Go to Settings', href: '/settings/security' },
  },
  {
    number: 3,
    title: 'Configure White Label Theme',
    icon: <Palette size={18} />,
    description:
      'Set your module\'s visual identity — primary color, logo, brand name. The ZMB generator uses this to produce a styled, branded portal.',
    detail:
      'In the Console, navigate to Settings → White Label. Choose your primary color, upload a logo, and set the product name. The theme config is fetched by the CLI during generation.',
    code: `# Or pass theme inline
zorbit zmb create \\
  --theme primary-color=#2563eb \\
  --theme brand-name="Claims Portal"`,
  },
  {
    number: 4,
    title: 'Generate Module with CLI',
    icon: <Terminal size={18} />,
    description:
      'Run a single CLI command. ZMB fetches your form schema, applies your theme, and scaffolds a complete, deployable NestJS + React application.',
    detail:
      'The generated module includes: a NestJS backend with CRUD APIs, a React frontend with your form rendered by the FormRenderer SDK, PII tokenization wired in, FQP queue integration, and DataTable for the review UI.',
    code: `# Generate a new module from your form
zorbit zmb create \\
  --form claims-intake \\
  --org $ZORBIT_ORG \\
  --token $ZORBIT_TOKEN \\
  --output ./my-module

# Or use interactive mode
zorbit zmb create`,
  },
  {
    number: 5,
    title: 'Configure and Customize',
    icon: <Settings size={18} />,
    description:
      'The generated module is fully functional out of the box. Open the config file to tune behavior without touching code.',
    detail:
      'The 90:10 philosophy: 90% of customization happens in config, 10% in code. Edit module.config.ts to change queue behavior, PII fields, routing rules, and display columns.',
    code: `// module.config.ts — generated file
export const config = {
  module: 'claims_intake',
  piiFields: ['name', 'email', 'phone'],
  fqpQueue: 'claims.new',
  tableColumns: ['id', 'status', 'createdAt'],
  theme: {
    primaryColor: '#2563eb',
    brandName: 'Claims Portal',
  },
};`,
  },
  {
    number: 6,
    title: 'Deploy',
    icon: <Rocket size={18} />,
    description:
      'Build the module and deploy it using the standard Zorbit deployment pattern: build locally, rsync to server, PM2 manage.',
    detail:
      'The generated module includes a Dockerfile and PM2 ecosystem config. Use the same pattern as all other Zorbit services.',
    code: `# Build
npm run build

# Deploy (rsync + PM2)
rsync -avz dist/ sourav@server:~/apps/zorbit-platform/my-module/dist/
ssh sourav@server "cd ~/apps/zorbit-platform/my-module && npm ci --omit=dev && pm2 restart ecosystem.config.js"`,
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-3 group">
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed font-mono">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
        title="Copy"
      >
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}

const ZmbGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number>(1);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dev-center')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            ZMB Module Creation Guide
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Build your first Zorbit module in 6 steps
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-5 mb-8">
        <h2 className="font-semibold text-primary-800 dark:text-primary-200 mb-1">
          What is ZMB?
        </h2>
        <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">
          <strong>Zorbit Module Builder (ZMB)</strong> is a code generation tool that turns a Form
          Builder template into a complete, deployable business module. It wires together the 4
          Zorbit platform capabilities: Form Builder (input), DataTable (display), PII Vault
          (security), and FQP Queues (workflow). The target ratio is{' '}
          <strong>90% configuration, 10% code</strong>.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const isOpen = expanded === step.number;
          return (
            <div
              key={step.number}
              className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? 0 : step.number)}
                className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                    isOpen
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`${isOpen ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      {step.icon}
                    </span>
                    <span
                      className={`font-semibold text-sm ${
                        isOpen
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
                <CheckCircle2
                  size={16}
                  className={isOpen ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                    {step.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {step.detail}
                  </p>
                  {step.code && <CodeBlock code={step.code} />}
                  {step.link && (
                    <button
                      onClick={() => navigate(step.link!.href)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      <ExternalLink size={12} />
                      {step.link.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Prefer to watch instead of read?
        </p>
        <button
          onClick={() => navigate('/dev-center/tutorials')}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Watch the Video Tutorial
        </button>
      </div>
    </div>
  );
};

export default ZmbGuidePage;
