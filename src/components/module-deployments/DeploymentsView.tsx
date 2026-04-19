import React, { useEffect, useState, useCallback } from 'react';
import { useModuleContext } from '../../contexts/ModuleContext';
import api from '../../services/api';
import { Info, CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw, GitCommit, Package, Calendar } from 'lucide-react';

type HealthStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

/**
 * Reads `deployments.*` from module context, shows build info, environment grid,
 * live health check against the declared health.beRoute.
 */
const DeploymentsView: React.FC = () => {
  const { manifest, moduleId, loading } = useModuleContext();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('checking');
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const deployments = manifest?.deployments;

  const checkHealth = useCallback(async () => {
    if (!deployments?.health?.beRoute) {
      setHealthStatus('unknown');
      return;
    }
    setHealthStatus('checking');
    const start = Date.now();
    try {
      await api.get(deployments.health.beRoute, { timeout: 5000 });
      setHealthLatency(Date.now() - start);
      setHealthStatus('healthy');
    } catch {
      setHealthLatency(Date.now() - start);
      setHealthStatus('unhealthy');
    }
  }, [deployments?.health?.beRoute]);

  useEffect(() => {
    if (!loading) checkHealth();
  }, [loading, checkHealth]);

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading deployments…</div>;

  if (!deployments) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5 flex gap-3 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">Deployments not supplied</h2>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Module <code className="font-mono">{moduleId || '?'}</code> did not declare <code>deployments</code> in its manifest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Health, build metadata, and environment grid for <code className="font-mono">{moduleId}</code>.
          </p>
        </div>
        <button
          onClick={checkHealth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw size={14} className={healthStatus === 'checking' ? 'animate-spin' : ''} /> Recheck health
        </button>
      </div>

      {/* Live health */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <div className="text-xs uppercase font-semibold text-gray-500 mb-3">Live health</div>
        <div className="flex items-center gap-3">
          {healthStatus === 'checking' && (
            <>
              <Clock className="text-gray-400 animate-pulse" size={22} />
              <span className="text-gray-500">Checking…</span>
            </>
          )}
          {healthStatus === 'healthy' && (
            <>
              <CheckCircle2 className="text-green-600" size={22} />
              <span className="font-semibold text-green-700 dark:text-green-300">Healthy</span>
              <span className="text-xs text-gray-500">({healthLatency} ms)</span>
            </>
          )}
          {healthStatus === 'unhealthy' && (
            <>
              <XCircle className="text-red-600" size={22} />
              <span className="font-semibold text-red-700 dark:text-red-300">Unhealthy</span>
            </>
          )}
          {healthStatus === 'unknown' && (
            <>
              <Info className="text-gray-400" size={22} />
              <span className="text-gray-500">No health endpoint declared</span>
            </>
          )}
        </div>
        {deployments.health?.beRoute && (
          <div className="text-[11px] font-mono text-gray-500 mt-2 break-all">
            {deployments.health.beRoute}
          </div>
        )}
      </div>

      {/* Build info */}
      {deployments.build && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-3">Build metadata</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deployments.build.commitSha && (
              <BuildCell icon={<GitCommit size={14} />} label="Commit SHA" value={deployments.build.commitSha} mono />
            )}
            {deployments.build.builtAt && (
              <BuildCell icon={<Calendar size={14} />} label="Built at" value={new Date(deployments.build.builtAt).toLocaleString()} />
            )}
            {deployments.build.nodeVersion && (
              <BuildCell icon={<Package size={14} />} label="Node version" value={deployments.build.nodeVersion} mono />
            )}
            {deployments.build.dockerImage && (
              <BuildCell icon={<Package size={14} />} label="Docker image" value={deployments.build.dockerImage} mono />
            )}
          </div>
        </div>
      )}

      {/* Environments */}
      {deployments.environments && deployments.environments.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-500">
            Environments
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {deployments.environments.map((env, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 uppercase">{env.name}</div>
                  <a
                    href={env.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    {env.url} <ExternalLink size={10} />
                  </a>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                    env.status === 'healthy'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : env.status === 'degraded'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : env.status === 'down'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {env.status || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runbook */}
      {deployments.runbook?.href && (
        <a
          href={deployments.runbook.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          View runbook <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
};

const BuildCell: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({ icon, label, value, mono }) => (
  <div>
    <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-gray-500 mb-0.5">
      {icon} {label}
    </div>
    <div className={`text-sm text-gray-900 dark:text-gray-100 break-all ${mono ? 'font-mono' : ''}`}>
      {value}
    </div>
  </div>
);

export default DeploymentsView;
