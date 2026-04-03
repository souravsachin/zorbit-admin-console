import React from 'react';
import {
  Stethoscope,
  FileText,
  Search,
  Database,
  BookOpen,
  Layers,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const MedicalCodingHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="medical-coding"
      moduleName="Medical Coding"
      moduleDescription="ICD-10, CPT, HCPCS &mdash; Code Lookup, Standards Management, Provider Mapping"
      moduleIntro="Medical Coding provides a centralized master for international medical classification standards used across the insurance platform. It includes ICD-10 diagnosis codes (68,000+ codes), CPT procedure codes, DRG groupings, and regional authority code sets (DHA, MOH, DOH). The module powers auto-complete lookups, code validation in claims processing, and mapping between different coding standards."
      icon={Stethoscope}
      capabilities={[
        {
          icon: Search,
          title: 'ICD-10 Autocomplete',
          description: 'Real-time search across 68,000+ ICD-10 codes by code, description, or keyword. Hierarchical browsing by chapter and block.',
        },
        {
          icon: Database,
          title: 'Multi-Standard Support',
          description: 'ICD-10 (diagnosis), CPT (procedures), HCPCS (supplies/equipment), DRG (groupings), and regional authority codes.',
        },
        {
          icon: Layers,
          title: 'Code Mapping',
          description: 'Cross-reference mapping between coding standards. Map TPA-specific codes to ICD-10. Map regional authority codes to international standards.',
        },
        {
          icon: BookOpen,
          title: 'Code Validation',
          description: 'Real-time validation of medical codes during claims entry. Flag invalid, expired, or gender/age-inappropriate codes.',
        },
        {
          icon: FileText,
          title: 'Exclusion Lists',
          description: 'Product-specific exclusion code lists. Automatically flag claims with excluded diagnosis or procedure codes.',
        },
        {
          icon: Stethoscope,
          title: 'Clinical Grouping',
          description: 'Group related codes into clinical categories for analytics: cardiovascular, oncology, maternity, mental health, etc.',
        },
      ]}
      targetUsers={[
        { role: 'Medical Coders', desc: 'Look up and validate medical codes during claims processing.' },
        { role: 'Claims Team', desc: 'Use autocomplete for accurate code entry on claim forms.' },
        { role: 'Product Team', desc: 'Define exclusion lists and coverage rules based on medical codes.' },
        { role: 'Analytics', desc: 'Use clinical groupings for population health and utilization analysis.' },
      ]}
      lifecycleStages={[
        { label: 'Import', description: 'Code set imported from WHO/CMS/regional authority. Version tracked.', color: '#f59e0b' },
        { label: 'Mapped', description: 'Cross-references to other standards and regional codes established.', color: '#3b82f6' },
        { label: 'Active', description: 'Code set live and available for lookup, validation, and analytics.', color: '#10b981' },
        { label: 'Deprecated', description: 'Older version superseded but retained for historical claims reference.', color: '#64748b' },
      ]}
      recordings={[
        {
          file: 'medical-coding-overview.mp4',
          title: 'Medical Coding Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 45,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'ICD-10 Lookup', startMs: 8000 },
            { title: 'Code Standards', startMs: 20000 },
            { title: 'Exclusion Lists', startMs: 32000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/medical-coding/"
      swaggerUrl="/api/medical-coding/api-docs"
      faqs={[
        { question: 'How many ICD-10 codes are supported?', answer: 'The full WHO ICD-10 classification with 68,000+ codes across 22 chapters. Updated annually when WHO releases new versions.' },
        { question: 'Can we define custom exclusion lists?', answer: 'Yes. Each product can have its own exclusion list referencing ICD-10 and CPT codes. Exclusions are checked automatically during claims adjudication.' },
        { question: 'How does code mapping work?', answer: 'TPA-specific codes and regional authority codes (DHA Activity codes, MOH codes) are mapped to standard ICD-10/CPT. Mappings are maintained by the medical coding team.' },
        { question: 'Is the code set version-controlled?', answer: 'Yes. Each import creates a new version. Historical claims retain their original coding version for audit purposes.' },
      ]}
      resources={[
        { label: 'Medical Coding API (Swagger)', url: '#', icon: FileText },
        { label: 'ICD-10 Reference', url: 'https://icd.who.int/browse10', icon: BookOpen },
      ]}
    />
  );
};

export default MedicalCodingHubPage;
