import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { FileCheck } from 'lucide-react';

export default function PolicyIssuanceSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="policy-issuance"
      moduleName="Policy Issuance"
      icon={FileCheck}
      seedEndpoint="/api/policy-issuance/api/v1/G/policy-issuance/seed"
      demoSeedEndpoint="/api/policy-issuance/api/v1/G/policy-issuance/seed/demo"
      demoFlushEndpoint="/api/policy-issuance/api/v1/G/policy-issuance/seed/demo"
      flushEndpoint="/api/policy-issuance/api/v1/G/policy-issuance/seed/all"
      healthEndpoint="/api/policy-issuance/api/v1/G/policy-issuance/health"
    />
  );
}
