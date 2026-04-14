import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, DollarSign, Plus, Filter, Loader2 } from 'lucide-react';
import Card from '../../components/shared/Card';
import api from '../../services/api';
import { API_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Quotation {
  hashId: string;
  quotationNumber?: string;
  proposerName?: string;
  productCode?: string;
  channel?: string;
  status?: string;
  totalPremium?: number;
  createdAt: string;
}

interface BrokerStats {
  total: number;
  pending: number;
  approved: number;
  totalPremium: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const BrokerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.organizationId || 'O-DEMO';

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  async function fetchQuotations() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(
        `${API_CONFIG.HI_QUOTATION_URL}/api/v1/O/${orgId}/hi-quotation/quotations`,
        { params: { channel: 'broker' } },
      );
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setQuotations(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  /* Stats derived from loaded data */
  const stats: BrokerStats = useMemo(() => {
    const s = { total: 0, pending: 0, approved: 0, totalPremium: 0 };
    for (const q of quotations) {
      s.total++;
      const st = (q.status || '').toLowerCase();
      if (st === 'pending' || st === 'draft' || st === 'submitted') s.pending++;
      if (st === 'approved' || st === 'accepted') s.approved++;
      s.totalPremium += q.totalPremium || 0;
    }
    return s;
  }, [quotations]);

  /* Apply client-side filters */
  const filtered = useMemo(() => {
    let list = quotations;
    if (statusFilter !== 'all') {
      list = list.filter((q) => (q.status || '').toLowerCase() === statusFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((q) => new Date(q.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // end of day
      list = list.filter((q) => new Date(q.createdAt).getTime() < to);
    }
    return list;
  }, [quotations, statusFilter, dateFrom, dateTo]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(n);

  const statusColor = (s: string) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'approved' || lower === 'accepted') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (lower === 'pending' || lower === 'draft' || lower === 'submitted') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (lower === 'rejected' || lower === 'declined') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6" data-testid="broker-dashboard">
      {/* Welcome banner */}
      <div className="flex items-center justify-between" data-testid="broker-welcome">
        <div>
          <h1 className="text-2xl font-bold">Broker Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome, {user?.displayName || 'Broker'}
          </p>
        </div>
        <button
          data-testid="btn-create-application"
          onClick={() => navigate('/hi-quotation/new')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Application
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="broker-stats">
        <Card icon={FileText} label="My Applications" value={stats.total} />
        <Card icon={Clock} label="Pending" value={stats.pending} color="text-yellow-600" />
        <Card icon={CheckCircle2} label="Approved" value={stats.approved} color="text-green-600" />
        <Card icon={DollarSign} label="Total Premium (AED)" value={formatCurrency(stats.totalPremium)} />
      </div>

      {/* Filter bar */}
      <div className="card p-4 flex flex-wrap items-center gap-4" data-testid="broker-filters">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filters</span>
        </div>
        <select
          data-testid="filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          data-testid="filter-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="input-field w-40"
          placeholder="From"
        />
        <input
          data-testid="filter-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="input-field w-40"
          placeholder="To"
        />
      </div>

      {/* Application list table */}
      <div className="card overflow-hidden" data-testid="broker-application-list">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Applications ({filtered.length})</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading applications...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-red-500" data-testid="broker-error">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400" data-testid="broker-empty">
            No applications found. Create your first application to get started.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="broker-table">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Quotation #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Channel</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((q) => (
                  <tr key={q.hashId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30" data-testid={`row-${q.hashId}`}>
                    <td className="px-4 py-3 font-mono text-xs">{q.quotationNumber || q.hashId}</td>
                    <td className="px-4 py-3">{q.proposerName || '---'}</td>
                    <td className="px-4 py-3">{q.productCode || '---'}</td>
                    <td className="px-4 py-3 capitalize">{q.channel || 'broker'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(q.status || '')}`}>
                        {q.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        data-testid={`btn-view-${q.hashId}`}
                        onClick={() => navigate(`/hi-quotation/${q.hashId}`)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerDashboardPage;
