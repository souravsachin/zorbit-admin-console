import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { FileCheck } from 'lucide-react';

export default function PolicyIssuanceDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="policy-issuance"
      moduleName="Policy Issuance"
      icon={FileCheck}
    />
  );
}
