import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Brain } from 'lucide-react';

export default function HIDecisioningDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="hi_uw_decisioning"
      moduleName="HI UW Decisioning"
      icon={Brain}
    />
  );
}
