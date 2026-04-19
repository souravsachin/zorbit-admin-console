import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Theme-consistent Select — drop-in replacement for native <select>.
// Deliberately NOT using the native element so we get identical visuals
// across OS/browsers. Keyboard-friendly: Enter/Space opens, arrows navigate,
// Escape closes.

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  minWidth?: number;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ value, options, onChange, placeholder, minWidth = 180, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlightIdx(idx >= 0 ? idx : 0);
  }, [open, value, options]);

  const selected = options.find((o) => o.value === value);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = options[highlightIdx];
      if (chosen) { onChange(chosen.value); setOpen(false); }
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-1.5 text-sm rounded-md
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-800
          hover:border-gray-400 dark:hover:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-colors
        `}
      >
        <span className={selected ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500'}>
          {selected ? selected.label : (placeholder || 'Select…')}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-72 overflow-y-auto"
        >
          {options.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">No options</div>
          )}
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlight = idx === highlightIdx;
            return (
              <button
                key={opt.value || `__empty_${idx}`}
                role="option"
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                onMouseEnter={() => setHighlightIdx(idx)}
                aria-selected={isSelected}
                className={`
                  w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-left
                  ${isHighlight ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}
                  ${isSelected ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-100'}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={13} className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;
