import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Workflow } from 'lucide-react';

export default function WorkflowDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="workflow_engine"
      moduleName="Workflow Engine"
      icon={Workflow}
    />
  );
}
