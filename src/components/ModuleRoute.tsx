/**
 * ModuleRoute
 *
 * Used inside React Router <Route> elements for remote (Option B) modules.
 *
 * Resolves a moduleId to a full ModuleRecord via the module registry service,
 * then delegates rendering to <ModuleFrame> which handles lazy loading,
 * Suspense, and error isolation.
 *
 * Usage (in App.tsx):
 *   <Route path="m/pcg4/*" element={<ModuleRoute moduleId="app_pcg4" />} />
 */

import React from 'react';
import { ModuleFrame } from './ModuleFrame';
import { useModuleRegistry } from '../hooks/useModuleRegistry';

interface ModuleRouteProps {
  moduleId: string;
}

export function ModuleRoute({ moduleId }: ModuleRouteProps): React.ReactElement {
  const { module, loading, error } = useModuleRegistry(moduleId);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
        Loading module info...
      </div>
    );
  }

  if (error || !module) {
    return (
      <div
        role="alert"
        style={{
          padding: '2rem',
          color: '#721c24',
          background: '#fff5f5',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          margin: '1rem',
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
          Module <code>{moduleId}</code> is not registered or unavailable.
        </p>
        {error && (
          <p style={{ fontSize: '0.875rem' }}>{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <ModuleFrame
      moduleId={module.moduleId}
      bundleUrl={module.frontend.bundleUrl}
      moduleName={module.moduleName}
    />
  );
}
