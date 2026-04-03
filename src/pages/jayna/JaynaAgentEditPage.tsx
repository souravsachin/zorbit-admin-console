import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

const LLM_OPTIONS = [
  { provider: 'openai', models: ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { provider: 'anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-haiku-20240307'] },
  { provider: 'ollama', models: ['llama3', 'mistral', 'mixtral'] },
];

const VOICE_OPTIONS = [
  'en-US-AriaNeural',
  'en-US-GuyNeural',
  'en-US-JennyNeural',
  'en-GB-SoniaNeural',
  'en-GB-RyanNeural',
  'en-AU-NatashaNeural',
  'ar-AE-FatimaNeural',
  'ar-AE-HamdanNeural',
];

const VOICE_ENGINE_OPTIONS = [
  { value: 'edge-tts', label: 'Edge TTS (Microsoft)' },
  { value: 'elevenlabs', label: 'ElevenLabs' },
  { value: 'azure', label: 'Azure Neural' },
];

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  colSpan?: 1 | 2;
}

const AGENT_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Agent Name', type: 'text', required: true, placeholder: 'e.g. AWNIC Customer Service' },
  { key: 'description', label: 'Description', type: 'text', placeholder: 'Handles policy inquiries and claims status' },
  { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', required: true, rows: 4, placeholder: 'You are a friendly customer service agent...', colSpan: 2 },
  { key: 'greeting', label: 'Greeting Message', type: 'text', placeholder: 'Hello, how can I help you today?', colSpan: 2 },
  { key: 'llmProvider', label: 'LLM Provider', type: 'select', required: true, options: LLM_OPTIONS.map(o => ({ value: o.provider, label: o.provider })) },
  { key: 'llmModel', label: 'Model', type: 'select', required: true, options: [] },
  { key: 'voiceEngine', label: 'Voice Engine', type: 'select', options: VOICE_ENGINE_OPTIONS },
  { key: 'voiceId', label: 'Voice ID', type: 'select', options: VOICE_OPTIONS.map(v => ({ value: v, label: v })) },
  { key: 'isActive', label: 'Agent is active', type: 'checkbox' },
];

const JaynaAgentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`${base}/api/v1/O/${orgId}/jayna/agents/${id}`);
        const agent = res.data?.agent || res.data;
        setForm({
          name: agent.name || '',
          description: agent.description || '',
          systemPrompt: agent.systemPrompt || '',
          greeting: agent.greeting || '',
          llmProvider: agent.llmProvider || 'openai',
          llmModel: agent.llmModel || 'gpt-4',
          voiceEngine: agent.voiceEngine || 'edge-tts',
          voiceId: agent.voiceId || 'en-US-AriaNeural',
          isActive: agent.isActive ?? true,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id, orgId]);

  const updateField = (key: string, value: unknown) => {
    const updated = { ...form, [key]: value };
    if (key === 'llmProvider') {
      const models = LLM_OPTIONS.find(o => o.provider === value)?.models || [];
      updated.llmModel = models[0] || '';
    }
    setForm(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put(`${base}/api/v1/O/${orgId}/jayna/agents/${id}`, form);
      navigate('/jayna/agents');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  const getModelOptions = () => {
    const provider = form.llmProvider as string;
    return (LLM_OPTIONS.find(o => o.provider === provider)?.models || []).map(m => ({ value: m, label: m }));
  };

  const renderField = (field: FieldConfig) => {
    const value = form[field.key];
    const options = field.key === 'llmModel' ? getModelOptions() : field.options;

    if (field.type === 'checkbox') {
      return (
        <div key={field.key} className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => updateField(field.key, e.target.checked)}
            className="rounded border-gray-300"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">{field.label}</label>
        </div>
      );
    }

    return (
      <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            rows={field.rows || 3}
            value={(value as string) || ''}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono"
            placeholder={field.placeholder}
          />
        ) : field.type === 'select' ? (
          <select
            value={(value as string) || ''}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {(options || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            placeholder={field.placeholder}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <Link to="/jayna/agents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to Agents
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Agent</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update agent configuration <span className="font-mono text-xs">{id}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {AGENT_FIELDS.map(renderField)}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/jayna/agents')}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.systemPrompt}
          className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Update Agent
        </button>
      </div>
    </div>
  );
};

export default JaynaAgentEditPage;
