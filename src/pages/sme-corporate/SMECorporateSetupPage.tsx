import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Building2 } from 'lucide-react';

export default function SMECorporateSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="sme-corporate"
      moduleName="SME & Corporate Insurance"
      icon={Building2}
      seedEndpoint="/api/sme-corporate/api/v1/G/sme-corporate/seed"
      demoSeedEndpoint="/api/sme-corporate/api/v1/G/sme-corporate/seed/demo"
      demoFlushEndpoint="/api/sme-corporate/api/v1/G/sme-corporate/seed/demo"
      flushEndpoint="/api/sme-corporate/api/v1/G/sme-corporate/seed/all"
      healthEndpoint="/api/sme-corporate/api/v1/G/sme-corporate/health"
    />
  );
}
