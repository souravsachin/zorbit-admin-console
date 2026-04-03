import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  GitBranch,
  Trash2,
  MessageSquare,
  ClipboardList,
  Shield,
  Wrench,
  MessageCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
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

interface Workflow {
  hashId: string;
  organizationHashId: string;
  agentHashId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  _isDemo?: boolean;
  createdAt?: string;
}

const STEP_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  greet: { label: 'Greet', icon: MessageSquare, color: 'text-green-500' },
  collect: { label: 'Collect Info', icon: ClipboardList, color: 'text-blue-500' },
  verify: { label: 'Verify', icon: Shield, color: 'text-amber-500' },
  action: { label: 'Action', icon: Wrench, color: 'text-violet-500' },
  respond: { label: 'Respond', icon: MessageCircle, color: 'text-cyan-500' },
  close: { label: 'Close', icon: XCircle, color: 'text-rose-500' },
};

const JaynaWorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (API_CONFIG as Record<string, string>).JAYNA_URL || '/api/jayna';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`${base}/api/v1/O/${orgId}/jayna/workflows/${id}`);
        const wf = res.data?.workflow || res.data;
        setWorkflow(wf);
        // Try to resolve agent name
        if (wf.agentHashId) {
          try {
            const agRes = await api.get(`${base}/api/v1/O/${orgId}/jayna/agents/${wf.agentHashId}`);
            const agent = agRes.data?.agent || agRes.data;
            setAgentName(agent.name || wf.agentHashId);
          } catch {
            setAgentName(wf.agentHashId);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, orgId]);

  const handleDelete = async () => {
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.delete(`${base}/api/v1/O/${orgId}/jayna/workflows/${id}`);
      navigate('/jayna/workflows');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="space-y-4">
        <Link to="/jayna/workflows" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error || 'Workflow not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <Link to="/jayna/workflows" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to Workflows
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
            <GitBranch className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{workflow.name}</h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{workflow.hashId}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-4 space-y-3">
        <div className="flex items-center gap-3">
          {workflow.isActive ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium flex items-center gap-1">
              <ToggleRight className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium flex items-center gap-1">
              <ToggleLeft className="h-3 w-3" /> Inactive
            </span>
          )}
          {workflow._isDemo && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-medium">demo</span>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Agent</label>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{agentName || workflow.agentHashId}</p>
        </div>
        {workflow.description && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{workflow.description}</p>
          </div>
        )}
        {workflow.createdAt && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</label>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{new Date(workflow.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Steps ({workflow.steps?.length || 0})
        </h3>
        {workflow.steps && workflow.steps.length > 0 ? (
          <div className="relative ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-3">
            {workflow.steps.sort((a, b) => a.order - b.order).map((step, idx) => {
              const meta = STEP_TYPE_META[step.type] || STEP_TYPE_META.respond;
              const Icon = meta.icon;
              return (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-500">{step.order}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      {step.field && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-mono">
                          field: {step.field}
                        </span>
                      )}
                      {step.tool && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400 font-mono">
                          tool: {step.tool}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{step.prompt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No steps defined</p>
        )}
      </div>
    </div>
  );
};

export default JaynaWorkflowDetailPage;
