import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Phone, Loader2, Bot, Brain, Mic, ToggleLeft, ToggleRight } from 'lucide-react';
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

const JaynaAgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`${base}/api/v1/O/${orgId}/jayna/agents/${id}`);
        setAgent(res.data?.agent || res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id, orgId]);

  const handleDelete = async () => {
    if (!confirm('Delete this agent?')) return;
    try {
      await api.delete(`${base}/api/v1/O/${orgId}/jayna/agents/${id}`);
      navigate('/jayna/agents');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-4">
        <Link to="/jayna/agents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back to Agents
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error || 'Agent not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <Link to="/jayna/agents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to Agents
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <Bot className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{agent.hashId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/jayna/test-call?agent=${agent.hashId}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
          >
            <Phone className="h-4 w-4" /> Test Call
          </button>
          <button
            onClick={() => navigate(`/jayna/agents/${id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Agent Details</span>
          {agent.isActive ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium flex items-center gap-1">
              <ToggleRight className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium flex items-center gap-1">
              <ToggleLeft className="h-3 w-3" /> Inactive
            </span>
          )}
          {agent._isDemo && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-medium">demo</span>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {agent.description && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{agent.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">LLM</label>
              <div className="mt-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${PROVIDER_COLORS[agent.llmProvider] || 'bg-gray-100 text-gray-600'}`}>
                  <Brain className="h-3 w-3 inline mr-1" />
                  {agent.llmProvider} / {agent.llmModel}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Voice</label>
              <div className="mt-1">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <Mic className="h-3 w-3 inline mr-1" />
                  {agent.voiceEngine} / {agent.voiceId}
                </span>
              </div>
            </div>
          </div>

          {agent.greeting && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Greeting</label>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 mt-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{agent.greeting}"</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">System Prompt</label>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 mt-1">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{agent.systemPrompt}</pre>
            </div>
          </div>

          {agent.tools && agent.tools.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tools</label>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {agent.tools.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agent.createdAt && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{new Date(agent.createdAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JaynaAgentDetailPage;
