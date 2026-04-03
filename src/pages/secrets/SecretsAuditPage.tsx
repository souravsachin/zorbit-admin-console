import React, { useState, useEffect } from 'react';
import { Eye, KeyRound, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../../components/shared/DataTable';
import { useToast } from '../../components/shared/Toast';
import { API_CONFIG } from '../../config';
import api from '../../services/api';

interface AuditEntry {
  hashId: string;
  secretHashId: string;
  secretName: string;
  action: string;
  performedBy: string;
  performedByName: string;
  sourceModule: string;
  sourceIp: string;
  userAgent: string;
  timestamp: string;
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  read: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  updated: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  deleted: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  rotated: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

const columns: Column<AuditEntry>[] = [
  {
    key: 'timestamp',
    header: 'Time',
    render: (e) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(e.timestamp).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'secretName',
    header: 'Secret',
    render: (e) => (
      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{e.secretName}</code>
    ),
  },
  {
    key: 'action',
    header: 'Action',
    render: (e) => (
      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ACTION_COLORS[e.action] || ''}`}>
        {e.action}
      </span>
    ),
  },
  {
    key: 'performedByName',
    header: 'User',
    render: (e) => <span className="text-xs">{e.performedByName || e.performedBy}</span>,
  },
  {
    key: 'sourceModule',
    header: 'Module',
    render: (e) => (
      <span className="text-xs text-gray-500">{e.sourceModule || '-'}</span>
    ),
  },
  {
    key: 'sourceIp',
    header: 'IP',
    render: (e) => <span className="text-xs text-gray-500 font-mono">{e.sourceIp || '-'}</span>,
  },
];

const SecretsAuditPage: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const orgId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('zorbit_user') || '{}');
      return user.organizationHashId || 'O-OZPY';
    } catch {
      return 'O-OZPY';
    }
  })();

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets/audit/all?limit=200`,
      );
      setEntries(Array.isArray(res.data.logs) ? res.data.logs : []);
      setTotal(res.data.total || 0);
    } catch {
      toast('Failed to load audit logs', 'error');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Eye className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Secrets Audit Log</h1>
            <p className="text-sm text-gray-500">
              {total} audit entries - every secret access is logged
            </p>
          </div>
        </div>
        <button onClick={fetchAudit} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card p-3 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <KeyRound size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-200">
            This log is immutable. Every create, read, update, delete, and rotate operation on
            any secret is recorded with the user, timestamp, source IP, and requesting module.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        emptyMessage="No audit entries yet"
      />
    </div>
  );
};

export default SecretsAuditPage;
