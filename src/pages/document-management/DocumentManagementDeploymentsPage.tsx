import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { FolderOpen } from 'lucide-react';

export default function DocumentManagementDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="document-management"
      moduleName="Document Management"
      icon={FolderOpen}
    />
  );
}
