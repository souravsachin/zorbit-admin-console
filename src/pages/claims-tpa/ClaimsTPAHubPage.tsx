import React from 'react';
import {
  Upload,
  FileText,
  BarChart3,
  Search,
  Banknote,
  AlertTriangle,
  Database,
  GitCompare,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const ClaimsTPAHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="claims-tpa"
      moduleName="Claims TPA"
      moduleDescription="TPA Data Management &mdash; Report Uploads, Data Mapping, Analytics, Audit, Recoveries"
      moduleIntro="Claims TPA handles the ingestion, normalization, and analysis of claims data from third-party administrators. It supports multi-format TPA report uploads (DHA, MOH, DOH, and custom formats), automated field mapping, data quality validation, claims analytics with loss ratio calculations, claim audit for overpayment detection, referral management, and recovery tracking."
      icon={Upload}
      capabilities={[
        {
          icon: Upload,
          title: 'TPA Report Upload',
          description: 'Bulk upload TPA claims reports in Excel/CSV. Auto-detect format (DHA, MOH, DOH, custom). Sheet-to-TPA assignment with preview before processing.',
        },
        {
          icon: GitCompare,
          title: 'Field Mapping Engine',
          description: 'Configurable column mapping from TPA-specific formats to unified data model. Save mapping templates per TPA for reuse.',
        },
        {
          icon: Database,
          title: 'Unified Claims Data',
          description: 'Normalized claims repository across all TPAs. Searchable by member, provider, diagnosis, date range, and claim status.',
        },
        {
          icon: BarChart3,
          title: 'Claims Analytics',
          description: 'Loss ratio analysis, utilization patterns, top diagnosis codes, provider cost analysis, and member-level claims experience.',
        },
        {
          icon: Search,
          title: 'Claim Audit',
          description: 'Automated audit rules to detect overpayments, duplicate claims, coding errors, and policy exclusion violations.',
        },
        {
          icon: Banknote,
          title: 'Recoveries Tracking',
          description: 'Track identified recovery amounts from claim audits. Status tracking from identification through collection.',
        },
      ]}
      targetUsers={[
        { role: 'Claims Operations', desc: 'Upload TPA reports, manage field mappings, and monitor data quality.' },
        { role: 'Claims Analysts', desc: 'Run analytics, identify trends, and generate loss ratio reports.' },
        { role: 'Auditors', desc: 'Review flagged claims, confirm overpayments, and initiate recovery.' },
        { role: 'Management', desc: 'Monitor portfolio performance and TPA service levels.' },
      ]}
      lifecycleStages={[
        { label: 'Upload', description: 'TPA report file uploaded. Sheets detected and assigned to TPAs.', color: '#f59e0b' },
        { label: 'Mapping', description: 'Column mapping applied. Data validated against business rules.', color: '#3b82f6' },
        { label: 'Processing', description: 'Records normalized and loaded into unified claims database.', color: '#8b5cf6' },
        { label: 'Analytics', description: 'Loss ratios, utilization, and experience reports generated.', color: '#6366f1' },
        { label: 'Audit', description: 'Automated audit rules applied. Flagged claims sent for review.', color: '#f97316' },
        { label: 'Recovery', description: 'Confirmed overpayments tracked through recovery lifecycle.', color: '#10b981' },
      ]}
      recordings={[
        {
          file: 'claims-tpa-overview.mp4',
          title: 'Claims TPA Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 60,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'TPA Upload Flow', startMs: 10000 },
            { title: 'Field Mapping', startMs: 22000 },
            { title: 'Analytics & Audit', startMs: 38000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/claims-tpa/"
      swaggerUrl="/api/claims-tpa/api-docs"
      faqs={[
        { question: 'What TPA report formats are supported?', answer: 'DHA (Dubai Health Authority), MOH (Ministry of Health), DOH (Department of Health), and any custom Excel/CSV format. The field mapping engine adapts to any column layout.' },
        { question: 'How does auto-detect format work?', answer: 'The system analyzes column headers and sheet names to identify the TPA format. If multiple sheets exist, each can be assigned to a different TPA.' },
        { question: 'What audit rules are available?', answer: 'Duplicate claim detection, amount threshold violations, excluded diagnosis codes, provider fee schedule comparison, age/gender vs diagnosis validation, and coverage period verification.' },
        { question: 'Can we track recovery status?', answer: 'Yes. Each identified overpayment is tracked through: Identified, Notified (to TPA/provider), Under Dispute, Agreed, Recovered, and Written-Off statuses.' },
      ]}
      resources={[
        { label: 'Claims TPA API (Swagger)', url: '#', icon: FileText },
        { label: 'Data Dictionary', url: '#', icon: Database },
        { label: 'Audit Rules Guide', url: '#', icon: AlertTriangle },
      ]}
    />
  );
};

export default ClaimsTPAHubPage;
