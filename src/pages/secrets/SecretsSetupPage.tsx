import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { KeyRound } from 'lucide-react';

export default function SecretsSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="secrets"
      moduleName="Secrets Vault"
      icon={KeyRound}
      seedEndpoint="/api/secrets/api/v1/G/secrets/seed"
      demoSeedEndpoint="/api/secrets/api/v1/G/secrets/seed/demo"
      demoFlushEndpoint="/api/secrets/api/v1/G/secrets/seed/demo"
      flushEndpoint="/api/secrets/api/v1/G/secrets/seed/all"
      healthEndpoint="/api/secrets/api/v1/G/secrets/health"
    />
  );
}
