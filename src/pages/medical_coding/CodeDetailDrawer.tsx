/**
 * CodeDetailDrawer — code-to-descriptions + synonyms + cross-standard
 * correlations.
 *
 * Fetches /api/medical_coding/api/v1/G/G/code-sets/:setId/entries/:code and
 * /correlations (best-effort). Renders in a right-side slide-out.
 */
import React, { useEffect, useState } from 'react';
import { X, Link2 } from 'lucide-react';
import api from '../../services/api';

export interface CodeEntry {
  code: string;
  shortDescription?: string;
  longDescription?: string;
  synonyms?: string[];
}

interface Correlation {
  fromStandard: string;
  fromCode: string;
  toStandard: string;
  toCode: string;
  toDescription?: string;
  confidence?: number;
}

interface Props {
  setId: string;
  entry: CodeEntry;
  onClose: () => void;
}

const CodeDetailDrawer: React.FC<Props> = ({ setId, entry, onClose }) => {
  const [detail, setDetail] = useState<CodeEntry>(entry);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const detailUrl = `/api/medical_coding/api/v1/G/G/code-sets/${encodeURIComponent(setId)}/entries/${encodeURIComponent(entry.code)}`;
    const corrUrl = `/api/medical_coding/api/v1/G/G/code-sets/${encodeURIComponent(setId)}/entries/${encodeURIComponent(entry.code)}/correlations`;

    Promise.allSettled([api.get(detailUrl), api.get(corrUrl)]).then((results) => {
      if (cancelled) return;
      const [d, c] = results;
      if (d.status === 'fulfilled') {
        const raw = d.value.data?.data ?? d.value.data;
        if (raw) {
          setDetail({
            code: raw.code || entry.code,
            shortDescription: raw.shortDescription || raw.short || entry.shortDescription,
            longDescription: raw.longDescription || raw.long || entry.longDescription,
            synonyms: raw.synonyms || entry.synonyms,
          });
        }
      } else {
        setError(d.reason?.response?.data?.message || d.reason?.message || 'Detail fetch failed');
      }
      if (c.status === 'fulfilled') {
        const raw = c.value.data?.data ?? c.value.data ?? [];
        setCorrelations(Array.isArray(raw) ? raw : []);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [setId, entry.code]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-xs text-gray-500">{setId}</div>
            <h2 className="text-xl font-semibold font-mono">{detail.code}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {error && (
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
              {error}
            </div>
          )}

          {detail.shortDescription && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Short description</h3>
              <p className="text-sm font-medium">{detail.shortDescription}</p>
            </section>
          )}

          {detail.longDescription && detail.longDescription !== detail.shortDescription && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Long description</h3>
              <p className="text-sm">{detail.longDescription}</p>
            </section>
          )}

          {detail.synonyms && detail.synonyms.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Synonyms</h3>
              <ul className="flex flex-wrap gap-2">
                {detail.synonyms.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
              <Link2 size={12} /> Cross-standard correlations
            </h3>
            {loading ? (
              <div className="text-xs text-gray-400">Loading…</div>
            ) : correlations.length === 0 ? (
              <div className="text-xs text-gray-400">No correlations recorded.</div>
            ) : (
              <ul className="space-y-2">
                {correlations.map((c, i) => (
                  <li
                    key={i}
                    className="border border-gray-200 dark:border-gray-700 rounded p-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-xs text-sky-700 dark:text-sky-300">
                        {c.toStandard}:{c.toCode}
                      </code>
                      {typeof c.confidence === 'number' && (
                        <span className="text-xs text-gray-500">{(c.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                    {c.toDescription && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {c.toDescription}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

export default CodeDetailDrawer;
