import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Workflow } from 'lucide-react';

export default function WorkflowSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="workflow_engine"
      moduleName="Workflow Engine"
      icon={Workflow}
      seedEndpoint="/api/workflow_engine/api/v1/G/workflow/seed"
      demoSeedEndpoint="/api/workflow_engine/api/v1/G/workflow/seed/demo"
      demoFlushEndpoint="/api/workflow_engine/api/v1/G/workflow/seed/demo"
      flushEndpoint="/api/workflow_engine/api/v1/G/workflow/seed/all"
      healthEndpoint="/api/workflow_engine/api/v1/G/workflow/health"
    />
  );
}
