/**
 * WorkflowDesigner — stylesheet imports.
 *
 * bpmn-js and @bpmn-io/properties-panel ship their own stylesheets which MUST
 * be imported once at the top of the render tree. Keeping them in a dedicated
 * module makes Vite code-split the CSS alongside the lazy-loaded designer
 * chunk, so the unified-console main bundle stays lean for users who never
 * open the Designer.
 *
 * FQP mapping note: the designer is the BPMN-era replacement for the legacy
 * FQP (Filters / Queues / Pipelines) authoring surface. Filters map to
 * exclusive gateways, queues map to user tasks (work-inboxes), and pipelines
 * map to the overall sequence-flow skeleton of a process.
 */

// Core diagram stylesheet (canvas, palette, context-pad, connections).
import 'bpmn-js/dist/assets/diagram-js.css';
// bpmn-js embedded font for the element icons.
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
// Camunda-flavoured element overlays / badges used by the properties panel.
import 'bpmn-js/dist/assets/bpmn-js.css';
// Properties panel (right-hand side). bpmn-js-properties-panel re-uses the
// base sheet shipped by @bpmn-io/properties-panel (no separate css of its
// own as of v5.x).
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

export {};
