/**
 * moduleLoader.ts
 *
 * Dynamically loads remote module bundles from their CDN URLs.
 * bundleUrl comes from manifest.frontend.bundleUrl
 * (e.g. "https://cdn.onezippy.ai/modules/pcg4/1.0.0/bundle.js")
 *
 * The in-memory cache is keyed by moduleId.
 * MODULE_UPDATED platform events clear the cache entry so the next
 * navigation fetches the fresh bundle.
 */

import React from 'react';

// In-memory cache: moduleId → resolved React component
const loadedModules = new Map<string, React.ComponentType<any>>();

/**
 * Returns all currently cached module IDs.
 * Used by platformEvents.ts to invalidate on MODULE_UPDATED.
 */
export function getCachedModuleIds(): string[] {
  return Array.from(loadedModules.keys());
}

/**
 * Removes a module from the in-memory bundle cache.
 * The next navigation to that module will re-fetch the bundle from the CDN.
 */
export function evictModuleFromCache(moduleId: string): void {
  loadedModules.delete(moduleId);
}

/**
 * Loads the remote module bundle at bundleUrl and returns its default export.
 * Throws if the bundle does not export a default React component.
 * Results are cached in-memory for the session lifetime (unless evicted).
 */
export async function loadModuleBundle(
  moduleId: string,
  bundleUrl: string,
): Promise<React.ComponentType<any>> {
  if (loadedModules.has(moduleId)) {
    return loadedModules.get(moduleId)!;
  }

  // Dynamic import of the remote bundle.
  // @vite-ignore suppresses the static analysis warning for non-literal URLs.
  const mod = await import(/* @vite-ignore */ bundleUrl);
  const Component = mod.default;

  if (!Component) {
    throw new Error(
      `Module bundle at ${bundleUrl} does not export a default React component`,
    );
  }

  loadedModules.set(moduleId, Component);
  return Component;
}

/**
 * Returns a React.lazy component that loads the remote bundle on first render.
 * The result is a stable reference — wrap callers in React.useMemo to avoid
 * creating a new lazy component on every render.
 */
export function createLazyModule(
  moduleId: string,
  bundleUrl: string,
): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(() =>
    loadModuleBundle(moduleId, bundleUrl).then((Component) => ({
      default: Component,
    })),
  );
}
