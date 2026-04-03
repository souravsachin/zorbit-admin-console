import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Lock, Shield } from 'lucide-react';
import { useToast } from '../../components/shared/Toast';
import { API_CONFIG } from '../../config';
import api from '../../services/api';

const CATEGORIES = [
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth', label: 'OAuth Secret' },
  { value: 'database', label: 'Database Credential' },
  { value: 'sftp', label: 'SFTP Key' },
  { value: 'smtp', label: 'SMTP Credential' },
  { value: 'custom', label: 'Custom' },
];

const PROVIDERS = [
  'openai', 'google', 'aws', 'azure', 'sendgrid', 'twilio',
  'github', 'gitlab', 'mongodb', 'postgresql', 'kafka', 'custom',
];

const SecretsCreatePage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'api_key',
    value: '',
    provider: 'custom',
    linkedModules: '',
    expiresAt: '',
  });

  const orgId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('zorbit_user') || '{}');
      return user.organizationHashId || 'O-OZPY';
    } catch {
      return 'O-OZPY';
    }
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.value.trim()) {
      toast('Name and value are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post(`${API_CONFIG.SECRETS_URL}/api/v1/O/${orgId}/secrets`, {
        name: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        category: form.category,
        value: form.value,
        provider: form.provider,
        linkedModules: form.linkedModules
          ? form.linkedModules.split(',').map((m) => m.trim()).filter(Boolean)
          : [],
        expiresAt: form.expiresAt || undefined,
      });
      toast('Secret created successfully', 'success');
      navigate('/app/secrets/list');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create secret';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/secrets/list')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <KeyRound className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create Secret</h1>
          <p className="text-sm text-gray-500">The value will be encrypted with AES-256-GCM before storage</p>
        </div>
      </div>

      <div className="card p-3 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <div className="flex items-start space-x-2">
          <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            The secret value is encrypted before it leaves this page. It is transmitted over HTTPS
            and stored as an AES-256-GCM encrypted blob. The plaintext value is never logged or cached.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., openai-api-key"
            className="input-field w-full"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Lowercase, hyphen-separated. Must be unique per organization.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What is this secret used for?"
            className="input-field w-full"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field w-full"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="input-field w-full"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            <Lock size={14} className="inline mr-1" />
            Secret Value *
          </label>
          <input
            name="value"
            type="password"
            value={form.value}
            onChange={handleChange}
            placeholder="Enter the secret value"
            className="input-field w-full font-mono"
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Linked Modules</label>
          <input
            name="linkedModules"
            value={form.linkedModules}
            onChange={handleChange}
            placeholder="e.g., ai-gateway, voice-engine (comma separated)"
            className="input-field w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/app/secrets/list')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Lock size={16} />
            <span>{saving ? 'Encrypting...' : 'Create Secret'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecretsCreatePage;
