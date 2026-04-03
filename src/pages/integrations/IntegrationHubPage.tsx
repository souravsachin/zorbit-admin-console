import React from 'react';
import {
  Plug,
  Globe,
  Bot,
  Webhook,
  Activity,
  Shield,
  Clock,
  Database,
  FileText,
  Code,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';
import type { Slide } from '../../components/shared/SlidePlayer';

const INTEGRATION_SLIDES: Slide[] = [
  {
    id: 'title',
    title: 'Integration Hub',
    subtitle: 'Unified API & RPA Integration Platform',
    icon: <Plug size={32} />,
    background: 'bg-gradient-to-br from-cyan-700 via-blue-700 to-indigo-800',
    content: (
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">API Connectors</p>
          <p className="text-white/60 text-xs mt-1">REST, SOAP, GraphQL integrations</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">RPA Automation</p>
          <p className="text-white/60 text-xs mt-1">Legacy system screen scraping</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-white">Webhooks</p>
          <p className="text-white/60 text-xs mt-1">Inbound event receivers</p>
        </div>
      </div>
    ),
  },
  {
    id: 'connectors',
    title: 'Connector Types',
    subtitle: 'REST API, SOAP, Webhook, RPA, SFTP, Database',
    icon: <Globe size={32} />,
    background: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800',
    content: (
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-left">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-emerald-300">REST API</p>
          <p className="text-white/60 text-xs mt-1">Connect to modern APIs with OAuth2, API keys, or basic auth.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-blue-300">RPA</p>
          <p className="text-white/60 text-xs mt-1">Automate legacy systems via screen scraping and UI automation.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-amber-300">Webhooks</p>
          <p className="text-white/60 text-xs mt-1">Receive inbound events from partner systems and broker portals.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
          <p className="font-semibold text-purple-300">SFTP / Database</p>
          <p className="text-white/60 text-xs mt-1">Batch file transfers and direct database connectors for data sync.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'execution',
    title: 'Execution Monitoring',
    subtitle: 'Full request/response audit trail',
    icon: <Activity size={32} />,
    background: 'bg-gradient-to-br from-rose-700 via-pink-700 to-red-800',
    content: (
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-left">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold text-cyan-300">Request Logging</p>
          <p className="text-white/60 text-xs mt-1">
            Every execution records full request details: method, URL, headers, body. Debug issues instantly.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold text-amber-300">Response Tracking</p>
          <p className="text-white/60 text-xs mt-1">
            Response status, body, timing. Failed executions show error messages and retry history.
          </p>
        </div>
      </div>
    ),
  },
];

const IntegrationHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="integrations"
      moduleName="Integration Hub"
      moduleDescription="Unified API & RPA Integration Platform Service"
      moduleIntro="The Integration Hub provides a centralized way to configure, execute, and monitor third-party integrations. Connect to external APIs (health authorities, government registries, credit bureaus), automate legacy systems via RPA, receive inbound webhooks from partners, and schedule batch jobs. Every execution is logged with full request/response details for debugging and audit."
      icon={Plug}
      slides={INTEGRATION_SLIDES}
      capabilities={[
        {
          icon: Globe,
          title: 'API Connectors',
          description: 'Configure REST and SOAP connectors with auth, headers, retry policies, and endpoint mappings. Execute on demand or via schedule.',
        },
        {
          icon: Bot,
          title: 'RPA Automation',
          description: 'Define RPA connectors for legacy systems. Configure screen mappings and field bindings. Execute via API or scheduled jobs.',
        },
        {
          icon: Webhook,
          title: 'Webhook Receivers',
          description: 'Register inbound webhook endpoints for partner systems. Payloads are recorded and can trigger downstream workflows.',
        },
        {
          icon: Activity,
          title: 'Execution Monitoring',
          description: 'Full execution history with request/response details, timing, error messages, and status tracking (pending/running/success/failed).',
        },
        {
          icon: Clock,
          title: 'Scheduled Jobs',
          description: 'Configure cron schedules for batch integrations. Timezone-aware scheduling with retry policies.',
        },
        {
          icon: Shield,
          title: 'Secure Credentials',
          description: 'Credentials are never stored in connector configs. All secrets reference PII Vault or Secrets service tokens.',
        },
      ]}
      targetUsers={[
        { role: 'Integration Engineers', desc: 'Configure and manage third-party API connectors.' },
        { role: 'Operations Teams', desc: 'Monitor execution history, diagnose failures, and track SLAs.' },
        { role: 'Platform Developers', desc: 'Execute integrations from business modules via the REST API.' },
        { role: 'Compliance Officers', desc: 'Audit integration activity, verify sanctions checks, identity verifications.' },
      ]}
      lifecycleStages={[
        { label: 'Configure', description: 'Define connector with endpoints, auth, headers, and retry policy.', color: '#f59e0b' },
        { label: 'Execute', description: 'Trigger via API call, webhook, or cron schedule.', color: '#3b82f6' },
        { label: 'Record', description: 'Full request/response logged with timing and status.', color: '#8b5cf6' },
        { label: 'Monitor', description: 'View execution history, filter by status, debug failures.', color: '#10b981' },
      ]}
      swaggerUrl="/api/integration/api-docs"
      faqs={[
        { question: 'How are credentials secured?', answer: 'Credentials are never stored directly in connector configurations. The credentials field contains a reference to a PII Vault token or Secrets service entry. The actual secret is retrieved at execution time.' },
        { question: 'Does the RPA connector actually automate UIs?', answer: 'In Phase 1, RPA connectors are configuration stubs that record the screen mappings and field bindings. The execution is mocked. Phase 2 will integrate with UiPath/Automation Anywhere APIs.' },
        { question: 'Can I schedule integrations?', answer: 'Yes. Set the schedule field on a connector with a cron expression and timezone. The scheduler service (Phase 2) will trigger executions automatically.' },
        { question: 'How do webhooks authenticate?', answer: 'Webhook receivers validate the X-Webhook-Signature header against the API key configured in the connector. The endpoint is publicly accessible but payloads are verified.' },
        { question: 'What happens when an execution fails?', answer: 'The execution record captures the error message and response. Retry policies (maxRetries, backoffMs) are configured per connector and will automatically retry in Phase 2.' },
      ]}
      resources={[
        { label: 'Integration API (Swagger)', url: 'https://scalatics.com:3130/api-docs', icon: FileText },
        { label: 'Connector Schema Reference', url: '#', icon: Code },
        { label: 'Execution API', url: '#', icon: Database },
      ]}
    />
  );
};

export default IntegrationHubPage;
