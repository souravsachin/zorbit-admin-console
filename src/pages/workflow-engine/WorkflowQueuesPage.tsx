import React, { useState, useEffect } from 'react';
import { Layers, ChevronRight, Inbox, Clock, CheckCircle } from 'lucide-react';

const API_BASE = '/api/workflow_engine';

interface QueueDef {
  hashId: string;
  name: string;
  description?: string;
  module: string;
  objectType: string;
  filterHashIds: string[];
  filterLogic: string;
  priority: number;
  pipelineHashId?: string;
  active: boolean;
  itemCount: number;
  pendingCount: number;
}

interface QueueItem {
  hashId: string;
  objectHashId: string;
  module: string;
  objectType: string;
  status: string;
  priority: number;
  objectData: Record<string, any>;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  escalated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  on_hold: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const WorkflowQueuesPage: React.FC = () => {
  const [queues, setQueues] = useState<QueueDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const token = localStorage.getItem('zorbit_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/O/O-OZPY/workflow/queues`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setQueues(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadItems = (queueHashId: string) => {
    if (selectedQueue === queueHashId) {
      setSelectedQueue(null);
      return;
    }
    setSelectedQueue(queueHashId);
    setItemsLoading(true);
    fetch(`${API_BASE}/api/v1/O/O-OZPY/workflow/queues/${queueHashId}/items?limit=50`, { headers })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <Layers className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Queues</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Filter-driven queues with item counts and pipeline attachments
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : queues.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No queues defined</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Seed demo data or create queues via the API</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queues.map((q) => (
            <div key={q.hashId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                onClick={() => loadItems(q.hashId)}
              >
                <ChevronRight
                  size={16}
                  className={`text-gray-400 transition-transform ${selectedQueue === q.hashId ? 'rotate-90' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{q.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                      {q.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{q.hashId}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {q.module}/{q.objectType} | Filters: {q.filterHashIds.join(', ')} ({q.filterLogic}) | Priority: {q.priority}
                    {q.pipelineHashId && ` | Pipeline: ${q.pipelineHashId}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Clock size={14} />
                    <span className="font-semibold">{q.pendingCount}</span>
                    <span className="text-xs text-gray-400">pending</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Inbox size={14} />
                    <span className="font-semibold">{q.itemCount}</span>
                    <span className="text-xs text-gray-400">total</span>
                  </div>
                </div>
              </div>

              {selectedQueue === q.hashId && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  {itemsLoading ? (
                    <div className="px-5 py-4 animate-pulse">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm text-gray-400">No items in this queue</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Item</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Object</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Key Data</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                          <tr key={item.hashId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">{item.hashId}</td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.objectHashId}</td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || STATUS_COLORS.pending}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-500">{item.priority}</td>
                            <td className="px-4 py-2 text-xs text-gray-400 font-mono max-w-[200px] truncate">
                              {Object.entries(item.objectData || {}).slice(0, 3).map(([k, v]) => `${k.split('.').pop()}=${v}`).join(', ')}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowQueuesPage;
