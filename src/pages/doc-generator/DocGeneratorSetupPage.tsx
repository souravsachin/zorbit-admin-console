import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { FileText } from 'lucide-react';

export default function DocGeneratorSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="doc-generator"
      moduleName="Doc Generator"
      icon={FileText}
      seedEndpoint="/api/doc-generator/api/v1/G/doc-generator/seed/system"
      demoSeedEndpoint="/api/doc-generator/api/v1/G/doc-generator/seed/demo"
      demoFlushEndpoint="/api/doc-generator/api/v1/G/doc-generator/seed/demo"
      flushEndpoint="/api/doc-generator/api/v1/G/doc-generator/seed/all"
      healthEndpoint="/api/doc-generator/api/v1/G/doc-generator/health"
    />
  );
}
