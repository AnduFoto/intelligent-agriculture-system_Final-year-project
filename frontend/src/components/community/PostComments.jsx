import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';
import CommentItem from './CommentItem';
import { message } from 'antd';

export const PostComments = ({ postId, user, onCommentsCountChanged }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  const fetchComments = async () => {
    try {
      const data = await communityService.getComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await communityService.createComment(postId, { content: commentText });
      setCommentText('');
      fetchComments();
      if (onCommentsCountChanged) onCommentsCountChanged();
      message.success(t('community.commentAdded', 'Comment added.'));
    } catch (err) {
      message.error(t('community.commentError', 'Failed to add comment.'));
    }
  };

  return (
    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/60 rounded-b-2xl">
      {/* Input Form */}
      <form onSubmit={handleSendComment} className="flex items-center gap-2 mb-4">
        {user?.profile_image ? (
          <img src={user.profile_image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user?.first_name ? user.first_name[0] : 'U'}
          </div>
        )}

        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('community.writeComment', 'Write a comment or agricultural advice...')}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100 focus:border-emerald-500"
        />

        <button
          type="submit"
          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* List Comments */}
      {loading ? (
        <div className="text-center py-4 text-xs text-slate-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-400 italic">
          {t('community.noCommentsYet', 'No comments yet. Be the first to share your thoughts!')}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              user={user}
              onCommentUpdated={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostComments;
