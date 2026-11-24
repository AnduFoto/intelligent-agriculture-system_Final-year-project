import React, { useState } from 'react';
import { Modal, Select, Input, Button, message as antMessage } from 'antd';
import { FlagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chatService from '../../api/chatService';

export const ReportChatModal = ({
  open,
  onClose,
  conversationId,
  messageToReport
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('HARASSMENT');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!conversationId) return;

    setSubmitting(true);
    try {
      await chatService.reportChat({
        conversation_id: conversationId,
        message_id: messageToReport ? messageToReport.id : null,
        reason,
        description
      });
      antMessage.success(t('report_submitted', 'Report submitted successfully. Administrators will review it promptly.'));
      onClose();
    } catch (err) {
      console.error('Failed to submit report', err);
      antMessage.error(t('report_failed', 'Failed to submit report. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="font-bold flex items-center gap-2 text-amber-600"><FlagOutlined /> {t('report_chat_title', 'Report Chat / Message')}</span>}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={t('submit_report', 'Submit Report')}
      okButtonProps={{ className: 'bg-amber-600 hover:bg-amber-700' }}
    >
      <div className="space-y-4 py-3 text-sm">
        {messageToReport && (
          <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs border-l-4 border-amber-500">
            <span className="font-semibold">{t('reported_message', 'Reported Message')}: </span>
            <span className="italic">"{messageToReport.text || messageToReport.message_type}"</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('reason_for_report', 'Reason for Report')}
          </label>
          <Select
            value={reason}
            onChange={(val) => setReason(val)}
            className="w-full"
            options={[
              { value: 'SPAM', label: t('reason_spam', 'Spam') },
              { value: 'HARASSMENT', label: t('reason_harassment', 'Harassment') },
              { value: 'INAPPROPRIATE', label: t('reason_inappropriate', 'Inappropriate Content') },
              { value: 'THREAT', label: t('reason_threat', 'Threatening Behavior') },
              { value: 'IMPERSONATION', label: t('reason_impersonation', 'Impersonation') },
              { value: 'OTHER', label: t('reason_other', 'Other') }
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('additional_details', 'Additional Details')}
          </label>
          <Input.TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('describe_violation_placeholder', 'Describe why this content violates community standards...')}
          />
        </div>
      </div>
    </Modal>
  );
};
