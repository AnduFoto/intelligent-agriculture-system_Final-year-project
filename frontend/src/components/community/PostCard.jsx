import React, { useState } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostComments from './PostComments';
import SharePostModal from './SharePostModal';
import ReportPostModal from './ReportPostModal';
import communityService from '../../api/communityService';
import { message } from 'antd';

export const PostCard = ({
  post,
  user,
  onPostUpdated,
  onPostDeleted,
  onEditPostRequested
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [currentPost, setCurrentPost] = useState(post);

  const handleToggleLike = async () => {
    try {
      const res = await communityService.likePost(currentPost.id);
      setCurrentPost(prev => ({
        ...prev,
        is_liked: res.liked,
        likes_count: res.likes_count
      }));
    } catch (err) {
      message.error('Failed to update like status.');
    }
  };

  const handleDeletePost = async () => {
    try {
      await communityService.deletePost(currentPost.id);
      message.success('Post deleted.');
      if (onPostDeleted) onPostDeleted(currentPost.id);
    } catch (err) {
      message.error('Failed to delete post.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden mb-5 transition-all hover:shadow-sm">
      {/* Header */}
      <PostHeader
        post={currentPost}
        user={user}
        onEdit={() => onEditPostRequested(currentPost)}
        onDelete={handleDeletePost}
        onReport={() => setShowReportModal(true)}
      />

      {/* Content & Media */}
      <PostContent
        content={currentPost.content}
        mediaFiles={currentPost.media_files || []}
      />

      {/* Social Actions */}
      <PostActions
        post={currentPost}
        onToggleLike={handleToggleLike}
        onToggleComments={() => setShowComments(!showComments)}
        onShare={() => setShowShareModal(true)}
        showComments={showComments}
      />

      {/* Comments Section */}
      {showComments && (
        <PostComments
          postId={currentPost.id}
          user={user}
          onCommentsCountChanged={() => {
            setCurrentPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
          }}
        />
      )}

      {/* Modals */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={currentPost}
        onPostShared={() => {
          setCurrentPost(prev => ({ ...prev, shares_count: prev.shares_count + 1 }));
        }}
      />

      <ReportPostModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        post={currentPost}
      />
    </div>
  );
};

export default PostCard;
