import React, { useState, useEffect } from 'react';
import { Filter, Plus, ChevronRight, Trash2, Play, Tag } from 'lucide-react';

const API_BASE = '/api/workflow_engine';

interface FilterCondition {
  field?: string;
  operator?: string;
  value?: any;
  valueType?: string;
  logic?: 'AND' | 'OR' | 'NOT';
  conditions?: FilterCondition[];
}

interface FilterDef {
  hashId: string;
  name: string;
  description?: string;
  module: string;
  objectType: string;
  condition: FilterCondition;
  tags: string[];
  createdAt: string;
}

function ConditionBadge({ condition, depth = 0 }: { condition: FilterCondition; depth?: number }) {
  if (condition.field) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-mono">
        {condition.field} <span className="text-blue-500">{condition.operator}</span> <span className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(condition.value)}</span>
      </span>
    );
  }
  if (condition.logic && condition.conditions) {
    return (
      <div className={`border-l-2 ${condition.logic === 'AND' ? 'border-purple-400' : condition.logic === 'OR' ? 'border-amber-400' : 'border-red-400'} pl-3 space-y-1 ${depth > 0 ? 'ml-2' : ''}`}>
        <span className={`text-xs font-bold ${condition.logic === 'AND' ? 'text-purple-600 dark:text-purple-400' : condition.logic === 'OR' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
          {condition.logic}
        </span>
        {condition.conditions.map((c, i) => (
          <ConditionBadge key={i} condition={c} depth={depth + 1} />
        ))}
      </div>
    );
  }
  return null;
}

const WorkflowFiltersPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('zorbit_token');
    fetch(`${API_BASE}/api/v1/O/O-OZPY/workflow/filters`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFilters(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
          <Filter className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Filters</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recursive filter conditions for routing items to queues
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : filters.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No filters defined yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Seed demo data or create filters via the API</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filters.map((f) => (
            <div
              key={f.hashId}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                onClick={() => setExpanded(expanded === f.hashId ? null : f.hashId)}
              >
                <ChevronRight
                  size={16}
                  className={`text-gray-400 transition-transform ${expanded === f.hashId ? 'rotate-90' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{f.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">
                      {f.hashId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {f.module}/{f.objectType}
                    {f.description && ` -- ${f.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {f.tags?.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center gap-0.5">
                      <Tag size={8} /> {t}
                    </span>
                  ))}
                </div>
              </div>
              {expanded === f.hashId && (
                <div className="px-5 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Condition Tree</p>
                  <ConditionBadge condition={f.condition} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowFiltersPage;
