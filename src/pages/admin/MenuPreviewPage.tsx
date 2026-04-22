import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { navigationService } from '../../services/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string | null;
  level: number;
  children: MenuItem[];
}

/* ------------------------------------------------------------------ */
/*  Colour palette per level (Tailwind classes)                        */
/* ------------------------------------------------------------------ */

const LEVEL_COLORS: Record<number, { badge: string; text: string; border: string; bg: string }> = {
  1: { badge: 'bg-indigo-600 text-white',   text: 'text-indigo-100', border: 'border-indigo-500/30', bg: 'bg-indigo-950/40' },
  2: { badge: 'bg-sky-600 text-white',      text: 'text-sky-100',    border: 'border-sky-500/30',    bg: 'bg-sky-950/30' },
  3: { badge: 'bg-emerald-600 text-white',  text: 'text-emerald-100',border: 'border-emerald-500/20',bg: 'bg-emerald-950/20' },
  4: { badge: 'bg-amber-600 text-white',    text: 'text-amber-100',  border: 'border-amber-500/20',  bg: 'bg-amber-950/20' },
  5: { badge: 'bg-rose-600 text-white',     text: 'text-rose-100',   border: 'border-rose-500/20',   bg: 'bg-rose-950/15' },
  6: { badge: 'bg-purple-600 text-white',   text: 'text-purple-200', border: 'border-purple-500/15', bg: 'bg-purple-950/10' },
};

const levelColor = (level: number) => LEVEL_COLORS[level] || LEVEL_COLORS[6];

/* ------------------------------------------------------------------ */
/*  Helper: count all descendants                                      */
/* ------------------------------------------------------------------ */

function countDescendants(item: MenuItem): number {
  let count = 0;
  for (const child of item.children) {
    count += 1 + countDescendants(child);
  }
  return count;
}

function countLeafRoutes(item: MenuItem): number {
  if (item.children.length === 0) return item.route ? 1 : 0;
  return item.children.reduce((sum, c) => sum + countLeafRoutes(c), 0);
}

/* ------------------------------------------------------------------ */
/*  TreeNode component (recursive)                                     */
/* ------------------------------------------------------------------ */

interface TreeNodeProps {
  item: MenuItem;
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  searchTerm: string;
}

function matchesSearch(item: MenuItem, term: string): boolean {
  if (!term) return true;
  const lower = term.toLowerCase();
  if (item.label.toLowerCase().includes(lower)) return true;
  if (item.route?.toLowerCase().includes(lower)) return true;
  if (item.id.toLowerCase().includes(lower)) return true;
  return item.children.some((c) => matchesSearch(c, lower));
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, expandedIds, toggle, searchTerm }) => {
  const navigate = useNavigate();
  const hasChildren = item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const colors = levelColor(item.level);
  const descendants = countDescendants(item);

  if (searchTerm && !matchesSearch(item, searchTerm)) return null;

  const visibleChildren = item.children.filter((c) => matchesSearch(c, searchTerm));

  return (
    <div className={`ml-${Math.min(item.level, 6) * 2}`}>
      {/* Row */}
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-150 hover:bg-white/5 group ${colors.bg}`}
        style={{ marginLeft: `${(item.level - 1) * 24}px` }}
        onClick={() => {
          if (hasChildren) {
            toggle(item.id);
          } else if (item.route) {
            navigate(item.route);
          }
        }}
      >
        {/* Expand/collapse chevron */}
        <span className="w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
          {hasChildren ? (
            <svg
              className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          )}
        </span>

        {/* Level badge */}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge} flex-shrink-0`}>
          L{item.level}
        </span>

        {/* Icon name (as text since we don't import all lucide icons) */}
        <span className="text-gray-500 text-xs font-mono w-16 truncate flex-shrink-0" title={item.icon}>
          {item.icon}
        </span>

        {/* Label */}
        <span className={`font-medium text-sm ${colors.text} flex-grow`}>
          {item.label}
        </span>

        {/* Route tag */}
        {item.route && (
          <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full truncate max-w-[240px]">
            {item.route}
          </span>
        )}

        {/* Descendant count */}
        {hasChildren && (
          <span className="text-[10px] text-gray-500 flex-shrink-0">
            {descendants} item{descendants !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Children */}
      {isExpanded && visibleChildren.length > 0 && (
        <div className={`border-l ${colors.border}`} style={{ marginLeft: `${(item.level - 1) * 24 + 12}px` }}>
          {visibleChildren.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              expandedIds={expandedIds}
              toggle={toggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Stats bar                                                          */
/* ------------------------------------------------------------------ */

function collectStats(items: MenuItem[]): { total: number; byLevel: Record<number, number>; routes: number } {
  const stats = { total: 0, byLevel: {} as Record<number, number>, routes: 0 };
  function walk(list: MenuItem[]) {
    for (const item of list) {
      stats.total++;
      stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
      if (item.route) stats.routes++;
      walk(item.children);
    }
  }
  walk(items);
  return stats;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

// Transform cascade-resolver sections[] shape into the MenuItem tree shape
// the preview page renders. One L1 per scaffold (moduleType), one L2 per
// module, one L3 per nav item. This mirrors the sidebar's own scaffold
// build with fewer levels because the preview page is a flat inspector,
// not the full 6-level tree.
function transformSectionsToTree(
  sections: Array<{
    moduleId: string;
    moduleName?: string;
    placement?: { scaffold?: string; businessLine?: string; capabilityArea?: string };
    items?: Array<{ label: string; feRoute: string; icon: string; privilege?: string }>;
  }>,
): MenuItem[] {
  const byScaffold = new Map<string, MenuItem>();
  for (const sec of sections) {
    const scaffoldName = sec.placement?.scaffold || 'Other';
    const scaffoldId = scaffoldName.toLowerCase().replace(/\s+/g, '-');
    if (!byScaffold.has(scaffoldId)) {
      byScaffold.set(scaffoldId, {
        id: scaffoldId,
        label: scaffoldName,
        icon: 'folder',
        route: null,
        level: 1,
        children: [],
      });
    }
    const scaffoldNode = byScaffold.get(scaffoldId)!;
    const moduleNode: MenuItem = {
      id: sec.moduleId,
      label: sec.moduleName || sec.moduleId,
      icon: 'package',
      route: null,
      level: 2,
      children: (sec.items || []).map((it, idx) => ({
        id: `${sec.moduleId}-${idx}`,
        label: it.label,
        icon: it.icon || 'circle',
        route: it.feRoute || null,
        level: 3,
        children: [],
      })),
    };
    scaffoldNode.children.push(moduleNode);
  }
  return Array.from(byScaffold.values());
}

const MenuPreviewPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [fetchState, setFetchState] = useState<'loading' | 'live' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveMenu = async (refresh = false) => {
    const userId = user?.id;
    if (!userId) return;
    if (refresh) setIsRefreshing(true);
    else setFetchState('loading');
    try {
      const res = await navigationService.getMenu(userId, { refresh });
      const data = res.data as {
        source?: string;
        sections?: Parameters<typeof transformSectionsToTree>[0];
      };
      if (data?.source !== 'live') {
        setFetchState('error');
        setErrorMessage(
          `Nav service returned source="${data?.source ?? 'unknown'}" — expected "live".`,
        );
        setItems([]);
        return;
      }
      const tree = transformSectionsToTree(data?.sections || []);
      setItems(tree);
      setFetchState('live');
      setErrorMessage('');
    } catch (err) {
      setFetchState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Navigation service unreachable');
      setItems([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) void fetchLiveMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // When items change (after fetch) re-seed expanded set with L1 nodes.
  useEffect(() => {
    setExpandedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const stats = useMemo(() => collectStats(items), [items]);

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    function walk(list: MenuItem[]) {
      for (const item of list) {
        all.add(item.id);
        walk(item.children);
      }
    }
    walk(items);
    setExpandedIds(all);
  };

  const collapseAll = () => setExpandedIds(new Set());

  const expandToLevel = (targetLevel: number) => {
    const ids = new Set<string>();
    function walk(list: MenuItem[]) {
      for (const item of list) {
        if (item.level <= targetLevel && item.children.length > 0) {
          ids.add(item.id);
        }
        walk(item.children);
      }
    }
    walk(items);
    setExpandedIds(ids);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">Navigation Menu Preview</h1>
          <span
            className={
              fetchState === 'live'
                ? 'inline-flex items-center gap-1 rounded-full border border-emerald-600/50 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300'
                : fetchState === 'loading'
                ? 'inline-flex items-center gap-1 rounded-full border border-gray-600/50 bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-gray-300'
                : 'inline-flex items-center gap-1 rounded-full border border-red-600/50 bg-red-950/40 px-2 py-0.5 text-[10px] font-semibold text-red-300'
            }
          >
            {fetchState === 'live' ? '🟢 LIVE' : fetchState === 'loading' ? '⚪ LOADING' : '🔴 OFFLINE'}
          </span>
          <button
            onClick={() => void fetchLiveMenu(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Live cascade-resolver view. Click rows to expand/collapse or navigate.
        </p>

        {fetchState === 'error' && (
          <div className="mb-4 rounded-lg border border-red-700/60 bg-red-950/40 p-4 text-sm text-red-200">
            <strong>Live navigation unavailable.</strong> {errorMessage}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-gray-900 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Items</div>
          </div>
          <div className="bg-gray-900 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-emerald-400">{stats.routes}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Routable</div>
          </div>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <div key={lvl} className="bg-gray-900 rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-bold text-white">{stats.byLevel[lvl] || 0}</div>
              <div className={`text-[10px] uppercase tracking-wider ${levelColor(lvl).badge} px-1.5 py-0.5 rounded mt-0.5 inline-block`}>
                L{lvl}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="Search menu items, routes, or IDs..."
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 w-80 focus:outline-none focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={expandAll}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg transition"
          >
            Collapse All
          </button>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => expandToLevel(lvl)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 rounded-lg transition"
            >
              To L{lvl}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
          {[1, 2, 3, 4, 5, 6].map((lvl) => {
            const names: Record<number, string> = {
              1: 'Top Section',
              2: 'Category',
              3: 'Sub-Category',
              4: 'Module',
              5: 'Pages',
              6: 'Tabs',
            };
            return (
              <span key={lvl} className="flex items-center gap-1">
                <span className={`${levelColor(lvl).badge} text-[10px] px-1.5 py-0.5 rounded font-bold`}>L{lvl}</span>
                {names[lvl]}
              </span>
            );
          })}
        </div>

        {/* Tree */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-0.5">
          {items.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              expandedIds={expandedIds}
              toggle={toggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs mt-4 text-center">
          Source: zorbit-cor-navigation cascade resolver
          (<code>/api/v1/U/&lt;userId&gt;/menu</code>) | Live module registry
        </p>
      </div>
    </div>
  );
};

export default MenuPreviewPage;
