/* Tiny React hook for resolving {$src: "<url>"} sub-configs.
 *
 * Caches by URL in a module-level Map so repeated mounts re-use the same
 * fetch. Cache is invalidated by `cacheKey` (version-ish), matching SPEC
 * §"$src integration" — "cached by manifest.version; bumping the module
 * version invalidates".
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { SrcRef } from './types';

interface CacheEntry {
  key: string;
  promise: Promise<any>;
}

const cache = new Map<string, CacheEntry>();

export function fetchSrc(url: string, cacheKey: string): Promise<any> {
  const existing = cache.get(url);
  if (existing && existing.key === cacheKey) return existing.promise;
  const promise = api
    .get(url)
    .then((res) => res.data)
    .catch((err) => {
      // bubble up but also purge so next mount retries
      cache.delete(url);
      throw err;
    });
  cache.set(url, { key: cacheKey, promise });
  return promise;
}

/** Resolve either an inline value OR a `{$src}` reference. */
export function useResolvedSrc<T>(
  src: T | SrcRef | undefined | null,
  cacheKey: string,
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>(() => {
    if (!src) return { data: null, loading: false, error: null };
    if (typeof src === 'object' && src !== null && (src as any).$src) {
      return { data: null, loading: true, error: null };
    }
    return { data: src as T, loading: false, error: null };
  });

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    if (typeof src === 'object' && src !== null && (src as any).$src) {
      const url = (src as SrcRef).$src;
      setState((s) => ({ ...s, loading: true, error: null }));
      fetchSrc(url, cacheKey)
        .then((data) => {
          if (!cancelled) setState({ data, loading: false, error: null });
        })
        .catch((err) => {
          if (!cancelled) setState({ data: null, loading: false, error: err as Error });
        });
    } else {
      setState({ data: src as T, loading: false, error: null });
    }
    return () => {
      cancelled = true;
    };
  }, [src && typeof src === 'object' ? (src as any).$src : null, cacheKey]);

  return state;
}

/** Resolve every `{$src}` inside a Record<string, ...> in parallel.
 *  Keys with plain values pass through untouched. */
export function useResolvedRecord<T>(
  rec: Record<string, T | SrcRef> | undefined,
  cacheKey: string,
): { data: Record<string, T> | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{ data: Record<string, T> | null; loading: boolean; error: Error | null }>({
    data: rec ? ({} as Record<string, T>) : null,
    loading: !!rec,
    error: null,
  });

  const signature = rec
    ? Object.entries(rec)
        .map(([k, v]) => `${k}=${v && typeof v === 'object' && (v as any).$src ? (v as any).$src : '*'}`)
        .join('|')
    : '';

  useEffect(() => {
    let cancelled = false;
    if (!rec) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const entries = Object.entries(rec);
    Promise.all(
      entries.map(async ([k, v]) => {
        if (v && typeof v === 'object' && (v as any).$src) {
          const data = await fetchSrc((v as SrcRef).$src, cacheKey);
          return [k, data as T] as const;
        }
        return [k, v as T] as const;
      }),
    )
      .then((pairs) => {
        if (!cancelled) {
          const out: Record<string, T> = {};
          for (const [k, v] of pairs) out[k] = v;
          setState({ data: out, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err as Error });
      });
    return () => {
      cancelled = true;
    };
  }, [signature, cacheKey]);

  return state;
}

/** Clear the entire $src cache — useful for dev / tests. */
export function clearSrcCache(): void {
  cache.clear();
}
