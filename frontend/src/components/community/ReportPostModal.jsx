import React, { useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import { Flag, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';

export const ReportPostModal = ({ isOpen, onClose, post }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('INAPPROPRIATE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (!post) return;
    setSubmitting(true);
    try {
      await communityService.reportPost(post.id, { reason, description });
      message.success(t('community.reportSubmitted', 'Report submitted successfully. Administrators will review this content.'));
      setDescription('');
      onClose();
    } catch (err) {
      message.error(t('community.reportError', 'Failed to submit report.'));
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: 'SPAM', label: t('community.reasonSpam', 'Spam or Promotional') },
    { value: 'HARASSMENT', label: t('community.reasonHarassment', 'Harassment or Bullying') },
    { value: 'INAPPROPRIATE', label: t('community.reasonInappropriate', 'Inappropriate Content') },
    { value: 'MISINFORMATION', label: t('community.reasonMisinformation', 'Agricultural Misinformation') },
    { value: 'HATEFUL_CONTENT', label: t('community.reasonHateful', 'Hateful Content') },
    { value: 'SCAM', label: t('community.reasonScam', 'Scam or Fraud') },
    { value: 'OTHER', label: t('community.reasonOther', 'Other Violation') },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
          <Flag className="w-5 h-5 text-amber-500" />
          <span>{t('community.reportContent', 'Report Content')}</span>
        </div>
      }
      className="dark:bg-slate-800"
    >
      <div className="space-y-4 pt-2">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{t('community.reportNote', 'Reports are confidential and reviewed by system administrators.')}</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('community.selectReason', 'Select Reason')}
          </label>
          <Select
            value={reason}
            onChange={(val) => setReason(val)}
            options={reasonOptions}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('community.descriptionOptional', 'Additional Details (Optional)')}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('community.reportDetailPlaceholder', 'Provide details to help administrators understand the issue...')}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>{t('community.cancel', 'Cancel')}</Button>
          <Button
            type="primary"
            danger
            loading={submitting}
            onClick={handleReport}
            className="font-semibold"
          >
            {t('community.submitReport', 'Submit Report')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportPostModal;
