import React from 'react';

export const VideoMessage = ({ videoUrl, fileName }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-w-xs sm:max-w-sm bg-black">
      <video 
        src={videoUrl} 
        controls 
        preload="metadata"
        className="w-full max-h-64 object-contain rounded-xl"
      >
        Your browser does not support HTML5 video.
      </video>
      {fileName && (
        <div className="p-2 text-xs text-slate-300 truncate bg-zinc-900">
          {fileName}
        </div>
      )}
    </div>
  );
};
