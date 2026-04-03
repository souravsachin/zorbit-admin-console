import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Layers } from 'lucide-react';

export default function ReinsuranceDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="reinsurance"
      moduleName="Reinsurance"
      icon={Layers}
    />
  );
}
