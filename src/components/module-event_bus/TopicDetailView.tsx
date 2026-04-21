import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Users as UsersIcon,
  Send,
  BookOpen,
  PlayCircle,
  PauseCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../shared/StatusBadge';

/**
 * TopicDetailView — platform-supplied drill-down for a single Kafka topic.
 *
 * Registered as `@platform:TopicDetailView`. Rendered at
 * `/m/event-bus/topics/:name` either via sidebar deep-link or via the
 * "Inspect" row action on the Topics DataTable.
 *
 * Four sub-panels:
 *   1. Detail — partition / replica / offset table, live configs
 *   2. Subscribers — consumer groups with lag against this topic
 *   3. Publishers — recent producer modules (from event archive)
 *   4. Event History — paginated recent archived events
 *   5. Live Tail — SSE stream of in-flight messages
 */

interface TopicDetail {
  name: string;
  isInternal: boolean;
  partitions: number;
  replicationFactor: number;
  messageCount: number;
  partitionDetails: Array<{
    partition: number;
    leader: number;
    replicas: number[];
    isr: number[];
    offset: number;
  }>;
  configs: Record<string, string>;
}

interface TopicSubscriber {
  groupId: string;
  state: string;
  memberCount: number;
  members: Array<{ memberId: string; clientId: string; clientHost: string }>;
  assignments: Array<{ partition: number; currentOffset: number; logEndOffset: number; lag: number }>;
  totalLag: number;
}

interface TopicPublisher {
  producerModule: string;
  eventCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

interface ArchivedEvent {
  id: string;
  eventId: string | null;
  topic: string;
  eventName: string | null;
  producerModule: string | null;
  timestamp: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  metadata: { partition?: number; offset?: number; key?: string | null };
}

interface LiveTailMessage {
  topic: string;
  partition: number;
  offset: number;
  timestamp: string;
  receivedAt: string;
  key: string | null;
  value: unknown;
  valueIsJson: boolean;
  headers: Record<string, string>;
}

const EVENT_BUS_BASE =
  (import.meta as unknown as { env?: { VITE_EVENT_BUS_BASE?: string } })?.env
    ?.VITE_EVENT_BUS_BASE || '/api/event-bus/api/v1/G/messaging/broker';

const TopicDetailView: React.FC = () => {
  const params = useParams<{ name: string }>();
  const rawName = params.name ?? '';
  const topicName = decodeURIComponent(rawName);

  const [detail, setDetail] = useState<TopicDetail | null>(null);
  const [subscribers, setSubscribers] = useState<TopicSubscriber[]>([]);
  const [publishers, setPublishers] = useState<TopicPublisher[]>([]);
  const [events, setEvents] = useState<ArchivedEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, s, p, e] = await Promise.all([
        api.get(`${EVENT_BUS_BASE}/topics/${encodeURIComponent(topicName)}/detail`),
        api.get(`${EVENT_BUS_BASE}/topics/${encodeURIComponent(topicName)}/subscribers`),
        api.get(`${EVENT_BUS_BASE}/topics/${encodeURIComponent(topicName)}/publishers`),
        api.get(`${EVENT_BUS_BASE}/topics/${encodeURIComponent(topicName)}/events?limit=25&offset=0`),
      ]);
      setDetail(d.data);
      setSubscribers(Array.isArray(s.data) ? s.data : []);
      setPublishers(Array.isArray(p.data) ? p.data : []);
      setEvents(e.data.rows ?? []);
      setEventsTotal(e.data.total ?? 0);
    } catch (err) {
      setError((err as Error).message || 'Failed to load topic detail');
    } finally {
      setLoading(false);
    }
  }, [topicName]);

  useEffect(() => {
    if (topicName) loadAll();
  }, [topicName, loadAll]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/m/event-bus/topics"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={14} className="mr-1" /> All topics
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="font-mono">{topicName}</span>
            {detail?.isInternal && (
              <span className="ml-3 text-xs uppercase text-gray-400">internal</span>
            )}
          </h1>
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !detail ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
          Loading…
        </div>
      ) : (
        <>
          <DetailCard detail={detail} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubscribersCard subscribers={subscribers} />
            <PublishersCard publishers={publishers} />
          </div>
          <EventsCard events={events} total={eventsTotal} />
          <LiveTailCard topic={topicName} />
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DetailCard: React.FC<{ detail: TopicDetail | null }> = ({ detail }) => {
  if (!detail) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Activity size={16} /> Partition Layout
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-4">
        <Stat label="Partitions" value={detail.partitions.toString()} />
        <Stat label="Replication" value={detail.replicationFactor.toString()} />
        <Stat label="Total Messages" value={detail.messageCount.toLocaleString()} />
        <Stat label="Internal" value={detail.isInternal ? 'Yes' : 'No'} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-700/40">
            <tr>
              <Th>Partition</Th>
              <Th>Leader</Th>
              <Th>Replicas</Th>
              <Th>ISR</Th>
              <Th className="text-right">High-Water Offset</Th>
            </tr>
          </thead>
          <tbody>
            {detail.partitionDetails.map((p) => (
              <tr key={p.partition} className="border-t border-gray-100 dark:border-gray-700/60">
                <Td>P{p.partition}</Td>
                <Td>{p.leader}</Td>
                <Td>[{p.replicas.join(', ')}]</Td>
                <Td
                  className={
                    p.isr.length < p.replicas.length ? 'text-amber-600' : 'text-green-600'
                  }
                >
                  [{p.isr.join(', ')}]
                </Td>
                <Td className="text-right font-mono">{p.offset.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Object.keys(detail.configs).length > 0 && (
        <details className="border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <summary className="cursor-pointer text-xs font-semibold uppercase text-gray-500">
            Kafka config overrides ({Object.keys(detail.configs).length})
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-1 text-xs font-mono text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            {Object.entries(detail.configs)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => (
                <div key={k} className="truncate">
                  <span className="text-gray-500">{k}:</span> {v}
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
};

const SubscribersCard: React.FC<{ subscribers: TopicSubscriber[] }> = ({ subscribers }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <UsersIcon size={16} /> Subscribers
      </h2>
      <span className="text-xs text-gray-500">{subscribers.length} group(s)</span>
    </div>
    {subscribers.length === 0 ? (
      <div className="px-5 py-4 text-sm text-gray-500">No consumer groups subscribing.</div>
    ) : (
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {subscribers.map((s) => (
          <div key={s.groupId} className="px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm text-gray-900 dark:text-gray-100">{s.groupId}</div>
              <StatusBadge
                label={s.state}
                variant={s.state === 'Stable' ? 'success' : 'info'}
              />
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {s.memberCount} member(s) · total lag{' '}
              <span className={s.totalLag > 0 ? 'text-amber-600' : 'text-green-600'}>
                {s.totalLag.toLocaleString()}
              </span>
            </div>
            {s.assignments.length > 0 && (
              <div className="mt-1 text-[11px] font-mono text-gray-500">
                {s.assignments
                  .map((a) => `P${a.partition}: ${a.currentOffset}/${a.logEndOffset} (lag ${a.lag})`)
                  .join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const PublishersCard: React.FC<{ publishers: TopicPublisher[] }> = ({ publishers }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <Send size={16} /> Recent Publishers
      </h2>
      <span className="text-xs text-gray-500">last 7 days</span>
    </div>
    {publishers.length === 0 ? (
      <div className="px-5 py-4 text-sm text-gray-500">
        No archived publishes yet — archiver may still be warming up.
      </div>
    ) : (
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left dark:bg-gray-700/40">
          <tr>
            <Th>Producer</Th>
            <Th className="text-right">Count</Th>
            <Th>Last Seen</Th>
          </tr>
        </thead>
        <tbody>
          {publishers.map((p) => (
            <tr
              key={p.producerModule}
              className="border-t border-gray-100 dark:border-gray-700/60"
            >
              <Td>{p.producerModule}</Td>
              <Td className="text-right font-mono">{p.eventCount.toLocaleString()}</Td>
              <Td className="text-xs text-gray-500">{new Date(p.lastSeenAt).toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const EventsCard: React.FC<{ events: ArchivedEvent[]; total: number }> = ({ events, total }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <BookOpen size={16} /> Event History
      </h2>
      <span className="text-xs text-gray-500">
        showing {events.length} of {total.toLocaleString()}
      </span>
    </div>
    {events.length === 0 ? (
      <div className="px-5 py-4 text-sm text-gray-500">No archived events for this topic yet.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-700/40">
            <tr>
              <Th>When</Th>
              <Th>Event</Th>
              <Th>Producer</Th>
              <Th>Event ID</Th>
              <Th className="text-right">P / Offset</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 dark:border-gray-700/60">
                <Td className="whitespace-nowrap text-xs text-gray-500">
                  {new Date(e.timestamp).toLocaleString()}
                </Td>
                <Td className="font-mono text-xs">{e.eventName ?? '—'}</Td>
                <Td className="text-xs">{e.producerModule ?? '—'}</Td>
                <Td className="font-mono text-xs text-gray-500">{e.eventId ?? '—'}</Td>
                <Td className="text-right font-mono text-xs">
                  P{e.metadata?.partition ?? '?'} / {e.metadata?.offset ?? '?'}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const LiveTailCard: React.FC<{ topic: string }> = ({ topic }) => {
  const [messages, setMessages] = useState<LiveTailMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<LiveTailMessage[]>([]);

  const start = useCallback(() => {
    if (streaming) return;
    const token = localStorage.getItem('zorbit_token');
    if (!token) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    fetch(`${EVENT_BUS_BASE}/topics/${encodeURIComponent(topic)}/stream`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          setStreaming(false);
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const chunks = buf.split('\n\n');
          buf = chunks.pop() ?? '';
          for (const chunk of chunks) {
            const dataLine = chunk.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            try {
              const msg = JSON.parse(dataLine.slice(6)) as LiveTailMessage;
              bufferRef.current = [msg, ...bufferRef.current].slice(0, 200);
              setMessages([...bufferRef.current]);
            } catch {
              // ignore
            }
          }
        }
      })
      .catch(() => {
        setStreaming(false);
      });
  }, [topic, streaming]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Activity size={16} /> Live Tail
          {streaming && (
            <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
          )}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{messages.length} buffered</span>
          {!streaming ? (
            <button
              onClick={start}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <PlayCircle size={12} /> Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
            >
              <PauseCircle size={12} /> Stop
            </button>
          )}
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="px-5 py-4 text-sm text-gray-500">
          {streaming
            ? 'Listening… messages will appear here as they arrive.'
            : 'Click Start to begin streaming.'}
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 text-left dark:bg-gray-700/40">
              <tr>
                <Th className="w-32">Received</Th>
                <Th className="w-16 text-right">P/Off</Th>
                <Th>Key</Th>
                <Th>Payload</Th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m, i) => (
                <tr
                  key={`${m.partition}-${m.offset}-${i}`}
                  className="border-t border-gray-100 dark:border-gray-700/60"
                >
                  <Td className="whitespace-nowrap font-mono text-[11px] text-gray-500">
                    {new Date(m.receivedAt).toLocaleTimeString()}
                  </Td>
                  <Td className="text-right font-mono">
                    P{m.partition}/{m.offset}
                  </Td>
                  <Td className="font-mono text-[11px] text-gray-600">{m.key ?? '—'}</Td>
                  <Td className="font-mono text-[11px] text-gray-600">
                    <div className="max-w-3xl truncate">
                      {m.valueIsJson
                        ? JSON.stringify(m.value)
                        : String(m.value).slice(0, 200)}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tiny primitives
// ---------------------------------------------------------------------------

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
  </div>
);

const Th: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <th className={`px-4 py-2 text-[11px] font-semibold uppercase text-gray-500 ${className ?? ''}`}>
    {children}
  </th>
);

const Td: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={`px-4 py-2 ${className ?? ''}`}>{children}</td>
);

export default TopicDetailView;
