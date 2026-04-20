import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Server,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/shared/Toast';
import Select from '../../components/shared/Select';

// --- types -----------------------------------------------------------

type Category = 'PP' | 'ORG';
type Health = 'unknown' | 'healthy' | 'degraded' | 'down';

interface EnvironmentRow {
  envId: string;
  name: string;
  category: Category;
  orgHashId: string;
  baseUrl: string;
  capabilities: string[] | null;
  healthStatus: Health;
  lastHealthAt: string | null;
  hasApiSecret: boolean;
  apiSecretPreview: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ModuleRegistryEntry {
  moduleId: string;
}

// --- constants / helpers --------------------------------------------

const API_BASE = '/api/deployment-registry/api/v1/G/environments';
const MODULE_REGISTRY_API = '/api/module-registry/api/v1/G/modules';

const HEALTH_STYLE: Record<
  Health,
  { bg: string; text: string; label: string }
> = {
  healthy: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    label: 'healthy',
  },
  degraded: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'degraded',
  },
  down: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    label: 'down',
  },
  unknown: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-300',
    label: 'unknown',
  },
};

function whenAgo(iso?: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

// --- component -------------------------------------------------------

const DeploymentEnvironmentsPage: React.FC = () => {
  const { toast } = useToast();

  const [rows, setRows] = useState<EnvironmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<'' | Category>('');
  const [orgFilter, setOrgFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState<'' | Health>('');
  const [pingingId, setPingingId] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<EnvironmentRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [secretTarget, setSecretTarget] = useState<EnvironmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnvironmentRow | null>(null);

  const [moduleOptions, setModuleOptions] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<EnvironmentRow[]>(API_BASE);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || 'Failed to load environments';
      toast(msg, 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const res = await api.get<ModuleRegistryEntry[]>(MODULE_REGISTRY_API);
      const ids = (Array.isArray(res.data) ? res.data : [])
        .map((m) => m.moduleId)
        .sort();
      setModuleOptions(ids);
    } catch {
      // Non-fatal — create modal falls back to manual entry
      setModuleOptions([]);
    }
  };

  useEffect(() => {
    load();
    loadModules();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (catFilter && r.category !== catFilter) return false;
        if (orgFilter && !r.orgHashId.toLowerCase().includes(orgFilter.toLowerCase()))
          return false;
        if (healthFilter && r.healthStatus !== healthFilter) return false;
        return true;
      }),
    [rows, catFilter, orgFilter, healthFilter],
  );

  const counts = useMemo(() => {
    const c = { total: rows.length, healthy: 0, pp: 0, org: 0 };
    for (const r of rows) {
      if (r.healthStatus === 'healthy') c.healthy++;
      if (r.category === 'PP') c.pp++;
      if (r.category === 'ORG') c.org++;
    }
    return c;
  }, [rows]);

  const ping = async (r: EnvironmentRow) => {
    setPingingId(r.envId);
    try {
      await api.post(`${API_BASE}/${r.envId}/health`);
      toast(`${r.envId} probed`, 'success');
      await load();
    } catch {
      toast(`Ping failed for ${r.envId}`, 'error');
    } finally {
      setPingingId(null);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`${API_BASE}/${deleteTarget.envId}`);
      toast(`Deleted ${deleteTarget.envId}`, 'success');
      setDeleteTarget(null);
      await load();
    } catch {
      toast(`Delete failed for ${deleteTarget.envId}`, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="text-indigo-600" size={22} /> Deployment Environments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Targets for config/data promotion. Health probed every 5 minutes and on demand.
            apiSecret storage is{' '}
            <strong>temporary Phase-2</strong> — migrates to{' '}
            <code className="font-mono">zorbit-cor-secrets_vault</code> in Phase 5.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus size={14} /> Add Environment
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reload All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
          Total: <strong>{counts.total}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">
          Healthy: <strong>{counts.healthy}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300">
          PP: <strong>{counts.pp}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-xs text-purple-700 dark:text-purple-300">
          ORG: <strong>{counts.org}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={catFilter}
          onChange={(v) => setCatFilter(v as '' | Category)}
          options={[
            { value: '', label: 'All categories' },
            { value: 'PP', label: 'PP (Platform Provider)' },
            { value: 'ORG', label: 'ORG (Customer)' },
          ]}
          minWidth={220}
        />
        <input
          type="text"
          placeholder="Filter by org hash id (e.g. O-OZPY)"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded"
        />
        <Select
          value={healthFilter}
          onChange={(v) => setHealthFilter(v as '' | Health)}
          options={[
            { value: '', label: 'Any health' },
            { value: 'healthy', label: 'Healthy only' },
            { value: 'degraded', label: 'Degraded only' },
            { value: 'down', label: 'Down only' },
            { value: 'unknown', label: 'Unknown only' },
          ]}
          minWidth={160}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left">Env ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Cat</th>
                <th className="px-3 py-2 text-left">Owner Org</th>
                <th className="px-3 py-2 text-left">Base URL</th>
                <th className="px-3 py-2 text-left">Capabilities</th>
                <th className="px-3 py-2 text-left">Health</th>
                <th className="px-3 py-2 text-left">Last Checked</th>
                <th className="px-3 py-2 text-left">Secret</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-gray-400">
                    No environments match filter.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((r) => {
                  const hs = HEALTH_STYLE[r.healthStatus] || HEALTH_STYLE.unknown;
                  return (
                    <tr
                      key={r.envId}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-3 py-2 font-mono text-[12px]">{r.envId}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {r.category === 'PP' ? (
                            <Server size={12} className="text-indigo-500" />
                          ) : (
                            <Globe size={12} className="text-purple-500" />
                          )}
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                            r.category === 'PP'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          }`}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[12px]">{r.orgHashId}</td>
                      <td className="px-3 py-2">
                        <a
                          href={r.baseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-indigo-600 dark:text-indigo-300 hover:underline break-all"
                        >
                          {r.baseUrl}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-[12px]">
                        <span title={(r.capabilities || []).join(', ')}>
                          {(r.capabilities || []).length}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${hs.bg} ${hs.text}`}
                        >
                          <Activity size={10} /> {hs.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-500">
                        {whenAgo(r.lastHealthAt)}
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        {r.hasApiSecret ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 size={11} />{' '}
                            <span className="font-mono">{r.apiSecretPreview}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <XCircle size={11} /> none
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => ping(r)}
                          disabled={pingingId === r.envId}
                          title="Ping now — probes baseUrl/health"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-indigo-600"
                        >
                          <Activity
                            size={13}
                            className={pingingId === r.envId ? 'animate-pulse' : ''}
                          />
                        </button>
                        <button
                          onClick={() => setSecretTarget(r)}
                          title="Rotate API secret"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-indigo-600 ml-1"
                        >
                          <Key size={13} />
                        </button>
                        <button
                          onClick={() => setEditTarget(r)}
                          title="Edit"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-indigo-600 ml-1"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          title="Delete (soft)"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-red-600 ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <EnvironmentFormModal
          mode="create"
          moduleOptions={moduleOptions}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            load();
          }}
        />
      )}

      {editTarget && (
        <EnvironmentFormModal
          mode="edit"
          initial={editTarget}
          moduleOptions={moduleOptions}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            load();
          }}
        />
      )}

      {secretTarget && (
        <ApiSecretModal
          env={secretTarget}
          onClose={() => setSecretTarget(null)}
          onSaved={() => {
            setSecretTarget(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <TypedConfirmDeleteModal
          env={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
};

// --- modals ----------------------------------------------------------

interface FormState {
  name: string;
  category: Category;
  orgHashId: string;
  baseUrl: string;
  capabilities: string[];
}

const EnvironmentFormModal: React.FC<{
  mode: 'create' | 'edit';
  initial?: EnvironmentRow;
  moduleOptions: string[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ mode, initial, moduleOptions, onClose, onSaved }) => {
  const { toast } = useToast();
  const [state, setState] = useState<FormState>({
    name: initial?.name ?? '',
    category: initial?.category ?? 'PP',
    orgHashId:
      initial?.orgHashId ?? (initial?.category === 'ORG' ? '' : 'O-OZPY'),
    baseUrl: initial?.baseUrl ?? '',
    capabilities: initial?.capabilities ?? [],
  });
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  };

  // keep org locked to O-OZPY when PP
  useEffect(() => {
    if (state.category === 'PP' && state.orgHashId !== 'O-OZPY') {
      update('orgHashId', 'O-OZPY');
    }
  }, [state.category]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!state.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    if (!state.baseUrl.trim()) {
      toast('Base URL is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.post(API_BASE, {
          name: state.name.trim(),
          category: state.category,
          orgHashId: state.orgHashId.trim(),
          baseUrl: state.baseUrl.trim(),
          capabilities: state.capabilities,
        });
        toast('Environment created', 'success');
      } else if (initial) {
        await api.put(`${API_BASE}/${initial.envId}`, {
          name: state.name.trim(),
          category: state.category,
          orgHashId: state.orgHashId.trim(),
          baseUrl: state.baseUrl.trim(),
          capabilities: state.capabilities,
        });
        toast('Environment updated', 'success');
      }
      onSaved();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || 'Save failed';
      toast(Array.isArray(msg) ? msg.join('; ') : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleCap = (id: string) => {
    setState((s) => ({
      ...s,
      capabilities: s.capabilities.includes(id)
        ? s.capabilities.filter((c) => c !== id)
        : [...s.capabilities, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold">
            {mode === 'create' ? 'Add Environment' : `Edit ${initial?.envId}`}
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              value={state.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
              placeholder="e.g. UAT-1, PROD-EU, ACME-Sandbox"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <Select
                value={state.category}
                onChange={(v) => update('category', v as Category)}
                options={[
                  { value: 'PP', label: 'PP — Platform Provider' },
                  { value: 'ORG', label: 'ORG — Customer' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Owner Org Hash ID
              </label>
              <input
                value={state.orgHashId}
                onChange={(e) => update('orgHashId', e.target.value)}
                disabled={state.category === 'PP'}
                className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded disabled:opacity-60"
                placeholder="O-XXXX"
              />
              {state.category === 'PP' && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Locked to O-OZPY for Platform-Provider envs.
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base URL</label>
            <input
              value={state.baseUrl}
              onChange={(e) => update('baseUrl', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
              placeholder="https://..."
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              Health pinger GETs <code>{'{baseUrl}'}/health</code> every 5 minutes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Capabilities (modules this env supports) — {state.capabilities.length} selected
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-2 max-h-56 overflow-y-auto">
              {moduleOptions.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">
                  Module registry unavailable. Enter module IDs manually (comma-separated):
                </p>
              ) : null}
              {moduleOptions.length === 0 ? (
                <input
                  value={state.capabilities.join(', ')}
                  onChange={(e) =>
                    update(
                      'capabilities',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  className="w-full px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
                  placeholder="zorbit-app-pcg4, zorbit-cor-identity, ..."
                />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {moduleOptions.map((id) => (
                    <label
                      key={id}
                      className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={state.capabilities.includes(id)}
                        onChange={() => toggleCap(id)}
                        className="shrink-0"
                      />
                      <span className="text-[11px] font-mono truncate">{id}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiSecretModal: React.FC<{
  env: EnvironmentRow;
  onClose: () => void;
  onSaved: () => void;
}> = ({ env, onClose, onSaved }) => {
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (value.length < 8) {
      toast('Secret must be at least 8 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put(`${API_BASE}/${env.envId}/api-secret`, { value });
      toast(`Secret set for ${env.envId}`, 'success');
      onSaved();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || 'Rotation failed';
      toast(Array.isArray(msg) ? msg.join('; ') : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-semibold">Rotate API Secret</h3>
            <p className="text-xs text-gray-500">{env.envId} — {env.name}</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 mb-3 rounded-md bg-amber-50 dark:bg-amber-900/20 text-[11px] text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <div>
            Phase-2 storage is <strong>temporary</strong>. Ciphertext lives in
            <code> environments.api_secret_ciphertext</code> with the
            <code> DEPLOYMENT_REGISTRY_TEMP_KEK_BASE64</code> key. Migrates to
            <code> zorbit-cor-secrets_vault</code> in Phase 5.
          </div>
        </div>

        <label className="block text-xs font-medium text-gray-500 mb-1">
          New secret value (min 8 chars)
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
          placeholder="paste generated secret…"
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || value.length < 8}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Set Secret'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TypedConfirmDeleteModal: React.FC<{
  env: EnvironmentRow;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ env, onCancel, onConfirm }) => {
  const [typed, setTyped] = useState('');
  const canConfirm = typed.trim() === env.envId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={22} />
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1">Soft-delete environment?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Sets <code>deleted_at</code> on{' '}
              <code className="font-mono">{env.envId}</code> ({env.name}). List
              endpoints will hide it. No data is dropped — rollback requires DB access.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Type <code className="font-mono font-semibold">{env.envId}</code> to
              confirm:
            </p>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
              autoFocus
            />
          </div>
          <button onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentEnvironmentsPage;
