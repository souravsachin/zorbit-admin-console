import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';

interface RegionCard {
  flag: string;
  name: string;
  label: string;
  description: string;
  route: string;
  color: string;
  bg: string;
  features: string[];
}

const REGIONS: RegionCard[] = [
  {
    flag: '\u{1F1EE}\u{1F1F3}',
    name: 'India',
    label: 'India Market',
    description: 'IRDAI-compliant health insurance application with PAN/Aadhaar KYC, floater plans, and GST 18% tax calculation.',
    route: 'india',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    features: ['Floater / Multi-Individual plans', 'PAN & Aadhaar KYC', 'IRDAI medical questions', 'GST 18%', 'ABHA ID', 'Portability support'],
  },
  {
    flag: '\u{1F1E6}\u{1F1EA}',
    name: 'UAE',
    label: 'UAE Market',
    description: 'DHA/DOH-compliant health insurance application with Emirates ID, network tier selection, and VAT 5%.',
    route: 'uae',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    features: ['Individual plans only', 'Emirates ID mandatory', 'DHA/DOH compliance', 'VAT 5%', 'Network tiers (Platinum-Bronze)', 'Certificate of Continuity'],
  },
  {
    flag: '\u{1F1FA}\u{1F1F8}',
    name: 'United States',
    label: 'US Market',
    description: 'ACA-compliant health insurance application with metal tier plans, SSN, subsidies, and HIPAA compliance.',
    route: 'us',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    features: ['Metal tiers (Bronze-Platinum)', 'SSN required', 'ACA mandate', 'Premium tax credits', 'No pre-existing exclusions', 'HIPAA compliant'],
  },
  {
    flag: '\u{1F1F8}\u{1F1E6}',
    name: 'Saudi Arabia',
    label: 'KSA Market',
    description: 'CCHI-compliant health insurance with Iqama ID, cooperative insurance model, and VAT 15%.',
    route: 'saudi-arabia',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    features: ['Cooperative insurance model', 'Iqama ID mandatory', 'CCHI compliance', 'VAT 15%', 'Essential Benefits Package', 'Saudization rules'],

  },
  {
    flag: '\u{1F1E7}\u{1F1ED}',
    name: 'Bahrain',
    label: 'Bahrain Market',
    description: 'CBB-regulated health insurance with CPR number, mandatory coverage, and no VAT.',
    route: 'bahrain',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    features: ['CBB regulation', 'CPR number required', 'Mandatory health coverage', 'No VAT', 'Expat worker plans', 'SIO integration'],

  },
  {
    flag: '\u{1F1F4}\u{1F1F2}',
    name: 'Oman',
    label: 'Oman Market',
    description: 'CMA-regulated health insurance with mandatory expat coverage and civil ID requirement.',
    route: 'oman',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    features: ['CMA regulation', 'Civil ID mandatory', 'Mandatory expat coverage', 'No VAT', 'Daman Health integration', 'Unified policy format'],

  },
  {
    flag: '\u{1F1F6}\u{1F1E6}',
    name: 'Qatar',
    label: 'Qatar Market',
    description: 'QCB-regulated health insurance with QID, mandatory coverage for residents, and no income tax.',
    route: 'qatar',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    features: ['QCB regulation', 'QID mandatory', 'Mandatory resident coverage', 'No VAT', 'PHCC network', 'Hamad Medical integration'],

  },
  {
    flag: '\u{1F1F0}\u{1F1FC}',
    name: 'Kuwait',
    label: 'Kuwait Market',
    description: 'MOH-regulated health insurance with civil ID, mandatory expat health coverage.',
    route: 'kuwait',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    features: ['MOH regulation', 'Civil ID mandatory', 'Mandatory expat coverage', 'No VAT', 'Government hospital network', 'Afya scheme'],

  },
  {
    flag: '\u{1F1EC}\u{1F1E7}',
    name: 'United Kingdom',
    label: 'UK Market',
    description: 'FCA-regulated private medical insurance with NHS supplement plans and IPT 12%.',
    route: 'uk',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    features: ['FCA regulation', 'NHS number reference', 'IPT 12%', 'PMI supplement plans', 'Moratorium underwriting', 'Mental health parity'],

  },
  {
    flag: '\u{1F1E9}\u{1F1EA}',
    name: 'Germany',
    label: 'Germany Market',
    description: 'BaFin-regulated private health insurance (PKV) with dual public/private system and income threshold.',
    route: 'germany',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    features: ['BaFin regulation', 'PKV/GKV dual system', 'Income threshold rules', 'VAT exempt', 'Standardized tariffs', 'Altersruckstellung reserves'],

  },
  {
    flag: '\u{1F1F8}\u{1F1EC}',
    name: 'Singapore',
    label: 'Singapore Market',
    description: 'MAS-regulated health insurance with MediShield Life integration, NRIC, and GST 9%.',
    route: 'singapore',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    features: ['MAS regulation', 'NRIC mandatory', 'MediShield Life top-up', 'GST 9%', 'Integrated Shield Plans', 'Medisave payable'],

  },
  {
    flag: '\u{1F1ED}\u{1F1F0}',
    name: 'Hong Kong',
    label: 'Hong Kong Market',
    description: 'IA-regulated health insurance with VHIS certified plans, HKID, and no sales tax.',
    route: 'hong-kong',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    features: ['IA regulation', 'HKID mandatory', 'VHIS certified plans', 'No sales tax', 'Tax deduction eligible', 'Standard/Flexi plan tiers'],

  },
  {
    flag: '\u{1F1FF}\u{1F1E6}',
    name: 'South Africa',
    label: 'South Africa Market',
    description: 'CMS-regulated medical schemes with PMB coverage, ID number, and VAT 15%.',
    route: 'south-africa',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    features: ['CMS regulation', 'SA ID number', 'PMB mandatory coverage', 'VAT 15%', 'Medical scheme plans', 'Gap cover options'],

  },
  {
    flag: '\u{1F1E6}\u{1F1FA}',
    name: 'Australia',
    label: 'Australia Market',
    description: 'APRA-regulated private health insurance with Medicare integration, LHC loading, and GST-free.',
    route: 'australia',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    features: ['APRA regulation', 'Medicare number', 'LHC age loading', 'GST-free', 'Rebate tier system', 'Hospital/Extras cover'],

  },
  {
    flag: '\u{1F1E8}\u{1F1E6}',
    name: 'Canada',
    label: 'Canada Market',
    description: 'Provincial regulator-overseen supplemental health insurance with SIN, and provincial tax variations.',
    route: 'canada',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    features: ['Provincial regulation', 'SIN reference', 'Supplemental to public', 'Provincial tax varies', 'Drug/dental/vision plans', 'Group benefit plans'],

  },
  {
    flag: '\u{1F1E7}\u{1F1F7}',
    name: 'Brazil',
    label: 'Brazil Market',
    description: 'ANS-regulated health insurance with CPF, mandatory coverage rules, and ISS tax.',
    route: 'brazil',
    color: 'text-lime-600 dark:text-lime-400',
    bg: 'bg-lime-50 dark:bg-lime-900/20',
    features: ['ANS regulation', 'CPF mandatory', 'Mandatory coverage rules', 'ISS tax applicable', 'Individual/corporate plans', 'SUS supplement plans'],

  },
];

const RegionSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegionClick = (region: RegionCard) => {
    navigate(region.route);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40">
          <Globe className="w-7 h-7 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Health Insurance Application</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a region to begin the application process. Each region has localized fields, currencies, and compliance requirements.
          </p>
        </div>
      </div>

      {/* Region Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {REGIONS.map((region) => (
          <button
            key={region.route}
            data-testid={`hiq-region-${region.route}`}
            onClick={() => handleRegionClick(region)}
            className="group text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-600 transition-all hover:shadow-lg p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{region.flag}</span>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-fuchsia-500 transition-colors" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {region.name}
            </h2>
            <p className={`text-xs font-semibold uppercase tracking-wider ${region.color} mb-3`}>
              {region.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
              {region.description}
            </p>

            <div className={`rounded-lg ${region.bg} p-3`}>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Features:</p>
              <ul className="space-y-1">
                {region.features.map((f, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-fuchsia-500 mt-0.5">-</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      {/* Info note */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400">
        <strong className="text-gray-700 dark:text-gray-300">How it works:</strong>{' '}
        Each regional form is defined in the Zorbit Form Builder and rendered dynamically.
        Fields, validations, and conditional logic are all driven by the form schema &mdash; no custom code per region.
        PII fields are automatically tokenized through the PII Vault on submission.
      </div>
    </div>
  );
};

export default RegionSelectorPage;
