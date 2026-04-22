import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { FileText } from 'lucide-react';

export default function DocGeneratorSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="doc_generator"
      moduleName="Doc Generator"
      icon={FileText}
      seedEndpoint="/api/doc_generator/api/v1/G/doc_generator/seed/system"
      demoSeedEndpoint="/api/doc_generator/api/v1/G/doc_generator/seed/demo"
      demoFlushEndpoint="/api/doc_generator/api/v1/G/doc_generator/seed/demo"
      flushEndpoint="/api/doc_generator/api/v1/G/doc_generator/seed/all"
      healthEndpoint="/api/doc_generator/api/v1/G/doc_generator/health"
    />
  );
}
