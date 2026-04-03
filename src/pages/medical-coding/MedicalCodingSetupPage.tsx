import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Stethoscope } from 'lucide-react';

export default function MedicalCodingSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="medical-coding"
      moduleName="Medical Coding"
      icon={Stethoscope}
      seedEndpoint="/api/medical-coding/api/v1/G/medical-coding/seed"
      demoSeedEndpoint="/api/medical-coding/api/v1/G/medical-coding/seed/demo"
      demoFlushEndpoint="/api/medical-coding/api/v1/G/medical-coding/seed/demo"
      flushEndpoint="/api/medical-coding/api/v1/G/medical-coding/seed/all"
      healthEndpoint="/api/medical-coding/api/v1/G/medical-coding/health"
    />
  );
}
