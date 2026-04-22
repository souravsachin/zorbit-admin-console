/**
 * PaymentGatewayPage — region-tabbed catalog of payment gateways.
 *
 * Tabs by region (North America, Europe/UK, India, Middle East, Southeast
 * Asia, LATAM, Africa). Gateway cards within each region show logo,
 * displayName, and click opens PaymentFormModal which carries a big red
 * NON-DISMISSIBLE sandbox banner.
 *
 * Route: /m/payment_gateway
 * Backend: GET /api/payment_gateway/api/v1/G/{orgId}/payment-gateways
 *
 * Added 2026-04-22 by Soldier BB.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import PaymentFormModal, { GatewayLite } from './PaymentFormModal';

interface PaymentGateway {
  hashId?: string;
  code: string;
  displayName: string;
  region?: string;
  logoUrl?: string;
  enabled?: boolean;
  config?: Record<string, unknown> | string;
}

const REGION_TABS: Array<{ key: string; label: string }> = [
  { key: 'north_america', label: 'North America' },
  { key: 'europe_uk', label: 'Europe / UK' },
  { key: 'india', label: 'India' },
  { key: 'middle_east', label: 'Middle East' },
  { key: 'southeast_asia', label: 'Southeast Asia' },
  { key: 'latam', label: 'LATAM' },
  { key: 'africa', label: 'Africa' },
];

// Fallback mapping of known gateway codes -> region, for payloads whose
// `region` field is missing or free-form.
const CODE_REGION_FALLBACK: Record<string, string> = {
  stripe: 'north_america',
  braintree: 'north_america',
  authorize_net: 'north_america',
  adyen: 'europe_uk',
  worldpay: 'europe_uk',
  checkout_com: 'europe_uk',
  razorpay: 'india',
  payu_india: 'india',
  ccavenue: 'india',
  upi: 'india',
  nach: 'india',
  telr: 'middle_east',
  payfort: 'middle_east',
  network_international: 'middle_east',
  omise: 'southeast_asia',
  paynow: 'southeast_asia',
  mercadopago: 'latam',
  ebanx: 'latam',
  paystack: 'africa',
  flutterwave: 'africa',
};

function regionKey(g: PaymentGateway): string {
  const r = (g.region || '').toLowerCase().replace(/[\s\-/]+/g, '_');
  for (const tab of REGION_TABS) {
    if (r === tab.key || r === tab.label.toLowerCase()) return tab.key;
  }
  if (CODE_REGION_FALLBACK[g.code.toLowerCase()]) return CODE_REGION_FALLBACK[g.code.toLowerCase()];
  return 'north_america';
}

const PaymentGatewayPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>(REGION_TABS[0].key);
  const [selected, setSelected] = useState<GatewayLite | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Org is derived server-side from JWT. Client endpoint uses underscore
    // slug per strict nomenclature. Fallback path `G/G` covers setups where
    // the BE expects a literal "G" scope id.
    api
      .get('/api/payment_gateway/api/v1/G/G/payment-gateways')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setGateways(Array.isArray(raw) ? raw : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load payment gateways');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byRegion = useMemo(() => {
    const map: Record<string, PaymentGateway[]> = {};
    for (const tab of REGION_TABS) map[tab.key] = [];
    for (const g of gateways) {
      const key = regionKey(g);
      (map[key] = map[key] || []).push(g);
    }
    return map;
  }, [gateways]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <CreditCard className="text-red-600" size={22} />
        <h1 className="text-2xl font-semibold">Payment Gateway</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
        Regional catalog of 40+ payment gateways. Click a card to open a familiar payment form.
        All gateways are sandbox / mock — no real money moves.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {REGION_TABS.map((tab) => {
            const count = byRegion[tab.key]?.length || 0;
            const active = tab.key === activeRegion;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveRegion(tab.key)}
                className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${
                  active
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} <span className="text-xs text-gray-400">({count})</span>
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-12 text-center">Loading…</div>
      ) : (byRegion[activeRegion]?.length || 0) === 0 ? (
        <div className="text-gray-400 text-sm py-12 text-center">
          No gateways registered for this region.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {byRegion[activeRegion].map((g) => (
            <button
              key={g.hashId || g.code}
              onClick={() =>
                setSelected({
                  code: g.code,
                  displayName: g.displayName,
                  region: activeRegion,
                })
              }
              disabled={g.enabled === false}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left transition-colors ${
                g.enabled === false
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-red-400 hover:shadow-md bg-white dark:bg-gray-800'
              }`}
            >
              <div className="h-12 w-24 mb-3 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                {g.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.logoUrl} alt={g.displayName} className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon size={20} className="text-gray-400" />
                )}
              </div>
              <div className="font-medium text-sm">{g.displayName}</div>
              <code className="text-xs text-gray-500">{g.code}</code>
            </button>
          ))}
        </div>
      )}

      {selected && <PaymentFormModal gateway={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default PaymentGatewayPage;
