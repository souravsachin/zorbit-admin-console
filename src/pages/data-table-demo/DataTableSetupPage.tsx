import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Table2 } from 'lucide-react';

export default function DataTableSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="datatable"
      moduleName="Data Table"
      icon={Table2}
      seedEndpoint="/api/datatable/api/v1/G/datatable/seed/system"
      demoSeedEndpoint="/api/datatable/api/v1/G/datatable/seed/demo"
      demoFlushEndpoint="/api/datatable/api/v1/G/datatable/seed/demo"
      flushEndpoint="/api/datatable/api/v1/G/datatable/seed/all"
      healthEndpoint="/api/datatable/api/v1/G/datatable/health"
    />
  );
}
