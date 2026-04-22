import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Mic } from 'lucide-react';

export default function VoiceEngineSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="voice_engine"
      moduleName="Voice Engine"
      icon={Mic}
      seedEndpoint="/api/voice_engine/api/v1/G/voice/seed"
      demoSeedEndpoint="/api/voice_engine/api/v1/G/voice/seed/demo"
      demoFlushEndpoint="/api/voice_engine/api/v1/G/voice/seed/demo"
      flushEndpoint="/api/voice_engine/api/v1/G/voice/seed/all"
      healthEndpoint="/api/voice_engine/api/v1/G/voice/health"
    />
  );
}
