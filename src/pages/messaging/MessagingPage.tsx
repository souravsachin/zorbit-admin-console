import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, X, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import {
  messagingService,
  Topic,
  DLQEntry,
  HealthStatus,
  BrokerTopic,
  BrokerConsumerGroup,
  BrokerDrift,
  BrokerMessagesResult,
  ConsumerGroupAssignment,
} from '../../services/messaging';
import Select from '../../components/shared/Select';

type Tab = 'topics' | 'broker-topics' | 'consumer-groups' | 'drift' | 'dlq';

const topicColumns: Column<Topic>[] = [
  { key: 'hashId', header: 'Hash ID', render: (t) => <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t.hashId}</code> },
  { key: 'name', header: 'Topic Name' },
  { key: 'partitions', header: 'Partitions' },
  { key: 'replicationFactor', header: 'Replication' },
  { key: 'retentionMs', header: 'Retention', render: (t) => `${Math.round(t.retentionMs / 86400000)}d` },
  { key: 'createdAt', header: 'Created', render: (t) => new Date(t.createdAt).toLocaleDateString() },
];

const brokerTopicColumns: Column<BrokerTopic>[] = [
  {
    key: 'name',
    header: 'Topic Name',
    render: (t) => (
      <span className="font-mono text-sm">
        {t.name}
        {t.isInternal && (
          <span className="ml-2 text-[10px] uppercase text-gray-400">internal</span>
        )}
      </span>
    ),
  },
  { key: 'partitions', header: 'Partitions' },
  { key: 'replicationFactor', header: 'Replication' },
  {
    key: 'leader',
    header: 'Leader(s)',
    render: (t) => Array.from(new Set(t.partitionDetails.map((p) => p.leader))).join(', '),
  },
  {
    key: 'isr',
    header: 'ISR',
    render: (t) => {
      const allReplicas = t.partitionDetails.length > 0 ? t.partitionDetails[0].replicas.length : 0;
      const minIsr = t.partitionDetails.reduce(
        (min, p) => Math.min(min, p.isr.length),
        Number.MAX_SAFE_INTEGER,
      );
      const healthy = t.partitionDetails.length === 0 || minIsr >= allReplicas;
      return (
        <span className={healthy ? 'text-green-600' : 'text-amber-600'}>
          {t.partitionDetails.map((p) => `P${p.partition}:[${p.isr.join(',')}]`).join(' ')}
        </span>
      );
    },
  },
  {
    key: 'messageCount',
    header: 'Messages',
    render: (t) => t.messageCount.toLocaleString(),
  },
];

const consumerGroupColumns: Column<BrokerConsumerGroup>[] = [
  { key: 'groupId', header: 'Group ID', render: (g) => <span className="font-mono text-sm">{g.groupId}</span> },
  {
    key: 'state',
    header: 'State',
    render: (g) => (
      <StatusBadge
        label={g.state}
        variant={g.state === 'Stable' ? 'success' : g.state === 'Empty' ? 'neutral' : 'warning'}
      />
    ),
  },
  { key: 'memberCount', header: 'Members' },
  {
    key: 'topics',
    header: 'Topics',
    render: (g) => {
      const topics = Array.from(new Set(g.assignments.map((a) => a.topic)));
      return topics.length === 0 ? (
        <span className="text-gray-400 text-xs">—</span>
      ) : (
        <span className="text-sm font-mono">{topics.join(', ')}</span>
      );
    },
  },
  {
    key: 'lag',
    header: 'Total Lag',
    render: (g) => {
      const total = g.assignments.reduce((sum, a) => sum + a.lag, 0);
      return (
        <span className={total === 0 ? 'text-green-600' : 'text-amber-600'}>
          {total.toLocaleString()}
        </span>
      );
    },
  },
];

const assignmentColumns: Column<ConsumerGroupAssignment & { groupId: string }>[] = [
  { key: 'groupId', header: 'Group', render: (a) => <span className="font-mono text-xs">{a.groupId}</span> },
  { key: 'topic', header: 'Topic', render: (a) => <span className="font-mono text-xs">{a.topic}</span> },
  { key: 'partition', header: 'Part' },
  { key: 'currentOffset', header: 'Current' },
  { key: 'logEndOffset', header: 'End' },
  {
    key: 'lag',
    header: 'Lag',
    render: (a) => (
      <span className={a.lag === 0 ? 'text-green-600' : 'text-amber-600'}>{a.lag}</span>
    ),
  },
];

const dlqColumns: Column<DLQEntry>[] = [
  { key: 'id', header: 'ID', render: (d) => <code className="text-xs">{d.id}</code> },
  { key: 'topic', header: 'Original Topic' },
  { key: 'error', header: 'Error', render: (d) => <span className="text-red-600 text-xs">{d.error}</span> },
  { key: 'retryCount', header: 'Retries' },
  { key: 'timestamp', header: 'Timestamp', render: (d) => new Date(d.timestamp).toLocaleString() },
];

const MessagingPage: React.FC = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dlq, setDlq] = useState<DLQEntry[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [brokerTopics, setBrokerTopics] = useState<BrokerTopic[]>([]);
  const [consumerGroups, setConsumerGroups] = useState<BrokerConsumerGroup[]>([]);
  const [drift, setDrift] = useState<BrokerDrift | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesTopic, setMessagesTopic] = useState<string | null>(null);
  const [messagesResult, setMessagesResult] = useState<BrokerMessagesResult | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesLimit, setMessagesLimit] = useState(20);

  const openMessages = async (topic: string, limit = messagesLimit) => {
    setMessagesTopic(topic);
    setMessagesLoading(true);
    setMessagesResult(null);
    try {
      const res = await messagingService.getBrokerMessages(topic, limit);
      setMessagesResult(res.data);
    } catch (err) {
      toast(`Failed to read messages from ${topic}`, 'error');
      setMessagesResult(null);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [topicsRes, dlqRes, healthRes, brokerRes, groupsRes, driftRes] = await Promise.allSettled([
          messagingService.getTopics(),
          messagingService.getDLQ(),
          messagingService.getHealth(),
          messagingService.getBrokerTopics(),
          messagingService.getBrokerConsumerGroups(),
          messagingService.getBrokerDrift(),
        ]);
        if (topicsRes.status === 'fulfilled') setTopics(Array.isArray(topicsRes.value.data) ? topicsRes.value.data : []);
        if (dlqRes.status === 'fulfilled') setDlq(Array.isArray(dlqRes.value.data) ? dlqRes.value.data : []);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
        if (brokerRes.status === 'fulfilled') setBrokerTopics(Array.isArray(brokerRes.value.data) ? brokerRes.value.data : []);
        if (groupsRes.status === 'fulfilled') setConsumerGroups(Array.isArray(groupsRes.value.data) ? groupsRes.value.data : []);
        if (driftRes.status === 'fulfilled') setDrift(driftRes.value.data);
      } catch {
        toast('Failed to load messaging data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const nonInternalBrokerTopics = brokerTopics.filter((t) => !t.isInternal);
  const allAssignments: Array<ConsumerGroupAssignment & { groupId: string }> = consumerGroups.flatMap((g) =>
    g.assignments.map((a) => ({ ...a, groupId: g.groupId })),
  );

  const tabButton = (key: Tab, label: string, count?: number, highlight?: boolean) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        tab === key
          ? 'border-primary-600 text-primary-600'
          : highlight
            ? 'border-transparent text-amber-600 hover:text-amber-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {highlight && <AlertTriangle size={14} className="inline mr-1" />}
      {label}
      {typeof count === 'number' && <span className="ml-1 opacity-70">({count})</span>}
    </button>
  );

  const driftCount = drift
    ? drift.inBrokerNotInRegistry.length + drift.inRegistryNotInBroker.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messaging</h1>
        {health && (
          <div className="flex items-center space-x-2">
            <Activity size={18} className={health.status === 'healthy' ? 'text-green-500' : 'text-red-500'} />
            <StatusBadge label={health.status || 'unknown'} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap space-x-1 border-b border-gray-200 dark:border-gray-700">
        {tabButton('topics', 'Topics (Registry)', topics.length)}
        {tabButton('broker-topics', 'Broker Topics (Live)', nonInternalBrokerTopics.length)}
        {tabButton('consumer-groups', 'Consumer Groups', consumerGroups.length)}
        {tabButton('drift', 'Drift', driftCount, driftCount > 0)}
        {tabButton('dlq', 'Dead Letter Queue', dlq.length)}
      </div>

      {tab === 'topics' && (
        <>
          <p className="text-xs text-gray-500">
            From Postgres <code>zorbit_messaging.topics</code> — declared/registered topic names. May not match real Kafka state.
          </p>
          <DataTable columns={topicColumns} data={topics} loading={loading} emptyMessage="No topics found" />
        </>
      )}

      {tab === 'broker-topics' && (
        <>
          <p className="text-xs text-gray-500">
            Live from Kafka broker via AdminClient. Equivalent to <code>kafka-topics.sh --describe</code>.
            Click any row to browse the last {messagesLimit} messages.
          </p>
          <DataTable
            columns={brokerTopicColumns}
            data={nonInternalBrokerTopics}
            loading={loading}
            emptyMessage="Broker returned no topics (admin client may be disconnected)"
            onRowClick={(t) => openMessages(t.name)}
          />
        </>
      )}

      {tab === 'consumer-groups' && (
        <>
          <p className="text-xs text-gray-500">
            Live subscribers with per-partition lag. Equivalent to <code>kafka-consumer-groups.sh --describe --all-groups</code>.
          </p>
          <DataTable
            columns={consumerGroupColumns}
            data={consumerGroups}
            loading={loading}
            emptyMessage="No consumer groups"
          />
          {allAssignments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Partition assignments</h3>
              <DataTable
                columns={assignmentColumns}
                data={allAssignments}
                loading={false}
                emptyMessage=""
              />
            </div>
          )}
        </>
      )}

      {tab === 'drift' && drift && (
        <div className="space-y-6">
          <p className="text-xs text-gray-500">
            Compares registry (Postgres) with broker (Kafka). Topics in one but not the other indicate platform drift.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-amber-600 mb-2">
              In Kafka broker but NOT in registry ({drift.inBrokerNotInRegistry.length}) — rogue / orphan
            </h3>
            {drift.inBrokerNotInRegistry.length === 0 ? (
              <p className="text-xs text-gray-500">None</p>
            ) : (
              <ul className="list-disc pl-6 text-sm font-mono">
                {drift.inBrokerNotInRegistry.map((n) => (
                  <li key={n} className="text-amber-700">
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-600 mb-2">
              In registry but NOT in Kafka broker ({drift.inRegistryNotInBroker.length}) — aspirational / never created
            </h3>
            {drift.inRegistryNotInBroker.length === 0 ? (
              <p className="text-xs text-gray-500">None</p>
            ) : (
              <ul className="list-disc pl-6 text-sm font-mono">
                {drift.inRegistryNotInBroker.map((n) => (
                  <li key={n} className="text-blue-700">
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-600 mb-2">
              Matched ({drift.matched.length})
            </h3>
            {drift.matched.length === 0 ? (
              <p className="text-xs text-gray-500">None</p>
            ) : (
              <ul className="list-disc pl-6 text-sm font-mono text-green-700">
                {drift.matched.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'dlq' && (
        <DataTable columns={dlqColumns} data={dlq} loading={loading} emptyMessage="No dead letter entries" />
      )}

      {messagesTopic && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMessagesTopic(null)} />
          <div className="relative ml-auto w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-mono">{messagesTopic}</h2>
                {messagesResult && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {messagesResult.returned} of {messagesResult.totalMessages.toLocaleString()} total
                    {messagesResult.note && <span className="text-amber-600 ml-2">— {messagesResult.note}</span>}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={String(messagesLimit)}
                  onChange={(v) => {
                    const n = parseInt(v, 10);
                    setMessagesLimit(n);
                    openMessages(messagesTopic, n);
                  }}
                  options={[10, 20, 50, 100, 200].map((n) => ({ value: String(n), label: String(n) }))}
                  minWidth={80}
                />
                <button
                  onClick={() => openMessages(messagesTopic, messagesLimit)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Refresh"
                >
                  <RefreshCw size={16} className={messagesLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setMessagesTopic(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {messagesLoading && <p className="text-sm text-gray-500">Reading from broker...</p>}
              {!messagesLoading && messagesResult && messagesResult.messages.length === 0 && (
                <p className="text-sm text-gray-500">No messages.</p>
              )}
              {!messagesLoading &&
                messagesResult?.messages.map((m) => (
                  <div
                    key={`${m.partition}-${m.offset}`}
                    className="border border-gray-200 dark:border-gray-700 rounded p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2 text-gray-500">
                      <span className="font-mono">
                        P{m.partition} · offset {m.offset}
                        {m.key && <span className="ml-2">key: <code className="text-gray-700 dark:text-gray-300">{m.key}</code></span>}
                      </span>
                      <span>{new Date(m.timestamp).toLocaleString()}</span>
                    </div>
                    {m.valueIsJson ? (
                      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto text-[11px] whitespace-pre-wrap break-all">
                        {JSON.stringify(m.value, null, 2)}
                      </pre>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-[11px] break-all">
                        {String(m.value)}
                      </div>
                    )}
                    {Object.keys(m.headers).length > 0 && (
                      <div className="mt-2 text-[10px] text-gray-500">
                        Headers: {Object.entries(m.headers).map(([k, v]) => `${k}=${v}`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
