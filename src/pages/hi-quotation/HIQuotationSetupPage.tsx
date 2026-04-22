import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { DemoDataGenerator } from '../../components/shared/DemoDataGenerator';
import { generateHIQuotationPreview } from './DemoDataGenerator/generators';
import { FileText } from 'lucide-react';
import type { DemoColumnDef, CohortOption } from '../../components/shared/DemoDataGenerator';

const HI_COLUMNS: DemoColumnDef[] = [
  { key: 'refId', label: 'Ref', type: 'text', editable: false, width: 'w-24' },
  { key: 'applicantName', label: 'Applicant', type: 'text' },
  { key: 'product', label: 'Product', type: 'select', options: ['AWNIC NAS Dubai', 'AWNIC NAS Abu Dhabi', 'AWNIC Enhanced', 'AWNIC Basic', 'AWNIC Platinum', 'AWNIC Gold'] },
  { key: 'region', label: 'Region', type: 'select', options: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'] },
  { key: 'members', label: 'Members', type: 'number' },
  { key: 'annualPremium', label: 'Annual Premium (AED)', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'submitted', 'approved', 'declined'] },
];

const HI_COHORTS: CohortOption[] = [
  { key: 'clean', label: 'Clean Cases', description: 'Standard healthy applicants', defaultPct: 40 },
  { key: 'diabetic', label: 'Diabetic', description: 'Pre-existing diabetes', defaultPct: 15 },
  { key: 'hypertension', label: 'Hypertension', description: 'High blood pressure', defaultPct: 15 },
  { key: 'high_bmi', label: 'High BMI (>35)', description: 'Obesity cases', defaultPct: 10 },
  { key: 'senior', label: 'Senior (60+)', description: 'Elderly applicants', defaultPct: 10 },
  { key: 'high_sum', label: 'High Sum Insured', description: '>500K AED coverage', defaultPct: 10 },
];

export default function HIQuotationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="hi_quotation"
      moduleName="HI Quotation"
      icon={FileText}
      seedEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed"
      demoSeedEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed/demo"
      demoFlushEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed/demo"
      flushEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed/all"
      healthEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/health"
      demoGenerator={
        <DemoDataGenerator
          moduleId="hi_quotation"
          moduleName="HI Quotation"
          seedEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed/demo"
          flushEndpoint="/api/hi_quotation/api/v1/G/hi_quotation/seed/demo"
          columns={HI_COLUMNS}
          cohortOptions={HI_COHORTS}
          generatePreview={generateHIQuotationPreview}
        />
      }
    />
  );
}
