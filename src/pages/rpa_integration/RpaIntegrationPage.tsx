/**
 * RpaIntegrationPage — adapter list + quick launch.
 *
 * Lists all RPA adapters (portals) delivered by zorbit-pfs-rpa_integration
 * (AX3). Each row shows code, displayName, portalUrl, enabled toggle and a
 * "Run" button that opens RpaRunLauncherModal.
 *
 * Route: /m/rpa_integration
 * Backend: GET /api/rpa_integration/api/v1/G/adapters
 *
 * Added 2026-04-22 by Soldier BB (task AX3 follow-up).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ExternalLink, Play, History, CircleCheck, CircleOff } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/shared/DataTable';
import RpaRunLauncherModal from './RpaRunLauncherModal';

interface RpaAdapter {
  code: string;
  displayName: string;
  portalUrl?: string | null;
  authType?: string | null;
  enabled?: boolean;
  _isDemo?: boolean;
}

const RpaIntegrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [adapters, setAdapters] = useState<RpaAdapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RpaAdapter | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/rpa_integration/api/v1/G/adapters')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setAdapters(Array.isArray(raw) ? raw : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load adapters');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo<Column<RpaAdapter>[]>(
    () => [
      {
        key: 'code',
        header: 'Code',
        render: (a) => <code className="text-xs font-mono text-gray-700 dark:text-gray-200">{a.code}</code>,
      },
      {
        key: 'displayName',
        header: 'Display Name',
        render: (a) => <span className="font-medium">{a.displayName}</span>,
      },
      {
        key: 'portalUrl',
        header: 'Portal',
        render: (a) =>
          a.portalUrl ? (
            <a
              href={a.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline text-sm inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {new URL(a.portalUrl).host}
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          ),
      },
      {
        key: 'enabled',
        header: 'Enabled',
        render: (a) =>
          a.enabled ? (
            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
              <CircleCheck size={14} /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
              <CircleOff size={14} /> Disabled
            </span>
          ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (a) => (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md inline-flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(a);
              }}
              disabled={!a.enabled}
              title={a.enabled ? 'Trigger a new run' : 'Adapter disabled'}
            >
              <Play size={12} /> Run
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md inline-flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/m/rpa_integration/adapters/${encodeURIComponent(a.code)}/runs`);
              }}
            >
              <History size={12} /> Runs
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Cpu className="text-indigo-600" size={22} />
        <h1 className="text-2xl font-semibold">RPA Integration</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
        Browser/desktop automation adapters for partner portals without usable APIs. Trigger
        runs, stream live events and review run history.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={adapters}
        loading={loading}
        emptyMessage="No RPA adapters registered. Seed demo data from module Setup."
      />

      {selected && (
        <RpaRunLauncherModal
          adapter={selected}
          onClose={() => setSelected(null)}
          onLaunched={(runId) => {
            setSelected(null);
            navigate(`/m/rpa_integration/adapters/${encodeURIComponent(selected.code)}/runs/${encodeURIComponent(runId)}`);
          }}
        />
      )}
    </div>
  );
};

export default RpaIntegrationPage;
