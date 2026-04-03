import React from 'react';
import {
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Eye,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const ReportingHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="reporting"
      moduleName="Reporting & Analytics"
      moduleDescription="Business Intelligence &mdash; Dashboards, Scheduled Reports, Audit Trails, Data Export"
      moduleIntro="Reporting & Analytics provides comprehensive business intelligence across all insurance operations. It includes pre-built reports (production, claims, financial, regulatory), configurable dashboards, scheduled report delivery, ad-hoc query builder, audit trail viewer with cross-service filtering, and data export in multiple formats (Excel, PDF, CSV). The module aggregates data across all platform services."
      icon={BarChart3}
      capabilities={[
        {
          icon: PieChart,
          title: 'Pre-Built Reports',
          description: 'Production register, claims register, premium collection, loss ratio analysis, portfolio summary, regulatory returns, and commission statements.',
        },
        {
          icon: TrendingUp,
          title: 'Interactive Dashboards',
          description: 'Drag-and-drop dashboard builder with charts, KPI cards, tables, and filters. Real-time data refresh or scheduled snapshots.',
        },
        {
          icon: Calendar,
          title: 'Scheduled Delivery',
          description: 'Automated report generation and delivery via email on daily, weekly, monthly, or custom schedules. Multiple recipients and formats.',
        },
        {
          icon: Filter,
          title: 'Ad-Hoc Query Builder',
          description: 'Visual query builder for business users. Select dimensions, measures, filters, and groupings without writing SQL.',
        },
        {
          icon: Eye,
          title: 'Cross-Service Audit',
          description: 'Unified audit trail viewer aggregating events from identity, authorization, claims, underwriting, and all platform services.',
        },
        {
          icon: Download,
          title: 'Data Export',
          description: 'Export any report or query result to Excel, PDF, or CSV. Bulk data export with PII masking for external distribution.',
        },
      ]}
      targetUsers={[
        { role: 'Management', desc: 'View executive dashboards and key performance indicators.' },
        { role: 'Finance', desc: 'Generate financial reports, premium reconciliation, and regulatory returns.' },
        { role: 'Operations', desc: 'Monitor operational metrics: turnaround times, queue depths, and SLAs.' },
        { role: 'Compliance', desc: 'Review audit trails and generate regulatory compliance reports.' },
      ]}
      lifecycleStages={[
        { label: 'Configured', description: 'Report template or dashboard defined with data sources and filters.', color: '#f59e0b' },
        { label: 'Scheduled', description: 'Report assigned to delivery schedule. Recipients and format configured.', color: '#3b82f6' },
        { label: 'Generated', description: 'Report data queried and rendered. Available for viewing or download.', color: '#8b5cf6' },
        { label: 'Delivered', description: 'Report sent to recipients via email or published to portal.', color: '#10b981' },
        { label: 'Archived', description: 'Historical report version retained for compliance and comparison.', color: '#64748b' },
      ]}
      recordings={[
        {
          file: 'reporting-overview.mp4',
          title: 'Reporting & Analytics Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 55,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Pre-Built Reports', startMs: 10000 },
            { title: 'Dashboard Builder', startMs: 25000 },
            { title: 'Scheduling & Export', startMs: 40000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/reporting/"
      swaggerUrl="/api/reporting/api-docs"
      faqs={[
        { question: 'What pre-built reports are available?', answer: 'Production register, claims register, premium collection, loss ratio, portfolio summary, regulatory returns (DHA/MOH/CBUAE), commission statements, renewal pipeline, and audit compliance report.' },
        { question: 'Can I create custom reports?', answer: 'Yes. The ad-hoc query builder lets you select data sources, dimensions, measures, and filters visually. Custom reports can be saved and shared with other users.' },
        { question: 'How is PII handled in reports?', answer: 'Reports show PII tokens by default. Authorized users can request PII reveal for specific records. Bulk exports apply PII masking based on user privileges.' },
        { question: 'What export formats are supported?', answer: 'Excel (.xlsx), PDF (formatted), CSV (raw data), and JSON (API). PDF reports use configurable templates with company branding.' },
      ]}
      resources={[
        { label: 'Reporting API (Swagger)', url: '#', icon: FileText },
        { label: 'Report Catalog', url: '#', icon: BarChart3 },
      ]}
    />
  );
};

export default ReportingHubPage;
