import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw, Trash2, Upload, X, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Info, Minus,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../../config';
import api from '../../services/api';
import { useToast } from '../../components/shared/Toast';
import Select from '../../components/shared/Select';
import JsonViewer from '../../components/shared/JsonViewer';

interface RegistryModule {
  moduleId: string;
  moduleName?: string;
  moduleType?: string;
  version?: string;
  status: 'PENDING' | 'READY' | 'FAILED' | string;
  manifestUrl?: string | null;
  manifestData?: ManifestData | null;
  signatureValid?: boolean;
  registeredAt?: string;
  readyAt?: string | null;
  manifest_data?: ManifestData | null;
  registered_at?: string;
  ready_at?: string | null;
}

interface ManifestData {
  moduleId?: string;
  moduleName?: string;
  version?: string;
  placement?: {
    scaffold?: string;
    scaffoldSortOrder?: number;
    businessLine?: string;
    capabilityArea?: string;
    sortOrder?: number;
    edition?: { name?: string; category?: string } | null;
  };
  navigation?: { sections?: Array<{ items?: unknown[] }> };
  guide?: {
    intro?: { headline?: string; summary?: string };
    slides?: { deck?: unknown[] };
    lifecycle?: { phases?: unknown[] };
    videos?: { entries?: unknown[] };
    docs?: { links?: unknown[] };
    pricing?: { tiers?: unknown[] };
  };
  deployments?: { health?: { beRoute?: string } };
  db?: { operations?: Record<string, unknown> };
  composition?: unknown;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; Icon: LucideIcon }> = {
  READY:       { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', Icon: CheckCircle2 },
  PENDING:     { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', Icon: AlertTriangle },
  FAILED:      { bg: 'bg-red-100 dark:bg-red-900/40',     text: 'text-red-700 dark:text-red-300',     Icon: XCircle },
  DEACTIVATED: { bg: 'bg-gray-200 dark:bg-gray-700',      text: 'text-gray-700 dark:text-gray-300',   Icon: Info },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.text}`}>
      <Icon size={11} /> {status}
    </span>
  );
}

function md(m: RegistryModule): ManifestData | null {
  return m.manifestData || m.manifest_data || null;
}

function navItemCount(m: RegistryModule): number {
  return (md(m)?.navigation?.sections || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);
}

function whenAgo(iso?: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

type Tab = 'modules' | 'compliance';

const ModuleRegistryPage: React.FC = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<RegistryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmDeregister, setConfirmDeregister] = useState<RegistryModule | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('modules');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<RegistryModule[]>(`${API_CONFIG.MODULE_REGISTRY_URL}/api/v1/G/modules`);
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast('Failed to load module registry', 'error');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => modules.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false;
    const sc = md(m)?.placement?.scaffold || '';
    if (sectionFilter && sc !== sectionFilter) return false;
    if (filter) {
      const f = filter.toLowerCase();
      const hay = `${m.moduleId} ${m.moduleName||''} ${md(m)?.placement?.capabilityArea||''} ${md(m)?.placement?.edition?.name||''}`.toLowerCase();
      if (!hay.includes(f)) return false;
    }
    return true;
  }), [modules, filter, sectionFilter, statusFilter]);

  const scaffolds = useMemo(() => {
    const s = new Set<string>();
    for (const m of modules) {
      const sc = md(m)?.placement?.scaffold;
      if (sc) s.add(sc);
    }
    return Array.from(s).sort();
  }, [modules]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    for (const m of modules) if (m.status) s.add(m.status);
    return Array.from(s).sort();
  }, [modules]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { total: modules.length, READY: 0, PENDING: 0, FAILED: 0 };
    for (const m of modules) out[m.status] = (out[m.status] || 0) + 1;
    return out;
  }, [modules]);

  const handleRefresh = async (m: RegistryModule) => {
    setRefreshingId(m.moduleId);
    try {
      await api.post(`${API_CONFIG.MODULE_REGISTRY_URL}/api/v1/G/modules/${m.moduleId}/notifications`, {});
      toast(`Refresh signal sent for ${m.moduleId}`, 'success');
      setTimeout(load, 600);
    } catch {
      toast(`Refresh failed for ${m.moduleId}`, 'error');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeregister = async () => {
    if (!confirmDeregister) return;
    try {
      await api.delete(`${API_CONFIG.MODULE_REGISTRY_URL}/api/v1/G/modules/${confirmDeregister.moduleId}`);
      toast(`Deregistered ${confirmDeregister.moduleId}`, 'success');
      setConfirmDeregister(null);
      load();
    } catch {
      toast(`Deregister failed for ${confirmDeregister.moduleId}`, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Module Registry</h1>
          <p className="text-xs text-gray-500 mt-1">
            Live data from <code>{API_CONFIG.MODULE_REGISTRY_URL}/api/v1/G/modules</code>. Every module ships its own manifest; this is the canonical roster.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">
            <Upload size={14} /> Upload Signed Manifest
          </button>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reload All
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-px">
        <button
          onClick={() => setTab('modules')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'modules'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Modules
        </button>
        <button
          onClick={() => setTab('compliance')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'compliance'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Compliance
        </button>
      </div>

      {tab === 'compliance' ? (
        <ComplianceMatrix modules={modules} loading={loading} />
      ) : (
      <>
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">Total: <strong>{counts.total}</strong></span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">READY: <strong>{counts.READY || 0}</strong></span>
        {(counts.PENDING || 0) > 0 && <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs text-amber-700 dark:text-amber-300">PENDING: <strong>{counts.PENDING}</strong></span>}
        {(counts.FAILED || 0) > 0 && <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-xs text-red-700 dark:text-red-300">FAILED: <strong>{counts.FAILED}</strong></span>}
        {scaffolds.map((sc) => (
          <span key={sc} className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300">
            {sc}: <strong>{modules.filter((m) => md(m)?.placement?.scaffold === sc).length}</strong>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input type="text" placeholder="Search moduleId / name / capability / edition…" value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 min-w-[260px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded" />
        <Select
          value={sectionFilter}
          onChange={setSectionFilter}
          options={[{ value: '', label: 'All sections' }, ...scaffolds.map((s) => ({ value: s, label: s }))]}
          minWidth={200}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: '', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: s }))]}
          minWidth={160}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-2 py-2 w-6"></th>
                <th className="px-3 py-2 text-left">Module ID</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Section</th>
                <th className="px-3 py-2 text-left">Business Line</th>
                <th className="px-3 py-2 text-left">Capability</th>
                <th className="px-3 py-2 text-left">Edition</th>
                <th className="px-3 py-2 text-left">Ver</th>
                <th className="px-3 py-2 text-left">Items</th>
                <th className="px-3 py-2 text-left">Ready</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-400">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-400">No modules</td></tr>}
              {!loading && filtered.map((m) => {
                const placement = md(m)?.placement || {};
                const isExpanded = expandedRow === m.moduleId;
                return (
                  <React.Fragment key={m.moduleId}>
                    <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-2 py-2 align-top">
                        <button onClick={() => setExpandedRow(isExpanded ? null : m.moduleId)} className="text-gray-400 hover:text-gray-700">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-mono text-[12px]">{m.moduleId}</div>
                        {m.moduleName && <div className="text-[10.5px] text-gray-500">{m.moduleName}</div>}
                      </td>
                      <td className="px-3 py-2 align-top"><StatusBadge status={m.status} /></td>
                      <td className="px-3 py-2 align-top text-[12px]">{placement.scaffold || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-2 align-top text-[12px]">{placement.businessLine || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-2 align-top text-[12px]">{placement.capabilityArea || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-2 align-top text-[12px]">{placement.edition?.name || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-2 align-top text-[12px] font-mono">{m.version || md(m)?.version || '—'}</td>
                      <td className="px-3 py-2 align-top text-[12px]">{navItemCount(m)}</td>
                      <td className="px-3 py-2 align-top text-[12px] text-gray-500">{whenAgo(m.readyAt || m.ready_at)}</td>
                      <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                        <button onClick={() => handleRefresh(m)} disabled={refreshingId === m.moduleId} title="Refresh — sends a notification to subscribers" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-indigo-600">
                          <RefreshCw size={13} className={refreshingId === m.moduleId ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={() => setConfirmDeregister(m)} title="Deregister — remove from registry" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-red-600 ml-1">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-gray-900/40">
                        <td colSpan={11} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Manifest URL</div>
                              <div className="font-mono text-[11px] break-all">{m.manifestUrl || '—'}</div>
                              <div className="text-[10px] uppercase font-semibold text-gray-500 mt-3 mb-1">Signature Valid</div>
                              <div>{m.signatureValid ? <span className="text-green-600">yes</span> : <span className="text-amber-600">no</span>}</div>
                              <div className="text-[10px] uppercase font-semibold text-gray-500 mt-3 mb-1">Registered</div>
                              <div className="text-[11px]">{whenAgo(m.registeredAt || m.registered_at)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Manifest (placement + navigation)</div>
                              <JsonViewer
                                value={{ placement: md(m)?.placement, navigation: md(m)?.navigation }}
                                maxHeightClass="max-h-96"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDeregister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmDeregister(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={22} />
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">Deregister module?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This permanently removes <code className="font-mono">{confirmDeregister.moduleId}</code> from the registry. If the module is still running, it will re-announce on its next restart.
                </p>
              </div>
              <button onClick={() => setConfirmDeregister(null)}><X size={18} /></button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setConfirmDeregister(null)} className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleDeregister} className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700">Deregister</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowUpload(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base font-semibold">Upload Signed Manifest</h3>
              <button onClick={() => setShowUpload(false)}><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Paste a signed manifest JSON. The HMAC <code>signedToken</code> must match
              <code> HMAC-SHA256(canonical_json(manifest), PLATFORM_MODULE_SECRET)</code>.
            </p>
            <UploadManifestForm onDone={() => { setShowUpload(false); load(); }} onClose={() => setShowUpload(false)} />
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

// ============================================================
// Compliance matrix (US-MX-2094 Phase 4)
// ============================================================

interface ComplianceRow {
  moduleId: string;
  scaffold: string;
  navigation: boolean;
  guide: boolean;
  deployments: boolean;
  db: boolean;
  composition: boolean;
}

function buildComplianceRow(m: RegistryModule): ComplianceRow {
  const d = md(m);
  return {
    moduleId: m.moduleId,
    scaffold: d?.placement?.scaffold || '',
    navigation: (d?.navigation?.sections || []).some((s) => (s.items || []).length > 0),
    guide: Boolean(d?.guide && d.guide.intro && (d.guide.intro.headline || d.guide.intro.summary)),
    deployments: Boolean(d?.deployments?.health?.beRoute),
    db: Boolean(d?.db && d.db.operations && Object.keys(d.db.operations).length > 0),
    composition: Boolean(d?.composition),
  };
}

const Cell: React.FC<{
  present: boolean;
  href?: string;
  label: string;
  moduleId: string;
}> = ({ present, href, label, moduleId }) => {
  const [showTip, setShowTip] = useState(false);
  if (present && href) {
    return (
      <Link
        to={href}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/40"
        title={`Open ${label}`}
      >
        <CheckCircle2 size={18} />
      </Link>
    );
  }
  if (present && !href) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md text-green-600">
        <CheckCircle2 size={18} />
      </span>
    );
  }
  // missing: show X with popover
  return (
    <button
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip((v) => !v)}
      className="relative inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40"
    >
      <XCircle size={18} />
      {showTip && (
        <div className="absolute z-20 top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded shadow-lg">
          Not supplied — declared as US-MF-2089 follow-up for <code className="font-mono">{moduleId}</code>
        </div>
      )}
    </button>
  );
};

const DashCell: React.FC = () => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-300 dark:text-gray-600">
    <Minus size={18} />
  </span>
);

const ComplianceMatrix: React.FC<{ modules: RegistryModule[]; loading: boolean }> = ({ modules, loading }) => {
  const rows = useMemo(() => modules.map(buildComplianceRow), [modules]);

  const totals = useMemo(() => {
    const t = { navigation: 0, guide: 0, deployments: 0, db: 0, composition: 0 };
    for (const r of rows) {
      if (r.navigation) t.navigation++;
      if (r.guide) t.guide++;
      if (r.deployments) t.deployments++;
      if (r.db) t.db++;
      if (r.composition) t.composition++;
    }
    return t;
  }, [rows]);

  const slug = (moduleId: string) => moduleId.replace(/^zorbit-(app|cor|pfs|tpm|sdk|ext)-/, '');

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Green = section supplied and renderable; red = missing; dash = not applicable to this module type.
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">Modules: <strong>{rows.length}</strong></span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">Navigation: <strong>{totals.navigation}</strong> / {rows.length}</span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">Guide: <strong>{totals.guide}</strong> / {rows.length}</span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">Deployments: <strong>{totals.deployments}</strong> / {rows.length}</span>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-xs text-green-700 dark:text-green-300">DB: <strong>{totals.db}</strong> / {rows.length}</span>
        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300">Composition: <strong>{totals.composition}</strong> / {rows.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left">Module</th>
                <th className="px-3 py-2 text-left">Scaffold</th>
                <th className="px-3 py-2 text-center">Navigation</th>
                <th className="px-3 py-2 text-center">Guide</th>
                <th className="px-3 py-2 text-center">Deployments</th>
                <th className="px-3 py-2 text-center">DB</th>
                <th className="px-3 py-2 text-center">Composition</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">No modules</td></tr>}
              {!loading && rows.map((r) => {
                const s = slug(r.moduleId);
                return (
                  <tr key={r.moduleId} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-3 py-2 align-middle">
                      <div className="font-mono text-[12px]">{r.moduleId}</div>
                    </td>
                    <td className="px-3 py-2 align-middle text-[12px] text-gray-600 dark:text-gray-400">{r.scaffold || '—'}</td>
                    <td className="px-3 py-2 align-middle text-center">
                      <Cell present={r.navigation} moduleId={r.moduleId} label="navigation" href={`/m/${s}/`} />
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <Cell present={r.guide} moduleId={r.moduleId} label="guide" href={r.guide ? `/m/${s}/guide/intro` : undefined} />
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <Cell present={r.deployments} moduleId={r.moduleId} label="deployments" href={r.deployments ? `/m/${s}/deployments` : undefined} />
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <Cell present={r.db} moduleId={r.moduleId} label="db" href={r.db ? `/m/${s}/db` : undefined} />
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      {r.composition
                        ? <Cell present moduleId={r.moduleId} label="composition" href={`/m/${s}/`} />
                        : <DashCell />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UploadManifestForm: React.FC<{ onDone: () => void; onClose: () => void }> = ({ onDone, onClose }) => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { toast('Invalid JSON', 'error'); return; }
    setBusy(true);
    try {
      await api.post(`${API_CONFIG.MODULE_REGISTRY_URL}/api/v1/G/modules`, parsed);
      toast('Manifest accepted', 'success');
      onDone();
    } catch (err) {
      toast(`Registration failed${(err as Error).message ? `: ${(err as Error).message}` : ''}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} placeholder='{"moduleId":"zorbit-app-foo","moduleName":"Foo","version":"1.0.0","placement":{...},"navigation":{...},"signedToken":"<HMAC>"}' className="w-full font-mono text-[11px] p-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded" />
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
        <button onClick={submit} disabled={busy || !text.trim()} className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Submitting…' : 'Register'}
        </button>
      </div>
    </>
  );
};

export default ModuleRegistryPage;
