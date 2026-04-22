/**
 * CodeSearchPanel — debounced fuzzy search over a code set.
 *
 * POSTs to /api/medical_coding/api/v1/G/G/code-sets/:setId/entries/searches
 * body { term, maxEditDistance: 2 }. Renders ranked matches with score and
 * short + long descriptions.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../../services/api';
import type { CodeEntry } from './CodeDetailDrawer';

interface SearchResult extends CodeEntry {
  score?: number;
}

interface Props {
  setId: string;
  onSelectEntry: (entry: CodeEntry) => void;
}

const CodeSearchPanel: React.FC<Props> = ({ setId, onSelectEntry }) => {
  const [term, setTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    if (!term || term.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = window.setTimeout(() => {
      api
        .post(
          `/api/medical_coding/api/v1/G/G/code-sets/${encodeURIComponent(setId)}/entries/searches`,
          { term, maxEditDistance: 2 },
        )
        .then((res) => {
          const raw = res.data?.data ?? res.data ?? [];
          const mapped: SearchResult[] = Array.isArray(raw)
            ? raw.map((r: any) => ({
                code: r.code,
                shortDescription: r.shortDescription || r.short || r.displayName,
                longDescription: r.longDescription || r.long || r.description,
                score: r.score,
                synonyms: r.synonyms,
              }))
            : [];
          setResults(mapped);
          setError(null);
        })
        .catch((err) => {
          setError(err?.response?.data?.message || err.message || 'Search failed');
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [term, setId]);

  const hint = useMemo(() => {
    if (term.trim().length === 0) return 'Type at least 2 characters to search.';
    if (term.trim().length < 2) return 'Keep typing…';
    if (loading) return 'Searching…';
    if (results.length === 0 && !error) return 'No matches.';
    return '';
  }, [term, loading, results.length, error]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by code, term, or synonym…"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded text-xs">{error}</div>
      )}

      {hint && <div className="text-xs text-gray-400">{hint}</div>}

      {results.length > 0 && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
          {results.map((r, i) => (
            <li
              key={r.code + '-' + i}
              onClick={() => onSelectEntry(r)}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <code className="font-mono text-sm text-sky-700 dark:text-sky-300">{r.code}</code>
                {typeof r.score === 'number' && (
                  <span className="text-xs text-gray-500">score {r.score.toFixed(2)}</span>
                )}
              </div>
              <div className="text-sm mt-1">{r.shortDescription || r.longDescription || '—'}</div>
              {r.longDescription && r.longDescription !== r.shortDescription && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{r.longDescription}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CodeSearchPanel;
