import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Lock } from 'lucide-react';

export default function PiiVaultSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="pii_vault"
      moduleName="PII Vault"
      icon={Lock}
      seedEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed"
      demoSeedEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/demo"
      demoFlushEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/demo"
      flushEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/all"
      healthEndpoint="/api/pii_vault/api/v1/G/pii_vault/health"
    />
  );
}
