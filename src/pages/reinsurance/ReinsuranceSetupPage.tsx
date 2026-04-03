import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Layers } from 'lucide-react';

export default function ReinsuranceSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="reinsurance"
      moduleName="Reinsurance"
      icon={Layers}
      seedEndpoint="/api/reinsurance/api/v1/G/reinsurance/seed"
      demoSeedEndpoint="/api/reinsurance/api/v1/G/reinsurance/seed/demo"
      demoFlushEndpoint="/api/reinsurance/api/v1/G/reinsurance/seed/demo"
      flushEndpoint="/api/reinsurance/api/v1/G/reinsurance/seed/all"
      healthEndpoint="/api/reinsurance/api/v1/G/reinsurance/health"
    />
  );
}
