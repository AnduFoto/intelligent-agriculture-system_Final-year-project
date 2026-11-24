import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { Share2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';

export const SharePostModal = ({ isOpen, onClose, post, onPostShared }) => {
  const { t } = useTranslation();
  const [optionalText, setOptionalText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleShare = async () => {
    if (!post) return;
    setSubmitting(true);
    try {
      await communityService.sharePost(post.id, { optional_text: optionalText });
      message.success(t('community.sharedSuccess', 'Post shared with community!'));
      setOptionalText('');
      if (onPostShared) onPostShared();
      onClose();
    } catch (err) {
      message.error(t('community.shareError', 'Failed to share post.'));
    } finally {
      setSubmitting(false);
    }
  };

  const author = post?.author || {};

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
          <Share2 className="w-5 h-5 text-emerald-500" />
          <span>{t('community.sharePost', 'Share Post')}</span>
        </div>
      }
      className="dark:bg-slate-800"
    >
      <div className="space-y-4 pt-2">
        <textarea
          rows={3}
          value={optionalText}
          onChange={(e) => setOptionalText(e.target.value)}
          placeholder={t('community.shareCommentPlaceholder', 'Add your thoughts or commentary (optional)...')}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs outline-none resize-none"
        />

        {/* Embedded Post Preview */}
        {post && (
          <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>{author.full_name || author.first_name} ({author.role})</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-3 italic">
              "{post.content}"
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>{t('community.cancel', 'Cancel')}</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleShare}
            className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
          >
            {t('community.shareNow', 'Share Now')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SharePostModal;
