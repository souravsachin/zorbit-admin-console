/**
 * ApiRunConsolePage — live SSE console for a single API integration run.
 *
 * Route: /m/api_integration/adapters/:code/runs/:runId
 * Backend SSE: /api/api_integration/api/v1/G/adapters/:code/runs/:runId/events
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plug, ChevronLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface RunEvent {
  ts?: string;
  level?: string;
  message?: string;
  data?: unknown;
}

type RunStatus = 'connecting' | 'streaming' | 'succeeded' | 'failed' | 'error';

const levelColor = (level?: string): string => {
  switch ((level || '').toUpperCase()) {
    case 'DEBUG': return 'text-gray-400';
    case 'INFO': return 'text-sky-400';
    case 'NOTICE': return 'text-cyan-300';
    case 'WARN':
    case 'WARNING': return 'text-amber-400';
    case 'ERROR':
    case 'ERR': return 'text-red-400';
    case 'CRIT':
    case 'ALERT':
    case 'EMERG': return 'text-red-300 font-bold';
    default: return 'text-gray-300';
  }
};

const ApiRunConsolePage: React.FC = () => {
  const { code, runId } = useParams<{ code: string; runId: string }>();
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [status, setStatus] = useState<RunStatus>('connecting');
  const [finalError, setFinalError] = useState<string | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!code || !runId) return;
    const url = `/api/api_integration/api/v1/G/adapters/${encodeURIComponent(code)}/runs/${encodeURIComponent(runId)}/events`;
    const es = new EventSource(url);

    const onOpen = () => setStatus((prev) => (prev === 'connecting' ? 'streaming' : prev));
    const onEvent = (msg: MessageEvent) => {
      try {
        const parsed = JSON.parse(msg.data);
        setEvents((prev) => [...prev, parsed as RunEvent]);
      } catch {
        setEvents((prev) => [...prev, { message: String(msg.data) }]);
      }
    };
    const onComplete = (msg: MessageEvent) => {
      try {
        const parsed = JSON.parse(msg.data);
        const st = (parsed?.status || '').toLowerCase();
        setStatus(st === 'failed' ? 'failed' : 'succeeded');
        if (parsed?.errorMessage) setFinalError(String(parsed.errorMessage));
      } catch {
        setStatus('succeeded');
      }
      es.close();
    };
    const onError = () => {
      setStatus('error');
    };

    es.addEventListener('open', onOpen);
    es.addEventListener('event', onEvent as EventListener);
    es.addEventListener('complete', onComplete as EventListener);
    es.onerror = onError;

    return () => {
      es.close();
    };
  }, [code, runId]);

  useEffect(() => {
    if (tailRef.current) {
      tailRef.current.scrollTop = tailRef.current.scrollHeight;
    }
  }, [events.length]);

  const statusBadge = useMemo(() => {
    switch (status) {
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
            <Loader2 className="animate-spin" size={14} /> connecting
          </span>
        );
      case 'streaming':
        return (
          <span className="inline-flex items-center gap-1 text-indigo-600 text-sm">
            <Loader2 className="animate-spin" size={14} /> streaming
          </span>
        );
      case 'succeeded':
        return (
          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle2 size={14} /> succeeded
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-red-600 text-sm">
            <XCircle size={14} /> failed
          </span>
        );
      case 'error':
        return <span className="text-red-600 text-sm">connection error</span>;
    }
  }, [status]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/m/api_integration/adapters/${encodeURIComponent(code || '')}/runs`}
            className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 text-sm"
          >
            <ChevronLeft size={16} /> Runs
          </Link>
          <Plug className="text-indigo-600" size={18} />
          <h1 className="text-xl font-semibold">
            Run <code className="font-mono text-base">{runId}</code>
          </h1>
          <span className="text-gray-400 text-sm">adapter {code}</span>
        </div>
        {statusBadge}
      </div>

      <div
        ref={tailRef}
        className="rounded-lg bg-gray-900 text-gray-100 font-mono text-xs p-4 overflow-y-auto max-h-[calc(100vh-14rem)] border border-gray-700"
      >
        {events.length === 0 ? (
          <div className="text-gray-500">waiting for events…</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="whitespace-pre-wrap break-words">
              <span className="text-gray-500">{ev.ts || ''}</span>{' '}
              <span className={levelColor(ev.level)}>{(ev.level || 'INFO').toUpperCase()}</span>{' '}
              <span>{ev.message || ''}</span>
              {ev.data !== undefined && ev.data !== null && (
                <span className="text-gray-400"> {JSON.stringify(ev.data as unknown)}</span>
              )}
            </div>
          ))
        )}
      </div>

      {finalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm font-mono">
          {finalError}
        </div>
      )}
    </div>
  );
};

export default ApiRunConsolePage;
