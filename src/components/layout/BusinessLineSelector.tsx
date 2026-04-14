import React from 'react';

export type BusinessLine =
  | 'health' | 'motor' | 'marine' | 'property' | 'life'
  | 'uhc' | 'provider' | 'tpa' | 'broker' | 'regulator' | 'garage'
  | 'platform';

export const BUSINESS_LINE_LABELS: Record<BusinessLine, string> = {
  health:    'Health Insurance',
  motor:     'Motor Insurance',
  marine:    'Marine Insurance',
  property:  'Property Insurance',
  life:      'Life Insurance',
  uhc:       'UHC / Managed Care',
  provider:  'Healthcare Provider',
  tpa:       'TPA Suite',
  broker:    'Broker Suite',
  regulator: 'Regulator Suite',
  garage:    'Garage Suite',
  platform:  'All (Platform View)',
};

// Suite → tailwind-ish inline style config
const SUITE_STYLES: Record<BusinessLine, {
  bg: string;
  border: string;
  labelColor: string;
  activeColor: string;
  selectBorder: string;
}> = {
  health:    { bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#86efac', labelColor: '#15803d', activeColor: '#166534', selectBorder: '#86efac' },
  motor:     { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#93c5fd', labelColor: '#1d4ed8', activeColor: '#1e40af', selectBorder: '#93c5fd' },
  marine:    { bg: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border: '#5eead4', labelColor: '#0f766e', activeColor: '#115e59', selectBorder: '#5eead4' },
  property:  { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fcd34d', labelColor: '#b45309', activeColor: '#92400e', selectBorder: '#fcd34d' },
  life:      { bg: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', border: '#c4b5fd', labelColor: '#7c3aed', activeColor: '#6d28d9', selectBorder: '#c4b5fd' },
  uhc:       { bg: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', border: '#7dd3fc', labelColor: '#0284c7', activeColor: '#0369a1', selectBorder: '#7dd3fc' },
  provider:  { bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', border: '#6ee7b7', labelColor: '#059669', activeColor: '#047857', selectBorder: '#6ee7b7' },
  tpa:       { bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#fdba74', labelColor: '#c2410c', activeColor: '#9a3412', selectBorder: '#fdba74' },
  broker:    { bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#a78bfa', labelColor: '#7c3aed', activeColor: '#6d28d9', selectBorder: '#a78bfa' },
  regulator: { bg: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '#fca5a5', labelColor: '#dc2626', activeColor: '#b91c1c', selectBorder: '#fca5a5' },
  garage:    { bg: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', border: '#d1d5db', labelColor: '#6b7280', activeColor: '#4b5563', selectBorder: '#d1d5db' },
  platform:  { bg: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', border: '#a5b4fc', labelColor: '#4338ca', activeColor: '#3730a3', selectBorder: '#a5b4fc' },
};

interface BusinessLineSelectorProps {
  value: BusinessLine;
  onChange: (v: BusinessLine) => void;
}

const BusinessLineSelector: React.FC<BusinessLineSelectorProps> = ({ value, onChange }) => {
  const s = SUITE_STYLES[value] || SUITE_STYLES.platform;

  return (
    <div
      className="mx-2 my-1 rounded-lg overflow-hidden shrink-0 transition-all duration-300"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: s.labelColor }}>
          Business Line
        </span>
        <span className="text-[11px] font-semibold truncate ml-2" style={{ color: s.activeColor }}>
          {BUSINESS_LINE_LABELS[value]}
        </span>
      </div>
      <div className="px-2.5 pb-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BusinessLine)}
          className="w-full text-[11.5px] font-medium py-1.5 px-2 rounded-md outline-none cursor-pointer transition-colors"
          style={{
            border: `1px solid ${s.selectBorder}`,
            color: s.activeColor,
            background: 'rgba(255,255,255,0.9)',
          }}
        >
          <optgroup label="Platform">
            <option value="platform">All (Platform View)</option>
          </optgroup>
          <optgroup label="Insurance Lines">
            <option value="health">Health Insurance</option>
            <option value="motor">Motor Insurance</option>
            <option value="marine">Marine Insurance</option>
            <option value="property">Property Insurance</option>
            <option value="life">Life Insurance</option>
          </optgroup>
          <optgroup label="Specialized Suites">
            <option value="uhc">UHC / Managed Care</option>
            <option value="provider">Healthcare Provider</option>
            <option value="tpa">TPA Suite</option>
            <option value="broker">Broker Suite</option>
            <option value="regulator">Regulator Suite</option>
            <option value="garage">Garage Suite</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
};

export default BusinessLineSelector;
