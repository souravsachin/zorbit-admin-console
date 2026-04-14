import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FormInput,
  Table2,
  Lock,
  Filter,
  ArrowRight,
  Code2,
  Settings,
  Layers,
} from 'lucide-react';

interface CapabilityCard {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
  examples: string[];
}

const CAPABILITIES: CapabilityCard[] = [
  {
    icon: <FormInput size={24} />,
    title: 'Form Builder',
    tagline: 'All input',
    description:
      'Every piece of data enters the platform through a Form Builder template. Forms are schema-defined, version-controlled, and renderable anywhere via the SDK FormRenderer.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    examples: ['Claims intake', 'New application', 'Prospect registration', 'Policy endorsement'],
  },
  {
    icon: <Table2 size={24} />,
    title: 'DataTable',
    tagline: 'All display',
    description:
      'Structured data is always displayed through the DataTable engine. It handles filtering, sorting, pagination, PII masking, and single-backend routing. Configure columns in JSON — zero frontend code.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    examples: ['Claims queue', 'Policy list', 'Customer search', 'Audit trail viewer'],
  },
  {
    icon: <Lock size={24} />,
    title: 'PII Vault',
    tagline: 'All sensitive data',
    description:
      'Sensitive fields are never stored raw in operational databases. PII Vault tokenizes them on write and detokenizes on read based on role privilege. Operational systems hold only tokens (e.g. PII-92AF).',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
    examples: ['Name → PII-A1B2', 'Email → PII-C3D4', 'Phone → PII-E5F6', 'NIC → PII-G7H8'],
  },
  {
    icon: <Filter size={24} />,
    title: 'FQP Queues',
    tagline: 'All filtered views',
    description:
      'Filter → Queue → Pipeline. Every workflow is modeled as a Kafka-backed queue with configurable filters. Submissions flow into queues; agents process them through pipelines. No ad-hoc query logic.',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800',
    examples: ['New claims queue', 'UW review pipeline', 'Prospect follow-up', 'Renewal triggers'],
  },
];

const ArchitecturePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            Architecture Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The 4 Zorbit platform capabilities
          </p>
        </div>
      </div>

      {/* Philosophy banner */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={18} className="text-primary-400" />
          <span className="text-primary-400 font-semibold text-sm">MACH Architecture</span>
        </div>
        <h2 className="text-lg font-bold mb-2">The 90:10 Philosophy</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Zorbit modules should be 90% configuration and 10% code. The platform handles
          authentication, PII, queuing, and display. You configure — not code — your business rules.
        </p>
        {/* Ratio bar */}
        <div className="flex rounded-lg overflow-hidden h-8 text-xs font-semibold">
          <div className="bg-primary-600 flex items-center justify-center" style={{ width: '90%' }}>
            <Settings size={12} className="mr-1" />
            90% Config
          </div>
          <div className="bg-gray-600 flex items-center justify-center" style={{ width: '10%' }}>
            <Code2 size={12} className="mr-1" />
            10%
          </div>
        </div>
      </div>

      {/* Data flow diagram */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Module Data Flow
        </h2>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {['Form Builder', 'PII Vault', 'FQP Queue', 'DataTable'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700 rounded-xl flex items-center justify-center">
                  {i === 0 && <FormInput size={20} className="text-primary-600 dark:text-primary-400" />}
                  {i === 1 && <Lock size={20} className="text-primary-600 dark:text-primary-400" />}
                  {i === 2 && <Filter size={20} className="text-primary-600 dark:text-primary-400" />}
                  {i === 3 && <Table2 size={20} className="text-primary-600 dark:text-primary-400" />}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                  {step}
                </span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {['User enters data', 'PII tokenized', 'Queued for review', 'Agents see data'].map(
            (desc) => (
              <span key={desc} className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                {desc}
              </span>
            ),
          )}
        </div>
      </div>

      {/* The 4 capabilities */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
        The 4 Platform Capabilities
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.title}
            className={`border rounded-2xl p-5 ${cap.bgColor}`}
          >
            <div className={`flex items-center gap-2 mb-3 ${cap.color}`}>
              {cap.icon}
              <div>
                <span className="font-bold text-sm">{cap.title}</span>
                <span className="text-xs ml-2 opacity-70">— {cap.tagline}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {cap.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cap.examples.map((ex) => (
                <span
                  key={ex}
                  className="text-xs bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SDK integration */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
          SDK Integration Pattern
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generated modules use the zorbit-sdk-react for all UI primitives. No custom DataTables or
          form renderers — everything comes from the SDK.
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
{`// Generated module — frontend entry point
import { FormRenderer } from '@zorbit/sdk-react/FormRenderer';
import { ZorbitDataTable } from '@zorbit/sdk-react/ZorbitDataTable';
import { useZorbitAuth } from '@zorbit/sdk-react/hooks';

// Form input — powered by Form Builder schema
<FormRenderer formSlug="claims-intake" orgId={orgId} />

// Queue display — powered by DataTable engine
<ZorbitDataTable
  source="/api/v1/O/{orgId}/claims/queue"
  columns={config.tableColumns}
  piiFields={config.piiFields}
/>`}
        </pre>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/dev-center/zmb-guide')}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Build Your First Module
        </button>
        <button
          onClick={() => navigate('/dev-center/tutorials')}
          className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Watch Tutorials
        </button>
      </div>
    </div>
  );
};

export default ArchitecturePage;
