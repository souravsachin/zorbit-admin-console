import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Plug } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import { integrationService, CreateConnectorPayload, ConnectorEndpoint } from '../../services/integration';

const CONNECTOR_TYPES = [
  { value: 'rest_api', label: 'REST API' },
  { value: 'soap', label: 'SOAP' },
  { value: 'webhook_receiver', label: 'Webhook Receiver' },
  { value: 'webhook_sender', label: 'Webhook Sender' },
  { value: 'rpa', label: 'RPA' },
  { value: 'sftp', label: 'SFTP' },
  { value: 'database', label: 'Database' },
];

const AUTH_TYPES = [
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'basic', label: 'Basic Auth' },
];

const IntegrationConnectorNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { orgId } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'rest_api',
    description: '',
    baseUrl: '',
    authType: 'api_key',
    authCredentials: 'stored_in_vault',
    timeout: 30000,
    maxRetries: 3,
    backoffMs: 1000,
    scheduleCron: '',
    scheduleTimezone: 'Asia/Dubai',
  });

  const [endpoints, setEndpoints] = useState<ConnectorEndpoint[]>([
    { name: '', method: 'GET', path: '', mapping: {} },
  ]);

  const addEndpoint = () => {
    setEndpoints([...endpoints, { name: '', method: 'GET', path: '', mapping: {} }]);
  };

  const removeEndpoint = (idx: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== idx));
  };

  const updateEndpoint = (idx: number, field: string, value: string) => {
    const updated = [...endpoints];
    (updated[idx] as any)[field] = value;
    setEndpoints(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: CreateConnectorPayload = {
      name: form.name,
      type: form.type,
      description: form.description,
      config: {
        baseUrl: form.baseUrl || undefined,
        auth: { type: form.authType, credentials: form.authCredentials },
        timeout: form.timeout,
        retryPolicy: { maxRetries: form.maxRetries, backoffMs: form.backoffMs },
      },
      endpoints: endpoints.filter((ep) => ep.name && ep.path),
      schedule: form.scheduleCron ? { cron: form.scheduleCron, timezone: form.scheduleTimezone } : null,
      isActive: true,
    };

    try {
      await integrationService.createConnector(orgId, payload);
      toast('Connector created', 'success');
      navigate('/integrations/connectors');
    } catch {
      toast('Failed to create connector', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/integrations/connectors')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug size={24} />
          New Connector
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="HAAD Provider Lookup"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field"
              >
                {CONNECTOR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Describe the purpose of this integration..."
            />
          </div>
        </div>

        {/* Connection Config */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Connection</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Base URL</label>
            <input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              className="input-field font-mono text-sm"
              placeholder="https://api.example.com/v1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Auth Type</label>
              <select
                value={form.authType}
                onChange={(e) => setForm({ ...form, authType: e.target.value })}
                className="input-field"
              >
                {AUTH_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credentials Ref</label>
              <input
                value={form.authCredentials}
                onChange={(e) => setForm({ ...form, authCredentials: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="stored_in_vault"
              />
              <p className="text-xs text-gray-400 mt-1">PII Vault or Secrets service reference</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Timeout (ms)</label>
              <input
                type="number"
                value={form.timeout}
                onChange={(e) => setForm({ ...form, timeout: parseInt(e.target.value) || 30000 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Retries</label>
              <input
                type="number"
                value={form.maxRetries}
                onChange={(e) => setForm({ ...form, maxRetries: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Backoff (ms)</label>
              <input
                type="number"
                value={form.backoffMs}
                onChange={(e) => setForm({ ...form, backoffMs: parseInt(e.target.value) || 1000 })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Endpoints</h2>
            <button type="button" onClick={addEndpoint} className="btn-secondary flex items-center gap-1 text-sm">
              <Plus size={14} /> Add
            </button>
          </div>
          {endpoints.map((ep, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <input
                  value={ep.name}
                  onChange={(e) => updateEndpoint(idx, 'name', e.target.value)}
                  className="input-field text-sm"
                  placeholder="endpoint_name"
                />
                <select
                  value={ep.method}
                  onChange={(e) => updateEndpoint(idx, 'method', e.target.value)}
                  className="input-field text-sm"
                >
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'RPA'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  value={ep.path}
                  onChange={(e) => updateEndpoint(idx, 'path', e.target.value)}
                  className="input-field text-sm font-mono col-span-2"
                  placeholder="/resources/{id}"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEndpoint(idx)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 mt-1"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Schedule (optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cron Expression</label>
              <input
                value={form.scheduleCron}
                onChange={(e) => setForm({ ...form, scheduleCron: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="0 2 * * *"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty for on-demand only</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <input
                value={form.scheduleTimezone}
                onChange={(e) => setForm({ ...form, scheduleTimezone: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? 'Creating...' : 'Create Connector'}
          </button>
          <button type="button" onClick={() => navigate('/integrations/connectors')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default IntegrationConnectorNewPage;
