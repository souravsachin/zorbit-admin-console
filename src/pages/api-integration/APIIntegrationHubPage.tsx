import React from 'react';
import {
  Plug,
  FileText,
  KeyRound,
  Play,
  Calendar,
  Layers,
  BarChart3,
  Shield,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const APIIntegrationHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="api_integration"
      moduleName="API Integration"
      moduleDescription="External API Connectivity &mdash; Credentials, Endpoints, Orchestration, Monitoring"
      moduleIntro="API Integration manages outbound API connections to external partners, regulators, and data providers. Unlike RPA (which automates portal UIs), this module handles direct API-to-API integrations via REST, SOAP, and SFTP. It manages API credentials (API keys, OAuth tokens, certificates), defines integration segments (request/response mappings), composes multi-step orchestrations, and provides real-time monitoring."
      icon={Plug}
      capabilities={[
        {
          icon: KeyRound,
          title: 'API Credential Store',
          description: 'Manage API keys, OAuth client credentials, mutual TLS certificates, and SFTP keys for external partner APIs.',
        },
        {
          icon: Layers,
          title: 'Endpoint Registry',
          description: 'Register external API endpoints with request/response schemas, authentication method, rate limits, and SLA expectations.',
        },
        {
          icon: Play,
          title: 'Orchestration Flows',
          description: 'Chain multiple API calls into workflows. Data transformation between steps. Parallel execution and conditional branching.',
        },
        {
          icon: Calendar,
          title: 'Batch Scheduling',
          description: 'Schedule periodic batch API calls (nightly data sync, daily rate fetch, weekly report pull) with configurable retry policies.',
        },
        {
          icon: BarChart3,
          title: 'Health Monitoring',
          description: 'Real-time API health dashboard: response times, error rates, throughput, and SLA compliance per partner endpoint.',
        },
        {
          icon: Shield,
          title: 'Security & Compliance',
          description: 'Mutual TLS support, request signing, IP whitelisting, and full request/response audit logging for regulatory compliance.',
        },
      ]}
      targetUsers={[
        { role: 'Integration Engineers', desc: 'Configure API endpoints, credentials, and orchestration flows.' },
        { role: 'Operations', desc: 'Monitor API health and handle integration failures.' },
        { role: 'Security', desc: 'Manage certificates, review access logs, and enforce compliance.' },
        { role: 'Business Analysts', desc: 'Define data mapping requirements between internal and external systems.' },
      ]}
      lifecycleStages={[
        { label: 'Registered', description: 'External API endpoint registered with credentials and schema.', color: '#f59e0b' },
        { label: 'Tested', description: 'Connectivity verified. Request/response mapping validated in sandbox.', color: '#3b82f6' },
        { label: 'Active', description: 'Integration live in production. Monitoring enabled.', color: '#10b981' },
        { label: 'Degraded', description: 'Partner API experiencing issues. Fallback or retry in effect.', color: '#f97316' },
        { label: 'Disabled', description: 'Integration paused due to partner downtime or credential expiry.', color: '#ef4444' },
      ]}
      recordings={[
        {
          file: 'api-integration-overview.mp4',
          title: 'API Integration Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 50,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Credential Management', startMs: 10000 },
            { title: 'Orchestration', startMs: 25000 },
            { title: 'Monitoring', startMs: 38000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/api-integration/"
      swaggerUrl="/api/api_integration/api-docs"
      faqs={[
        { question: 'What API protocols are supported?', answer: 'REST (JSON/XML), SOAP (WSDL), GraphQL, SFTP (file-based), and webhooks (inbound). Each endpoint is configured with its protocol and authentication method.' },
        { question: 'How are API credentials rotated?', answer: 'Configurable expiry reminders. OAuth tokens are auto-refreshed. API keys and certificates trigger alerts before expiry. Rotation history is tracked.' },
        { question: 'What happens when a partner API is down?', answer: 'Configurable retry with exponential backoff. After max retries, the request is queued for manual retry. Critical integrations can have fallback endpoints.' },
        { question: 'How is data mapped between systems?', answer: 'Visual mapping editor connects source fields to target fields. Supports transformations (date format, code lookup, concatenation). Mappings are versioned.' },
      ]}
      resources={[
        { label: 'API Integration Docs (Swagger)', url: '#', icon: FileText },
        { label: 'Partner Registry', url: '#', icon: Plug },
      ]}
    />
  );
};

export default APIIntegrationHubPage;
