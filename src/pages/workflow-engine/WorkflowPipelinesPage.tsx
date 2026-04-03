import React, { useState, useEffect } from 'react';
import { GitBranch, ChevronRight, Bot, UserCheck, Eye, Zap, ArrowRight } from 'lucide-react';

const API_BASE = '/api/workflow-engine';

interface PipelineStage {
  stageIndex: number;
  name: string;
  description?: string;
  mode: string;
  actions: string[];
  requiredPrivilege?: string;
  timeoutHours?: number;
}

interface PipelineDef {
  hashId: string;
  name: string;
  description?: string;
  module: string;
  objectType: string;
  stages: PipelineStage[];
  outcomes: string[];
  active: boolean;
  createdAt: string;
}

const MODE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  automated: { icon: <Zap size={14} />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Automated' },
  top_moderated: { icon: <Eye size={14} />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Top Moderated' },
  moderated: { icon: <Bot size={14} />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Moderated' },
  human: { icon: <UserCheck size={14} />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Human' },
};

const WorkflowPipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('zorbit_token');
    fetch(`${API_BASE}/api/v1/O/O-OZPY/workflow/pipelines`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPipelines(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
          <GitBranch className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Pipelines</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Multi-stage processing pipelines with human, moderated, and automated stages
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <GitBranch className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No pipelines defined</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Seed demo data or create pipelines via the API</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pipelines.map((p) => (
            <div key={p.hashId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                onClick={() => setExpanded(expanded === p.hashId ? null : p.hashId)}
              >
                <ChevronRight
                  size={16}
                  className={`text-gray-400 transition-transform ${expanded === p.hashId ? 'rotate-90' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{p.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{p.hashId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {p.module}/{p.objectType} | {p.stages.length} stages | Outcomes: {p.outcomes.join(', ')}
                  </p>
                </div>
              </div>

              {expanded === p.hashId && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {p.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{p.description}</p>
                  )}
                  <div className="flex items-start gap-2 overflow-x-auto pb-2">
                    {p.stages.map((stage, i) => {
                      const mc = MODE_CONFIG[stage.mode] || MODE_CONFIG.human;
                      return (
                        <React.Fragment key={stage.stageIndex}>
                          {i > 0 && (
                            <div className="flex items-center pt-6">
                              <ArrowRight size={18} className="text-gray-300 dark:text-gray-600" />
                            </div>
                          )}
                          <div className="min-w-[180px] bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${mc.color}`}>
                                {mc.icon} {mc.label}
                              </span>
                            </div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{stage.name}</p>
                            {stage.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {stage.actions.map((a) => (
                                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                  {a}
                                </span>
                              ))}
                            </div>
                            {stage.timeoutHours && (
                              <p className="text-[10px] text-gray-400 mt-1">Timeout: {stage.timeoutHours}h</p>
                            )}
                            {stage.requiredPrivilege && (
                              <p className="text-[10px] text-gray-400 mt-0.5">Requires: {stage.requiredPrivilege}</p>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowPipelinesPage;
