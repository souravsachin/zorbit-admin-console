import React from 'react';
import { useModuleContext } from '../../contexts/ModuleContext';
import { Info, Check } from 'lucide-react';

/**
 * Renders `guide.pricing.tiers[]` as 3-column pricing cards.
 */
const PricingTable: React.FC = () => {
  const { manifest, moduleId, loading } = useModuleContext();
  const tiers = manifest?.guide?.pricing?.tiers || [];

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading pricing…</div>;

  if (tiers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">Pricing not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>guide.pricing</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Pricing</h1>
      <p className="text-sm text-gray-500 mb-6">Choose the plan that fits your scale.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((t, i) => {
          const middle = i === 1 && tiers.length >= 3;
          return (
            <div
              key={i}
              className={`rounded-xl border p-6 bg-white dark:bg-gray-800 ${
                middle
                  ? 'border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-md'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-sm uppercase font-semibold tracking-wide text-indigo-600 dark:text-indigo-400">
                {t.name}
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t.monthlyPrice === null
                  ? 'Contact us'
                  : t.monthlyPrice === 0
                  ? 'Free'
                  : `$${t.monthlyPrice}/mo`}
              </div>
              <ul className="mt-5 space-y-2">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="text-green-600 shrink-0 mt-0.5" size={16} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full py-2 rounded-md text-sm font-semibold transition-colors ${
                  middle
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t.monthlyPrice === null ? 'Contact sales' : 'Choose plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingTable;
