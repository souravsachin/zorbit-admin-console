import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { PenLine } from 'lucide-react';

export default function EndorsementsDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="endorsements"
      moduleName="Endorsements"
      icon={PenLine}
    />
  );
}
