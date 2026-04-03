import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Plug } from 'lucide-react';

export default function IntegrationDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="integrations"
      moduleName="Integration Hub"
      icon={Plug}
    />
  );
}
