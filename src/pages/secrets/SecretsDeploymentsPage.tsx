import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { KeyRound } from 'lucide-react';

export default function SecretsDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="secrets"
      moduleName="Secrets Vault"
      icon={KeyRound}
    />
  );
}
