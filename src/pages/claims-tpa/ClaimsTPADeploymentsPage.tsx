import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Upload } from 'lucide-react';

export default function ClaimsTPADeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="claims-tpa"
      moduleName="Claims TPA"
      icon={Upload}
    />
  );
}
