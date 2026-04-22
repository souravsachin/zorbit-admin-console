import { ModuleDeploymentsPage } from '../../components/shared/ModuleDeploymentsPage';
import { Mic } from 'lucide-react';

export default function VoiceEngineDeploymentsPage() {
  return (
    <ModuleDeploymentsPage
      moduleId="voice_engine"
      moduleName="Voice Engine"
      icon={Mic}
    />
  );
}
