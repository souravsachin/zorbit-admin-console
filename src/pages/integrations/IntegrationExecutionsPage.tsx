import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import { integrationService, Execution } from '../../services/integration';

const statusColors: Record<string, string> = {
  pending: 'warning',
  running: 'info',
  success: 'active',
  failed: 'error',
};

const IntegrationExecutionsPage: React.FC = () => {
  const { orgId } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Execution | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await integrationService.getExecutions(orgId, params);
      const d = res.data as any;
      setExecutions(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []);
    } catch {
      toast('Failed to load executions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExecutions(); }, [orgId, statusFilter]);

  const columns: Column<Execution>[] = [
    {
      key: 'hashId',
      header: 'ID',
      render: (e) => <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{e.hashId}</code>,
    },
    {
      key: 'connectorName',
      header: 'Connector',
      render: (e) => (
        <div>
          <span className="font-medium text-sm">{e.connectorName}</span>
          <span className="text-xs text-gray-400 ml-1">/ {e.endpointName}</span>
        </div>
      ),
    },
    {
      key: 'request',
      header: 'Request',
      render: (e) => (
        <span className="text-xs font-mono">
          <span className="font-bold text-blue-600">{e.request?.method}</span>{' '}
          <span className="text-gray-500 truncate inline-block max-w-[200px] align-bottom" title={e.request?.url}>
            {e.request?.url}
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusBadge label={e.status} />,
    },
    {
      key: 'response',
      header: 'Response',
      render: (e) => (
        <span className="text-xs">
          {e.response?.status ? (
            <>
              <span className={e.response.status < 400 ? 'text-green-600' : 'text-red-500'}>{e.response.status}</span>
              {e.response.timeMs !== undefined && (
                <span className="text-gray-400 ml-1">{e.response.timeMs}ms</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </span>
      ),
    },
    {
      key: 'triggeredBy',
      header: 'Triggered By',
      render: (e) => <span className="text-xs">{e.triggeredBy}</span>,
    },
    {
      key: 'startedAt',
      header: 'Time',
      render: (e) => <span className="text-xs">{new Date(e.startedAt).toLocaleString()}</span>,
    },
    {
      key: 'actions' as any,
      header: '',
      render: (e) => (
        <button onClick={() => setDetail(e)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="View details">
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity size={24} />
          Execution History
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm w-36"
          >
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={loadExecutions} className="btn-secondary flex items-center gap-1" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={executions} loading={loading} emptyMessage="No executions yet." />

      {/* Detail modal with request/response viewer */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Execution ${detail?.hashId || ''}`}>
        {detail && (
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 text-xs">Connector</span>
                <p className="font-medium">{detail.connectorName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Endpoint</span>
                <p>{detail.endpointName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <p><StatusBadge label={detail.status} /></p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Triggered By</span>
                <p>{detail.triggeredBy}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Started</span>
                <p>{new Date(detail.startedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Completed</span>
                <p>{detail.completedAt ? new Date(detail.completedAt).toLocaleString() : '-'}</p>
              </div>
            </div>

            {/* Error */}
            {detail.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <span className="text-red-600 font-semibold text-xs">Error</span>
                <p className="text-red-700 dark:text-red-300 mt-1">{detail.error}</p>
              </div>
            )}

            {/* Request */}
            <div>
              <span className="text-gray-500 text-xs font-semibold">Request</span>
              <pre className="mt-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-48">
                {JSON.stringify(detail.request, null, 2)}
              </pre>
            </div>

            {/* Response */}
            <div>
              <span className="text-gray-500 text-xs font-semibold">Response</span>
              <pre className="mt-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-48">
                {JSON.stringify(detail.response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrationExecutionsPage;
