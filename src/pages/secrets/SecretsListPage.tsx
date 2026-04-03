import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Plus,
  Eye,
  EyeOff,
  RotateCw,
  Trash2,
  Clock,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import DataTable, { Column } from '../../components/shared/DataTable';
import { useToast } from '../../components/shared/Toast';
import { API_CONFIG } from '../../config';
import api from '../../services/api';

interface SecretEntry {
  hashId: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  linkedModules: string[];
  createdBy: string;
  isActive: boolean;
  accessCount: number;
  lastAccessedAt: string | null;
  expiresAt: string | null;
  rotatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  api_key: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  oauth: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  database: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  sftp: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  smtp: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  custom: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300',
};

const SecretsListPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState<SecretEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [revealedValue, setRevealedValue] = useState<string>('');
  const [revealLoading, setRevealLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const orgId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('zorbit_user') || '{}');
      return user.organizationHashId || 'O-OZPY';
    } catch {
      return 'O-OZPY';
    }
  })();

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await api.get<SecretEntry[]>(
        `${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets`,
      );
      setSecrets(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast('Failed to load secrets', 'error');
      setSecrets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReveal = async (name: string) => {
    if (revealedSecret === name) {
      setRevealedSecret(null);
      setRevealedValue('');
      return;
    }
    setRevealLoading(true);
    try {
      const res = await api.get(
        `${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets/${name}`,
      );
      setRevealedSecret(name);
      setRevealedValue(res.data.value);
    } catch {
      toast('Failed to retrieve secret value', 'error');
    } finally {
      setRevealLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(revealedValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete secret "${name}"? This action can be undone by admin.`)) return;
    try {
      await api.delete(`${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets/${name}`);
      toast(`Secret "${name}" deleted`, 'success');
      fetchSecrets();
    } catch {
      toast('Failed to delete secret', 'error');
    }
  };

  const handleRotate = async (name: string) => {
    const newValue = prompt(`Enter new value for "${name}":`);
    if (!newValue) return;
    try {
      await api.post(
        `${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets/${name}/rotate`,
        { value: newValue },
      );
      toast(`Secret "${name}" rotated`, 'success');
      setRevealedSecret(null);
      setRevealedValue('');
      fetchSecrets();
    } catch {
      toast('Failed to rotate secret', 'error');
    }
  };

  const columns: Column<SecretEntry>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (s) => (
        <div>
          <code className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {s.name}
          </code>
          <p className="text-xs text-gray-500 mt-0.5 max-w-[250px] truncate">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (s) => (
        <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS.custom}`}>
          {s.category.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (s) => <span className="text-xs text-gray-600 dark:text-gray-400">{s.provider}</span>,
    },
    {
      key: 'linkedModules',
      header: 'Modules',
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.linkedModules.slice(0, 3).map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded">
              {m}
            </span>
          ))}
          {s.linkedModules.length > 3 && (
            <span className="text-[10px] text-gray-500">+{s.linkedModules.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'accessCount',
      header: 'Accesses',
      render: (s) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{s.accessCount}</span>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      render: (s) => (
        <div className="flex items-center gap-1.5">
          {revealedSecret === s.name ? (
            <>
              <code className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded max-w-[120px] truncate">
                {revealedValue}
              </code>
              <button onClick={handleCopy} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Copy">
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 font-mono">{'*'.repeat(16)}</span>
          )}
          <button
            onClick={() => handleReveal(s.name)}
            disabled={revealLoading}
            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={revealedSecret === s.name ? 'Hide' : 'Reveal'}
          >
            {revealedSecret === s.name ? (
              <EyeOff size={14} className="text-gray-500" />
            ) : (
              <Eye size={14} className="text-gray-500" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRotate(s.name)}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
            title="Rotate"
          >
            <RotateCw size={14} className="text-amber-600" />
          </button>
          <button
            onClick={() => handleDelete(s.name)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title="Delete"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <KeyRound className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Secrets Vault</h1>
            <p className="text-sm text-gray-500">
              {secrets.length} secret{secrets.length !== 1 ? 's' : ''} stored
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/app/secrets/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>New Secret</span>
        </button>
      </div>

      <div className="card p-3 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <div className="flex items-start space-x-2">
          <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            All values are encrypted with AES-256-GCM. Revealing a secret value is audit-logged.
            Use the <Clock size={12} className="inline" /> rotation button to update a secret with a new value.
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={secrets} loading={loading} emptyMessage="No secrets found. Create one to get started." />
    </div>
  );
};

export default SecretsListPage;
