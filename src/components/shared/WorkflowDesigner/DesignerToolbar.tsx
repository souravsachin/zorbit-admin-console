/**
 * DesignerToolbar — Load / Save / Validate / Export buttons.
 *
 * Runs along the top of the WorkflowDesigner. All actions are parent-
 * controlled (parent holds the Modeler ref + knows whether we're editing
 * an existing BPMN row or creating a new one).
 *
 * FQP note (continued): this toolbar is the FQP-era "Save Pipeline" button
 * rewritten for BPMN 2.0. Save sends the full XML up to the bpmn_processes
 * collection; Validate runs the lint rules that would have caught a broken
 * filter chain in the legacy runtime.
 */

import React from 'react';
import {
  Save,
  FilePlus,
  RefreshCcw,
  CheckCircle2,
  Download,
  Loader2,
} from 'lucide-react';

interface DesignerToolbarProps {
  processes: Array<{ hashId: string; name: string }>;
  selectedProcessHashId: string | null;
  onSelectProcess: (hashId: string | null) => void;
  processName: string;
  onProcessNameChange: (next: string) => void;
  onNew: () => void;
  onSave: () => void;
  onValidate: () => void;
  onExportXml: () => void;
  onReloadList: () => void;
  saving: boolean;
  loading: boolean;
  dirty: boolean;
}

const btnBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border ' +
  'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 ' +
  'dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed';

const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
  processes,
  selectedProcessHashId,
  onSelectProcess,
  processName,
  onProcessNameChange,
  onNew,
  onSave,
  onValidate,
  onExportXml,
  onReloadList,
  saving,
  loading,
  dirty,
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      data-testid="workflow-designer-toolbar"
    >
      {/* Process picker — dropdown of existing bpmn_processes rows */}
      <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
        Load:
        <select
          value={selectedProcessHashId ?? ''}
          onChange={(e) => onSelectProcess(e.target.value || null)}
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          data-testid="workflow-designer-process-picker"
        >
          <option value="">— new diagram —</option>
          {processes.map((p) => (
            <option key={p.hashId} value={p.hashId}>
              {p.hashId} — {p.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className={btnBase}
        onClick={onReloadList}
        disabled={loading}
        title="Refresh the list of saved BPMN processes"
      >
        <RefreshCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reload list</span>
      </button>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

      <button
        type="button"
        className={btnBase}
        onClick={onNew}
        title="Start a fresh blank BPMN diagram"
      >
        <FilePlus className="w-4 h-4" />
        <span className="hidden sm:inline">New</span>
      </button>

      {/* Name field — required for POST /bpmn-processes */}
      <input
        type="text"
        value={processName}
        onChange={(e) => onProcessNameChange(e.target.value)}
        placeholder="Process name (required to save)"
        className="flex-1 min-w-[10rem] px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        data-testid="workflow-designer-name-input"
      />

      <button
        type="button"
        className={btnBase}
        onClick={onValidate}
        title="Validate the BPMN XML (schema + lightweight lint)"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline">Validate</span>
      </button>

      <button
        type="button"
        className={btnBase}
        onClick={onExportXml}
        title="Download the current diagram as .bpmn XML"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export XML</span>
      </button>

      <button
        type="button"
        className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700`}
        onClick={onSave}
        disabled={saving || !processName.trim()}
        title={
          selectedProcessHashId
            ? `Save a new version of ${selectedProcessHashId}`
            : 'Save this diagram as a new BPMN process'
        }
        data-testid="workflow-designer-save"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>
          {selectedProcessHashId
            ? dirty
              ? 'Save new version'
              : 'Save (no changes)'
            : 'Save as new'}
        </span>
      </button>
    </div>
  );
};

export default DesignerToolbar;
