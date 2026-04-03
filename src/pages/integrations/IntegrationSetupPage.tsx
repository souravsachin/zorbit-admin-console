import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Plug } from 'lucide-react';

export default function IntegrationSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="integrations"
      moduleName="Integration Hub"
      icon={Plug}
      seedEndpoint="/api/integration/api/v1/G/integrations/seed"
      demoSeedEndpoint="/api/integration/api/v1/G/integrations/seed/demo"
      demoFlushEndpoint="/api/integration/api/v1/G/integrations/seed/demo"
      flushEndpoint="/api/integration/api/v1/G/integrations/seed/demo"
      healthEndpoint="/api/integration/api/v1/G/integrations/health"
    />
  );
}
