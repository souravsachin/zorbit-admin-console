/* AudioViewer — native HTML5 audio player. */

import React from 'react';
import type { RendererProps } from './types';

export const AudioViewer: React.FC<RendererProps> = ({ objectUrl, mimeType, filename }) => (
  <div className="fv-audio bg-white rounded border border-gray-200 p-6 flex flex-col items-center gap-4">
    <div className="text-sm text-gray-600">{filename}</div>
    {objectUrl ? (
      <audio controls src={objectUrl} className="w-full max-w-2xl">
        <source src={objectUrl} type={mimeType} />
      </audio>
    ) : (
      <div className="text-sm text-gray-500">No audio data.</div>
    )}
  </div>
);

export default AudioViewer;
