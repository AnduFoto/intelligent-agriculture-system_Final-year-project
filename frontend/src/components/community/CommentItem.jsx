import React, { useState } from 'react';
import { ThumbsUp, Reply, Edit2, Trash2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';
import { message } from 'antd';

export const CommentItem = ({ comment, postId, user, onCommentUpdated, isReply = false }) => {
  const { t } = useTranslation();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);

  const author = comment.author || {};
  const isOwner = comment.is_owner || (user && author.id === user.id);
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const handleToggleLike = async () => {
    try {
      const res = await communityService.likeComment(comment.id);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      message.error(t('community.likeError', 'Failed to like comment.'));
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await communityService.createComment(postId, {
        content: replyText,
        parent_comment: comment.id,
      });
      setReplyText('');
      setIsReplying(false);
      onCommentUpdated();
      message.success(t('community.replyAdded', 'Reply added.'));
    } catch (err) {
      message.error(t('community.replyError', 'Failed to post reply.'));
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await communityService.updateComment(comment.id, { content: editText });
      setIsEditing(false);
      onCommentUpdated();
      message.success(t('community.commentUpdated', 'Comment updated.'));
    } catch (err) {
      message.error(t('community.commentUpdateError', 'Failed to update comment.'));
    }
  };

  const handleDelete = async () => {
    try {
      await communityService.deleteComment(comment.id);
      onCommentUpdated();
      message.success(t('community.commentDeleted', 'Comment deleted.'));
    } catch (err) {
      message.error(t('community.commentDeleteError', 'Failed to delete comment.'));
    }
  };

  return (
    <div className={`flex items-start gap-2.5 ${isReply ? 'ml-8 mt-2.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3' : 'mt-3'}`}>
      {/* Avatar */}
      {author.profile_image_url || author.profile_image ? (
        <img
          src={author.profile_image_url || author.profile_image}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-emerald-500/20"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center shrink-0">
          {author.first_name ? author.first_name[0] : 'U'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="bg-slate-100 dark:bg-slate-700/60 p-3 rounded-2xl inline-block max-w-full text-xs">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-slate-900 dark:text-white">
              {author.full_name || `${author.first_name || ''} ${author.last_name || ''}`}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {author.role}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs outline-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleSaveEdit} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-[11px] text-slate-500">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {/* Action bar below comment */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
          <button
            onClick={handleToggleLike}
            className={`font-semibold hover:underline ${liked ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
          >
            {liked ? 'Liked' : 'Like'} {likesCount > 0 && `(${likesCount})`}
          </button>

          {!isReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="font-semibold hover:underline text-slate-600 dark:text-slate-300"
            >
              Reply
            </button>
          )}

          {(isOwner || isAdmin) && (
            <>
              <button onClick={() => setIsEditing(!isEditing)} className="hover:underline text-slate-500">
                Edit
              </button>
              <button onClick={handleDelete} className="hover:underline text-red-500">
                Delete
              </button>
            </>
          )}

          <span className="text-[10px] text-slate-400">
            {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Reply Box */}
        {isReplying && (
          <div className="flex items-center gap-2 mt-2 pl-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            />
            <button
              onClick={handleSendReply}
              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                user={user}
                onCommentUpdated={onCommentUpdated}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
