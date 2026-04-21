/**
 * PropertiesPanel — side panel host for bpmn-js-properties-panel.
 *
 * The actual form widgets are rendered inside `containerRef.current` by the
 * bpmn-js properties-panel modules wired up in DesignerCanvas. This
 * component is essentially a typed wrapper that:
 *
 *   1. Owns a stable DOM node (so the Modeler can mount its panel into it).
 *   2. Exposes that node to the parent via the `onContainerRef` callback.
 *   3. Provides an empty-state message when no element is selected so the
 *      side panel never looks broken.
 *
 * FQP note: in the old FQP UI this column was the "filter condition
 * builder" / "pipeline stage editor". Under BPMN it becomes a generic
 * property sheet — click any activity / gateway / task and its fields
 * appear here.
 */

import React, { useEffect, useRef } from 'react';

interface PropertiesPanelProps {
  onContainerRef: (el: HTMLDivElement | null) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ onContainerRef }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onContainerRef(ref.current);
    return () => onContainerRef(null);
  }, [onContainerRef]);

  return (
    <div className="w-80 h-full border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 overflow-auto">
      <div className="p-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Properties
      </div>
      <div
        ref={ref}
        className="bpmn-properties-panel-host text-sm"
        data-testid="workflow-designer-properties-panel"
      />
    </div>
  );
};

export default PropertiesPanel;
