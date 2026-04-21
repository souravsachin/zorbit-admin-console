/* VideoViewer — native HTML5 video player. */

import React from 'react';
import type { RendererProps } from './types';

export const VideoViewer: React.FC<RendererProps> = ({ objectUrl, mimeType, filename }) => (
  <div className="fv-video bg-black rounded border border-gray-200 flex items-center justify-center p-2">
    {objectUrl ? (
      <video
        controls
        src={objectUrl}
        className="max-w-full max-h-[calc(100vh-220px)]"
        aria-label={filename}
      >
        <source src={objectUrl} type={mimeType} />
      </video>
    ) : (
      <div className="text-sm text-gray-300 p-8">No video data.</div>
    )}
  </div>
);

export default VideoViewer;
