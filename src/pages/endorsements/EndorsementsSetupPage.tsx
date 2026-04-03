import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { PenLine } from 'lucide-react';

export default function EndorsementsSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="endorsements"
      moduleName="Endorsements"
      icon={PenLine}
      seedEndpoint="/api/endorsements/api/v1/G/endorsements/seed"
      demoSeedEndpoint="/api/endorsements/api/v1/G/endorsements/seed/demo"
      demoFlushEndpoint="/api/endorsements/api/v1/G/endorsements/seed/demo"
      flushEndpoint="/api/endorsements/api/v1/G/endorsements/seed/all"
      healthEndpoint="/api/endorsements/api/v1/G/endorsements/health"
    />
  );
}
