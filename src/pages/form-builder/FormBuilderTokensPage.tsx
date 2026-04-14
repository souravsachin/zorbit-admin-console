import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  X,
  ShieldOff,
} from 'lucide-react';
import { formBuilderService, type FormToken, type CreateTokenDto } from '../../services/formBuilder';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface CreateModalProps {
  onClose: () => void;
  onCreated: (secret: string) => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [forms, setForms] = useState('');
  const [domains, setDomains] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);
    const payload: CreateTokenDto = {
      name: name.trim(),
      allowedForms: forms.split(',').map((s) => s.trim()).filter(Boolean),
      allowedDomains: domains.split(',').map((s) => s.trim()).filter(Boolean),
    };
    formBuilderService
      .createToken(payload)
      .then((res) => {
        onCreated(res.data.secret);
      })
      .catch(() => setError('Failed to create token. Check service connectivity.'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Create Access Token</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Token Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Portal Integration Token"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allowed Form Slugs
            </label>
            <input
              type="text"
              value={forms}
              onChange={(e) => setForms(e.target.value)}
              placeholder="form-slug-1, form-slug-2"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Comma-separated list of form slugs</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allowed Domains
            </label>
            <input
              type="text"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="example.com, app.example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Comma-separated list of allowed domains</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              {saving ? 'Creating...' : 'Create Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SecretModal {
  secret: string;
  onClose: () => void;
}

const SecretDisplayModal: React.FC<SecretModal> = ({ secret, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" /> Token Created
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm">
            Copy this secret now. It will not be shown again.
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Token Secret</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 break-all">
                {secret}
              </code>
              <button
                onClick={copy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormBuilderTokensPage: React.FC = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<FormToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    formBuilderService
      .getTokens()
      .then((res) => {
        const data = res.data;
        setTokens(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Failed to load tokens. Is the Form Builder service running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = (tokenId: string) => {
    if (!confirm('Revoke this token? This cannot be undone.')) return;
    setRevoking(tokenId);
    formBuilderService
      .revokeToken(tokenId)
      .then(() => load())
      .catch(() => setError('Failed to revoke token.'))
      .finally(() => setRevoking(null));
  };

  const handleCreated = (secret: string) => {
    setShowCreate(false);
    setNewSecret(secret);
    load();
  };

  return (
    <>
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {newSecret && (
        <SecretDisplayModal secret={newSecret} onClose={() => setNewSecret(null)} />
      )}

      <div className="space-y-6 pb-10">
        {/* Back */}
        <button
          onClick={() => navigate('/form-builder')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Forms
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <Key className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Tokens</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage external form access tokens
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Plus size={15} /> Create Token
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Allowed Forms</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Domains</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Last Used</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
                    <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No access tokens</p>
                    <p className="text-xs mt-1">Create a token to enable external form access</p>
                  </td>
                </tr>
              ) : (
                tokens.map((t) => (
                  <tr key={t.hashId} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{t.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE[t.status] ?? STATUS_BADGE.active
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">
                      {t.allowedForms?.length > 0
                        ? t.allowedForms.join(', ')
                        : <span className="text-gray-300 dark:text-gray-600">All</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {t.allowedDomains?.length > 0
                        ? t.allowedDomains.join(', ')
                        : <span className="text-gray-300 dark:text-gray-600">Any</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">
                      {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {t.status === 'active' && (
                        <button
                          onClick={() => handleRevoke(t.hashId)}
                          disabled={revoking === t.hashId}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                        >
                          <ShieldOff size={12} />
                          {revoking === t.hashId ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FormBuilderTokensPage;
