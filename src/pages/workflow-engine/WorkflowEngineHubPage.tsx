import React from 'react';
import {
  Filter,
  Layers,
  GitBranch,
  Workflow,
  Bot,
  UserCheck,
  Eye,
  Zap,
  ArrowRight,
  Database,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';
import type { Slide } from '../../components/shared/SlidePlayer';

const WORKFLOW_SLIDES: Slide[] = [
  {
    id: 'title',
    title: 'Workflow Engine (FQP)',
    subtitle: 'Filters, Queues, Pipelines -- Generic Workflow Orchestration',
    icon: <Workflow size={32} />,
    audioSrc: '/audio/workflow-engine/slide_01.mp3',
    background: 'bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800',
    content: (
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Recursive Filters</p>
          <p className="text-white/60 text-xs mt-1">AND/OR/NOT with unlimited nesting</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Smart Queues</p>
          <p className="text-white/60 text-xs mt-1">Filter-driven routing with priorities</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Multi-Stage Pipelines</p>
          <p className="text-white/60 text-xs mt-1">Human, moderated, automated stages</p>
        </div>
      </div>
    ),
  },
  {
    id: 'filters',
    title: 'Recursive Filter Conditions',
    subtitle: 'Conditions inside conditions inside conditions',
    icon: <Filter size={32} />,
    audioSrc: '/audio/workflow-engine/slide_02.mp3',
    background: 'bg-gradient-to-br from-blue-700 via-cyan-700 to-teal-800',
    content: (
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-left">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-cyan-300">Leaf Conditions</p>
          <p className="text-white/60 text-xs mt-1">field + operator + value (equals, between, in, regex, etc.)</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-blue-300">Compound Conditions</p>
          <p className="text-white/60 text-xs mt-1">AND, OR, NOT with nested children -- unlimited depth</p>
        </div>
      </div>
    ),
  },
  {
    id: 'queues',
    title: 'Queue Routing',
    subtitle: 'Items automatically routed to matching queues',
    icon: <Layers size={32} />,
    audioSrc: '/audio/workflow-engine/slide_03.mp3',
    background: 'bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800',
    content: (
      <div className="flex items-center justify-center gap-3 mt-4 text-sm">
        {[
          { label: 'STP Auto Queue', desc: 'Low-value items', color: 'border-green-400 bg-green-500/20' },
          { label: 'Junior Review', desc: 'Mid-range items', color: 'border-amber-400 bg-amber-500/20' },
          { label: 'Senior Review', desc: 'High-value items', color: 'border-red-400 bg-red-500/20' },
        ].map((q, i) => (
          <React.Fragment key={q.label}>
            {i > 0 && <ArrowRight size={20} className="text-white/40" />}
            <div className={`${q.color} border backdrop-blur rounded-lg p-4 text-center min-w-[130px]`}>
              <p className="font-bold text-white">{q.label}</p>
              <p className="text-white/60 text-xs mt-1">{q.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    id: 'pipelines',
    title: 'Pipeline Stages',
    subtitle: 'From full automation to human oversight',
    icon: <GitBranch size={32} />,
    audioSrc: '/audio/workflow-engine/slide_04.mp3',
    background: 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800',
    content: (
      <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
        {[
          { mode: 'Automated', desc: 'Pure rule execution (STP)', icon: <Zap size={16} /> },
          { mode: 'Top Moderated', desc: 'AI decides, human spot-checks', icon: <Eye size={16} /> },
          { mode: 'Moderated', desc: 'AI suggests, human approves all', icon: <Bot size={16} /> },
          { mode: 'Human', desc: 'Person must act on every item', icon: <UserCheck size={16} /> },
        ].map((s) => (
          <div key={s.mode} className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="flex justify-center mb-1 text-white/80">{s.icon}</div>
            <p className="font-semibold text-white">{s.mode}</p>
            <p className="text-white/50 text-[10px] mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'objects',
    title: 'Exported Objects',
    subtitle: 'Modules register their object schemas for filtering',
    icon: <Database size={32} />,
    audioSrc: '/audio/workflow-engine/slide_05.mp3',
    background: 'bg-gradient-to-br from-rose-700 via-pink-700 to-purple-800',
    content: (
      <div className="grid grid-cols-3 gap-3 mt-4 text-sm text-left">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-green-300">Versioned Schemas</p>
          <p className="text-white/60 text-xs mt-1">Each object type has a JSON Schema defining filterable fields</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-amber-300">Module Agnostic</p>
          <p className="text-white/60 text-xs mt-1">Claims, quotations, products -- any module can register</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-purple-300">Deep Field Paths</p>
          <p className="text-white/60 text-xs mt-1">claim.hospitalCharges.estimatedBill.roomRent</p>
        </div>
      </div>
    ),
  },
];

const WorkflowEngineHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="workflow-engine"
      moduleName="Workflow Engine"
      moduleDescription="FQP &mdash; Filters, Queues, Pipelines for Generic Workflow Orchestration"
      moduleIntro="The Workflow Engine (FQP) is a generic, recursive filter-based routing system. Business modules export their object schemas, define recursive filter conditions (AND/OR/NOT with unlimited nesting), create queues that combine multiple filters, and build pipelines with human, moderated, and automated stages. Items submitted to the engine are automatically evaluated against all active queues and routed accordingly."
      icon={Workflow}
      slides={WORKFLOW_SLIDES}
      capabilities={[
        {
          icon: Filter,
          title: 'Recursive Filters',
          description: 'Define conditions with unlimited nesting: AND/OR/NOT groups containing leaf comparisons or other groups. 16 operators supported.',
        },
        {
          icon: Layers,
          title: 'Smart Queues',
          description: 'Queues combine multiple filters with AND/OR logic. Items automatically route to all matching queues based on priority.',
        },
        {
          icon: GitBranch,
          title: 'Multi-Stage Pipelines',
          description: 'Pipelines define processing stages: automated (STP), top_moderated (AI + spot-check), moderated (AI + human), human (full manual).',
        },
        {
          icon: Database,
          title: 'Object Export Registry',
          description: 'Modules register versioned object schemas. The engine knows what fields are available for filtering without tight coupling.',
        },
        {
          icon: Zap,
          title: 'Filter Evaluation Engine',
          description: 'Core engine evaluates recursive condition trees against object data. Supports deep nested field paths and type coercion.',
        },
        {
          icon: Eye,
          title: 'Execution Audit Trail',
          description: 'Every action taken on a queue item is recorded with actor, stage, timestamp, and object snapshot for full traceability.',
        },
      ]}
      targetUsers={[
        { role: 'Business Analysts', desc: 'Define filters and queues to route work items to the right teams.' },
        { role: 'Operations Managers', desc: 'Monitor queue depths, pipeline throughput, and STP rates.' },
        { role: 'Underwriters', desc: 'Process items in their assigned queues, take actions to advance pipelines.' },
        { role: 'System Integrators', desc: 'Register exported objects from business modules into the FQP engine.' },
      ]}
      lifecycleStages={[
        { label: 'Submitted', description: 'Item submitted and evaluated against all active queue filters.', color: '#3b82f6' },
        { label: 'Queued', description: 'Item placed into one or more matching queues. Pipeline stage 0.', color: '#f59e0b' },
        { label: 'In Progress', description: 'An actor is working on the item at the current pipeline stage.', color: '#8b5cf6' },
        { label: 'Completed', description: 'Item reached a terminal outcome (approved, rejected, etc.).', color: '#10b981' },
      ]}
      recordings={[]}
      videosBaseUrl="/demos/workflow-engine/"
      swaggerUrl="/api/workflow-engine/api-docs"
      faqs={[
        { question: 'What is a recursive filter condition?', answer: 'A filter condition can be a leaf (field + operator + value) or a compound (AND/OR/NOT containing child conditions). Children can themselves be compound, allowing unlimited nesting depth.' },
        { question: 'What pipeline stage modes are available?', answer: 'Four modes: "automated" (pure rule execution / STP), "top_moderated" (AI decides, human spot-checks samples), "moderated" (AI suggests, human approves every decision), and "human" (person must act on every item).' },
        { question: 'Can an item be in multiple queues?', answer: 'Yes. When submitted, the item is evaluated against all active queues. It is placed into every queue whose filters match.' },
        { question: 'What operators are supported?', answer: 'equals, not_equals, less_than, greater_than, less_than_or_equal, greater_than_or_equal, in, not_in, between, contains, starts_with, ends_with, is_null, is_not_null, regex.' },
      ]}
      resources={[
        { label: 'Workflow Engine API (Swagger)', url: 'https://scalatics.com:3131/api-docs', icon: Database },
      ]}
    />
  );
};

export default WorkflowEngineHubPage;
