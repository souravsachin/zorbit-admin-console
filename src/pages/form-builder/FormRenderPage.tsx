// =============================================================================
// Form Renderer Page — LIVE rendering of Form Builder schemas
// =============================================================================
// Fetches a form definition from the Form Builder API and renders it using
// formio.js. On submit, logs the data (future: sends to module API).
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Send, Loader2 } from 'lucide-react';
import { Form } from '@formio/js';

const API_BASE = '/api/form-builder';

interface FormDefinition {
  _id: string;
  hashId: string;
  organizationHashId: string;
  name: string;
  slug: string;
  description?: string;
  version: number;
  status: string;
  formType: string;
  schema: {
    display: string;
    components: unknown[];
  };
  createdAt: string;
  updatedAt: string;
}

const FormRenderPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get('readonly') === 'true';

  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const formInstanceRef = useRef<unknown>(null);

  // Fetch form definition
  useEffect(() => {
    const token = localStorage.getItem('zorbit_token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${API_BASE}/api/v1/O/O-OZPY/form-builder/forms`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const forms = data.forms || (Array.isArray(data) ? data : []);
        const found = forms.find((f: FormDefinition) => f.slug === slug);
        if (found) {
          setForm(found);
        } else {
          setError(`Form with slug "${slug}" not found.`);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load form');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Render form with formio.js when form data is available
  useEffect(() => {
    if (!form || !formContainerRef.current) return;

    // Clear previous form instance
    if (formContainerRef.current) {
      formContainerRef.current.innerHTML = '';
    }

    const renderForm = async () => {
      try {
        const instance = await Form.createForm(
          formContainerRef.current!,
          form.schema,
          {
            readOnly,
            noAlerts: false,
            i18n: {
              en: {
                submit: 'Submit Form',
                next: 'Next Step',
                previous: 'Previous Step',
                cancel: 'Cancel',
              },
            },
          },
        );

        formInstanceRef.current = instance;

        // Listen for submit event
        instance.on('submit', (submission: { data: Record<string, unknown> }) => {
          console.log('Form submitted:', submission);
          setSubmittedData(submission.data);
          setSubmitted(true);
        });

        instance.on('error', (errors: unknown) => {
          console.error('Form validation errors:', errors);
        });

        instance.on('change', (changed: unknown) => {
          console.log('Form changed:', changed);
        });
      } catch (err) {
        console.error('Failed to render form:', err);
        setError('Failed to render form. Check console for details.');
      }
    };

    renderForm();

    return () => {
      // Cleanup
      if (formInstanceRef.current && typeof (formInstanceRef.current as { destroy: () => void }).destroy === 'function') {
        (formInstanceRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [form, readOnly]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="animate-pulse flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="ml-3 text-gray-500">Loading form...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error State
  // ---------------------------------------------------------------------------

  if (error || !form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/form-builder/templates')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <AlertCircle className="w-7 h-7 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Not Found</h1>
            <p className="text-sm text-red-500">{error || 'Unknown error'}</p>
          </div>
        </div>
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Could not load form "{slug}"
          </p>
          <button
            onClick={() => navigate('/form-builder/templates')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Submitted State
  // ---------------------------------------------------------------------------

  if (submitted && submittedData) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/form-builder/templates')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <CheckCircle className="w-7 h-7 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Submitted</h1>
            <p className="text-sm text-gray-500">{form.name} -- v{form.version}</p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Form data captured successfully
            </p>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            In production, this data would be sent to the module API endpoint.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Submitted Data</h3>
          </div>
          <div className="p-6">
            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setSubmittedData(null);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Fill Again
          </button>
          <button
            onClick={() => navigate('/form-builder/templates')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Form Render State
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/form-builder/templates')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
          <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {form.description || 'No description'} &middot; v{form.version} &middot;{' '}
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                form.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {form.status}
            </span>
            {readOnly && (
              <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Read Only
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 capitalize">{form.schema.display}</p>
          <p className="text-xs text-gray-500 mt-1">Display Mode</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{form.schema.components.length}</p>
          <p className="text-xs text-gray-500 mt-1">Top Components</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 capitalize">{form.formType}</p>
          <p className="text-xs text-gray-500 mt-1">Form Type</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{form.hashId}</p>
          <p className="text-xs text-gray-500 mt-1">Form ID</p>
        </div>
      </div>

      {/* formio.js renders here */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div ref={formContainerRef} className="formio-form-container" />
      </div>
    </div>
  );
};

export default FormRenderPage;
