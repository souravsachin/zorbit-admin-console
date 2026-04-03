import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Stethoscope } from 'lucide-react';

export default function MedicalCodingDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="medical-coding"
      moduleName="Medical Coding"
      icon={Stethoscope}
    />
  );
}
