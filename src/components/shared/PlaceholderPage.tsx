import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Hammer, ArrowLeft, MailQuestion, Info } from 'lucide-react';

// PlaceholderPage — platform-supplied (not module-supplied) fallback for
// manifest nav items that don't yet have a dedicated UI screen.
//
// Why this exists:
//   Backends can be live and working perfectly while their admin/user
//   screens haven't been built yet. Rather than making such items invisible
//   OR routing them to an unrelated page (which is misleading), we show
//   this friendly placeholder. Users know it's intentional, can file
//   feedback, and can confirm the backend itself is healthy.
//
// Conventions for module authors:
//   - Set `feComponent: "PlaceholderPage"` on any nav item whose UI hasn't
//     been built yet. The sidebar will show the item normally; clicking
//     lands here.
//   - Remove this value when you ship the real component (and add an entry
//     to componentRegistry for it).

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname;
  const slug = params.slug || path.split('/')[2] || '';

  // Pretty label: last path segment, title-cased
  const last = path.split('/').filter(Boolean).pop() || 'this feature';
  const prettyLabel = last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const feedbackMailto = [
    'mailto:platform@onezippy.ai?subject=',
    encodeURIComponent(`Module page missing: ${prettyLabel} (${path})`),
    '&body=',
    encodeURIComponent(
      `Hi platform team,\n\nThe UI for ${prettyLabel} (path: ${path}) shows a placeholder today. ` +
        `Please let me know the status.\n\nThanks.`,
    ),
  ].join('');

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20 border-b border-gray-200 dark:border-gray-700 flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center">
            <Hammer size={22} className="text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {prettyLabel}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This feature doesn't have a dedicated screen yet. The backend may be working fine underneath — this page is a friendly placeholder.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
            <Info size={16} className="shrink-0 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-100">What's happening</div>
              <div className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                The module manifest for <code className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{slug || 'this module'}</code> lists this entry but explicitly declares it as a placeholder (<code>feComponent: "PlaceholderPage"</code>). A dedicated screen is planned but not built.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
              <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Route</div>
              <div className="font-mono break-all">{path}</div>
            </div>
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
              <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Module</div>
              <div className="font-mono">{slug || '—'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <ArrowLeft size={13} /> Back to dashboard
            </Link>
            {slug && (
              <Link
                to={`/m/${slug}/deployments`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Check module health
              </Link>
            )}
            <a
              href={feedbackMailto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <MailQuestion size={13} /> Report: page missing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
