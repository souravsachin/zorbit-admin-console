/* Small helpers for ConfigurableDataTable. Kept in one file so the runtime
 * bundle stays tight and the component body stays readable. */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Column, SrcRef, RoleVariant, DataTableFeProps } from './types';

/** Dot-notation safe path read. `customer.phone.masked` → obj.customer.phone.masked. */
export function getByPath(row: any, path: string): any {
  if (!row || !path) return undefined;
  if (!path.includes('.')) return row[path];
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), row);
}

/** Template `"/m/{moduleSlug}/records/{recordId}"` with row fields. */
export function fillTemplate(tpl: string, row: any, extra?: Record<string, unknown>): string {
  return tpl.replace(/\{([^}]+)\}/g, (_m, key) => {
    if (extra && key in extra) return String(extra[key] ?? '');
    const v = getByPath(row, key);
    return v == null ? '' : String(v);
  });
}

/** Render a relative "3 days ago"-style date. Falls back to ISO on invalid. */
export function formatDate(value: any, format: string | undefined): string {
  if (value == null || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  if (!format || format === 'relative') {
    const diff = Date.now() - d.getTime();
    const abs = Math.abs(diff);
    const mins = Math.round(abs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.round(months / 12)}y ago`;
  }
  if (format === 'yyyy-MM-dd') return d.toISOString().slice(0, 10);
  // Fallback: simple human readable
  try {
    return d.toLocaleString();
  } catch {
    return d.toString();
  }
}

/** Currency format — ISO code from currencyField or prop default. */
export function formatCurrency(value: any, currency?: string): string {
  if (value == null || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency || 'USD'} ${n.toLocaleString()}`;
  }
}

export function formatNumber(value: any): string {
  if (value == null || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString();
}

/** Truncate with ellipsis. */
export function truncate(s: string, max?: number): string {
  if (!max || !s || s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

/** Detect that a cell value has already been masked by the BE. */
export function looksMaskedByBE(value: any): boolean {
  if (typeof value !== 'string') return false;
  return value.includes('•') || value.includes('***') || /\*{2,}/.test(value);
}

/** Apply a FE mask as defence-in-depth only. */
export function applyFEMask(value: any, pattern: string | undefined, maskChar: string): string {
  if (value == null) return '';
  const s = String(value);
  if (looksMaskedByBE(s)) return s;
  switch (pattern) {
    case 'keep-last-4':
      if (s.length <= 4) return s;
      return maskChar.repeat(s.length - 4) + s.slice(-4);
    case 'keep-first-1-and-domain': {
      const at = s.indexOf('@');
      if (at <= 1) return s;
      return s[0] + maskChar.repeat(Math.max(1, at - 1)) + s.slice(at);
    }
    default:
      return s;
  }
}

/** Resolve {$src:...} or return the inline value as-is. */
export function isSrcRef<T>(v: T | SrcRef): v is SrcRef {
  return !!v && typeof v === 'object' && typeof (v as any).$src === 'string';
}

/** Deep-merge a role variant over a base feProps. Arrays in the variant
 *  REPLACE base arrays (per spec example). Nested objects merge field-wise. */
export function mergeVariant(base: DataTableFeProps, variant: RoleVariant | null | undefined): DataTableFeProps {
  if (!variant) return base;
  const merged: DataTableFeProps = { ...base };
  if (variant.columns) merged.columns = variant.columns;
  if (variant.filters) {
    merged.filters = { ...(base.filters || {}), ...variant.filters };
    if (variant.filters.extra) merged.filters.extra = variant.filters.extra;
  }
  if (variant.lookups) merged.lookups = { ...(base.lookups || {}), ...variant.lookups };
  if (variant.tableActions) merged.tableActions = variant.tableActions;
  if (variant.rowActions) merged.rowActions = variant.rowActions;
  if (variant.detailView) {
    merged.detailView = { ...(base.detailView || {}), ...variant.detailView };
  }
  return merged;
}

/** Resolve a colour palette for a `pill` renderer's range config. */
export function resolvePillColor(
  value: any,
  range: Array<{ lt: number; bg: string; text: string; label?: string }> | undefined,
): { bg: string; text: string; label?: string } | null {
  if (!range || !Array.isArray(range)) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  for (const r of range) {
    if (n < r.lt) return r;
  }
  // Past highest threshold: reuse last for display
  return range[range.length - 1] || null;
}

/** Pick the best role variant for a user — simple first-match lookup. */
export function pickRoleVariant(
  roleVariants: Record<string, RoleVariant> | undefined,
  userRoles: string[],
): { key: string; variant: RoleVariant } | null {
  if (!roleVariants) return null;
  for (const role of userRoles) {
    if (role && roleVariants[role]) return { key: role, variant: roleVariants[role] };
  }
  return null;
}

/** Derive user roles from a decoded JWT — supports string OR array. */
export function extractUserRoles(
  jwtClaims: { role?: string | string[]; roles?: string | string[] } | null,
): string[] {
  if (!jwtClaims) return [];
  const seen = new Set<string>();
  const push = (v: unknown) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach((x) => typeof x === 'string' && seen.add(x));
    else if (typeof v === 'string') {
      // roles may be comma-separated
      v.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => seen.add(s));
    }
  };
  push(jwtClaims.role);
  push(jwtClaims.roles);
  return Array.from(seen);
}

export function ensureArray<T>(v: T[] | SrcRef | undefined | null): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [];
}

/** Parse a cached column config. Accepts both {columns:[...]} and bare [...]. */
export function unwrapColumnsPayload(data: any): Column[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.columns)) return data.columns;
  return [];
}
