/**
 * DesignerCanvas — hosts the bpmn-js Modeler instance.
 *
 * This is the middle column of the designer layout. The Modeler owns the
 * BPMN 2.0 SVG canvas, palette, context-pad and all model mutations. We
 * attach Modeler lifecycle hooks here and bubble them up to the parent via
 * the `onReady` callback so the parent toolbar can call `importXML` /
 * `saveXML` / `get('canvas')` etc.
 *
 * FQP note (for anyone migrating from the legacy surface): the blank canvas
 * below is the evolution of FQP. Filters become exclusive gateways, queues
 * become user tasks (each task acts as a work inbox), and pipelines become
 * the sequence flows that link them. Drag from the palette on the left —
 * that's the vocabulary our employees used to call "FQP primitives".
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef } from 'react';

// Modeler = full edit experience (palette + context-pad + bendpoint editing).
// Viewer/NavigatedViewer are read-only — we deliberately don't use them here.
import Modeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

interface DesignerCanvasProps {
  /** Called once the Modeler instance is mounted. Parent uses this ref to
   *  trigger import / save / validate. */
  onReady: (modeler: any) => void;
  /** The host element for the right-hand properties panel. Passed in by
   *  the parent so both components share the same DOM parent. */
  propertiesPanelContainer: HTMLDivElement | null;
}

// Empty BPMN 2.0 diagram bootstrapped when the user hits "New" — a single
// StartEvent sitting on the canvas so there's something to connect to.
// Claude Code note: an FQP pipeline always had an implicit "entry" — the
// StartEvent here is the BPMN equivalent.
export const EMPTY_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_new"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_new" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_new">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  onReady,
  propertiesPanelContainer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Spin up a Modeler. The properties panel is optional — if the parent
    // hasn't given us a host element yet (first render race) we fall back
    // to the plain palette-only experience so the canvas still renders.
    const config: any = {
      container: containerRef.current,
      keyboard: { bindTo: window },
    };
    if (propertiesPanelContainer) {
      config.propertiesPanel = { parent: propertiesPanelContainer };
      config.additionalModules = [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
      ];
    }

    let disposed = false;
    let modeler: any;
    try {
      modeler = new Modeler(config);
    } catch (err) {
      // The bpmn-js module system sometimes throws on hot-reload when a
      // stale instance is still wired to the same DOM node — surface the
      // error but don't crash the whole console.
      // eslint-disable-next-line no-console
      console.error('[WorkflowDesigner] failed to instantiate Modeler', err);
      return;
    }
    modelerRef.current = modeler;

    // Bootstrap with an empty diagram so the palette has something to hang
    // off. The parent will overwrite this almost immediately if a
    // processHashId was supplied.
    modeler
      .importXML(EMPTY_BPMN_XML)
      .then(() => {
        if (disposed) return;
        onReady(modeler);
      })
      .catch((err: any) => {
        // eslint-disable-next-line no-console
        console.error('[WorkflowDesigner] empty bootstrap failed', err);
      });

    return () => {
      disposed = true;
      try {
        modeler?.destroy?.();
      } catch {
        /* ignore — bpmn-js throws on double-destroy */
      }
      modelerRef.current = null;
    };
    // onReady and propertiesPanelContainer are stable refs from the parent —
    // re-creating the Modeler on every render would wipe the user's work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertiesPanelContainer]);

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
      data-testid="workflow-designer-canvas"
    />
  );
};

export default DesignerCanvas;
