/* CsvViewer — renders CSV / TSV as a read-only HTML table.
 *
 * Phase 1 intentionally uses a plain table for ≤ 2000 rows to keep
 * the initial bundle slim. For larger or edit-capable grids (Phase 2)
 * we'll lazy-load jspreadsheet-ce.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from 'react';
import type { RendererProps } from './types';
import { maskDelimited } from './piiMasker';

function splitRow(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"' && cur.length === 0) {
      inQuotes = true;
    } else if (ch === delim) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export const CsvViewer: React.FC<RendererProps> = ({ text, format, pii }) => {
  const delimiter = format === 'tsv' ? '\t' : ',';

  const prepared = useMemo(
    () =>
      maskDelimited(
        text ?? '',
        delimiter as ',' | '\t',
        pii?.applyRedactionRules,
        pii?.maskChar,
      ),
    [text, delimiter, pii?.applyRedactionRules, pii?.maskChar],
  );

  const { headers, rows } = useMemo(() => {
    const lines = prepared.split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const hdr = splitRow(lines[0], delimiter);
    const rs = lines.slice(1, 2001).map((l) => splitRow(l, delimiter));
    return { headers: hdr, rows: rs };
  }, [prepared, delimiter]);

  return (
    <div className="fv-csv overflow-auto bg-white rounded border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-2 py-1 text-xs text-gray-400 border-b border-gray-200">#</th>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
              >
                {h || <span className="text-gray-300">(blank)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-2 py-1 text-xs text-gray-400 border-b border-gray-100">
                {ri + 1}
              </td>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-1.5 text-gray-800 border-b border-gray-100 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 2000 && (
        <div className="p-2 text-xs text-amber-600 bg-amber-50 border-t border-amber-200">
          Large file — showing the first 2,000 rows. (Phase 2 will stream /
          virtualise.)
        </div>
      )}
    </div>
  );
};

export default CsvViewer;
