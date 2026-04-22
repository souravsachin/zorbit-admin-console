/**
 * useModuleRegistry
 *
 * Fetches a module record from the module registry service and caches it
 * in a module-level Map for the session. The cache is keyed by moduleId.
 *
 * The platformEvents service clears entries from this cache when a
 * MODULE_REGISTERED or MODULE_UPDATED event arrives over the platform WebSocket,
 * so the next navigation to that module will re-fetch the registry entry.
 */

import { useState, useEffect } from 'react';

export interface ModuleFrontend {
  bundleUrl: string;
  entryComponent: string;
  routes: string[];
}

export interface ModuleRecord {
  moduleId: string;
  moduleName: string;
  status: 'PENDING' | 'READY' | 'FAILED';
  frontend: ModuleFrontend;
}

// Session-level cache: moduleId → ModuleRecord
const moduleCache = new Map<string, ModuleRecord>();

/**
 * Removes a module from the registry cache so the next hook invocation
 * re-fetches from the API. Called by platformEvents on live-reload events.
 */
export function evictFromModuleRegistryCache(moduleId: string): void {
  moduleCache.delete(moduleId);
}

/**
 * Returns all cached module IDs. Used by platformEvents for bulk invalidation.
 */
export function getCachedRegistryModuleIds(): string[] {
  return Array.from(moduleCache.keys());
}

/**
 * Hook that resolves a moduleId to its full ModuleRecord from the registry.
 * Cached after the first successful fetch.
 */
export function useModuleRegistry(moduleId: string): {
  module: ModuleRecord | null;
  loading: boolean;
  error: Error | null;
} {
  const [module, setModule] = useState<ModuleRecord | null>(
    moduleCache.get(moduleId) ?? null,
  );
  const [loading, setLoading] = useState(!moduleCache.has(moduleId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (moduleCache.has(moduleId)) {
      // Already cached — make sure state is in sync (handles the case where
      // state was initialised before the cache entry existed)
      setModule(moduleCache.get(moduleId)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('zorbit_access_token') || localStorage.getItem('zorbit_token');
    fetch(`/api/module_registry/api/v1/G/modules/${moduleId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Registry returned ${r.status} for module "${moduleId}"`,
          );
        }
        return r.json() as Promise<ModuleRecord>;
      })
      .then((data) => {
        if (cancelled) return;
        moduleCache.set(moduleId, data);
        setModule(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  return { module, loading, error };
}
