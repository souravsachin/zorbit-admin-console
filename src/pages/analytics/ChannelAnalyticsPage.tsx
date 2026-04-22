import React, { useEffect, useState } from 'react';
import { BarChart3, DollarSign, TrendingUp, Percent, Loader2, RefreshCw } from 'lucide-react';
import Card from '../../components/shared/Card';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChannelData {
  channel: string;
  count: number;
  totalPremium?: number;
  conversionRate?: number;
}

interface SourceData {
  source: string;
  count: number;
  totalPremium?: number;
}

interface BrokerData {
  brokerName?: string;
  brokerHashId?: string;
  count: number;
  totalPremium?: number;
}

/* ------------------------------------------------------------------ */
/*  CSS-only horizontal bar                                            */
/* ------------------------------------------------------------------ */

const BAR_COLORS = [
  'bg-primary-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-orange-500',
];

function HorizontalBar({
  items,
  labelKey,
  valueKey,
  testIdPrefix,
}: {
  items: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  testIdPrefix: string;
}) {
  const maxVal = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <div className="space-y-3" data-testid={`${testIdPrefix}-bars`}>
      {items.map((item, idx) => {
        const val = Number(item[valueKey]) || 0;
        const pct = Math.round((val / maxVal) * 100);
        return (
          <div key={item[labelKey] || idx} data-testid={`${testIdPrefix}-bar-${idx}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium capitalize">{item[labelKey] || 'Unknown'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{val.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No data available</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ChannelAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || 'O-DEMO';

  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [brokers, setBrokers] = useState<BrokerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError('');
    try {
      const base = `${API_CONFIG.HI_QUOTATION_URL}/api/v1/O/${orgId}/hi_quotation/analytics`;
      const [chRes, srcRes, brkRes] = await Promise.allSettled([
        api.get(`${base}/channels`),
        api.get(`${base}/sources`),
        api.get(`${base}/brokers`),
      ]);

      if (chRes.status === 'fulfilled') {
        const d = chRes.value.data;
        setChannels(Array.isArray(d) ? d : d?.data ?? []);
      }
      if (srcRes.status === 'fulfilled') {
        const d = srcRes.value.data;
        setSources(Array.isArray(d) ? d : d?.data ?? []);
      }
      if (brkRes.status === 'fulfilled') {
        const d = brkRes.value.data;
        setBrokers(Array.isArray(d) ? d : d?.data ?? []);
      }

      // If all three failed, show error
      if (
        chRes.status === 'rejected' &&
        srcRes.status === 'rejected' &&
        brkRes.status === 'rejected'
      ) {
        setError('Failed to load analytics data');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  /* Summary stats derived from channel data */
  const totalQuotations = channels.reduce((s, c) => s + (c.count || 0), 0);
  const totalPremium = channels.reduce((s, c) => s + (c.totalPremium || 0), 0);
  const avgPremium = totalQuotations > 0 ? Math.round(totalPremium / totalQuotations) : 0;
  const avgConversion =
    channels.length > 0
      ? Math.round(channels.reduce((s, c) => s + (c.conversionRate || 0), 0) / channels.length)
      : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(n);

  /* Broker leaderboard sorted by count descending */
  const rankedBrokers = [...brokers].sort((a, b) => (b.count || 0) - (a.count || 0));

  return (
    <div className="space-y-6" data-testid="channel-analytics">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channel Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Channel performance and distribution</p>
        </div>
        <button
          data-testid="btn-refresh"
          onClick={fetchAll}
          className="btn btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading analytics...
        </div>
      )}

      {!loading && error && (
        <div className="card p-8 text-center text-red-500" data-testid="analytics-error">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="analytics-summary">
            <Card icon={BarChart3} label="Total Quotations" value={totalQuotations.toLocaleString()} />
            <Card icon={DollarSign} label="Total Premium" value={formatCurrency(totalPremium)} />
            <Card icon={TrendingUp} label="Avg Premium" value={formatCurrency(avgPremium)} />
            <Card icon={Percent} label="Conversion Rate" value={`${avgConversion}%`} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel breakdown */}
            <div className="card p-6" data-testid="channel-breakdown">
              <h2 className="font-semibold mb-4">Channel Breakdown</h2>
              <HorizontalBar
                items={channels}
                labelKey="channel"
                valueKey="count"
                testIdPrefix="channel"
              />
            </div>

            {/* Source breakdown */}
            <div className="card p-6" data-testid="source-breakdown">
              <h2 className="font-semibold mb-4">Source Breakdown</h2>
              <HorizontalBar
                items={sources}
                labelKey="source"
                valueKey="count"
                testIdPrefix="source"
              />
            </div>
          </div>

          {/* Broker leaderboard */}
          <div className="card overflow-hidden" data-testid="broker-leaderboard">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Broker Leaderboard</h2>
            </div>
            {rankedBrokers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No broker data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="broker-leaderboard-table">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Broker</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Applications</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {rankedBrokers.map((b, idx) => (
                      <tr
                        key={b.brokerHashId || idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30"
                        data-testid={`broker-row-${idx}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{b.brokerName || b.brokerHashId || 'Unknown'}</td>
                        <td className="px-4 py-3 text-right">{(b.count || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(b.totalPremium || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelAnalyticsPage;
