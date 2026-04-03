import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Plug } from 'lucide-react';

export default function APIIntegrationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="api-integration"
      moduleName="API Integration"
      icon={Plug}
      seedEndpoint="/api/api-integration/api/v1/G/api-integration/seed"
      demoSeedEndpoint="/api/api-integration/api/v1/G/api-integration/seed/demo"
      demoFlushEndpoint="/api/api-integration/api/v1/G/api-integration/seed/demo"
      flushEndpoint="/api/api-integration/api/v1/G/api-integration/seed/all"
      healthEndpoint="/api/api-integration/api/v1/G/api-integration/health"
    />
  );
}
