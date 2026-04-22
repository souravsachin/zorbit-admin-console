/**
 * CorrelationMatrixPage — table of cross-standard mappings (ICD10↔SNOMED↔CPT).
 *
 * Route: /m/medical_coding/correlations
 * Backend: GET /api/medical_coding/api/v1/G/G/correlations
 */
import React, { useEffect, useMemo, useState } from 'react';
import { GitMerge } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/shared/DataTable';

interface Correlation {
  hashId?: string;
  fromStandard: string;
  fromCode: string;
  fromDescription?: string;
  toStandard: string;
  toCode: string;
  toDescription?: string;
  confidence?: number;
  source?: string;
}

const CorrelationMatrixPage: React.FC = () => {
  const [rows, setRows] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/medical_coding/api/v1/G/G/correlations')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setRows(Array.isArray(raw) ? raw : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load correlations');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const standards = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      set.add(r.fromStandard);
      set.add(r.toStandard);
    }
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterFrom && r.fromStandard !== filterFrom) return false;
      if (filterTo && r.toStandard !== filterTo) return false;
      return true;
    });
  }, [rows, filterFrom, filterTo]);

  const columns = useMemo<Column<Correlation>[]>(
    () => [
      {
        key: 'from',
        header: 'From',
        render: (r) => (
          <div>
            <div className="text-xs text-gray-500">{r.fromStandard}</div>
            <code className="font-mono text-sm">{r.fromCode}</code>
            {r.fromDescription && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.fromDescription}</div>
            )}
          </div>
        ),
      },
      {
        key: 'arrow',
        header: '',
        render: () => <span className="text-gray-400">→</span>,
      },
      {
        key: 'to',
        header: 'To',
        render: (r) => (
          <div>
            <div className="text-xs text-gray-500">{r.toStandard}</div>
            <code className="font-mono text-sm text-sky-700 dark:text-sky-300">{r.toCode}</code>
            {r.toDescription && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.toDescription}</div>
            )}
          </div>
        ),
      },
      {
        key: 'confidence',
        header: 'Confidence',
        render: (r) =>
          typeof r.confidence === 'number' ? (
            <span className="text-xs font-medium">
              {(r.confidence * 100).toFixed(0)}%
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'source',
        header: 'Source',
        render: (r) => <span className="text-xs text-gray-500">{r.source || '—'}</span>,
      },
    ],
    [],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <GitMerge className="text-sky-600" size={22} />
        <h1 className="text-2xl font-semibold">Correlation Matrix</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
        Cross-standard mappings between ICD-10, SNOMED CT, CPT, and custom codes.
      </p>

      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500">From</label>
        <select
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          {standards.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="text-xs text-gray-500 ml-4">To</label>
        <select
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          {standards.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No correlations recorded."
      />
    </div>
  );
};

export default CorrelationMatrixPage;
