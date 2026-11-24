import React, { useState } from 'react';
import { Play } from 'lucide-react';

export const PostContent = ({ content, mediaFiles = [] }) => {
  const [activeVideo, setActiveVideo] = useState(null);

  const images = mediaFiles.filter(m => m.media_type === 'IMAGE');
  const videos = mediaFiles.filter(m => m.media_type === 'VIDEO');

  return (
    <div className="px-4 py-2 space-y-3">
      {/* Text Content */}
      {content && (
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((vid, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-sm">
              <video
                src={vid.file_url || vid.file}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Images Gallery Section */}
      {images.length > 0 && (
        <div className="rounded-xl overflow-hidden">
          {images.length === 1 && (
            <div className="bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <img
                src={images[0].file_url || images[0].file}
                alt="Post content"
                className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </div>
          )}

          {images.length === 2 && (
            <div className="grid grid-cols-2 gap-1">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.file_url || img.file}
                  alt=""
                  className="w-full h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer"
                />
              ))}
            </div>
          )}

          {images.length >= 3 && (
            <div className="grid grid-cols-2 gap-1">
              <img
                src={images[0].file_url || images[0].file}
                alt=""
                className="w-full h-72 object-cover col-span-1 hover:opacity-95 transition-opacity cursor-pointer"
              />
              <div className="grid grid-rows-2 gap-1 h-72">
                <img
                  src={images[1].file_url || images[1].file}
                  alt=""
                  className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                />
                <div className="relative h-full">
                  <img
                    src={images[2].file_url || images[2].file}
                    alt=""
                    className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                  />
                  {images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl cursor-pointer">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostContent;
