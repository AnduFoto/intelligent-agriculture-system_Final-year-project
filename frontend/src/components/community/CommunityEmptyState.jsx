import React from 'react';
import { Sprout, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CommunityEmptyState = ({ onCreatePostClick }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-xs my-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
        <Sprout className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        🌱 {t('community.emptyTitle', 'No community posts yet')}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
        {t('community.emptyDesc', 'Be the first person to share your agricultural experience, crop observation, or question with the community!')}
      </p>

      <button
        onClick={onCreatePostClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{t('community.createFirstPost', 'Create Post')}</span>
      </button>
    </div>
  );
};

export default CommunityEmptyState;
