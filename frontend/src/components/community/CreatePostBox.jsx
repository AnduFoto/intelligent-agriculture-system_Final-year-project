import React from 'react';
import { Image, Video, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CreatePostBox = ({ user, onClick }) => {
  const { t } = useTranslation();

  const handleFileChange = (e, mode) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length > 0) {
      onClick(mode, fileList);
    }
    // reset input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-700/80 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={user?.first_name || 'User'}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onClick(null)}
          className="flex-1 text-left px-4 py-3 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        >
          {t('community.sharePrompt', 'Share your agricultural experience or ask a question...')}
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer">
          <Image className="w-4 h-4 text-emerald-500" />
          <span>{t('community.photo', 'Photo')}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'PHOTO')}
            className="hidden"
          />
        </label>

        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer">
          <Video className="w-4 h-4 text-blue-500" />
          <span>{t('community.video', 'Video')}</span>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'VIDEO')}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => onClick('CROP_TAG')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
        >
          <Tag className="w-4 h-4 text-amber-500" />
          <span>{t('community.cropTag', 'Crop Tag')}</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePostBox;
