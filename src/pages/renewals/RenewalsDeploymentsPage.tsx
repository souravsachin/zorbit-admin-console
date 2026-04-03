import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { RefreshCw } from 'lucide-react';

export default function RenewalsDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="renewals"
      moduleName="Renewals"
      icon={RefreshCw}
    />
  );
}
