import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Workflow } from 'lucide-react';

export default function WorkflowSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="workflow-engine"
      moduleName="Workflow Engine"
      icon={Workflow}
      seedEndpoint="/api/workflow-engine/api/v1/G/workflow/seed"
      demoSeedEndpoint="/api/workflow-engine/api/v1/G/workflow/seed/demo"
      demoFlushEndpoint="/api/workflow-engine/api/v1/G/workflow/seed/demo"
      flushEndpoint="/api/workflow-engine/api/v1/G/workflow/seed/all"
      healthEndpoint="/api/workflow-engine/api/v1/G/workflow/health"
    />
  );
}
