import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Plus,
  Loader2,
  Brain,
  Mic,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Phone,
} from 'lucide-react';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

interface Agent {
  hashId: string;
  organizationHashId: string;
  name: string;
  description: string;
  systemPrompt: string;
  voiceEngine: string;
  voiceId: string;
  llmProvider: string;
  llmModel: string;
  tools: { name: string; endpoint: string }[];
  greeting: string;
  isActive: boolean;
  _isDemo?: boolean;
  createdAt?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  anthropic: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ollama: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

/** Column config — ready for DataTable conversion */
const COLUMNS = [
  { key: 'name', label: 'Agent Name' },
  { key: 'llm', label: 'LLM' },
  { key: 'voice', label: 'Voice' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
];

const JaynaAgentsPage: React.FC = () => {
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`${base}/api/v1/O/${orgId}/jayna/agents`);
      const d = res.data;
      setAgents(d?.agents || d?.data || (Array.isArray(d) ? d : []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, [orgId]);

  const handleDelete = async (e: React.MouseEvent, hashId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this agent?')) return;
    try {
      await api.delete(`${base}/api/v1/O/${orgId}/jayna/agents/${hashId}`);
      fetchAgents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <Bot className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure voice agents with personalities, voices, and LLM settings
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/jayna/agents/new')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-16 text-center">
          <Bot className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No agents configured yet</p>
          <p className="text-xs text-gray-400 mb-4">Create an agent or seed demo data from the Setup page</p>
          <button
            onClick={() => navigate('/jayna/agents/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Create First Agent
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {COLUMNS.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {agents.map(agent => (
                <tr
                  key={agent.hashId}
                  onClick={() => navigate(`/jayna/agents/${agent.hashId}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-violet-500 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-400">{agent.hashId}</span>
                          {agent._isDemo && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-medium">demo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* LLM */}
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PROVIDER_COLORS[agent.llmProvider] || 'bg-gray-100 text-gray-600'}`}>
                      <Brain className="h-3 w-3 inline mr-0.5" />
                      {agent.llmProvider}/{agent.llmModel}
                    </span>
                  </td>
                  {/* Voice */}
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Mic className="h-3 w-3 inline mr-0.5" />
                      {agent.voiceId}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {agent.isActive ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium flex items-center gap-1 w-fit">
                        <ToggleRight className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium flex items-center gap-1 w-fit">
                        <ToggleLeft className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/jayna/test-call?agent=${agent.hashId}`); }}
                        className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300"
                        title="Test Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/jayna/agents/${agent.hashId}/edit`); }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, agent.hashId)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JaynaAgentsPage;
