import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Palette } from 'lucide-react';

export default function WhiteLabelSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="white_label"
      moduleName="White Label"
      icon={Palette}
      seedEndpoint="/api/white_label/api/v1/G/white_label/seed/system"
      demoSeedEndpoint="/api/white_label/api/v1/G/white_label/seed/demo"
      demoFlushEndpoint="/api/white_label/api/v1/G/white_label/seed/demo"
      flushEndpoint="/api/white_label/api/v1/G/white_label/seed/all"
      healthEndpoint="/api/white_label/api/v1/G/white_label/health"
    />
  );
}
