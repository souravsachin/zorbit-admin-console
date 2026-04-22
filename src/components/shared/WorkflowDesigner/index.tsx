/**
 * WorkflowDesigner — `@platform:WorkflowDesigner`.
 *
 * A platform-wide cross-module component that embeds the bpmn-js full
 * Modeler inside the unified console. It is wired to the
 * `zorbit-pfs-workflow_engine` REST surface:
 *
 *    GET    /api/workflow_engine/api/v1/O/{orgId}/workflow/bpmn-processes
 *    GET    /api/workflow_engine/api/v1/O/{orgId}/workflow/bpmn-processes/:id
 *    POST   /api/workflow_engine/api/v1/O/{orgId}/workflow/bpmn-processes
 *    PUT    /api/workflow_engine/api/v1/O/{orgId}/workflow/bpmn-processes/:id
 *
 * Consumed via a manifest nav item in zorbit-pfs-workflow_engine as
 * `"feComponent": "@platform:WorkflowDesigner"`. The nav item may pass
 * `feProps.processHashId` to pre-load a specific BPMN row; omitting it
 * opens an empty canvas and lets the user pick via the dropdown.
 *
 * FQP reminder (for the wider team): this is the evolution of FQP
 * (Filters / Queues / Pipelines). The three FQP primitives map naturally
 * onto BPMN 2.0:
 *
 *    Filter    →  Exclusive Gateway (the decision point)
 *    Queue     →  User Task         (the work inbox that holds items)
 *    Pipeline  →  Sequence Flow     (the skeleton that links everything)
 *
 * Phase 2 of EPIC 16 will layer in palette-level permission restrictions
 * and Camunda-flavoured form overlays — this file intentionally ships the
 * default bpmn-js palette so platform admins can model anything BPMN 2.0
 * supports.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

// Bring in the bpmn-js stylesheets exactly once. Imported as a side-effect
// so Vite code-splits the CSS with this chunk.
import './styles';

// DesignerCanvas pulls in the bpmn-js Modeler (~1.5 MB). Lazy-load it so
// the canvas + its BPMN icon font only download when a user actually
// navigates to the Designer route.
const DesignerCanvas = lazy(() => import('./DesignerCanvas'));
const DesignerToolbar = lazy(() => import('./DesignerToolbar'));
const PropertiesPanel = lazy(() => import('./PropertiesPanel'));

// ---------------------------------------------------------------------------
// Types mirrored from zorbit-pfs-workflow_engine DTOs.
// ---------------------------------------------------------------------------

interface BpmnProcessRow {
  hashId: string;
  name: string;
  description?: string;
  bpmnXml?: string;
  bpmnProcessId?: string;
  version?: number;
  status?: 'draft' | 'published' | 'retired';
}

interface WorkflowDesignerProps {
  /** Optional BP-xxxx hashId to open. When omitted the user starts on an
   *  empty canvas and can load via the toolbar dropdown. Accepted from the
   *  manifest nav item's `feProps.processHashId` by the renderer. */
  processHashId?: string;
}

// ---------------------------------------------------------------------------
// API helpers.
// ---------------------------------------------------------------------------

const BASE = '/api/workflow_engine/api/v1';

async function listProcesses(orgId: string): Promise<BpmnProcessRow[]> {
  const res = await api.get(`${BASE}/O/${orgId}/workflow/bpmn-processes`);
  // BE may wrap in { data: [...] } or { items: [...] } — tolerate both.
  const raw = res.data?.items || res.data?.data || res.data || [];
  return Array.isArray(raw) ? (raw as BpmnProcessRow[]) : [];
}

async function fetchProcess(
  orgId: string,
  hashId: string,
): Promise<BpmnProcessRow> {
  const res = await api.get(`${BASE}/O/${orgId}/workflow/bpmn-processes/${hashId}`);
  const row = (res.data?.process || res.data?.data || res.data) as BpmnProcessRow;
  return row;
}

async function createProcess(
  orgId: string,
  body: { name: string; description?: string; bpmnXml: string },
): Promise<BpmnProcessRow> {
  const res = await api.post(`${BASE}/O/${orgId}/workflow/bpmn-processes`, body);
  return (res.data?.process || res.data?.data || res.data) as BpmnProcessRow;
}

async function updateProcess(
  orgId: string,
  hashId: string,
  body: { name: string; description?: string; bpmnXml: string },
): Promise<BpmnProcessRow> {
  const res = await api.put(
    `${BASE}/O/${orgId}/workflow/bpmn-processes/${hashId}`,
    body,
  );
  return (res.data?.process || res.data?.data || res.data) as BpmnProcessRow;
}

// ---------------------------------------------------------------------------
// Main component.
// ---------------------------------------------------------------------------

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  processHashId: initialHashIdProp,
}) => {
  const { orgId } = useAuth();
  // Second source of the hashId — the `/m/workflow_engine/designer/:processHashId`
  // route. Manifest-provided `feProps.processHashId` takes precedence, then
  // the URL param, then null (empty canvas).
  const routeParams = useParams<{ processHashId?: string }>();
  const initialHashId = initialHashIdProp ?? routeParams.processHashId ?? undefined;

  // Modeler ref — set once DesignerCanvas has bootstrapped the instance.
  const modelerRef = useRef<any>(null);

  // Properties-panel host DOM node — handed to DesignerCanvas as soon as
  // the PropertiesPanel component has mounted.
  const [propsPanelEl, setPropsPanelEl] = useState<HTMLDivElement | null>(null);

  const [processes, setProcesses] = useState<BpmnProcessRow[]>([]);
  const [selectedHashId, setSelectedHashId] = useState<string | null>(
    initialHashId ?? null,
  );
  const [processName, setProcessName] = useState<string>('');
  const [processDescription, setProcessDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[] | null>(null);

  // -------------------------------------------------------------------------
  // Load the list of existing bpmn_processes once on mount (and on refresh).
  // -------------------------------------------------------------------------
  const reloadList = useCallback(async () => {
    try {
      setError(null);
      const list = await listProcesses(orgId);
      setProcesses(list);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[WorkflowDesigner] listProcesses failed', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load BPMN process list',
      );
    }
  }, [orgId]);

  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  // -------------------------------------------------------------------------
  // Helper — import XML into the Modeler.
  // -------------------------------------------------------------------------
  const importXml = useCallback(async (xml: string) => {
    const modeler = modelerRef.current;
    if (!modeler) return;
    try {
      await modeler.importXML(xml);
      setDirty(false);
      // Fit the diagram into the canvas viewport — nicer first impression
      // than the default top-left zoom level.
      try {
        modeler.get('canvas').zoom('fit-viewport', 'auto');
      } catch {
        /* older bpmn-js versions throw on empty diagrams */
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[WorkflowDesigner] importXML failed', err);
      setError(err?.message || 'Failed to render BPMN XML');
    }
  }, []);

  // -------------------------------------------------------------------------
  // Load one BPMN process into the canvas when the user picks from the
  // dropdown (or on initial mount if processHashId was passed in).
  // -------------------------------------------------------------------------
  const loadProcess = useCallback(
    async (hashId: string | null) => {
      setError(null);
      setStatus(null);
      setValidationIssues(null);
      if (!hashId) {
        setSelectedHashId(null);
        setProcessName('');
        setProcessDescription('');
        // Re-bootstrap with an empty diagram.
        const { EMPTY_BPMN_XML } = await import('./DesignerCanvas');
        await importXml(EMPTY_BPMN_XML);
        return;
      }
      try {
        setLoading(true);
        const row = await fetchProcess(orgId, hashId);
        setSelectedHashId(row.hashId);
        setProcessName(row.name || '');
        setProcessDescription(row.description || '');
        if (row.bpmnXml) {
          await importXml(row.bpmnXml);
        } else {
          setError(
            `BPMN row ${hashId} loaded but has no bpmnXml field — ask an admin to re-seed.`,
          );
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[WorkflowDesigner] fetchProcess failed', err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            `Failed to load BPMN process ${hashId}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [orgId, importXml],
  );

  // Once the Modeler is ready, and if the caller pre-specified a hashId,
  // auto-load it. Deferred via effect to make sure the importXML that
  // DesignerCanvas does at bootstrap has resolved first.
  const onModelerReady = useCallback(
    (modeler: any) => {
      modelerRef.current = modeler;
      // Track dirty state so "Save (no changes)" can grey out appropriately.
      try {
        modeler.on('commandStack.changed', () => setDirty(true));
      } catch {
        /* older bpmn-js versions use a different event bus API */
      }
      if (initialHashId) {
        void loadProcess(initialHashId);
      }
    },
    [initialHashId, loadProcess],
  );

  // -------------------------------------------------------------------------
  // Toolbar handlers.
  // -------------------------------------------------------------------------

  const handleNew = useCallback(async () => {
    setSelectedHashId(null);
    setProcessName('');
    setProcessDescription('');
    setStatus('Started a fresh diagram.');
    setValidationIssues(null);
    const { EMPTY_BPMN_XML } = await import('./DesignerCanvas');
    await importXml(EMPTY_BPMN_XML);
  }, [importXml]);

  // Tiny lightweight lint — bpmn-js doesn't ship a `lint` module by
  // default; we guard against empty-diagram / missing-start-event / no-end-
  // event common mistakes. Phase 2 will plug in bpmnlint proper.
  const runValidation = useCallback(async (): Promise<string[]> => {
    const modeler = modelerRef.current;
    if (!modeler) return ['Modeler not ready yet.'];
    const issues: string[] = [];
    try {
      const elementRegistry = modeler.get('elementRegistry');
      const all = elementRegistry.getAll() as any[];
      const tasks = all.filter((e) => /Task$/.test(String(e.type)));
      const starts = all.filter((e) => e.type === 'bpmn:StartEvent');
      const ends = all.filter((e) => e.type === 'bpmn:EndEvent');
      if (starts.length === 0) {
        issues.push('No StartEvent — every process must have exactly one start.');
      }
      if (ends.length === 0 && tasks.length > 0) {
        issues.push('No EndEvent — add a terminator so instances can complete.');
      }
      if (tasks.length === 0) {
        issues.push(
          'No activities yet — drag a UserTask or Task from the palette (FQP note: a queue maps to a UserTask).',
        );
      }
      // Run schema validation via saveXML — bpmn-js throws on malformed
      // diagrams.
      await modeler.saveXML({ format: false });
    } catch (err: any) {
      issues.push(`BPMN XML is malformed: ${err?.message || String(err)}`);
    }
    return issues;
  }, []);

  const handleValidate = useCallback(async () => {
    setError(null);
    setStatus(null);
    const issues = await runValidation();
    setValidationIssues(issues);
    if (issues.length === 0) {
      setStatus('Validation OK — diagram is ready to save.');
    }
  }, [runValidation]);

  const handleExportXml = useCallback(async () => {
    const modeler = modelerRef.current;
    if (!modeler) return;
    try {
      const { xml } = await modeler.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (processName || 'bpmn-diagram').replace(/[^a-z0-9-_]/gi, '_');
      a.download = `${safeName}.bpmn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[WorkflowDesigner] exportXml failed', err);
      setError(err?.message || 'Export failed');
    }
  }, [processName]);

  const handleSave = useCallback(async () => {
    setError(null);
    setStatus(null);
    setValidationIssues(null);
    const modeler = modelerRef.current;
    if (!modeler) {
      setError('Modeler not ready yet — wait a moment and retry.');
      return;
    }
    if (!processName.trim()) {
      setError('A process name is required before saving.');
      return;
    }
    // Block save on hard validation errors, but let soft warnings through.
    const issues = await runValidation();
    const blocking = issues.filter((i) => i.startsWith('BPMN XML is malformed'));
    if (blocking.length > 0) {
      setValidationIssues(blocking);
      setError('Cannot save — fix the BPMN validation errors above.');
      return;
    }

    try {
      setSaving(true);
      const { xml } = await modeler.saveXML({ format: true });
      const body = {
        name: processName.trim(),
        description: processDescription.trim() || undefined,
        bpmnXml: xml,
      };
      let saved: BpmnProcessRow;
      if (selectedHashId) {
        saved = await updateProcess(orgId, selectedHashId, body);
        setStatus(
          `Saved new version of ${saved.hashId || selectedHashId}${
            saved.version ? ` (v${saved.version})` : ''
          }.`,
        );
      } else {
        saved = await createProcess(orgId, body);
        setStatus(
          `Created ${saved.hashId || 'new BPMN process'}${
            saved.version ? ` (v${saved.version})` : ''
          }.`,
        );
        if (saved.hashId) setSelectedHashId(saved.hashId);
      }
      setDirty(false);
      // Refresh the dropdown so the new row is immediately selectable.
      await reloadList();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[WorkflowDesigner] save failed', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Save failed — check the network panel for details.',
      );
    } finally {
      setSaving(false);
    }
  }, [
    orgId,
    processName,
    processDescription,
    selectedHashId,
    runValidation,
    reloadList,
  ]);

  const handleSelectProcess = useCallback(
    (hashId: string | null) => {
      void loadProcess(hashId);
    },
    [loadProcess],
  );

  const processChoices = useMemo(
    () => processes.map((p) => ({ hashId: p.hashId, name: p.name })),
    [processes],
  );

  // -------------------------------------------------------------------------
  // Render.
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading designer…
            </div>
          }
        >
          <DesignerToolbar
            processes={processChoices}
            selectedProcessHashId={selectedHashId}
            onSelectProcess={handleSelectProcess}
            processName={processName}
            onProcessNameChange={(v) => {
              setProcessName(v);
              setDirty(true);
            }}
            onNew={handleNew}
            onSave={handleSave}
            onValidate={handleValidate}
            onExportXml={handleExportXml}
            onReloadList={reloadList}
            saving={saving}
            loading={loading}
            dirty={dirty}
          />
        </Suspense>
      </div>

      {/* Error / status / validation banner row */}
      {(error || status || (validationIssues && validationIssues.length > 0)) && (
        <div className="flex-shrink-0 p-2 space-y-1">
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 text-sm rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {status && !error && (
            <div className="flex items-start gap-2 px-3 py-2 text-sm rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{status}</span>
            </div>
          )}
          {validationIssues && validationIssues.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2 text-sm rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Validation issues:</div>
                <ul className="list-disc list-inside">
                  {validationIssues.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Canvas + properties panel row */}
      <div className="flex-1 flex min-h-0 p-2 gap-2">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading BPMN canvas (~1.5 MB — first time only)…
            </div>
          }
        >
          <DesignerCanvas
            onReady={onModelerReady}
            propertiesPanelContainer={propsPanelEl}
          />
          <PropertiesPanel onContainerRef={setPropsPanelEl} />
        </Suspense>
      </div>

      {/* FQP educational footer — shown only when canvas is empty (no
          selection, no name typed) so seasoned authors aren't distracted. */}
      {!selectedHashId && !processName && !dirty && (
        <div className="flex-shrink-0 px-3 py-2 text-xs italic text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
          Drag activities from the palette on the left. This is the evolution
          of FQP — filters become gateways, queues become user tasks,
          pipelines become sequence flows.
        </div>
      )}
    </div>
  );
};

export default WorkflowDesigner;
