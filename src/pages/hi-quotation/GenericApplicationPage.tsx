import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Send, User, Users, Shield,
  ChevronRight, CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Country metadata lookup                                            */
/* ------------------------------------------------------------------ */

const COUNTRY_META: Record<string, { flag: string; name: string; idLabel: string; currency: string }> = {
  'saudi-arabia': { flag: '\u{1F1F8}\u{1F1E6}', name: 'Saudi Arabia', idLabel: 'Iqama / National ID', currency: 'SAR' },
  'bahrain':      { flag: '\u{1F1E7}\u{1F1ED}', name: 'Bahrain', idLabel: 'CPR Number', currency: 'BHD' },
  'oman':         { flag: '\u{1F1F4}\u{1F1F2}', name: 'Oman', idLabel: 'Civil ID', currency: 'OMR' },
  'qatar':        { flag: '\u{1F1F6}\u{1F1E6}', name: 'Qatar', idLabel: 'QID', currency: 'QAR' },
  'kuwait':       { flag: '\u{1F1F0}\u{1F1FC}', name: 'Kuwait', idLabel: 'Civil ID', currency: 'KWD' },
  'uk':           { flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom', idLabel: 'NHS Number', currency: 'GBP' },
  'germany':      { flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany', idLabel: 'Versichertennummer', currency: 'EUR' },
  'singapore':    { flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore', idLabel: 'NRIC', currency: 'SGD' },
  'hong-kong':    { flag: '\u{1F1ED}\u{1F1F0}', name: 'Hong Kong', idLabel: 'HKID', currency: 'HKD' },
  'south-africa': { flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa', idLabel: 'SA ID Number', currency: 'ZAR' },
  'australia':    { flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia', idLabel: 'Medicare Number', currency: 'AUD' },
  'canada':       { flag: '\u{1F1E8}\u{1F1E6}', name: 'Canada', idLabel: 'SIN', currency: 'CAD' },
  'brazil':       { flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil', idLabel: 'CPF', currency: 'BRL' },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FamilyMember {
  id: string;
  name: string;
  dob: string;
  gender: string;
  relationship: string;
}

type PlanTier = 'basic' | 'standard' | 'premium';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const GenericApplicationPage: React.FC = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const navigate = useNavigate();

  const meta = COUNTRY_META[countrySlug || ''] || {
    flag: '\u{1F30D}',
    name: countrySlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown',
    idLabel: 'ID Number',
    currency: 'USD',
  };

  /* --- Proposer state --- */
  const [proposer, setProposer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    nationality: '',
    idNumber: '',
  });

  /* --- Members state --- */
  const [members, setMembers] = useState<FamilyMember[]>([]);

  /* --- Plan state --- */
  const [plan, setPlan] = useState<PlanTier>('standard');

  /* --- UI state --- */
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const updateProposer = (field: string, value: string) =>
    setProposer((prev) => ({ ...prev, [field]: value }));

  const addMember = () =>
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', dob: '', gender: '', relationship: '' },
    ]);

  const removeMember = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  const updateMember = (id: string, field: string, value: string) =>
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const STEPS = ['Proposer Details', 'Family Members', 'Plan Selection', 'Review'];

  /* ------------------------------------------------------------------ */
  /*  Render helpers                                                     */
  /* ------------------------------------------------------------------ */

  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-colors';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1';

  const renderProposerStep = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label className={labelCls}>First Name *</label>
        <input className={inputCls} value={proposer.firstName} onChange={(e) => updateProposer('firstName', e.target.value)} placeholder="First name" />
      </div>
      <div>
        <label className={labelCls}>Last Name *</label>
        <input className={inputCls} value={proposer.lastName} onChange={(e) => updateProposer('lastName', e.target.value)} placeholder="Last name" />
      </div>
      <div>
        <label className={labelCls}>Email *</label>
        <input className={inputCls} type="email" value={proposer.email} onChange={(e) => updateProposer('email', e.target.value)} placeholder="email@example.com" />
      </div>
      <div>
        <label className={labelCls}>Phone *</label>
        <input className={inputCls} type="tel" value={proposer.phone} onChange={(e) => updateProposer('phone', e.target.value)} placeholder="+000 000 000 000" />
      </div>
      <div>
        <label className={labelCls}>Date of Birth *</label>
        <input className={inputCls} type="date" value={proposer.dob} onChange={(e) => updateProposer('dob', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Gender *</label>
        <select className={inputCls} value={proposer.gender} onChange={(e) => updateProposer('gender', e.target.value)}>
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Nationality</label>
        <input className={inputCls} value={proposer.nationality} onChange={(e) => updateProposer('nationality', e.target.value)} placeholder="Nationality" />
      </div>
      <div>
        <label className={labelCls}>{meta.idLabel}</label>
        <input className={inputCls} value={proposer.idNumber} onChange={(e) => updateProposer('idNumber', e.target.value)} placeholder={`Enter ${meta.idLabel}`} />
      </div>
    </div>
  );

  const renderMembersStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Add family members to be covered under this policy. Leave empty for an individual plan.
      </p>
      {members.map((m, idx) => (
        <div key={m.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Member {idx + 1}</span>
            <button onClick={() => removeMember(m.id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls} value={m.name} onChange={(e) => updateMember(m.id, 'name', e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input className={inputCls} type="date" value={m.dob} onChange={(e) => updateMember(m.id, 'dob', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Gender *</label>
              <select className={inputCls} value={m.gender} onChange={(e) => updateMember(m.id, 'gender', e.target.value)}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Relationship *</label>
              <select className={inputCls} value={m.relationship} onChange={(e) => updateMember(m.id, 'relationship', e.target.value)}>
                <option value="">Select...</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addMember}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-fuchsia-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Family Member
      </button>
    </div>
  );

  const PLAN_OPTIONS: { tier: PlanTier; label: string; price: string; features: string[] }[] = [
    {
      tier: 'basic',
      label: 'Basic',
      price: `${meta.currency} 500/yr`,
      features: ['Inpatient coverage', 'Emergency treatment', 'Basic diagnostics'],
    },
    {
      tier: 'standard',
      label: 'Standard',
      price: `${meta.currency} 1,200/yr`,
      features: ['All Basic features', 'Outpatient visits', 'Specialist referrals', 'Dental (basic)'],
    },
    {
      tier: 'premium',
      label: 'Premium',
      price: `${meta.currency} 2,500/yr`,
      features: ['All Standard features', 'Maternity', 'Optical', 'Global emergency cover', 'Wellness programs'],
    },
  ];

  const renderPlanStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {PLAN_OPTIONS.map((p) => {
        const selected = plan === p.tier;
        return (
          <button
            key={p.tier}
            onClick={() => setPlan(p.tier)}
            className={`text-left rounded-xl border-2 p-5 transition-all ${
              selected
                ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{p.label}</span>
              {selected && <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />}
            </div>
            <p className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-400 mb-4">{p.price}</p>
            <ul className="space-y-1.5">
              {p.features.map((f, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-fuchsia-500 mt-0.5">-</span>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Proposer
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><span className="text-xs text-gray-500">Name</span><p className="font-medium text-gray-900 dark:text-white">{proposer.firstName} {proposer.lastName || '-'}</p></div>
          <div><span className="text-xs text-gray-500">Email</span><p className="font-medium text-gray-900 dark:text-white">{proposer.email || '-'}</p></div>
          <div><span className="text-xs text-gray-500">Phone</span><p className="font-medium text-gray-900 dark:text-white">{proposer.phone || '-'}</p></div>
          <div><span className="text-xs text-gray-500">DOB</span><p className="font-medium text-gray-900 dark:text-white">{proposer.dob || '-'}</p></div>
          <div><span className="text-xs text-gray-500">Gender</span><p className="font-medium text-gray-900 dark:text-white capitalize">{proposer.gender || '-'}</p></div>
          <div><span className="text-xs text-gray-500">Nationality</span><p className="font-medium text-gray-900 dark:text-white">{proposer.nationality || '-'}</p></div>
          <div><span className="text-xs text-gray-500">{meta.idLabel}</span><p className="font-medium text-gray-900 dark:text-white">{proposer.idNumber || '-'}</p></div>
        </div>
      </div>

      {members.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Family Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((m, idx) => (
              <div key={m.id} className="flex items-center gap-4 text-sm">
                <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                <span className="font-medium text-gray-900 dark:text-white flex-1">{m.name || '-'}</span>
                <span className="text-gray-500 capitalize">{m.relationship}</span>
                <span className="text-gray-500">{m.dob}</span>
                <span className="text-gray-500 capitalize">{m.gender}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Plan
        </h3>
        <p className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-400 capitalize">{plan}</p>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Submitted state                                                    */
  /* ------------------------------------------------------------------ */

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your {meta.name} health insurance application has been submitted for processing.
            You will receive a confirmation via email.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/hi-quotation/new')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              New Application
            </button>
            <button
              onClick={() => navigate('/hi-quotation')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-colors"
            >
              View Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Main render                                                        */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/hi-quotation/new')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <span className="text-4xl">{meta.flag}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {meta.name} Health Insurance Application
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generic application form &mdash; fill in proposer details, add family members, and select a plan.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((s, idx) => {
          const isActive = step === idx;
          const isDone = step > idx;
          return (
            <React.Fragment key={s}>
              {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              <button
                onClick={() => idx <= step && setStep(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300'
                    : isDone
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-fuchsia-500 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-white'
                }`}>
                  {isDone ? '\u2713' : idx + 1}
                </span>
                {s}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{STEPS[step]}</h2>
        {step === 0 && renderProposerStep()}
        {step === 1 && renderMembersStep()}
        {step === 2 && renderPlanStep()}
        {step === 3 && renderReviewStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/hi-quotation/new')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? 'Back to Regions' : 'Previous'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericApplicationPage;
