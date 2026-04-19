import React, { useState } from 'react';
import { useModuleContext, type DbOperation } from '../../contexts/ModuleContext';
import api from '../../services/api';
import { useToast } from '../shared/Toast';
import { Info, Database, Sprout, Trash2, Archive, Upload, AlertTriangle, X } from 'lucide-react';

// lucide-react doesn't ship a Seed icon; use Sprout for seed operations.
const SeedIcon = Sprout;

type OpKey = 'seedSystemMin' | 'seedDemoData' | 'flushDemoData' | 'flushAllData' | 'backup' | 'restore';

interface OpMeta {
  key: OpKey;
  label: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const OPS: OpMeta[] = [
  { key: 'seedSystemMin', label: 'Seed system minimums', desc: 'Seed the minimum required rows for the module to operate.', Icon: SeedIcon, color: 'green' },
  { key: 'seedDemoData', label: 'Seed demo data',       desc: 'Populate representative demo records.',                    Icon: SeedIcon, color: 'emerald' },
  { key: 'flushDemoData', label: 'Flush demo data',     desc: 'Remove all demo records. Leaves system rows intact.',      Icon: Trash2,   color: 'amber' },
  { key: 'flushAllData', label: 'Flush ALL data',       desc: 'Remove EVERY record in this module, including system.',    Icon: Trash2,   color: 'red' },
  { key: 'backup',        label: 'Backup database',      desc: 'Snapshot and archive for restore.',                        Icon: Archive,  color: 'blue' },
  { key: 'restore',       label: 'Restore from backup',  desc: 'Restore a previous snapshot. OVERWRITES current data.',    Icon: Upload,   color: 'red' },
];

function getOp(ops: Record<string, DbOperation | undefined> | undefined, key: OpKey): DbOperation | undefined {
  if (!ops) return undefined;
  return ops[key];
}

const DbOperationsPanel: React.FC = () => {
  const { manifest, moduleId, loading } = useModuleContext();
  const { toast } = useToast();
  const [confirmOp, setConfirmOp] = useState<OpMeta | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const db = manifest?.db;

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading DB operations…</div>;

  if (!db) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">DB operations not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>db</code> in its manifest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const runOp = async (meta: OpMeta) => {
    const op = getOp(db.operations as Record<string, DbOperation | undefined> | undefined, meta.key);
    if (!op) return;
    setBusyKey(meta.key);
    try {
      const method = (op.method || (meta.key.startsWith('flush') ? 'DELETE' : 'POST')).toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (api as any)[method](op.beRoute);
      toast(`${meta.label} succeeded`, 'success');
    } catch (e) {
      toast(`${meta.label} failed: ${(e as Error).message || 'error'}`, 'error');
    } finally {
      setBusyKey(null);
      setConfirmOp(null);
      setConfirmText('');
    }
  };

  const startOp = (meta: OpMeta) => {
    const op = getOp(db.operations as Record<string, DbOperation | undefined> | undefined, meta.key);
    if (!op) return;
    if (op.destructive) {
      setConfirmOp(meta);
      setConfirmText('');
    } else {
      runOp(meta);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Database size={22} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Database operations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {db.dbType && <>Type: <code className="font-mono">{db.dbType}</code> · </>}
            {db.dbName && <>DB: <code className="font-mono">{db.dbName}</code> · </>}
            Module: <code className="font-mono">{moduleId}</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPS.map((meta) => {
          const op = getOp(db.operations as Record<string, DbOperation | undefined> | undefined, meta.key);
          const isDeclared = Boolean(op);
          const isDestructive = op?.destructive;
          const Icon = meta.Icon;
          const busy = busyKey === meta.key;
          return (
            <div
              key={meta.key}
              className={`rounded-lg border p-4 ${
                !isDeclared
                  ? 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                  : isDestructive
                  ? 'border-red-300 dark:border-red-800 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded ${
                    isDestructive
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon width={16} height={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{meta.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{meta.desc}</div>
                  {isDeclared && op && (
                    <div className="text-[10px] font-mono text-gray-500 mt-2 break-all">
                      {(op.method || (meta.key.startsWith('flush') ? 'DELETE' : 'POST'))} {op.beRoute}
                    </div>
                  )}
                  {!isDeclared && (
                    <div className="text-[10px] uppercase font-semibold text-gray-400 mt-2">
                      Not declared in manifest
                    </div>
                  )}
                </div>
              </div>
              <button
                disabled={!isDeclared || busy}
                onClick={() => startOp(meta)}
                className={`mt-3 w-full py-1.5 rounded text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDestructive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {busy ? 'Running…' : isDestructive ? `Run (destructive)` : 'Run'}
              </button>
            </div>
          );
        })}
      </div>

      {confirmOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmOp(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={22} />
              <div className="flex-1">
                <h3 className="text-base font-semibold">Confirm destructive operation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>{confirmOp.label}</strong> is marked destructive. Type the module ID exactly to enable the action.
                </p>
              </div>
              <button onClick={() => setConfirmOp(null)}><X size={18} /></button>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">
                Expected: <code className="font-mono text-red-600">{moduleId}</code>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type module ID to confirm"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded font-mono text-sm"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmOp(null)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => runOp(confirmOp)}
                disabled={confirmText !== moduleId}
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run {confirmOp.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DbOperationsPanel;
