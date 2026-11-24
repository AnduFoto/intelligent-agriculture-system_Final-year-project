import React from 'react';
import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PostActions = ({
  post,
  onToggleLike,
  onToggleComments,
  onShare,
  showComments
}) => {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/60">
      {/* Counts Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
            👍
          </span>
          <span className="font-medium">{post.likes_count || 0}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onToggleComments} className="hover:underline">
            {post.comments_count || 0} {t('community.comments', 'Comments')}
          </button>
          <span>•</span>
          <button onClick={onShare} className="hover:underline">
            {post.shares_count || 0} {t('community.shares', 'Shares')}
          </button>
        </div>
      </div>

      {/* Buttons Bar */}
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/40">
        <button
          onClick={onToggleLike}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            post.is_liked
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
          <span>{t('community.like', 'Like')}</span>
        </button>

        <button
          onClick={onToggleComments}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            showComments
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('community.comment', 'Comment')}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('community.share', 'Share')}</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
