import React from 'react';
import {
  RefreshCw,
  FileText,
  Calendar,
  Bell,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const RenewalsHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="renewals"
      moduleName="Renewals"
      moduleDescription="Policy Renewal Lifecycle &mdash; Automated Notices, Re-Rating, Lapse Management"
      moduleIntro="Renewals manages the end-to-end policy renewal process from pre-expiry notification through re-issuance or lapse. It automates renewal notices at configurable intervals (90/60/30 days), supports automatic re-rating with updated premium tables, handles grace periods, and manages lapse and reinstatement workflows. The module integrates with claims history to adjust renewal terms."
      icon={RefreshCw}
      capabilities={[
        {
          icon: Calendar,
          title: 'Renewal Pipeline',
          description: 'Automated tracking of all policies approaching expiry. Configurable pipeline views by 90-day, 60-day, and 30-day windows.',
        },
        {
          icon: Bell,
          title: 'Automated Notices',
          description: 'Multi-channel renewal notifications (email, SMS, portal) at configurable intervals. Pre-populated renewal offer with updated terms.',
        },
        {
          icon: TrendingUp,
          title: 'Re-Rating Engine',
          description: 'Automatic premium recalculation using latest rate tables, claims experience, age progression, and no-claim bonus/malus adjustments.',
        },
        {
          icon: Clock,
          title: 'Grace Period Management',
          description: 'Configurable grace periods by product type. Automatic coverage continuation during grace with payment reminders.',
        },
        {
          icon: RefreshCw,
          title: 'Lapse & Reinstatement',
          description: 'Automated policy lapse after grace period. Reinstatement workflow with medical re-underwriting if lapse exceeds threshold.',
        },
        {
          icon: BarChart3,
          title: 'Retention Dashboard',
          description: 'Renewal rate tracking, retention ratios, lapse analysis, and revenue impact of non-renewals by product and channel.',
        },
      ]}
      targetUsers={[
        { role: 'Renewal Team', desc: 'Process renewal offers, handle customer queries, and manage the renewal pipeline.' },
        { role: 'Underwriters', desc: 'Review renewal terms for policies with adverse claims history or risk changes.' },
        { role: 'Agents/Brokers', desc: 'Receive renewal lists, follow up with customers, and submit renewal acceptance.' },
        { role: 'Management', desc: 'Monitor retention rates and renewal revenue projections.' },
      ]}
      lifecycleStages={[
        { label: 'Pre-Renewal', description: 'Policy identified for renewal. Notice generated and sent to customer/agent.', color: '#f59e0b' },
        { label: 'Offer Sent', description: 'Renewal offer with updated premium and terms sent. Awaiting acceptance.', color: '#3b82f6' },
        { label: 'Accepted', description: 'Customer accepted renewal. Payment collection in progress.', color: '#8b5cf6' },
        { label: 'Renewed', description: 'Payment received. New policy period activated with updated terms.', color: '#10b981' },
        { label: 'Grace Period', description: 'Policy expired but within grace period. Coverage continues pending payment.', color: '#f97316' },
        { label: 'Lapsed', description: 'Grace period expired without payment. Coverage terminated.', color: '#ef4444' },
      ]}
      recordings={[
        {
          file: 'renewals-overview.mp4',
          title: 'Renewals Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 50,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Renewal Pipeline', startMs: 8000 },
            { title: 'Re-Rating', startMs: 20000 },
            { title: 'Retention Metrics', startMs: 35000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/renewals/"
      swaggerUrl="/api/renewals/api-docs"
      faqs={[
        { question: 'When are renewal notices sent?', answer: 'Default schedule is 90, 60, and 30 days before expiry. Each product can configure its own notice schedule and channel preferences.' },
        { question: 'How does no-claim bonus work on renewal?', answer: 'Each claim-free year earns a discount (typically 5-20%). The NCB percentage is applied during re-rating. Claims during the policy period reset or reduce the NCB.' },
        { question: 'What happens during the grace period?', answer: 'Coverage continues for the grace period duration (typically 15-30 days). If payment is received during grace, the policy continues seamlessly. After grace, the policy lapses.' },
        { question: 'Can lapsed policies be reinstated?', answer: 'Yes, within a reinstatement window (typically 6-12 months). Short lapses may not require medical re-underwriting. Longer lapses require fresh medical evaluation.' },
      ]}
      resources={[
        { label: 'Renewals API (Swagger)', url: '#', icon: FileText },
        { label: 'Retention Analysis Guide', url: '#', icon: BarChart3 },
      ]}
    />
  );
};

export default RenewalsHubPage;
