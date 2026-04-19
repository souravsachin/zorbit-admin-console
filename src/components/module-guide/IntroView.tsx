import React from 'react';
import { useModuleContext } from '../../contexts/ModuleContext';
import { Info, BookOpen } from 'lucide-react';

/**
 * Renders the `guide.intro` block from a module manifest as a hero card.
 * Wired via `componentByName("GuideIntroView")` from `ManifestRouter`.
 */
const IntroView: React.FC = () => {
  const { manifest, moduleId, loading, error } = useModuleContext();

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading guide…</div>;
  if (error) {
    return (
      <div className="p-6 text-red-600 text-sm">
        Failed to load manifest: {error}
      </div>
    );
  }

  const intro = manifest?.guide?.intro;
  if (!intro || (!intro.headline && !intro.summary)) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">Guide intro not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>guide.intro</code> in its manifest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-gray-900 border border-indigo-200 dark:border-indigo-800 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-600 text-white">
            <BookOpen size={28} />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
              {manifest?.moduleName || moduleId}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {intro.headline}
            </h1>
            {intro.summary && (
              <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {intro.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {manifest?.placement && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <InfoCell label="Scaffold" value={manifest.placement.scaffold} />
          <InfoCell label="Capability Area" value={manifest.placement.capabilityArea} />
          {manifest.placement.edition?.name && (
            <InfoCell label="Edition" value={manifest.placement.edition.name} />
          )}
          <InfoCell label="Version" value={manifest?.version} />
        </div>
      )}
    </div>
  );
};

const InfoCell: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </div>
    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
      {value ?? '—'}
    </div>
  </div>
);

export default IntroView;
