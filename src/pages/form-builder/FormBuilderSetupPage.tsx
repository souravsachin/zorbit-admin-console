import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { FileInput } from 'lucide-react';

export default function FormBuilderSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="form_builder"
      moduleName="Form Builder"
      icon={FileInput}
      seedEndpoint="/api/form_builder/api/v1/G/form_builder/seed/system"
      demoSeedEndpoint="/api/form_builder/api/v1/G/form_builder/seed/demo"
      demoFlushEndpoint="/api/form_builder/api/v1/G/form_builder/seed/demo"
      flushEndpoint="/api/form_builder/api/v1/G/form_builder/seed/all"
      healthEndpoint="/api/form_builder/api/v1/G/form_builder/health"
    />
  );
}
