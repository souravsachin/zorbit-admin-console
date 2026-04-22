import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Cpu } from 'lucide-react';

export default function RPAIntegrationDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="rpa_integration"
      moduleName="RPA Integration"
      icon={Cpu}
    />
  );
}
