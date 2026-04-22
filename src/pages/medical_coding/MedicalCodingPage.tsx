/**
 * MedicalCodingPage — code-set picker + search panel.
 *
 * Top-level page for the Medical Coding capability. Users pick a code set
 * (ICD10 / SNOMED / CPT / Custom) from the dropdown and search for codes
 * via the CodeSearchPanel.
 *
 * Route: /m/medical_coding
 * Backend: GET /api/medical_coding/api/v1/G/G/code-sets
 *          POST /api/medical_coding/api/v1/G/G/code-sets/:setId/entries/searches
 *
 * Added 2026-04-22 by Soldier BB.
 */
import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import api from '../../services/api';
import CodeSearchPanel from './CodeSearchPanel';
import CodeDetailDrawer, { CodeEntry } from './CodeDetailDrawer';

interface CodeSet {
  hashId?: string;
  setId: string; // ICD10, SNOMED, CPT, CUSTOM
  displayName: string;
  standard?: string;
  version?: string;
}

const FALLBACK_SETS: CodeSet[] = [
  { setId: 'ICD10', displayName: 'ICD-10', standard: 'ICD10' },
  { setId: 'SNOMED', displayName: 'SNOMED CT', standard: 'SNOMED' },
  { setId: 'CPT', displayName: 'CPT', standard: 'CPT' },
  { setId: 'CUSTOM', displayName: 'Custom', standard: 'CUSTOM' },
];

const MedicalCodingPage: React.FC = () => {
  const [sets, setSets] = useState<CodeSet[]>(FALLBACK_SETS);
  const [activeSetId, setActiveSetId] = useState<string>('ICD10');
  const [selectedEntry, setSelectedEntry] = useState<CodeEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/medical_coding/api/v1/G/G/code-sets')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: CodeSet[] = raw.map((s: any) => ({
            hashId: s.hashId,
            setId: s.setId || s.standard || s.code,
            displayName: s.displayName || s.name || s.setId,
            standard: s.standard,
            version: s.version,
          }));
          setSets(mapped);
          setActiveSetId(mapped[0].setId);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // Non-fatal — fallback set list keeps the UI usable
        setError(err?.response?.data?.message || err.message || 'Code sets endpoint unreachable (using fallback)');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="text-sky-600" size={22} />
        <h1 className="text-2xl font-semibold">Medical Coding</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
        Search, correlate, and resolve codes across ICD-10, SNOMED CT, CPT, and custom code sets.
        Fuzzy search handles synonyms and misspellings.
      </p>

      {error && (
        <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Code set</label>
        <select
          value={activeSetId}
          onChange={(e) => setActiveSetId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm"
        >
          {sets.map((s) => (
            <option key={s.setId} value={s.setId}>
              {s.displayName}
              {s.version ? ` (${s.version})` : ''}
            </option>
          ))}
        </select>
      </div>

      <CodeSearchPanel setId={activeSetId} onSelectEntry={(e) => setSelectedEntry(e)} />

      {selectedEntry && (
        <CodeDetailDrawer
          setId={activeSetId}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

export default MedicalCodingPage;
