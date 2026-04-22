import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, RefreshCw, Table2 } from 'lucide-react';

const API_BASE = '/api/product_pricing/api/v1/O/O-OZPY/product_pricing';

/* ─── helpers ─── */
const fmtAED = (v: number | undefined) =>
  v != null ? v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

/* ─── Rate Grid (pivoted, Excel-style) ─── */
const RateGridPanel: React.FC<{ selected: any }> = ({ selected }) => {
  const rates: any[] = selected.rates || [];
  const params = selected.parameters || {};
  const ageBands: string[] = params.ageBands || [];
  const genders: string[] = params.genders || ['Male', 'Female'];
  const groups: string[] = (params.networks?.length ? params.networks : params.plans) || [];
  const copayOptions: string[] = params.copayOptions || [];
  const groupLabel = params.networks?.length ? 'Network' : 'Plan';

  // If multiple copay options, let user pick which to display
  const [selectedCopay, setSelectedCopay] = useState(copayOptions[0] || '0%');

  // Build lookup map: key = `${ageBand}|${gender}|${group}|${copay}` -> netRate
  const rateMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rates) {
      const g = r.network || r.plan || '';
      const key = `${r.ageBand}|${r.gender}|${g}|${r.copay || '0%'}`;
      m.set(key, r.netRate);
    }
    return m;
  }, [rates]);

  const lookup = (ageBand: string, gender: string, group: string) =>
    rateMap.get(`${ageBand}|${gender}|${group}|${selectedCopay}`);

  // Determine copay description for subtitle
  const copayDesc = selectedCopay === '0%'
    ? 'NET RATES \u2014 0% OP Diagnostics and 0% Pharmacy Co-pay'
    : `NET RATES \u2014 ${selectedCopay} Co-pay`;

  if (rates.length === 0) {
    return (
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-400 py-8">
        No rate data available
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Title block */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <Table2 size={20} />
          <h3 className="font-bold text-lg">
            Individual Rates &mdash; {selected.insurerName} {selected.productName} {selected.region}
          </h3>
        </div>
        <p className="text-blue-100 text-sm mt-1">{copayDesc}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-blue-200">
          <span>{selected.currency} &middot; {selected.variant}</span>
          <span>{rates.length} rate entries</span>
          <span>{ageBands.length} age bands &times; {groups.length} {groupLabel.toLowerCase()}s &times; {genders.length} genders</span>
        </div>
      </div>

      {/* Copay selector (if multiple) */}
      {copayOptions.length > 1 && (
        <div className="px-5 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Co-pay:</span>
          {copayOptions.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCopay(c)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                selectedCopay === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          {/* Top header row: group names spanning gender sub-columns */}
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th
                rowSpan={2}
                className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 border-b border-r border-gray-200 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 min-w-[100px]"
              >
                Age Band
              </th>
              {groups.map((g) => (
                <th
                  key={g}
                  colSpan={genders.length}
                  className="text-center px-2 py-2 font-bold text-gray-800 dark:text-gray-100 border-b border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                >
                  {g}
                </th>
              ))}
            </tr>
            {/* Sub-header row: gender names */}
            <tr className="bg-gray-50 dark:bg-gray-750">
              {groups.map((g) =>
                genders.map((gen) => (
                  <th
                    key={`${g}-${gen}`}
                    className="text-center px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/80 whitespace-nowrap"
                  >
                    {gen}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {ageBands.map((band, rowIdx) => (
              <tr
                key={band}
                className={`${
                  rowIdx % 2 === 0
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-gray-50/70 dark:bg-gray-800/40'
                } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
              >
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 sticky left-0 bg-inherit whitespace-nowrap">
                  {band}
                </td>
                {groups.map((g) =>
                  genders.map((gen) => {
                    const val = lookup(band, gen, g);
                    return (
                      <td
                        key={`${g}-${gen}`}
                        className="text-right px-2 py-1.5 font-mono text-xs tabular-nums border-r border-gray-100 dark:border-gray-700 whitespace-nowrap"
                      >
                        {fmtAED(val)}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex justify-between">
        <span>All values in {selected.currency} per annum per person</span>
        <span>{selected.effectiveFrom ? `Effective: ${selected.effectiveFrom}` : ''}</span>
      </div>
    </div>
  );
};

const RateTablesPage: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupForm, setLookupForm] = useState({ age: '35', gender: 'Male', network: 'CN', copay: '0%' });

  const token = localStorage.getItem('zorbit_token') || '';

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rate-tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.rateTables || data.data || [];
      setTables(list);
    } catch (e) {
      console.error('Failed to fetch rate tables', e);
    }
    setLoading(false);
  };

  const fetchTable = async (hashId: string) => {
    try {
      const res = await fetch(`${API_BASE}/rate-tables/${hashId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data);
    } catch (e) {
      console.error('Failed to fetch rate table', e);
    }
  };

  const doLookup = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/lookup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rateTableHashId: selected.hashId,
          age: parseInt(lookupForm.age),
          gender: lookupForm.gender,
          network: lookupForm.network,
          copay: lookupForm.copay,
        }),
      });
      setLookupResult(await res.json());
    } catch (e) {
      console.error('Lookup failed', e);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Calculator className="text-primary-600" size={28} />
            Rate Tables
          </h1>
          <p className="text-gray-500 mt-1">Premium rate tables for insurance products</p>
        </div>
        <button onClick={fetchTables} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading rate tables...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rate Tables List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-lg mb-3">Available Tables ({tables.length})</h2>
            {tables.map((t: any) => (
              <div
                key={t.hashId || t._id}
                onClick={() => fetchTable(t.hashId || t._id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selected?.hashId === t.hashId
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="font-semibold">{t.insurerName}</div>
                <div className="text-sm text-gray-500">{t.productName} — {t.variant || 'Default'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t.status}</span>
                  <span className="text-xs text-gray-400">{t.currency}</span>
                  <span className="text-xs text-gray-400">{t.hashId}</span>
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="text-center py-8 text-gray-400">No rate tables found. Import one to get started.</div>
            )}
          </div>

          {/* Rate Table Detail + Lookup */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold">{selected.insurerName} — {selected.productName}</h2>
                  <p className="text-gray-500">{selected.variant} | {selected.region} | {selected.currency}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span>Rates: <strong>{selected.rates?.length || 0}</strong></span>
                    <span>Age Bands: <strong>{selected.parameters?.ageBands?.length || 0}</strong></span>
                    <span>Networks: <strong>{selected.parameters?.networks?.length || 0}</strong></span>
                    <span>Status: <strong className="text-green-600">{selected.status}</strong></span>
                  </div>
                </div>

                {/* Premium Lookup */}
                <div className="p-5 rounded-xl border border-primary-200 bg-primary-50/50 dark:bg-primary-900/10 dark:border-primary-800">
                  <h3 className="font-semibold mb-3">Premium Calculator</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Age</label>
                      <input type="number" value={lookupForm.age} onChange={e => setLookupForm({...lookupForm, age: e.target.value})}
                        className="input-field w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Gender</label>
                      <select value={lookupForm.gender} onChange={e => setLookupForm({...lookupForm, gender: e.target.value})}
                        className="input-field w-full">
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Network</label>
                      <select value={lookupForm.network} onChange={e => setLookupForm({...lookupForm, network: e.target.value})}
                        className="input-field w-full">
                        {(selected.parameters?.networks || []).map((n: string) => (
                          <option key={n}>{n}</option>
                        ))}
                        {(selected.parameters?.plans || []).map((p: string) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button onClick={doLookup} className="btn-primary w-full">Calculate</button>
                    </div>
                  </div>
                  {lookupResult && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500">Age Band: {lookupResult.ageBand}</div>
                      <div className="text-2xl font-bold text-primary-600 mt-1">
                        {selected.currency} {lookupResult.netRate?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Annual premium per person</div>
                    </div>
                  )}
                </div>

                {/* Rate Grid — Industry-Standard Pivoted View */}
                <RateGridPanel selected={selected} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                Select a rate table to view details and calculate premiums
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RateTablesPage;
