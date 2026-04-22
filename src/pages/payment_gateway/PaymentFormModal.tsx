/**
 * PaymentFormModal — familiar payment form appropriate to gateway type.
 *
 * Renders Card / UPI / NACH form based on inferred gateway type from code.
 * Tops every variant with a NON-DISMISSIBLE bright-red banner warning about
 * the sandbox/UAT-only nature of this system.
 *
 * POSTs to /api/payment_gateway/api/v1/G/G/payment-attempts on submit.
 */
import React, { useMemo, useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Loader2, AlertTriangle, Send } from 'lucide-react';

export interface GatewayLite {
  code: string;
  displayName: string;
  region?: string;
}

interface Props {
  gateway: GatewayLite;
  onClose: () => void;
}

type FormKind = 'card' | 'upi' | 'nach' | 'wallet';

function formKindFor(code: string): FormKind {
  const c = code.toLowerCase();
  if (c === 'upi' || c.includes('upi')) return 'upi';
  if (c === 'nach' || c.includes('nach')) return 'nach';
  if (c.includes('wallet') || c === 'paypal' || c === 'paytm') return 'wallet';
  return 'card';
}

const BANNER = (
  <div
    role="alert"
    aria-live="assertive"
    className="bg-red-600 text-white font-bold text-xl py-4 px-6 border-4 border-red-800 rounded mb-4"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5" size={26} aria-hidden="true" />
      <div>
        <div className="uppercase">UAT / SANDBOX ENVIRONMENT — DO NOT ENTER REAL CARD OR BANK DETAILS.</div>
        <div className="text-sm font-semibold mt-1">
          This system is NOT PCI-DSS compliant. For testing only.
        </div>
      </div>
    </div>
  </div>
);

const PaymentFormModal: React.FC<Props> = ({ gateway, onClose }) => {
  const kind = useMemo(() => formKindFor(gateway.code), [gateway.code]);
  const [amount, setAmount] = useState<string>('99.00');
  const [currency, setCurrency] = useState<string>('USD');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState<string>('DEMO USER');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('123');

  // UPI
  const [vpa, setVpa] = useState<string>('demo@upi');

  // NACH
  const [accountName, setAccountName] = useState<string>('DEMO ACCOUNT');
  const [accountNumber, setAccountNumber] = useState<string>('000000000000');
  const [ifsc, setIfsc] = useState<string>('DEMO0000000');
  const [mandateAmount, setMandateAmount] = useState<string>('99.00');
  const [frequency, setFrequency] = useState<string>('monthly');

  // Wallet
  const [walletId, setWalletId] = useState<string>('demo@paypal');

  const submit = async () => {
    setError(null);
    setResult(null);
    setSubmitting(true);
    const body: Record<string, unknown> = {
      gatewayCode: gateway.code,
      amount: Number(amount),
      currency,
      kind,
    };
    if (kind === 'card') body.card = { number: cardNumber.replace(/\s+/g, ''), holder: cardHolder, expiry, cvv };
    if (kind === 'upi') body.upi = { vpa };
    if (kind === 'nach') body.nach = { accountName, accountNumber, ifsc, mandateAmount, frequency };
    if (kind === 'wallet') body.wallet = { walletId };

    try {
      const res = await api.post('/api/payment_gateway/api/v1/G/G/payment-attempts', body);
      const payload = res.data?.data ?? res.data;
      setResult(
        `Sandbox attempt submitted. hashId=${payload?.hashId || 'n/a'}, status=${payload?.status || 'n/a'}`,
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Pay via ${gateway.displayName}`}>
      {BANNER}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm uppercase bg-white dark:bg-gray-800"
              disabled={submitting}
              maxLength={3}
            />
          </div>
        </div>

        {kind === 'card' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Card number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Cardholder</label>
              <input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Expiry (MM/YY)</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800"
                  disabled={submitting}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {kind === 'upi' && (
          <div>
            <label className="block text-xs font-medium mb-1">UPI VPA</label>
            <input
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
              disabled={submitting}
              placeholder="name@bank"
            />
          </div>
        )}

        {kind === 'nach' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Account holder</label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Account number</label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">IFSC</label>
                <input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Mandate amount</label>
                <input
                  type="number"
                  value={mandateAmount}
                  onChange={(e) => setMandateAmount(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  disabled={submitting}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {kind === 'wallet' && (
          <div>
            <label className="block text-xs font-medium mb-1">Wallet id</label>
            <input
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
              disabled={submitting}
            />
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded text-sm">{error}</div>
        )}
        {result && (
          <div className="p-2 bg-green-50 border border-green-200 text-green-800 rounded text-sm font-mono">
            {result}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Close
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            {submitting ? 'Submitting…' : 'Submit sandbox attempt'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentFormModal;
