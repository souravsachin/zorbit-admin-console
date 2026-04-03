import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Building2 } from 'lucide-react';

export default function SMECorporateDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="sme-corporate"
      moduleName="SME & Corporate Insurance"
      icon={Building2}
    />
  );
}
