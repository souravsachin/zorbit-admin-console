/**
 * ModuleFrame
 *
 * Renders a remotely loaded module bundle inside an error boundary + Suspense.
 * Each module is isolated: an error in one module shows an error card only in
 * that module's area; the rest of the shell is unaffected.
 *
 * Props:
 *   moduleId   — stable identifier used as the bundle cache key
 *   bundleUrl  — CDN URL of the module's bundle.js
 *   moduleName — human-readable name for error messages
 */

import React, { Suspense } from 'react';
import { createLazyModule } from '../services/moduleLoader';

// ── Types ────────────────────────────────────────────────────────────────────

interface ModuleFrameProps {
  moduleId: string;
  bundleUrl: string;
  moduleName: string;
}

// ── Error Boundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode; moduleName: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; moduleName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[ModuleFrame] Module "${this.props.moduleName}" crashed:`, error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            background: '#fff5f5',
            margin: '1rem',
          }}
        >
          <h3 style={{ color: '#721c24', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
            Module unavailable: {this.props.moduleName}
          </h3>
          <p style={{ color: '#721c24', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <p style={{ color: '#666', fontSize: '0.75rem' }}>
            Other modules are unaffected. Try refreshing the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────

function ModuleSkeleton(): React.ReactElement {
  return (
    <div style={{ padding: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
      <div
        style={{
          height: '2rem',
          background: '#e9ecef',
          borderRadius: '4px',
          marginBottom: '1rem',
          width: '40%',
        }}
      />
      <div
        style={{
          height: '1rem',
          background: '#e9ecef',
          borderRadius: '4px',
          marginBottom: '0.5rem',
        }}
      />
      <div
        style={{
          height: '1rem',
          background: '#e9ecef',
          borderRadius: '4px',
          marginBottom: '0.5rem',
          width: '80%',
        }}
      />
      <div
        style={{
          height: '1rem',
          background: '#e9ecef',
          borderRadius: '4px',
          width: '60%',
        }}
      />
    </div>
  );
}

// ── ModuleFrame ───────────────────────────────────────────────────────────────

/**
 * ModuleFrame lazily loads a remote module bundle and renders it inside
 * an error boundary so failures are scoped to this module only.
 *
 * The lazy component reference is memoised so React does not re-create it
 * on every parent render, which would cause unnecessary re-mounts.
 */
export function ModuleFrame({
  moduleId,
  bundleUrl,
  moduleName,
}: ModuleFrameProps): React.ReactElement {
  // Stable reference — only re-created when moduleId or bundleUrl changes.
  const LazyComponent = React.useMemo(
    () => createLazyModule(moduleId, bundleUrl),
    [moduleId, bundleUrl],
  );

  return (
    <ModuleErrorBoundary moduleName={moduleName}>
      <Suspense fallback={<ModuleSkeleton />}>
        <LazyComponent />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
