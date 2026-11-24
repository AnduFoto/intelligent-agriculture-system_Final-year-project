import React from 'react';
import { Modal, Tag, Button } from 'antd';
import { WarningOutlined, InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDetailModal = ({ notification, open, onClose }) => {
  const { t } = useTranslation();

  if (!notification) return null;

  const { title, message, category, notification_type, priority, created_at, created_by } = notification;

  const isWarning = notification_type === 'WARNING' || title?.toLowerCase().includes('warning');
  const isError = notification_type === 'ERROR' || title?.toLowerCase().includes('suspend');

  const getTimeString = (dateIso) => {
    if (!dateIso) return '';
    const date = new Date(dateIso);
    const formatted = date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const ago = formatDistanceToNow(date, { addSuffix: true });
    return `${formatted} (${ago})`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type={isWarning ? "primary" : "default"}
          danger={isWarning || isError}
          onClick={onClose}
          className="rounded-xl font-semibold px-6"
        >
          {t('acknowledge_and_close', 'I Understand / Close')}
        </Button>
      ]}
      centered
      width={540}
      className="rounded-2xl overflow-hidden"
    >
      <div className="pt-2 space-y-4">
        
        {/* Header Icon + Title */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${
            isError
              ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
              : isWarning
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
          }`}>
            {isError ? <ExclamationCircleOutlined /> : isWarning ? <WarningOutlined /> : <InfoCircleOutlined />}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {priority === 'HIGH' || priority === 'CRITICAL' ? (
                <Tag color="red" className="m-0 font-bold text-[10px] uppercase rounded-full">
                  {priority}
                </Tag>
              ) : null}
              <Tag color={isWarning ? "amber" : "blue"} className="m-0 font-semibold text-[10px] uppercase rounded-full">
                {category || 'SYSTEM'}
              </Tag>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Timestamp & Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
          <CalendarOutlined />
          <span>{getTimeString(created_at)}</span>
          {created_by && (
            <span className="ml-auto font-medium text-slate-600 dark:text-zinc-400">
              {t('by', 'By')}: {created_by.full_name || created_by.email}
            </span>
          )}
        </div>

        {/* Warning / Message Content Box */}
        <div className={`p-4 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap ${
          isError
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
            : isWarning
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 font-medium'
            : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200'
        }`}>
          {isWarning && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
              <WarningOutlined />
              <span>{t('official_warning_notice', 'Official Policy Warning Notice')}</span>
            </div>
          )}
          <p>{message}</p>
        </div>

      </div>
    </Modal>
  );
};
