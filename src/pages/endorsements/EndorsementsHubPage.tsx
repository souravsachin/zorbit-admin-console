import React from 'react';
import {
  PenLine,
  FileText,
  Users,
  Shield,
  Clock,
  BarChart3,
  AlertTriangle,
  Calculator,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const EndorsementsHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="endorsements"
      moduleName="Endorsements"
      moduleDescription="Mid-Term Policy Modifications &mdash; Coverage Changes, Rider Add/Remove, Premium Adjustments"
      moduleIntro="Endorsements manages all mid-term policy modifications after issuance. This includes adding or removing coverage, updating beneficiary details, changing sum insured, adding riders, correcting policyholder information, and recalculating premiums. Each endorsement follows a structured approval workflow with full audit trail and version history."
      icon={PenLine}
      capabilities={[
        {
          icon: FileText,
          title: '12 Endorsement Types',
          description: 'Coverage add/remove, sum insured change, beneficiary update, rider modification, address change, name correction, payment mode change, policy assignment, reinstatement, cancellation, extension, and free-look.',
        },
        {
          icon: Calculator,
          title: 'Premium Recalculation',
          description: 'Automatic pro-rata premium adjustment based on endorsement effective date. Supports refund, additional premium, and nil-impact endorsements.',
        },
        {
          icon: Shield,
          title: 'Approval Workflow',
          description: 'Configurable approval matrix based on endorsement type, premium impact, and authority limits. Multi-level approval for high-impact changes.',
        },
        {
          icon: Users,
          title: 'Beneficiary Management',
          description: 'Add, remove, or update beneficiaries with nomination percentage validation and relationship verification.',
        },
        {
          icon: Clock,
          title: 'Version History',
          description: 'Complete policy version tracking. Every endorsement creates a new policy version with before/after comparison.',
        },
        {
          icon: BarChart3,
          title: 'Endorsement Dashboard',
          description: 'Real-time metrics: pending endorsements, average processing time, premium impact analysis, and rejection rates.',
        },
      ]}
      targetUsers={[
        { role: 'Policy Servicing Team', desc: 'Process endorsement requests from customers, agents, and brokers.' },
        { role: 'Underwriters', desc: 'Review and approve endorsements that require underwriting assessment.' },
        { role: 'Finance', desc: 'Process premium adjustments and refunds resulting from endorsements.' },
        { role: 'Customers', desc: 'Request policy changes through the self-service portal.' },
      ]}
      lifecycleStages={[
        { label: 'Requested', description: 'Endorsement request received. Supporting documents being collected.', color: '#f59e0b' },
        { label: 'Under Review', description: 'Request validated against policy terms and coverage rules.', color: '#3b82f6' },
        { label: 'UW Assessment', description: 'Endorsement referred to underwriting for risk assessment (if required).', color: '#8b5cf6' },
        { label: 'Approved', description: 'Endorsement approved. Premium adjustment calculated and policy updated.', color: '#10b981' },
        { label: 'Issued', description: 'Endorsement schedule generated. New policy version created and delivered.', color: '#059669' },
        { label: 'Rejected', description: 'Endorsement request declined with documented reason and customer notification.', color: '#ef4444' },
      ]}
      recordings={[
        {
          file: 'endorsements-overview.mp4',
          title: 'Endorsements Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 55,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Endorsement Types', startMs: 8000 },
            { title: 'Approval Workflow', startMs: 22000 },
            { title: 'Premium Impact', startMs: 38000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/endorsements/"
      swaggerUrl="/api/endorsements/api-docs"
      faqs={[
        { question: 'What endorsement types are supported?', answer: 'Coverage add/remove, sum insured change, beneficiary update, rider modification, address change, name correction, payment mode change, policy assignment, reinstatement, cancellation, extension, and free-look period return.' },
        { question: 'How is premium adjusted on endorsement?', answer: 'Pro-rata calculation from endorsement effective date to policy expiry. Refund for coverage reduction, additional premium for coverage increase. Some endorsements (name correction, address change) have nil premium impact.' },
        { question: 'Can endorsements be backdated?', answer: 'Yes, with appropriate authority. Backdated endorsements recalculate premium from the effective date and may trigger refunds or additional collection.' },
        { question: 'What triggers underwriting review?', answer: 'Sum insured increase beyond threshold, addition of high-risk riders, reinstatement after lapse, and any change that materially affects the risk profile.' },
      ]}
      resources={[
        { label: 'Endorsements API (Swagger)', url: '#', icon: FileText },
        { label: 'Endorsement Type Matrix', url: '#', icon: AlertTriangle },
      ]}
    />
  );
};

export default EndorsementsHubPage;
