import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { BarChart3 } from 'lucide-react';

export default function ReportingDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="reporting"
      moduleName="Reporting & Analytics"
      icon={BarChart3}
    />
  );
}
