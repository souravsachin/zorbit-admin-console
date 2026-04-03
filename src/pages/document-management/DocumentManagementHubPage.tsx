import React from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Tags,
  Lock,
  Clock,
  Download,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const DocumentManagementHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="document-management"
      moduleName="Document Management"
      moduleDescription="Document Types, Templates, Storage, Versioning &amp; Compliance"
      moduleIntro="Document Management provides centralized document lifecycle management across all insurance operations. It defines document types required at each stage (application, underwriting, claims, endorsement), manages document templates (policy schedules, claim forms, renewal notices), handles secure storage with versioning, enforces document collection checklists, and provides OCR-based data extraction for uploaded documents."
      icon={FolderOpen}
      capabilities={[
        {
          icon: Tags,
          title: 'Document Type Registry',
          description: 'Define document types with metadata: category (KYC, medical, financial, legal), required formats (PDF, image, DICOM), size limits, and retention periods.',
        },
        {
          icon: FileText,
          title: 'Template Management',
          description: 'Version-controlled document templates for policy schedules, endorsement schedules, claim forms, renewal notices, and correspondence.',
        },
        {
          icon: Upload,
          title: 'Upload & OCR',
          description: 'Drag-and-drop upload with automatic OCR text extraction. AI-assisted document classification and data field extraction.',
        },
        {
          icon: Search,
          title: 'Document Search',
          description: 'Full-text search across document content (via OCR). Filter by type, policy, claim, date, and status. Quick preview without download.',
        },
        {
          icon: Clock,
          title: 'Version Control',
          description: 'Every document upload creates a version. Full history with who uploaded what and when. Rollback to previous versions.',
        },
        {
          icon: Lock,
          title: 'Access Control & Retention',
          description: 'Role-based document access. Configurable retention periods with automated archival and destruction schedules for compliance.',
        },
      ]}
      targetUsers={[
        { role: 'Operations', desc: 'Upload, classify, and attach documents to policies and claims.' },
        { role: 'Underwriters', desc: 'Review medical reports, financial statements, and KYC documents.' },
        { role: 'Claims Team', desc: 'Collect and verify claim-supporting documents.' },
        { role: 'Compliance', desc: 'Enforce document retention policies and audit document access.' },
      ]}
      lifecycleStages={[
        { label: 'Required', description: 'Document type mandated by workflow stage. Checklist item created.', color: '#f59e0b' },
        { label: 'Uploaded', description: 'Document received and stored. OCR processing initiated.', color: '#3b82f6' },
        { label: 'Classified', description: 'Document type confirmed. Metadata extracted and indexed.', color: '#8b5cf6' },
        { label: 'Verified', description: 'Document reviewed and accepted by authorized user.', color: '#10b981' },
        { label: 'Archived', description: 'Active use period ended. Moved to long-term storage per retention policy.', color: '#64748b' },
        { label: 'Destroyed', description: 'Retention period expired. Document permanently deleted per policy.', color: '#ef4444' },
      ]}
      recordings={[
        {
          file: 'document-management-overview.mp4',
          title: 'Document Management Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 50,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Document Types', startMs: 8000 },
            { title: 'Upload & OCR', startMs: 20000 },
            { title: 'Versioning & Retention', startMs: 35000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/document-management/"
      swaggerUrl="/api/document-management/api-docs"
      faqs={[
        { question: 'What document types are pre-configured?', answer: 'KYC (passport, Emirates ID, trade license), Medical (lab reports, discharge summary, prescription), Financial (salary certificate, bank statement), and Legal (POA, court order). Custom types can be added.' },
        { question: 'How does OCR work?', answer: 'Uploaded images and scanned PDFs are processed through OCR to extract text content. AI classifies the document type and extracts key fields (dates, amounts, names) automatically.' },
        { question: 'What are document checklists?', answer: 'Each workflow stage (application, underwriting, claims) defines required document types. The checklist tracks which documents have been received and which are outstanding.' },
        { question: 'How long are documents retained?', answer: 'Configurable per document type. Typical: KYC 10 years after policy expiry, medical reports 7 years, correspondence 5 years. Automated destruction after retention period.' },
      ]}
      resources={[
        { label: 'Document API (Swagger)', url: '#', icon: FileText },
        { label: 'Retention Policy Guide', url: '#', icon: Lock },
      ]}
    />
  );
};

export default DocumentManagementHubPage;
