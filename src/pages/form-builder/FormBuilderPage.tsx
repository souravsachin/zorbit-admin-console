import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { formBuilderService, type FormDefinition } from '../../services/formBuilder';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const FormBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    formBuilderService
      .getFormDefinitions()
      .then((res) => {
        const data = res.data;
        if (data && Array.isArray(data.forms)) {
          setForms(data.forms);
        } else if (Array.isArray(data)) {
          setForms(data as unknown as FormDefinition[]);
        } else {
          setForms([]);
        }
      })
      .catch(() => setError('Failed to load form definitions. Is the Form Builder service running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
          <FileEdit className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage form definitions, schemas, and access tokens
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/form-builder/tokens')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            Tokens
          </button>
          <button
            onClick={() => navigate('/form-builder/create')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={15} /> Create Form
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Slug</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Version</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : forms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
                  <FileEdit className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No form definitions found</p>
                  <p className="text-xs mt-1">Create a form or check service connectivity</p>
                </td>
              </tr>
            ) : (
              forms.map((f) => (
                <tr
                  key={f.hashId}
                  onClick={() => navigate(`/form-builder/${f.slug}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    {f.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {f.slug}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300 capitalize">
                    {f.formType}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_BADGE[f.status] ?? STATUS_BADGE.draft
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    v{f.version}
                  </td>
                  <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">
                    {new Date(f.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormBuilderPage;
