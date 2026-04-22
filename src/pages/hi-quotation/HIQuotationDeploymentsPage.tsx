import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { FileText } from 'lucide-react';

export default function HIQuotationDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="hi_quotation"
      moduleName="HI Quotation"
      icon={FileText}
    />
  );
}
