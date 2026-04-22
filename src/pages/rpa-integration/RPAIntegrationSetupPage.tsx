import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Cpu } from 'lucide-react';

export default function RPAIntegrationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="rpa_integration"
      moduleName="RPA Integration"
      icon={Cpu}
      seedEndpoint="/api/rpa_integration/api/v1/G/rpa_integration/seed"
      demoSeedEndpoint="/api/rpa_integration/api/v1/G/rpa_integration/seed/demo"
      demoFlushEndpoint="/api/rpa_integration/api/v1/G/rpa_integration/seed/demo"
      flushEndpoint="/api/rpa_integration/api/v1/G/rpa_integration/seed/all"
      healthEndpoint="/api/rpa_integration/api/v1/G/rpa_integration/health"
    />
  );
}
