/* ImageViewer — native <img> backed by the fetched Blob's objectUrl. */

import React from 'react';
import type { RendererProps } from './types';

export const ImageViewer: React.FC<RendererProps> = ({ objectUrl, filename }) => (
  <div className="fv-image bg-checkered rounded border border-gray-200 flex items-center justify-center p-4 overflow-auto">
    {objectUrl ? (
      <img
        src={objectUrl}
        alt={filename}
        className="max-w-full max-h-[calc(100vh-220px)] object-contain"
      />
    ) : (
      <div className="text-sm text-gray-500">No image data.</div>
    )}
  </div>
);

export default ImageViewer;
