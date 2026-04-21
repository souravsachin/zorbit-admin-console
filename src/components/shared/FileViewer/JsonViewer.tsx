/* JsonViewer — pretty-printed JSON with PII redaction. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from 'react';
import type { RendererProps } from './types';
import { maskJson } from './piiMasker';

export const JsonViewer: React.FC<RendererProps> = ({ text, pii }) => {
  const pretty = useMemo(() => {
    if (!text) return '';
    try {
      const parsed = JSON.parse(text);
      const masked = maskJson(
        parsed,
        pii?.applyRedactionRules,
        pii?.maskChar,
      );
      return JSON.stringify(masked, null, 2);
    } catch {
      return text;
    }
  }, [text, pii?.applyRedactionRules, pii?.maskChar]);

  return (
    <pre className="fv-json bg-gray-900 text-gray-100 rounded border border-gray-700 p-4 overflow-auto text-xs leading-5">
      {pretty}
    </pre>
  );
};

export default JsonViewer;
