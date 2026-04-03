import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Cpu } from 'lucide-react';

export default function RPAIntegrationDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="rpa-integration"
      moduleName="RPA Integration"
      icon={Cpu}
    />
  );
}
