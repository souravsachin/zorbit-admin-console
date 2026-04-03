import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { ClipboardCheck } from 'lucide-react';

export default function MAFEngineSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="maf-engine"
      moduleName="MAF Engine"
      icon={ClipboardCheck}
      seedEndpoint="/api/maf-engine/api/v1/G/maf-engine/seed"
      demoSeedEndpoint="/api/maf-engine/api/v1/G/maf-engine/seed/demo"
      demoFlushEndpoint="/api/maf-engine/api/v1/G/maf-engine/seed/demo"
      flushEndpoint="/api/maf-engine/api/v1/G/maf-engine/seed/all"
      healthEndpoint="/api/maf-engine/api/v1/G/maf-engine/health"
    />
  );
}
