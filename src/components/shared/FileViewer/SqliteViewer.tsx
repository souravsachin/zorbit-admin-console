/* SqliteViewer — sql.js (WASM) read-only SQLite browser.
 *
 * sql.js is lazy-loaded only when a SQLite file needs rendering.
 * Phase 1: list tables, preview the first 200 rows of each.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from 'react';
import type { RendererProps } from './types';

let sqlLoader: Promise<any> | null = null;
function loadSql(): Promise<any> {
  if (!sqlLoader) {
    sqlLoader = (async () => {
      const mod: any = await import('sql.js');
      const initSqlJs = mod.default ?? mod;
      const SQL = await initSqlJs({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/${file}`,
      });
      return SQL;
    })();
  }
  return sqlLoader;
}

interface TablePreview {
  name: string;
  columns: string[];
  rows: unknown[][];
  totalRows: number;
}

export const SqliteViewer: React.FC<RendererProps> = ({ blob, filename }) => {
  const [tables, setTables] = useState<TablePreview[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!blob) return;
        const SQL = await loadSql();
        const arrayBuf = await blob.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(arrayBuf));
        const result = db.exec(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        );
        const tableNames: string[] =
          result.length > 0 ? result[0].values.map((v: any[]) => v[0] as string) : [];
        const previews: TablePreview[] = [];
        for (const name of tableNames) {
          const countRes = db.exec(`SELECT COUNT(*) FROM "${name}"`);
          const total = (countRes[0]?.values?.[0]?.[0] as number) ?? 0;
          const dataRes = db.exec(`SELECT * FROM "${name}" LIMIT 200`);
          const columns = dataRes[0]?.columns ?? [];
          const rows = dataRes[0]?.values ?? [];
          previews.push({ name, columns, rows, totalRows: total });
        }
        if (cancelled) return;
        setTables(previews);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[FileViewer] sqlite render error:', err);
        setError(err?.message ?? String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blob]);

  const active = useMemo(() => tables[activeIdx], [tables, activeIdx]);

  return (
    <div className="fv-sqlite bg-white rounded border border-gray-200 overflow-hidden">
      {error && (
        <div className="text-sm text-red-600 p-3 bg-red-50">
          Failed to open SQLite file: {error}
        </div>
      )}
      <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <span className="text-xs text-gray-600 mr-2">{filename}</span>
        {tables.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={
              'text-xs px-2 py-1 rounded border ' +
              (i === activeIdx
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100')
            }
          >
            {t.name} ({t.totalRows})
          </button>
        ))}
      </div>
      {active && (
        <div className="overflow-auto max-h-[calc(100vh-260px)]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {active.columns.map((c, ci) => (
                  <th
                    key={ci}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-gray-50' : 'bg-white'}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-gray-800 border-b border-gray-100 whitespace-nowrap"
                    >
                      {cell === null ? (
                        <span className="text-gray-300">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {active.totalRows > active.rows.length && (
            <div className="p-2 text-xs text-amber-600 bg-amber-50 border-t border-amber-200">
              Showing first {active.rows.length} of {active.totalRows} rows.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SqliteViewer;
