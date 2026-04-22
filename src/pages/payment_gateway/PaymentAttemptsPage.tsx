/**
 * PaymentAttemptsPage — history DataTable of sandbox payment attempts.
 *
 * Route: /m/payment_gateway/payment_attempts
 * Backend: GET /api/payment_gateway/api/v1/G/G/payment-attempts
 */
import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/shared/DataTable';

interface PaymentAttempt {
  hashId: string;
  gatewayCode: string;
  amount: number;
  currency: string;
  status: string;
  mockResponse?: string;
  createdAt?: string;
}

const statusClass = (status: string): string => {
  switch ((status || '').toLowerCase()) {
    case 'succeeded':
    case 'captured':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800';
    case 'failed':
    case 'declined':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800';
    case 'pending':
    case 'authorizing':
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800';
    default:
      return 'inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700';
  }
};

const PaymentAttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/payment_gateway/api/v1/G/G/payment-attempts')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setAttempts(Array.isArray(raw) ? raw : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load attempts');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo<Column<PaymentAttempt>[]>(
    () => [
      {
        key: 'hashId',
        header: 'Attempt',
        render: (r) => <code className="text-xs font-mono">{r.hashId}</code>,
      },
      {
        key: 'gatewayCode',
        header: 'Gateway',
        render: (r) => <span className="text-sm">{r.gatewayCode}</span>,
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (r) => (
          <span className="text-sm font-medium">
            {r.currency} {Number(r.amount).toFixed(2)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (r) => <span className={statusClass(r.status)}>{r.status}</span>,
      },
      {
        key: 'mockResponse',
        header: 'Mock Response',
        render: (r) => (
          <span className="text-xs font-mono text-gray-600 line-clamp-1">{r.mockResponse || '—'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <CreditCard className="text-red-600" size={22} />
        <h1 className="text-2xl font-semibold">Payment Attempts</h1>
      </div>

      <div
        role="alert"
        className="bg-red-600 text-white font-bold text-sm py-2 px-4 border-2 border-red-800 rounded"
      >
        UAT / SANDBOX — all attempts below are mock. Nothing touches real payment networks.
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={attempts}
        loading={loading}
        emptyMessage="No sandbox attempts recorded yet."
      />
    </div>
  );
};

export default PaymentAttemptsPage;
