import React from 'react';
import { useModuleContext } from '../../contexts/ModuleContext';
import { Info, ChevronRight } from 'lucide-react';

/**
 * Renders `guide.lifecycle.phases[]` as a horizontal phase bar.
 */
const LifecycleView: React.FC = () => {
  const { manifest, moduleId, loading } = useModuleContext();
  const phases = manifest?.guide?.lifecycle?.phases || [];

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading lifecycle…</div>;

  if (phases.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">Lifecycle not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>guide.lifecycle</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lifecycle</h1>

      <div className="hidden md:flex items-stretch gap-0 overflow-x-auto pb-4">
        {phases.map((phase, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 min-w-[220px] rounded-lg border-2 border-indigo-400 dark:border-indigo-600 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{phase.name}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</div>
            </div>
            {i < phases.length - 1 && (
              <div className="flex items-center px-2 text-indigo-400">
                <ChevronRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="md:hidden space-y-3">
        {phases.map((phase, i) => (
          <div key={i} className="rounded-lg border border-indigo-300 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="font-semibold">{phase.name}</div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 ml-8">{phase.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LifecycleView;
