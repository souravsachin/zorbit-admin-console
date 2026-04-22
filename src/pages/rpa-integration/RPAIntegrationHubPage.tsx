import React from 'react';
import {
  Cpu,
  FileText,
  KeyRound,
  Play,
  Calendar,
  Layers,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const RPAIntegrationHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="rpa_integration"
      moduleName="RPA Integration"
      moduleDescription="Robotic Process Automation &mdash; Credentials, Segments, Playlists, Scheduling"
      moduleIntro="RPA Integration manages robotic process automation workflows that interact with external partner portals (insurance authorities, regulators, reinsurers, brokers). It securely stores portal credentials, defines automation segments (login, navigate, extract, submit), composes segments into playlists, and schedules automated runs. This eliminates manual data entry and extraction from partner systems."
      icon={Cpu}
      capabilities={[
        {
          icon: KeyRound,
          title: 'Credential Vault',
          description: 'Secure storage for partner portal credentials. Tracks IP whitelisting requirements, VPN dependencies, and access notes per partner.',
        },
        {
          icon: Layers,
          title: 'Segment Builder',
          description: 'Define reusable automation segments: login sequences, page navigation, data extraction patterns, form submission, and file download.',
        },
        {
          icon: Play,
          title: 'Playlist Composer',
          description: 'Chain segments into complete workflows. Error handling, retry logic, and conditional branching between segments.',
        },
        {
          icon: Calendar,
          title: 'Scheduler',
          description: 'Cron-based scheduling for automated runs. Support for daily, weekly, monthly, and event-triggered execution.',
        },
        {
          icon: BarChart3,
          title: 'Run Monitoring',
          description: 'Real-time execution monitoring with screenshots at each step. Success/failure tracking, duration metrics, and alerting.',
        },
        {
          icon: AlertTriangle,
          title: 'Error Recovery',
          description: 'Automatic retry with configurable backoff. Portal change detection alerts. Manual intervention queue for failed runs.',
        },
      ]}
      targetUsers={[
        { role: 'Integration Team', desc: 'Build and maintain RPA segments and playlists for partner portals.' },
        { role: 'Operations', desc: 'Schedule automated runs and monitor execution status.' },
        { role: 'IT Security', desc: 'Manage credential rotation and access audit.' },
        { role: 'Management', desc: 'Track automation ROI and operational efficiency gains.' },
      ]}
      lifecycleStages={[
        { label: 'Design', description: 'Segments defined and tested against partner portal.', color: '#f59e0b' },
        { label: 'Composed', description: 'Segments assembled into playlists with error handling.', color: '#3b82f6' },
        { label: 'Scheduled', description: 'Playlist assigned to schedule. Ready for automated execution.', color: '#8b5cf6' },
        { label: 'Running', description: 'Playlist executing. Steps being processed sequentially.', color: '#6366f1' },
        { label: 'Completed', description: 'Run finished successfully. Data extracted/submitted.', color: '#10b981' },
        { label: 'Failed', description: 'Run encountered an error. Queued for manual review.', color: '#ef4444' },
      ]}
      recordings={[
        {
          file: 'rpa-integration-overview.mp4',
          title: 'RPA Integration Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 55,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Credentials & Segments', startMs: 10000 },
            { title: 'Playlists', startMs: 25000 },
            { title: 'Scheduling & Monitoring', startMs: 40000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/rpa-integration/"
      swaggerUrl="/api/rpa_integration/api-docs"
      faqs={[
        { question: 'What types of partner portals can be automated?', answer: 'Insurance authority portals (DHA, MOH, DOH), reinsurer extranets, broker platforms, bank payment portals, and any web-based system with login access.' },
        { question: 'How are credentials secured?', answer: 'Credentials are encrypted at rest using AES-256. Access is role-restricted. Credential usage is logged in the audit trail. Rotation reminders are configurable.' },
        { question: 'What happens when a portal changes its layout?', answer: 'The system detects element selector failures and raises an alert. The segment is paused until updated by the integration team. Unaffected segments continue running.' },
        { question: 'Can RPA runs be triggered by events?', answer: 'Yes. In addition to cron schedules, runs can be triggered by platform events (new policy issued, claim approved, renewal due) via Kafka event integration.' },
      ]}
      resources={[
        { label: 'RPA API (Swagger)', url: '#', icon: FileText },
        { label: 'Segment Design Guide', url: '#', icon: Layers },
      ]}
    />
  );
};

export default RPAIntegrationHubPage;
