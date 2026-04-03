import React from 'react';
import {
  Layers,
  FileText,
  Receipt,
  BarChart3,
  Shield,
  Calculator,
  Banknote,
  GitCompare,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const ReinsuranceHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="reinsurance"
      moduleName="Reinsurance"
      moduleDescription="Treaty &amp; Facultative Reinsurance &mdash; Cessions, Bordereaux, Settlements"
      moduleIntro="Reinsurance manages the complete reinsurance lifecycle including treaty and facultative arrangements. It handles automatic cession calculations based on treaty terms, bordereaux generation, premium and claims settlement between cedents and reinsurers, and Slice-of-Pie fee configurations for multi-party revenue sharing. The module supports quota share, surplus, excess of loss, and stop loss treaty types."
      icon={Layers}
      capabilities={[
        {
          icon: Shield,
          title: 'Treaty Management',
          description: 'Configure and manage treaty arrangements: quota share, surplus, excess of loss (XoL), and stop loss. Multi-layer programs with retention and limit tracking.',
        },
        {
          icon: Calculator,
          title: 'Automatic Cession',
          description: 'Rule-based automatic cession to reinsurers based on treaty terms. Sum-at-risk calculation, retention monitoring, and overflow allocation.',
        },
        {
          icon: FileText,
          title: 'Bordereaux Generation',
          description: 'Automated premium and claims bordereaux generation on configurable schedules (monthly, quarterly). Standard and custom formats supported.',
        },
        {
          icon: Receipt,
          title: 'Slice-of-Pie Configuration',
          description: 'Multi-party fee and commission arrangements between platform providers, reinsurers, cedents, brokers, TPAs, and distribution partners.',
        },
        {
          icon: Banknote,
          title: 'Settlement Processing',
          description: 'Periodic settlement calculation with netting across premium, claims, and commissions. Statement generation and reconciliation.',
        },
        {
          icon: BarChart3,
          title: 'Portfolio Analytics',
          description: 'Cession ratios, reinsurer exposure, net retention analysis, and treaty utilization dashboards.',
        },
      ]}
      targetUsers={[
        { role: 'Reinsurance Team', desc: 'Configure treaties, monitor cessions, and generate bordereaux.' },
        { role: 'Finance', desc: 'Process reinsurance settlements and reconcile accounts.' },
        { role: 'Actuaries', desc: 'Analyze treaty performance and recommend program structure.' },
        { role: 'Management', desc: 'Monitor net retention exposure and reinsurance costs.' },
      ]}
      lifecycleStages={[
        { label: 'Treaty Setup', description: 'Treaty terms negotiated and configured in the system.', color: '#f59e0b' },
        { label: 'Active', description: 'Treaty active. Automatic cessions being calculated on new business.', color: '#10b981' },
        { label: 'Bordereaux Due', description: 'Periodic bordereaux generation triggered. Data being compiled.', color: '#3b82f6' },
        { label: 'Settlement', description: 'Net settlement calculated. Statements sent to reinsurer/cedent.', color: '#8b5cf6' },
        { label: 'Reconciled', description: 'Settlement confirmed and matched. Period closed.', color: '#059669' },
        { label: 'Expired/Renewed', description: 'Treaty period ended. Renewed with updated terms or expired.', color: '#64748b' },
      ]}
      recordings={[
        {
          file: 'reinsurance-overview.mp4',
          title: 'Reinsurance Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 65,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Treaty Types', startMs: 10000 },
            { title: 'Cession Engine', startMs: 25000 },
            { title: 'Slice-of-Pie Fees', startMs: 40000 },
            { title: 'Settlements', startMs: 52000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/reinsurance/"
      swaggerUrl="/api/reinsurance/api-docs"
      faqs={[
        { question: 'What treaty types are supported?', answer: 'Quota share (fixed percentage), surplus (based on sum insured exceeding retention), excess of loss (aggregate claims above threshold), and stop loss (loss ratio cap). Multi-layer programs are supported.' },
        { question: 'What is Slice-of-Pie?', answer: 'A multi-party fee arrangement engine. Defines how revenue (premium, fees) is split between platform provider, reinsurer, cedent, broker, TPA, and distribution partners. Each slice can be percentage-based or flat with caps.' },
        { question: 'How are bordereaux generated?', answer: 'Automatically on configurable schedules. Premium bordereaux list all policies ceded with premium details. Claims bordereaux list all claims with recovery amounts. Formats: standard Excel, Lloyd market format, or custom.' },
        { question: 'How does settlement netting work?', answer: 'Premium due to reinsurer, claims recovery due from reinsurer, and commission due to cedent are netted into a single settlement amount per period.' },
      ]}
      resources={[
        { label: 'Reinsurance API (Swagger)', url: '#', icon: FileText },
        { label: 'Treaty Configuration Guide', url: '#', icon: GitCompare },
      ]}
    />
  );
};

export default ReinsuranceHubPage;
