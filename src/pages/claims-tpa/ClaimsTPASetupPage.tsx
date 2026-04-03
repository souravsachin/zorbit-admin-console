import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Upload } from 'lucide-react';

export default function ClaimsTPASetupPage() {
  return (
    <ModuleSetupPage
      moduleId="claims-tpa"
      moduleName="Claims TPA"
      icon={Upload}
      seedEndpoint="/api/claims-tpa/api/v1/G/claims-tpa/seed"
      demoSeedEndpoint="/api/claims-tpa/api/v1/G/claims-tpa/seed/demo"
      demoFlushEndpoint="/api/claims-tpa/api/v1/G/claims-tpa/seed/demo"
      flushEndpoint="/api/claims-tpa/api/v1/G/claims-tpa/seed/all"
      healthEndpoint="/api/claims-tpa/api/v1/G/claims-tpa/health"
    />
  );
}
