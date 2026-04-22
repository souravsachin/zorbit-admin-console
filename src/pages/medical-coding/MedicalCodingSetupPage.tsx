import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Stethoscope } from 'lucide-react';

export default function MedicalCodingSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="medical_coding"
      moduleName="Medical Coding"
      icon={Stethoscope}
      seedEndpoint="/api/medical_coding/api/v1/G/medical_coding/seed"
      demoSeedEndpoint="/api/medical_coding/api/v1/G/medical_coding/seed/demo"
      demoFlushEndpoint="/api/medical_coding/api/v1/G/medical_coding/seed/demo"
      flushEndpoint="/api/medical_coding/api/v1/G/medical_coding/seed/all"
      healthEndpoint="/api/medical_coding/api/v1/G/medical_coding/health"
    />
  );
}
