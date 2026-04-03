import React, { useEffect, useState } from 'react';
import { Plus, Plug, Globe, Bot, Webhook, Database, Server, RefreshCw, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import { integrationService, Connector } from '../../services/integration';

const typeIcons: Record<string, React.ReactNode> = {
  rest_api: <Globe size={14} className="text-blue-500" />,
  soap: <Server size={14} className="text-purple-500" />,
  webhook_receiver: <Webhook size={14} className="text-green-500" />,
  webhook_sender: <Webhook size={14} className="text-amber-500" />,
  rpa: <Bot size={14} className="text-rose-500" />,
  sftp: <Database size={14} className="text-cyan-500" />,
  database: <Database size={14} className="text-indigo-500" />,
};

const typeLabels: Record<string, string> = {
  rest_api: 'REST API',
  soap: 'SOAP',
  webhook_receiver: 'Webhook (In)',
  webhook_sender: 'Webhook (Out)',
  rpa: 'RPA',
  sftp: 'SFTP',
  database: 'Database',
};

const IntegrationConnectorsPage: React.FC = () => {
  const { orgId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailConn, setDetailConn] = useState<Connector | null>(null);

  const loadConnectors = async () => {
    setLoading(true);
    try {
      const res = await integrationService.getConnectors(orgId);
      const d = res.data as any;
      setConnectors(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []);
    } catch {
      toast('Failed to load connectors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConnectors(); }, [orgId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this connector?')) return;
    try {
      await integrationService.deleteConnector(orgId, id);
      toast('Connector deleted', 'success');
      loadConnectors();
    } catch {
      toast('Failed to delete connector', 'error');
    }
  };

  const columns: Column<Connector>[] = [
    {
      key: 'hashId',
      header: 'ID',
      render: (c) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{c.hashId}</code>
      ),
    },
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (c) => (
        <span className="flex items-center gap-1.5 text-xs">
          {typeIcons[c.type] || <Plug size={14} />}
          {typeLabels[c.type] || c.type}
        </span>
      ),
    },
    {
      key: 'endpoints',
      header: 'Endpoints',
      render: (c) => <span className="text-xs text-gray-500">{c.endpoints?.length || 0}</span>,
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (c) =>
        c.schedule ? (
          <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{c.schedule.cron}</code>
        ) : (
          <span className="text-xs text-gray-400">On demand</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (c) => <StatusBadge label={c.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (c) => <span className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions' as any,
      header: '',
      render: (c) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setDetailConn(c)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="View details">
            <Eye size={14} />
          </button>
          <button onClick={() => handleDelete(c.hashId)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug size={24} />
          Connectors
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={loadConnectors} className="btn-secondary flex items-center gap-1" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => navigate('/integrations/connectors/new')} className="btn-primary flex items-center space-x-2">
            <Plus size={18} />
            <span>New Connector</span>
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={connectors} loading={loading} emptyMessage="No connectors configured. Create one to get started." />

      {/* Detail modal */}
      <Modal isOpen={!!detailConn} onClose={() => setDetailConn(null)} title={detailConn?.name || 'Connector'}>
        {detailConn && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 text-xs">Hash ID</span>
                <p className="font-mono">{detailConn.hashId}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Type</span>
                <p className="flex items-center gap-1">{typeIcons[detailConn.type]} {typeLabels[detailConn.type]}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <p><StatusBadge label={detailConn.isActive ? 'active' : 'inactive'} /></p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Base URL</span>
                <p className="font-mono text-xs break-all">{detailConn.config?.baseUrl || 'N/A'}</p>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Description</span>
              <p>{detailConn.description || 'No description'}</p>
            </div>
            {detailConn.config?.auth && (
              <div>
                <span className="text-gray-500 text-xs">Auth</span>
                <p>Type: {detailConn.config.auth.type} | Credentials: <code className="text-amber-600">{detailConn.config.auth.credentials}</code></p>
              </div>
            )}
            {detailConn.schedule && (
              <div>
                <span className="text-gray-500 text-xs">Schedule</span>
                <p>Cron: <code>{detailConn.schedule.cron}</code> | TZ: {detailConn.schedule.timezone}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs">Endpoints ({detailConn.endpoints?.length || 0})</span>
              <div className="mt-1 space-y-1">
                {(detailConn.endpoints || []).map((ep, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    <code className="font-bold text-blue-600">{ep.method}</code>
                    <span className="font-mono">{ep.path}</span>
                    <span className="text-gray-400 ml-auto">{ep.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {detailConn.config?.retryPolicy && (
              <div>
                <span className="text-gray-500 text-xs">Retry Policy</span>
                <p>Max retries: {detailConn.config.retryPolicy.maxRetries} | Backoff: {detailConn.config.retryPolicy.backoffMs}ms</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrationConnectorsPage;
