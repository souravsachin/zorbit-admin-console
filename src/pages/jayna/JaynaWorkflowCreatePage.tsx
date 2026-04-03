import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

interface WorkflowStep {
  order: number;
  type: 'greet' | 'collect' | 'verify' | 'action' | 'respond' | 'close';
  prompt: string;
  field?: string;
  tool?: string;
}

interface Agent {
  hashId: string;
  name: string;
}

const STEP_TYPES = [
  { type: 'greet', label: 'Greet' },
  { type: 'collect', label: 'Collect Info' },
  { type: 'verify', label: 'Verify' },
  { type: 'action', label: 'Action' },
  { type: 'respond', label: 'Respond' },
  { type: 'close', label: 'Close' },
] as const;

/** Field config — ready for FormBuilder conversion */
const WORKFLOW_FIELDS = [
  { key: 'name', label: 'Workflow Name', type: 'text' as const, required: true, placeholder: 'e.g. Policy Inquiry Flow' },
  { key: 'agentHashId', label: 'Agent', type: 'select' as const, required: true, options: [] as { value: string; label: string }[] },
  { key: 'description', label: 'Description', type: 'text' as const, placeholder: 'Optional description of this workflow' },
];

const DEFAULT_STEPS: WorkflowStep[] = [
  { order: 1, type: 'greet', prompt: 'Greet the caller' },
  { order: 2, type: 'close', prompt: 'Thank the caller and close' },
];

const JaynaWorkflowCreatePage: React.FC = () => {
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({ name: '', agentHashId: '', description: '' });
  const [steps, setSteps] = useState<WorkflowStep[]>([...DEFAULT_STEPS]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get(`${base}/api/v1/O/${orgId}/jayna/agents`);
        const d = res.data;
        const list = d?.agents || d?.data || (Array.isArray(d) ? d : []);
        setAgents(list);
        if (list.length > 0 && !form.agentHashId) {
          setForm(prev => ({ ...prev, agentHashId: list[0].hashId }));
        }
      } catch {
        // agents load failure is non-fatal
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, [orgId]);

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, type: 'respond', prompt: '' }]);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateStep = (idx: number, patch: Partial<WorkflowStep>) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], ...patch };
    setSteps(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post(`${base}/api/v1/O/${orgId}/jayna/workflows`, {
        name: form.name,
        agentHashId: form.agentHashId,
        description: form.description,
        steps,
        isActive: true,
      });
      navigate('/jayna/workflows');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <Link to="/jayna/workflows" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to Workflows
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Workflow</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design a step-by-step conversation flow for an AI agent</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Basic Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Workflow Name<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            placeholder="e.g. Policy Inquiry Flow"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agent<span className="text-red-500 ml-0.5">*</span>
          </label>
          {loadingAgents ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading agents...
            </div>
          ) : (
            <select
              value={form.agentHashId}
              onChange={e => setForm({ ...form, agentHashId: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="">Select agent...</option>
              {agents.map(a => (
                <option key={a.hashId} value={a.hashId}>{a.name} ({a.hashId})</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* Steps Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
          <button
            onClick={addStep}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Step
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
              <GripVertical className="h-4 w-4 text-gray-300 mt-2 shrink-0" />
              <span className="text-xs text-gray-400 font-bold mt-2 w-5 shrink-0">{idx + 1}</span>
              <select
                value={step.type}
                onChange={e => updateStep(idx, { type: e.target.value as WorkflowStep['type'] })}
                className="px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white w-28 shrink-0"
              >
                {STEP_TYPES.map(s => (
                  <option key={s.type} value={s.type}>{s.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={step.prompt}
                onChange={e => updateStep(idx, { prompt: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Step prompt..."
              />
              {(step.type === 'collect' || step.type === 'verify') && (
                <input
                  type="text"
                  value={step.field || ''}
                  onChange={e => updateStep(idx, { field: e.target.value })}
                  className="w-28 px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Field name"
                />
              )}
              {step.type === 'action' && (
                <input
                  type="text"
                  value={step.tool || ''}
                  onChange={e => updateStep(idx, { tool: e.target.value })}
                  className="w-28 px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Tool name"
                />
              )}
              <button onClick={() => removeStep(idx)} className="text-gray-400 hover:text-red-500 mt-1.5 shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/jayna/workflows')}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.agentHashId}
          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Workflow
        </button>
      </div>
    </div>
  );
};

export default JaynaWorkflowCreatePage;
