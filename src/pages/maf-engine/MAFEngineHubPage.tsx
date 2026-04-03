import React from 'react';
import {
  ClipboardCheck,
  FileText,
  Settings,
  Layers,
  Users,
  Shield,
} from 'lucide-react';
import { ModuleHubPage } from '../../components/shared/ModuleHubPage';

const MAFEngineHubPage: React.FC = () => {
  return (
    <ModuleHubPage
      moduleId="maf-engine"
      moduleName="MAF Engine"
      moduleDescription="Medical Application Form &mdash; Questionnaire Builder, Risk Scoring, Tele-UW"
      moduleIntro="MAF Engine manages the medical application form questionnaire lifecycle used in health and life insurance underwriting. It provides a question bank with categorization (medical history, lifestyle, family history, occupation), configurable question sets per product, conditional logic (show question B if answer to A is Yes), risk scoring based on responses, and tele-underwriting interview scheduling."
      icon={ClipboardCheck}
      capabilities={[
        {
          icon: FileText,
          title: 'Question Bank',
          description: 'Centralized repository of 500+ medical questions organized by category: medical history, lifestyle, family history, occupation, and travel.',
        },
        {
          icon: Layers,
          title: 'Question Sets',
          description: 'Product-specific question sets that pull from the bank. Different sets for individual health, group health, life, and critical illness products.',
        },
        {
          icon: Settings,
          title: 'Conditional Logic',
          description: 'Branch questions based on previous answers. Skip irrelevant sections. Dynamic form rendering based on applicant profile (age, gender, sum insured).',
        },
        {
          icon: Shield,
          title: 'Risk Scoring',
          description: 'Each answer carries a risk weight. Combined score determines: auto-accept, refer to underwriter, request medical tests, or decline.',
        },
        {
          icon: Users,
          title: 'Tele-Underwriting',
          description: 'Schedule telephone interviews for borderline cases. Structured interview scripts with recording and transcription integration.',
        },
        {
          icon: ClipboardCheck,
          title: 'Multi-Language Support',
          description: 'Questions and answer options available in multiple languages. Automatic selection based on applicant locale.',
        },
      ]}
      targetUsers={[
        { role: 'Product Team', desc: 'Define question sets and risk scoring rules per product.' },
        { role: 'Underwriters', desc: 'Review MAF responses, risk scores, and make accept/refer/decline decisions.' },
        { role: 'Tele-UW Team', desc: 'Conduct telephone interviews using structured scripts.' },
        { role: 'Applicants', desc: 'Complete the medical questionnaire during the application process.' },
      ]}
      lifecycleStages={[
        { label: 'Design', description: 'Question set configured for product. Scoring rules and branching logic defined.', color: '#f59e0b' },
        { label: 'Active', description: 'Question set live and presented to applicants during quotation.', color: '#10b981' },
        { label: 'Completed', description: 'Applicant submitted responses. Risk score calculated.', color: '#3b82f6' },
        { label: 'Scored', description: 'Auto-decision applied or referred to underwriter based on score thresholds.', color: '#8b5cf6' },
        { label: 'Tele-UW', description: 'Telephone interview scheduled for borderline cases.', color: '#6366f1' },
        { label: 'Decided', description: 'Final underwriting decision recorded. Feeds into policy issuance.', color: '#059669' },
      ]}
      recordings={[
        {
          file: 'maf-engine-overview.mp4',
          title: 'MAF Engine Overview',
          thumbnail: '',
          timestamp: '2026-04-01',
          duration: 50,
          chapters: [
            { title: 'Introduction', startMs: 0 },
            { title: 'Question Bank', startMs: 8000 },
            { title: 'Conditional Logic', startMs: 20000 },
            { title: 'Risk Scoring', startMs: 35000 },
          ],
        },
      ]}
      videosBaseUrl="/demos/maf-engine/"
      swaggerUrl="/api/maf-engine/api-docs"
      faqs={[
        { question: 'How many questions are in the bank?', answer: 'Over 500 questions across medical history, lifestyle, family history, occupation, and travel categories. New questions can be added and versioned.' },
        { question: 'How does conditional logic work?', answer: 'Each question can have show/hide conditions based on previous answers, applicant age, gender, or sum insured. This creates a dynamic form that only shows relevant questions.' },
        { question: 'What determines the risk score?', answer: 'Each answer option has a configurable risk weight (0-100). Weights are summed across categories with category-level multipliers. Thresholds determine auto-accept, refer, medical test, or decline.' },
        { question: 'Can question sets be versioned?', answer: 'Yes. Each change creates a new version. Active applications use the version in effect at the time of submission. Historical submissions always reference their original version.' },
      ]}
      resources={[
        { label: 'MAF Engine API (Swagger)', url: '#', icon: FileText },
        { label: 'Question Categories', url: '#', icon: Layers },
      ]}
    />
  );
};

export default MAFEngineHubPage;
