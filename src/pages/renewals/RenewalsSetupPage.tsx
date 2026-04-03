import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { RefreshCw } from 'lucide-react';

export default function RenewalsSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="renewals"
      moduleName="Renewals"
      icon={RefreshCw}
      seedEndpoint="/api/renewals/api/v1/G/renewals/seed"
      demoSeedEndpoint="/api/renewals/api/v1/G/renewals/seed/demo"
      demoFlushEndpoint="/api/renewals/api/v1/G/renewals/seed/demo"
      flushEndpoint="/api/renewals/api/v1/G/renewals/seed/all"
      healthEndpoint="/api/renewals/api/v1/G/renewals/health"
    />
  );
}
