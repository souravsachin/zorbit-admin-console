import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { BarChart3 } from 'lucide-react';

export default function ReportingSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="reporting"
      moduleName="Reporting & Analytics"
      icon={BarChart3}
      seedEndpoint="/api/reporting/api/v1/G/reporting/seed"
      demoSeedEndpoint="/api/reporting/api/v1/G/reporting/seed/demo"
      demoFlushEndpoint="/api/reporting/api/v1/G/reporting/seed/demo"
      flushEndpoint="/api/reporting/api/v1/G/reporting/seed/all"
      healthEndpoint="/api/reporting/api/v1/G/reporting/health"
    />
  );
}
