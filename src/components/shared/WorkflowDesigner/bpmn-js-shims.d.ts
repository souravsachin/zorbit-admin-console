/**
 * Ambient type shims for the bpmn-js family.
 *
 * These upstream packages either ship no .d.ts files at all (as of
 * bpmn-js@18 / bpmn-js-properties-panel@5) or only ship partial types that
 * aren't re-exported at the roots we use. Declaring them as `any` modules
 * keeps the TypeScript compiler happy without pretending to own the full
 * surface of bpmn-js's internals.
 *
 * When bpmn-io ships official types in a future major we can delete this
 * file wholesale.
 */

declare module 'bpmn-js/lib/Modeler' {
  const Modeler: any;
  export default Modeler;
}

declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: any;
  export const BpmnPropertiesProviderModule: any;
  export const CamundaPlatformPropertiesProviderModule: any;
  export const ZeebePropertiesProviderModule: any;
}

declare module '@bpmn-io/properties-panel' {
  const mod: any;
  export = mod;
}

// Side-effect CSS imports shipped by bpmn-js and friends. Vite handles
// these at runtime but tsc needs to know they are valid module specifiers.
declare module 'bpmn-js/dist/assets/diagram-js.css';
declare module 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
declare module 'bpmn-js/dist/assets/bpmn-js.css';
declare module '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
