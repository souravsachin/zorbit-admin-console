import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileEdit,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  Layers,
  Tag,
} from 'lucide-react';
import { formBuilderService, type FormDefinition } from '../../services/formBuilder';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

interface ComponentNode {
  type: string;
  key?: string;
  label?: string;
  title?: string;
  components?: ComponentNode[];
  [k: string]: unknown;
}

function FieldPreview({ component, depth = 0 }: { component: ComponentNode; depth?: number }) {
  const [open, setOpen] = useState(depth === 0);
  const isContainer = component.type === 'panel' || component.type === 'fieldset' ||
    component.type === 'columns' || component.type === 'datagrid' || component.type === 'editgrid';
  const label = component.label || component.title || component.key || component.type;
  const children = component.components || [];

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-gray-200 dark:border-gray-700 pl-3' : ''}`}>
      <div
        className={`flex items-center gap-2 py-1.5 text-sm ${isContainer ? 'cursor-pointer' : ''}`}
        onClick={() => isContainer && setOpen((o) => !o)}
      >
        {isContainer ? (
          open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
        ) : (
          <span className="w-3.5" />
        )}
        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-mono">
          {component.type}
        </span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{String(label)}</span>
        {component.key && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono ml-auto">{String(component.key)}</span>
        )}
      </div>
      {isContainer && open && children.length > 0 && (
        <div>
          {children.map((child, i) => (
            <FieldPreview key={i} component={child as ComponentNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const FormBuilderDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    formBuilderService
      .getFormDefinition(slug)
      .then((res) => setForm(res.data))
      .catch(() => setError('Failed to load form. Check service connectivity.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePublish = () => {
    if (!slug) return;
    setPublishing(true);
    formBuilderService
      .publishForm(slug)
      .then((res) => {
        setForm(res.data);
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 3000);
      })
      .catch(() => setError('Failed to publish form.'))
      .finally(() => setPublishing(false));
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-10 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-48" />
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-60 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/form-builder')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Forms
        </button>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (!form) return null;

  const components: ComponentNode[] = (form.schema?.components ?? []) as ComponentNode[];

  return (
    <div className="space-y-6 pb-10">
      {/* Back */}
      <button
        onClick={() => navigate('/form-builder')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Forms
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
          <FileEdit className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name}</h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                STATUS_BADGE[form.status] ?? STATUS_BADGE.draft
              }`}
            >
              {form.status}
            </span>
          </div>
          {form.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{form.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {form.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <CheckCircle size={14} />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          <button
            onClick={() => navigate(`/form-builder/edit/${form.slug}`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Publish success toast */}
      {publishSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          <CheckCircle size={15} /> Form published successfully.
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <div className="px-5 py-3 flex items-center gap-2">
          <Tag size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Slug</span>
          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{form.slug}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-2">
          <Layers size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Type</span>
          <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{form.formType}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-2">
          <span className="w-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Version</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">v{form.version}</span>
        </div>
        {form.piiFields && form.piiFields.length > 0 && (
          <div className="px-5 py-3 flex items-start gap-2">
            <span className="w-4 mt-0.5" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 mt-0.5">PII Fields</span>
            <div className="flex flex-wrap gap-1">
              {form.piiFields.map((f, i) => {
                const label = typeof f === 'object' && f !== null
                  ? `${(f as { fieldPath: string; piiType: string }).fieldPath} (${(f as { fieldPath: string; piiType: string }).piiType})`
                  : String(f);
                return (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-mono"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="px-5 py-3 flex items-center gap-2">
          <span className="w-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Created</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {new Date(form.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="px-5 py-3 flex items-center gap-2">
          <span className="w-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Updated</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {new Date(form.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Field Preview */}
      {components.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Form Structure</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {components.length} top-level component{components.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="px-5 py-3">
            {components.map((c, i) => (
              <FieldPreview key={i} component={c} depth={0} />
            ))}
          </div>
        </div>
      )}

      {/* Schema Viewer */}
      {form.schema && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSchemaOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-5 py-4 text-left"
          >
            <Code2 size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Raw JSON Schema</span>
            {schemaOpen
              ? <ChevronDown size={16} className="text-gray-400 ml-auto" />
              : <ChevronRight size={16} className="text-gray-400 ml-auto" />}
          </button>
          {schemaOpen && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              <pre className="overflow-auto text-xs text-gray-600 dark:text-gray-300 p-5 max-h-96 bg-gray-50 dark:bg-gray-900/40 rounded-b-xl">
                {JSON.stringify(form.schema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormBuilderDetailPage;
