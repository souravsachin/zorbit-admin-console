import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Plus,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

interface Workflow {
  hashId: string;
  organizationHashId: string;
  agentHashId: string;
  name: string;
  steps: { order: number; type: string; prompt: string }[];
  isActive: boolean;
  _isDemo?: boolean;
  createdAt?: string;
}

interface Agent {
  hashId: string;
  name: string;
}

/** Column config — ready for DataTable conversion */
const COLUMNS = [
  { key: 'name', label: 'Workflow' },
  { key: 'agent', label: 'Agent' },
  { key: 'steps', label: 'Steps' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
];

const JaynaWorkflowsPage: React.FC = () => {
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wfRes, agRes] = await Promise.allSettled([
        api.get(`${base}/api/v1/O/${orgId}/jayna/workflows`),
        api.get(`${base}/api/v1/O/${orgId}/jayna/agents`),
      ]);
      if (wfRes.status === 'fulfilled') {
        const d = wfRes.value.data;
        setWorkflows(d?.workflows || d?.data || (Array.isArray(d) ? d : []));
      }
      if (agRes.status === 'fulfilled') {
        const d = agRes.value.data;
        setAgents(d?.agents || d?.data || (Array.isArray(d) ? d : []));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [orgId]);

  const getAgentName = (id: string) => agents.find(a => a.hashId === id)?.name || id;

  const handleDelete = async (e: React.MouseEvent, hashId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.delete(`${base}/api/v1/O/${orgId}/jayna/workflows/${hashId}`);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
            <GitBranch className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Design step-by-step conversation flows for AI agents
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/jayna/workflows/new')}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Workflow
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
      ) : workflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-16 text-center">
          <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No workflows configured yet</p>
          <p className="text-xs text-gray-400 mb-4">Create a workflow or seed demo data from the Setup page</p>
          <button
            onClick={() => navigate('/jayna/workflows/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Create First Workflow
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
              {workflows.map(wf => (
                <tr
                  key={wf.hashId}
                  onClick={() => navigate(`/jayna/workflows/${wf.hashId}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-cyan-500 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{wf.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-400">{wf.hashId}</span>
                          {wf._isDemo && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-medium">demo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Agent */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {getAgentName(wf.agentHashId)}
                  </td>
                  {/* Steps */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {wf.steps?.length || 0} steps
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {wf.isActive ? (
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
                    <button
                      onClick={(e) => handleDelete(e, wf.hashId)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

export default JaynaWorkflowsPage;
