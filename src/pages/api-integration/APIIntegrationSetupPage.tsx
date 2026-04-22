import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Plug } from 'lucide-react';

export default function APIIntegrationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="api_integration"
      moduleName="API Integration"
      icon={Plug}
      seedEndpoint="/api/api_integration/api/v1/G/api_integration/seed"
      demoSeedEndpoint="/api/api_integration/api/v1/G/api_integration/seed/demo"
      demoFlushEndpoint="/api/api_integration/api/v1/G/api_integration/seed/demo"
      flushEndpoint="/api/api_integration/api/v1/G/api_integration/seed/all"
      healthEndpoint="/api/api_integration/api/v1/G/api_integration/health"
    />
  );
}
