import React, { useMemo, useState, useCallback } from 'react';
import { Maximize2, Minimize2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

// Lightweight JSON viewer. Features:
// - Syntax highlighting (keys, strings, numbers, booleans, null)
// - Line numbers gutter
// - Fold / expand for objects and arrays, recursive
// - "Expand all" / "Collapse all" controls
// - Fullscreen modal toggle
// - Copy-to-clipboard
// - Read-only
//
// Deliberately no dependency on a heavyweight editor (Monaco, CodeMirror).
// ~200 lines, zero new deps.

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface Line {
  indent: number;
  text: React.ReactNode;
  rawText: string;
  // Unique path for this line, used as collapse toggle key.
  path?: string;
  // If this line is an opener ({ or [), closeLineIdx is the matching closer.
  closeLineIdx?: number;
  // If this line is a closer, openLineIdx points back.
  openLineIdx?: number;
}

function renderValue(v: JsonValue): React.ReactNode {
  if (v === null) return <span className="text-gray-500">null</span>;
  if (typeof v === 'boolean') return <span className="text-purple-600 dark:text-purple-400">{String(v)}</span>;
  if (typeof v === 'number') return <span className="text-blue-600 dark:text-blue-400">{v}</span>;
  if (typeof v === 'string') {
    return <span className="text-green-700 dark:text-green-400">"{v.replace(/"/g, '\\"')}"</span>;
  }
  return null;
}

function buildLines(value: JsonValue): Line[] {
  const lines: Line[] = [];
  const openStack: number[] = [];

  function walk(v: JsonValue, indent: number, path: string, trailing: string) {
    if (v === null || typeof v !== 'object') {
      lines.push({
        indent,
        text: <>{renderValue(v)}{trailing}</>,
        rawText: JSON.stringify(v) + trailing,
      });
      return;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push({ indent, text: <>[]{trailing}</>, rawText: '[]' + trailing });
        return;
      }
      const openIdx = lines.length;
      lines.push({ indent, text: <>[</>, rawText: '[', path, closeLineIdx: -1 });
      openStack.push(openIdx);
      v.forEach((item, i) => {
        const childPath = `${path}[${i}]`;
        walkValueLine(item, indent + 1, childPath, i < v.length - 1 ? ',' : '');
      });
      const closeIdx = lines.length;
      lines.push({ indent, text: <>]{trailing}</>, rawText: ']' + trailing, openLineIdx: openIdx });
      const openRef = openStack.pop()!;
      lines[openRef].closeLineIdx = closeIdx;
      return;
    }
    // Object
    const keys = Object.keys(v);
    if (keys.length === 0) {
      lines.push({ indent, text: <>{'{}'}{trailing}</>, rawText: '{}' + trailing });
      return;
    }
    const openIdx = lines.length;
    lines.push({ indent, text: <>{'{'}</>, rawText: '{', path, closeLineIdx: -1 });
    openStack.push(openIdx);
    keys.forEach((k, i) => {
      const childPath = `${path}.${k}`;
      const childTrailing = i < keys.length - 1 ? ',' : '';
      walkKeyValue(k, v[k], indent + 1, childPath, childTrailing);
    });
    const closeIdx = lines.length;
    lines.push({ indent, text: <>{'}'}{trailing}</>, rawText: '}' + trailing, openLineIdx: openIdx });
    const openRef = openStack.pop()!;
    lines[openRef].closeLineIdx = closeIdx;
  }

  function walkValueLine(v: JsonValue, indent: number, path: string, trailing: string) {
    if (v === null || typeof v !== 'object') {
      lines.push({ indent, text: <>{renderValue(v)}{trailing}</>, rawText: JSON.stringify(v) + trailing });
      return;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push({ indent, text: <>[]{trailing}</>, rawText: '[]' + trailing });
        return;
      }
      walk(v, indent, path, trailing);
      return;
    }
    const keys = Object.keys(v);
    if (keys.length === 0) {
      lines.push({ indent, text: <>{'{}'}{trailing}</>, rawText: '{}' + trailing });
      return;
    }
    walk(v, indent, path, trailing);
  }

  function walkKeyValue(key: string, v: JsonValue, indent: number, path: string, trailing: string) {
    const keyNode = <span className="text-rose-600 dark:text-rose-400">"{key}"</span>;
    if (v === null || typeof v !== 'object') {
      lines.push({
        indent,
        text: <>{keyNode}: {renderValue(v)}{trailing}</>,
        rawText: `"${key}": ${JSON.stringify(v)}${trailing}`,
      });
      return;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push({ indent, text: <>{keyNode}: [ ]{trailing}</>, rawText: `"${key}": []${trailing}` });
        return;
      }
      const openIdx = lines.length;
      lines.push({ indent, text: <>{keyNode}: [</>, rawText: `"${key}": [`, path, closeLineIdx: -1 });
      openStack.push(openIdx);
      v.forEach((item, i) => {
        walkValueLine(item, indent + 1, `${path}[${i}]`, i < v.length - 1 ? ',' : '');
      });
      const closeIdx = lines.length;
      lines.push({ indent, text: <>]{trailing}</>, rawText: ']' + trailing, openLineIdx: openIdx });
      const openRef = openStack.pop()!;
      lines[openRef].closeLineIdx = closeIdx;
      return;
    }
    const keys = Object.keys(v);
    if (keys.length === 0) {
      lines.push({ indent, text: <>{keyNode}: {'{ }'}{trailing}</>, rawText: `"${key}": {}${trailing}` });
      return;
    }
    const openIdx = lines.length;
    lines.push({ indent, text: <>{keyNode}: {'{'}</>, rawText: `"${key}": {`, path, closeLineIdx: -1 });
    openStack.push(openIdx);
    keys.forEach((k, i) => {
      walkKeyValue(k, v[k], indent + 1, `${path}.${k}`, i < keys.length - 1 ? ',' : '');
    });
    const closeIdx = lines.length;
    lines.push({ indent, text: <>{'}'}{trailing}</>, rawText: '}' + trailing, openLineIdx: openIdx });
    const openRef = openStack.pop()!;
    lines[openRef].closeLineIdx = closeIdx;
  }

  walk(value, 0, '$', '');
  return lines;
}

interface JsonViewerProps {
  value: unknown;
  maxHeightClass?: string;     // tailwind height cap for the inline render
  initialCollapsed?: boolean;   // start with all foldable lines collapsed
}

const JsonViewer: React.FC<JsonViewerProps> = ({ value, maxHeightClass = 'max-h-96', initialCollapsed = false }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => buildLines(value as JsonValue), [value]);

  // Initialize collapsed set on first load if initialCollapsed.
  React.useEffect(() => {
    if (!initialCollapsed) return;
    const all = new Set<number>();
    lines.forEach((l, i) => { if (l.closeLineIdx !== undefined) all.add(i); });
    setCollapsed(all);
  }, [lines, initialCollapsed]);

  const toggle = useCallback((idx: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => {
    const all = new Set<number>();
    lines.forEach((l, i) => { if (l.closeLineIdx !== undefined) all.add(i); });
    setCollapsed(all);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  // Compute visible line indices — skip lines that are hidden because their
  // parent is collapsed.
  const visibleIdx: number[] = useMemo(() => {
    const out: number[] = [];
    let skipUntil = -1;
    for (let i = 0; i < lines.length; i++) {
      if (i <= skipUntil) continue;
      out.push(i);
      if (collapsed.has(i) && lines[i].closeLineIdx !== undefined) {
        skipUntil = lines[i].closeLineIdx!;
      }
    }
    return out;
  }, [lines, collapsed]);

  const body = (
    <div className={`relative font-mono text-[11.5px] leading-[1.55] bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${fullscreen ? 'h-full' : maxHeightClass}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60">
        <button onClick={expandAll} title="Expand all" className="px-1.5 py-0.5 text-[11px] rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          Expand
        </button>
        <button onClick={collapseAll} title="Collapse all" className="px-1.5 py-0.5 text-[11px] rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          Collapse
        </button>
        <div className="flex-1" />
        <button onClick={handleCopy} title="Copy JSON" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600">
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
        </button>
        <button onClick={() => setFullscreen((f) => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600">
          {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <tbody>
            {visibleIdx.map((i) => {
              const line = lines[i];
              const isFoldable = line.closeLineIdx !== undefined;
              const isCollapsed = collapsed.has(i);
              return (
                <tr key={i} className="align-top">
                  <td className="select-none sticky left-0 bg-gray-100 dark:bg-gray-800 text-right px-2 text-gray-400 text-[10px] border-r border-gray-200 dark:border-gray-700" style={{ width: 42 }}>
                    {i + 1}
                  </td>
                  <td className="w-4 px-0.5 select-none">
                    {isFoldable ? (
                      <button onClick={() => toggle(i)} className="p-0.5 text-gray-400 hover:text-gray-700">
                        {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                      </button>
                    ) : null}
                  </td>
                  <td className="pr-3 whitespace-pre">
                    {'  '.repeat(line.indent)}
                    {line.text}
                    {isCollapsed && isFoldable && (
                      <span className="text-gray-400 italic ml-1">…{line.rawText.includes('[') ? ' ]' : ' }'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 p-4 bg-black/60">
        <div className="relative mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-2xl h-full max-w-6xl flex flex-col overflow-hidden">
          {body}
        </div>
      </div>
    );
  }
  return body;
};

export default JsonViewer;
