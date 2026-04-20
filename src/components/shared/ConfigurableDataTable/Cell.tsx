/* Cell renderer for ConfigurableDataTable.
 * Maps column.type + column.cellRenderer to a visual cell. */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Link } from 'react-router-dom';
import { Column, Row } from './types';
import {
  fillTemplate,
  formatCurrency,
  formatDate,
  formatNumber,
  getByPath,
  resolvePillColor,
  truncate,
} from './utils';

interface CellProps {
  column: Column;
  row: Row;
  lookups?: Record<string, any>;
}

export const Cell: React.FC<CellProps> = ({ column, row, lookups }) => {
  const raw = getByPath(row, column.key);
  const type = column.type || 'text';
  const renderer = column.cellRenderer;
  const alignClass =
    column.align === 'right'
      ? 'text-right'
      : column.align === 'center'
      ? 'text-center'
      : 'text-left';

  // Explicit cellRenderer overrides type-defaults.
  if (renderer === 'link' || (type === 'link' && column.linkTo)) {
    const to = column.linkTo ? fillTemplate(column.linkTo, row) : '#';
    const label = raw == null ? '' : String(raw);
    return (
      <td className={`px-3 py-2 text-sm ${alignClass}`}>
        <Link
          to={to}
          className={`text-indigo-600 dark:text-indigo-400 hover:underline ${
            column.mono || type === 'id' ? 'font-mono text-xs' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </Link>
      </td>
    );
  }

  if (type === 'id') {
    return (
      <td className={`px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-200 ${alignClass}`}>
        {raw == null ? '' : String(raw)}
      </td>
    );
  }

  if (type === 'currency') {
    const currency = column.currencyField ? getByPath(row, column.currencyField) : undefined;
    return (
      <td className={`px-3 py-2 text-sm tabular-nums ${alignClass || 'text-right'}`}>
        {formatCurrency(raw, currency)}
      </td>
    );
  }

  if (type === 'number') {
    return (
      <td className={`px-3 py-2 text-sm tabular-nums ${alignClass || 'text-right'}`}>
        {formatNumber(raw)}
      </td>
    );
  }

  if (type === 'date') {
    return (
      <td className={`px-3 py-2 text-sm text-gray-600 dark:text-gray-300 ${alignClass}`}>
        {formatDate(raw, column.format)}
      </td>
    );
  }

  if (type === 'chip') {
    const key = raw == null ? '' : String(raw);
    const palette = column.chipColors?.[key];
    const bg = palette?.bg || '#f3f4f6';
    const text = palette?.text || '#374151';
    return (
      <td className={`px-3 py-2 text-sm ${alignClass}`}>
        {key ? (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: bg, color: text }}
          >
            {key}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
    );
  }

  if (type === 'avatar-with-name') {
    const lookup = column.lookup ? lookups?.[column.lookup] : null;
    const entry = lookup && Array.isArray(lookup) ? lookup.find((l: any) => l.value === raw) : null;
    const label = entry?.label || raw || '—';
    const avatarUrl = entry?.avatar;
    const initials = String(label)
      .split(/\s+/)
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <td className={`px-3 py-2 text-sm ${alignClass}`}>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-semibold text-indigo-700 dark:text-indigo-200 overflow-hidden shrink-0"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={String(label)} className="h-full w-full object-cover" />
            ) : (
              <span>{initials || '?'}</span>
            )}
          </div>
          <span className="truncate">{label}</span>
        </div>
      </td>
    );
  }

  if (type === 'pill' || renderer === 'pill') {
    // pillColors.range entries are typed with optional `lt` in the loose
    // ChipPalette to share with chipColors; at runtime only range variants
    // supply `lt`, so coerce here to satisfy the helper signature.
    const range = (column.pillColors?.range || []).filter(
      (r): r is { lt: number; bg: string; text: string; label?: string } =>
        typeof r.lt === 'number',
    );
    const palette = resolvePillColor(raw, range);
    const label = palette?.label ?? (raw == null ? '—' : String(raw));
    const bg = palette?.bg || '#f3f4f6';
    const text = palette?.text || '#374151';
    return (
      <td className={`px-3 py-2 text-sm ${alignClass}`}>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: bg, color: text }}
        >
          {label}
        </span>
      </td>
    );
  }

  if (type === 'boolean') {
    return (
      <td className={`px-3 py-2 text-sm ${alignClass}`}>
        {raw ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-gray-400">✗</span>
        )}
      </td>
    );
  }

  // default → text, truncatable
  const display = raw == null || raw === '' ? '—' : String(raw);
  const visible = truncate(display, column.truncate);
  return (
    <td
      className={`px-3 py-2 text-sm text-gray-800 dark:text-gray-200 ${alignClass}`}
      title={display !== visible ? display : undefined}
    >
      {visible}
    </td>
  );
};

export default Cell;
