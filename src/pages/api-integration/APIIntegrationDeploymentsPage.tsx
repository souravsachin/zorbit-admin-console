import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Plug } from 'lucide-react';

export default function APIIntegrationDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="api-integration"
      moduleName="API Integration"
      icon={Plug}
    />
  );
}
