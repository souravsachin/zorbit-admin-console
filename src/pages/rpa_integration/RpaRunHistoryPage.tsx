/**
 * RpaRunHistoryPage — DataTable of past RPA runs for an adapter.
 *
 * Route: /m/rpa_integration/adapters/:code/runs
 * Backend: GET /api/rpa_integration/api/v1/G/adapters/:code/runs
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Cpu, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/shared/DataTable';

interface RpaRun {
  hashId: string;
  adapterCode: string;
  trigger?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string | null;
}

const statusClass = (status: string): string => {
  switch ((status || '').toLowerCase()) {
    case 'succeeded':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800';
    case 'failed':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800';
    case 'running':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800';
    case 'queued':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800';
    default:
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700';
  }
};

const RpaRunHistoryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<RpaRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setLoading(true);
    api
      .get(`/api/rpa_integration/api/v1/G/adapters/${encodeURIComponent(code)}/runs`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setRuns(Array.isArray(raw) ? raw : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load run history');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const columns = useMemo<Column<RpaRun>[]>(
    () => [
      {
        key: 'hashId',
        header: 'Run',
        render: (r) => <code className="text-xs font-mono">{r.hashId}</code>,
      },
      {
        key: 'trigger',
        header: 'Trigger',
        render: (r) => <span className="text-sm text-gray-600">{r.trigger || '—'}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (r) => <span className={statusClass(r.status)}>{r.status}</span>,
      },
      {
        key: 'startedAt',
        header: 'Started',
        render: (r) => (
          <span className="text-sm text-gray-600">
            {r.startedAt ? new Date(r.startedAt).toLocaleString() : '—'}
          </span>
        ),
      },
      {
        key: 'completedAt',
        header: 'Completed',
        render: (r) => (
          <span className="text-sm text-gray-600">
            {r.completedAt ? new Date(r.completedAt).toLocaleString() : '—'}
          </span>
        ),
      },
      {
        key: 'errorMessage',
        header: 'Error',
        render: (r) => (
          <span className="text-xs text-red-700 font-mono line-clamp-1">
            {r.errorMessage || ''}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/m/rpa_integration" className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 text-sm">
          <ChevronLeft size={16} /> Adapters
        </Link>
        <Cpu className="text-indigo-600" size={18} />
        <h1 className="text-xl font-semibold">Run History — {code}</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={runs}
        loading={loading}
        emptyMessage="No runs yet for this adapter."
        onRowClick={(r) =>
          navigate(`/m/rpa_integration/adapters/${encodeURIComponent(code || '')}/runs/${encodeURIComponent(r.hashId)}`)
        }
      />
    </div>
  );
};

export default RpaRunHistoryPage;
