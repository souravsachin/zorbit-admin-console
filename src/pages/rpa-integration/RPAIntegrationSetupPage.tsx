import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Cpu } from 'lucide-react';

export default function RPAIntegrationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="rpa-integration"
      moduleName="RPA Integration"
      icon={Cpu}
      seedEndpoint="/api/rpa-integration/api/v1/G/rpa-integration/seed"
      demoSeedEndpoint="/api/rpa-integration/api/v1/G/rpa-integration/seed/demo"
      demoFlushEndpoint="/api/rpa-integration/api/v1/G/rpa-integration/seed/demo"
      flushEndpoint="/api/rpa-integration/api/v1/G/rpa-integration/seed/all"
      healthEndpoint="/api/rpa-integration/api/v1/G/rpa-integration/health"
    />
  );
}
