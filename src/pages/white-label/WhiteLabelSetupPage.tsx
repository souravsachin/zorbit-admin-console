import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Palette } from 'lucide-react';

export default function WhiteLabelSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="white-label"
      moduleName="White Label"
      icon={Palette}
      seedEndpoint="/api/white-label/api/v1/G/white-label/seed/system"
      demoSeedEndpoint="/api/white-label/api/v1/G/white-label/seed/demo"
      demoFlushEndpoint="/api/white-label/api/v1/G/white-label/seed/demo"
      flushEndpoint="/api/white-label/api/v1/G/white-label/seed/all"
      healthEndpoint="/api/white-label/api/v1/G/white-label/health"
    />
  );
}
