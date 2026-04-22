import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { EyeOff } from 'lucide-react';

export default function PIIShowcaseSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="pii-showcase"
      moduleName="PII Showcase"
      icon={EyeOff}
      seedEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed"
      demoSeedEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/demo"
      demoFlushEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/demo"
      flushEndpoint="/api/pii_vault/api/v1/G/pii_vault/seed/all"
      healthEndpoint="/api/pii_vault/api/v1/G/pii_vault/health"
    />
  );
}
