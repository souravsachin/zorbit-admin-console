import React from 'react';
import {
  FileCheck,
  FileText,
  Printer,
  Download,
  Paintbrush,
  Clock,
  Shield,
  Send,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const PolicyIssuanceHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="policy-issuance"
      moduleName="Policy Issuance"
      moduleDescription="Policy Document Generation &mdash; PDF Rendering, Templates, Digital Delivery, Register"
      moduleIntro="Policy Issuance manages the final stage of the insurance lifecycle: generating the policy document, assigning the policy number, and delivering to the customer. It supports configurable policy document templates with dynamic styling, PDF generation with digital signatures, policy register maintenance, batch issuance for group policies, and multi-channel delivery (email, portal, print)."
      icon={FileCheck}
      capabilities={[
        {
          icon: Paintbrush,
          title: 'Template Designer',
          description: 'Visual policy document template designer with sections for header, schedule, coverage details, terms, exclusions, and footer. Per-product customization.',
        },
        {
          icon: Printer,
          title: 'PDF Generation',
          description: 'High-fidelity PDF rendering with embedded logos, watermarks, barcodes, and digital signatures. Batch generation for group policies.',
        },
        {
          icon: FileText,
          title: 'Policy Register',
          description: 'Centralized register of all issued policies with policy number, effective dates, premium, and current status. Searchable and filterable.',
        },
        {
          icon: Send,
          title: 'Digital Delivery',
          description: 'Automated email delivery with PDF attachment. Portal availability for self-service download. Print queue for physical delivery.',
        },
        {
          icon: Shield,
          title: 'Digital Signatures',
          description: 'eSign integration for paperless issuance. Timestamped signatures with certificate-based verification.',
        },
        {
          icon: Clock,
          title: 'Issuance Queue',
          description: 'Track policies pending issuance. Monitor generation status, delivery confirmation, and customer acknowledgment.',
        },
      ]}
      targetUsers={[
        { role: 'Issuance Team', desc: 'Generate policy documents, manage delivery, and maintain the register.' },
        { role: 'Product Team', desc: 'Design and maintain policy document templates per product.' },
        { role: 'Quality Control', desc: 'Review generated documents for accuracy before delivery.' },
        { role: 'Customers', desc: 'Download policy documents from the self-service portal.' },
      ]}
      lifecycleStages={[
        { label: 'Approved', description: 'Underwriting approved and payment confirmed. Ready for issuance.', color: '#f59e0b' },
        { label: 'Generating', description: 'Policy document being rendered from template with policy data.', color: '#3b82f6' },
        { label: 'QC Review', description: 'Generated document under quality review (for high-value policies).', color: '#8b5cf6' },
        { label: 'Issued', description: 'Policy number assigned. Document signed and sealed.', color: '#10b981' },
        { label: 'Delivered', description: 'Policy document delivered to customer via email/portal.', color: '#059669' },
        { label: 'Acknowledged', description: 'Customer confirmed receipt. Policy active in register.', color: '#64748b' },
      ]}
      recordings={[
        {
          file: 'policy-issuance-overview.mp4',
          title: 'Policy Issuance Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 50,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Template Design', startMs: 10000 },
            { title: 'PDF Generation', startMs: 22000 },
            { title: 'Delivery & Register', startMs: 36000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/policy-issuance/"
      swaggerUrl="/api/policy-issuance/api-docs"
      faqs={[
        { question: 'What document formats are generated?', answer: 'Primary format is PDF with optional HTML preview. Group policies generate a master policy PDF plus individual member certificates.' },
        { question: 'Can policy templates be customized per product?', answer: 'Yes. Each product has its own template with configurable sections: schedule of benefits, premium breakdown, terms, exclusions, endorsements schedule, and contact details.' },
        { question: 'How does batch issuance work?', answer: 'For group policies, a single trigger generates individual certificates for all members. Progress is tracked with a completion percentage. Failed generations are retried automatically.' },
        { question: 'Are digital signatures legally valid?', answer: 'The system uses PKI-based digital signatures compliant with regional e-signature laws. Each signature includes a timestamp and verification certificate.' },
      ]}
      resources={[
        { label: 'Policy Issuance API (Swagger)', url: '#', icon: FileText },
        { label: 'Template Guide', url: '#', icon: Paintbrush },
      ]}
    />
  );
};

export default PolicyIssuanceHubPage;
