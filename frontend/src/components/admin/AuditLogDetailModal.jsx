import React from 'react';
import { Modal, Tag, Descriptions, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  ThunderboltOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

export default function AuditLogDetailModal({ visible, onClose, auditLog }) {
  const { t } = useTranslation();

  if (!auditLog) return null;

  const getLocationPath = () => {
    const parts = [];
    if (auditLog.region_name) parts.push(auditLog.region_name);
    if (auditLog.special_woreda_name) {
      parts.push(`${auditLog.special_woreda_name} (${t('special_woreda', 'Special Woreda')})`);
    } else {
      if (auditLog.zone_name) parts.push(auditLog.zone_name);
      if (auditLog.woreda_name) parts.push(auditLog.woreda_name);
    }
    if (auditLog.kebele_name) parts.push(auditLog.kebele_name);

    return parts.length > 0 ? parts.join(' → ') : t('global_system', 'Global / System-wide');
  };

  const getActionTagColor = (category) => {
    switch (category) {
      case 'USER': return 'blue';
      case 'LOCATION': return 'purple';
      case 'ASSIGNMENT': return 'green';
      case 'EDUCATION': return 'orange';
      case 'CONSULTATION': return 'cyan';
      default: return 'geekblue';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-lg">
          <ThunderboltOutlined className="text-emerald-600 dark:text-emerald-400" />
          <span>{t('activity_log_details', 'Activity Log Details')}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
      className="dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-content]:text-white"
    >
      <div className="py-4 space-y-6 text-slate-700 dark:text-slate-300">
        {/* Status Header Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <Tag color={getActionTagColor(auditLog.category)} className="px-3 py-1 text-sm font-semibold rounded-md uppercase">
              {auditLog.category_display || auditLog.category}
            </Tag>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {auditLog.action_display || auditLog.action}
            </span>
          </div>
          <div>
            {auditLog.is_success ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {t('success', 'Success')}
              </Tag>
            ) : (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                {t('failed', 'Failed')}
              </Tag>
            )}
          </div>
        </div>

        {/* Primary Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <UserOutlined className="text-emerald-500" />
              {t('actor_administrator', 'Actor / Administrator')}
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              {auditLog.actor_name || t('system', 'System')}
            </div>
            {auditLog.actor_email && (
              <div className="text-xs text-slate-500 dark:text-slate-400">{auditLog.actor_email}</div>
            )}
            {auditLog.ip_address && (
              <div className="text-xs text-slate-400 dark:text-slate-500">
                IP: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">{auditLog.ip_address}</code>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <CalendarOutlined className="text-emerald-500" />
              {t('timestamp', 'Timestamp')}
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              {new Date(auditLog.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Location Scope */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <EnvironmentOutlined className="text-emerald-500" />
            {t('location_scope', 'Location Scope')}
          </div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {getLocationPath()}
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <InfoCircleOutlined className="text-emerald-500" />
            {t('description', 'Description')}
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {auditLog.description}
          </p>
        </div>

        {/* Target Entity */}
        {(auditLog.target_repr || auditLog.target_type) && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              {t('target_entity', 'Target Entity')}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {auditLog.target_repr || auditLog.target_id}
              </span>
              {auditLog.target_type && (
                <Tag color="default" className="text-xs">
                  {auditLog.target_type}
                </Tag>
              )}
            </div>
          </div>
        )}

        {/* Metadata JSON */}
        {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase mb-1">{t('additional_metadata', 'Additional Metadata')}</div>
            <pre>{JSON.stringify(auditLog.metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
