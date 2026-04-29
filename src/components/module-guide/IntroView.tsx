import React, { useEffect, useState } from 'react';
import { useModuleContext } from '../../contexts/ModuleContext';
import { Info, BookOpen } from 'lucide-react';

/** Resolve a `$src` ref against the module-content static mount. The manifest
 * declares paths like `./manifest-content/guide/intro.md`; on-disk content
 * actually lives under `manifest-content/en/guide/intro.md` after the i18n
 * refactor. We strip the leading `./` and inject `/en/` if the path doesn't
 * already include a language segment. Final URL:
 *   /m-content/<moduleId>/manifest-content/en/...
 */
function resolveSrcUrl(moduleId: string, srcPath: string): string {
  let p = srcPath.replace(/^\.\//, '').replace(/^\/+/, '');
  if (!p.includes('/en/') && !p.includes('/<lang>/')) {
    p = p.replace(/^manifest-content\//, 'manifest-content/en/');
  }
  return `/m-content/${moduleId}/${p}`;
}

/** Parse the first H1 (headline) and the first non-empty paragraph (summary)
 * out of a markdown blob so we can render the existing hero card without
 * pulling in a full markdown lib. The full body is also returned for callers
 * that want to render everything below the hero. */
function extractHeadlineSummary(md: string): { headline: string; summary: string; rest: string } {
  const lines = md.split(/\r?\n/);
  let headline = '';
  const buf: string[] = [];
  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)$/);
    if (m) { headline = m[1].trim(); i++; break; }
  }
  // skip blanks
  while (i < lines.length && !lines[i].trim()) i++;
  // first paragraph = consecutive non-blank lines that are NOT headings or list bullets
  while (i < lines.length && lines[i].trim() && !/^#{1,6}\s/.test(lines[i]) && !/^[-*]\s/.test(lines[i])) {
    buf.push(lines[i]); i++;
  }
  const summary = buf.join(' ').trim();
  const rest = lines.slice(i).join('\n').trim();
  return { headline, summary, rest };
}

/**
 * Renders the `guide.intro` block from a module manifest as a hero card.
 * Supports two manifest shapes:
 *   - Inline: { headline, summary } — rendered directly
 *   - $src ref: { $src: "./manifest-content/guide/intro.md" } — fetched and
 *     parsed into headline + summary (first H1 + first paragraph)
 * Wired via `componentByName("GuideIntroView")` from `ManifestRouter`.
 */
const IntroView: React.FC = () => {
  const { manifest, moduleId, loading, error } = useModuleContext();
  const [resolved, setResolved] = useState<{ headline: string; summary: string; rest: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const intro = manifest?.guide?.intro;
  const srcPath: string | undefined = intro && typeof intro === 'object' && '$src' in intro ? (intro as { $src: string }).$src : undefined;

  useEffect(() => {
    if (!srcPath || !moduleId) return;
    let cancelled = false;
    setFetchError(null);
    setResolved(null);
    fetch(resolveSrcUrl(moduleId, srcPath))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((text) => { if (!cancelled) setResolved(extractHeadlineSummary(text)); })
      .catch((err) => { if (!cancelled) setFetchError(String(err.message || err)); });
    return () => { cancelled = true; };
  }, [moduleId, srcPath]);

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading guide…</div>;
  if (error) {
    return (
      <div className="p-6 text-red-600 text-sm">
        Failed to load manifest: {error}
      </div>
    );
  }

  const inlineHasContent = intro && typeof intro === 'object' && (('headline' in intro && intro.headline) || ('summary' in intro && intro.summary));
  const view = inlineHasContent
    ? { headline: (intro as Record<string, string>).headline || '', summary: (intro as Record<string, string>).summary || '', rest: '' }
    : resolved;

  if (!view) {
    if (srcPath && !fetchError) return <div className="p-6 text-gray-500 text-sm">Loading guide intro…</div>;
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">Guide intro not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>guide.intro</code> in its manifest{fetchError ? ` (fetch error: ${fetchError})` : ''}.
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
              {view.headline}
            </h1>
            {view.summary && (
              <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {view.summary}
              </p>
            )}
          </div>
        </div>
      </div>
      {view.rest && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-sm prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200">{view.rest}</pre>
        </div>
      )}

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
