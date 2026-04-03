import React from 'react';
import {
  Building2,
  FileText,
  Users,
  BarChart3,
  Handshake,
  ClipboardCheck,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const SMECorporateHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="sme-corporate"
      moduleName="SME & Corporate Insurance"
      moduleDescription="Group Insurance Lifecycle &mdash; Proposals, Negotiations, Census, Issuance"
      moduleIntro="SME & Corporate Insurance manages the complete group insurance lifecycle for corporate clients. This includes employer-sponsored health plans, group life, group personal accident, and workers compensation. The module handles census upload and validation, experience-based rating, multi-round negotiations, broker management, and annual renewal with claims experience adjustment."
      icon={Building2}
      capabilities={[
        {
          icon: FileText,
          title: 'Proposal Management',
          description: 'Structured proposal intake with company details, employee census upload (Excel/CSV), coverage requirements, and broker/agent assignment.',
        },
        {
          icon: Users,
          title: 'Census Processing',
          description: 'Bulk member upload with validation rules (age limits, relationship codes, salary bands). Support for additions, deletions, and corrections mid-term.',
        },
        {
          icon: Handshake,
          title: 'Negotiation Workflow',
          description: 'Multi-round quote negotiation with version tracking. Compare quotes across rounds with premium, benefit, and network changes highlighted.',
        },
        {
          icon: BarChart3,
          title: 'Experience Rating',
          description: 'Claims experience analysis from past reports (DHA, MOH, DOH, custom TPA). Loss ratio calculation and premium adjustment recommendations.',
        },
        {
          icon: ClipboardCheck,
          title: 'Approval Queue',
          description: 'Multi-level approval based on group size, premium volume, and deviation from standard rates. Authority matrix enforcement.',
        },
        {
          icon: TrendingUp,
          title: 'Portfolio Analytics',
          description: 'Corporate book analysis: loss ratios by segment, member demographics, utilization patterns, and renewal retention tracking.',
        },
      ]}
      targetUsers={[
        { role: 'Corporate Sales', desc: 'Submit new proposals, manage negotiations, and track pipeline.' },
        { role: 'Underwriters', desc: 'Review census data, assess risk, and determine pricing.' },
        { role: 'Approvers', desc: 'Review and approve quotes based on authority matrix.' },
        { role: 'Operations', desc: 'Process issuance, manage member additions/deletions, and handle endorsements.' },
      ]}
      lifecycleStages={[
        { label: 'Proposal', description: 'New corporate inquiry received. Census and requirements being gathered.', color: '#f59e0b' },
        { label: 'Analysis', description: 'Past claims reports analyzed. Experience rating calculated.', color: '#3b82f6' },
        { label: 'Negotiation', description: 'Quote presented to broker/client. Multi-round negotiation in progress.', color: '#8b5cf6' },
        { label: 'Approval', description: 'Final terms agreed. Pending internal approval based on authority matrix.', color: '#6366f1' },
        { label: 'Issued', description: 'Policy issued. Member cards generated. Network activated.', color: '#10b981' },
        { label: 'Servicing', description: 'Active policy. Handling member changes, endorsements, and claims.', color: '#059669' },
      ]}
      recordings={[
        {
          file: 'sme-corporate-overview.mp4',
          title: 'SME & Corporate Insurance Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 70,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Proposal Flow', startMs: 10000 },
            { title: 'Census & Rating', startMs: 25000 },
            { title: 'Negotiations', startMs: 40000 },
            { title: 'Issuance & Servicing', startMs: 55000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/sme-corporate/"
      swaggerUrl="/api/sme-corporate/api-docs"
      faqs={[
        { question: 'What group sizes are supported?', answer: 'From micro-SME (5-10 members) to large corporate (10,000+ members). Different underwriting rules apply based on group size bands.' },
        { question: 'How does experience rating work?', answer: 'Past 2-3 years of claims data from TPA reports (DHA, MOH, DOH formats) are analyzed. Loss ratio, frequency, severity, and IBNR are calculated to determine renewal premium.' },
        { question: 'Can we handle multi-round negotiations?', answer: 'Yes. Each negotiation round is versioned. The system tracks changes in premium, benefits, network, and deductibles across rounds with a comparison view.' },
        { question: 'How are member additions handled mid-term?', answer: 'Pro-rata premium for additions. Deletions processed with refund calculation. Members can be added individually or via bulk upload.' },
      ]}
      resources={[
        { label: 'Corporate API (Swagger)', url: '#', icon: FileText },
        { label: 'Census Template', url: '#', icon: Users },
        { label: 'Rating Methodology', url: '#', icon: Scale },
      ]}
    />
  );
};

export default SMECorporateHubPage;
