import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { ClipboardCheck } from 'lucide-react';

export default function MAFEngineDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="maf-engine"
      moduleName="MAF Engine"
      icon={ClipboardCheck}
    />
  );
}
