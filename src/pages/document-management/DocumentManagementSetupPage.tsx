import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { FolderOpen } from 'lucide-react';

export default function DocumentManagementSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="document-management"
      moduleName="Document Management"
      icon={FolderOpen}
      seedEndpoint="/api/document-management/api/v1/G/document-management/seed"
      demoSeedEndpoint="/api/document-management/api/v1/G/document-management/seed/demo"
      demoFlushEndpoint="/api/document-management/api/v1/G/document-management/seed/demo"
      flushEndpoint="/api/document-management/api/v1/G/document-management/seed/all"
      healthEndpoint="/api/document-management/api/v1/G/document-management/health"
    />
  );
}
