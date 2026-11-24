import React, { useState } from 'react';
import { Modal, message as antMessage } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chatService from '../../api/chatService';

export const BlockUserModal = ({
  open,
  onClose,
  targetUser,
  isBlocked,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!targetUser) return;
    setLoading(true);

    try {
      if (isBlocked) {
        await chatService.unblockUser(targetUser.id);
        antMessage.success(t('user_unblocked_success', 'User has been unblocked.'));
      } else {
        await chatService.blockUser(targetUser.id);
        antMessage.success(t('user_blocked_success', 'User has been blocked.'));
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to block/unblock user', err);
      antMessage.error(t('block_action_failed', 'Action failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className={`font-bold flex items-center gap-2 ${isBlocked ? 'text-emerald-600' : 'text-red-600'}`}>
          {isBlocked ? <UnlockOutlined /> : <LockOutlined />}
          {isBlocked ? t('unblock_user', 'Unblock User') : t('block_user', 'Block User')}
        </span>
      }
      onOk={handleConfirm}
      confirmLoading={loading}
      okText={isBlocked ? t('unblock', 'Unblock') : t('block', 'Block')}
      okButtonProps={{ danger: !isBlocked, className: isBlocked ? 'bg-emerald-600' : '' }}
    >
      <p className="py-2 text-sm text-slate-700 dark:text-slate-300">
        {isBlocked
          ? t('confirm_unblock_prompt', 'Are you sure you want to unblock {{name}}? You will be able to exchange messages again.', { name: targetUser?.full_name })
          : t('confirm_block_prompt', 'Are you sure you want to block {{name}}? They will not be able to send you messages.', { name: targetUser?.full_name })}
      </p>
    </Modal>
  );
};
