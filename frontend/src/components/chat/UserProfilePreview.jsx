import React from 'react';
import { Drawer, Tag, Avatar } from 'antd';
import { UserOutlined, MailOutlined, EnvironmentOutlined, IdcardOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export const UserProfilePreview = ({
  open,
  onClose,
  user
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'gold';
      case 'OFFICER': return 'emerald';
      case 'FARMER': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={<span className="font-bold">{t('user_profile', 'User Profile')}</span>}
      placement="right"
      width={360}
    >
      <div className="flex flex-col items-center text-center space-y-4 py-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-3xl shadow-inner">
          {user.first_name ? user.first_name[0].toUpperCase() : <UserOutlined />}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.full_name}</h2>
          <div className="mt-1">
            <Tag color={getRoleColor(user.role)} className="font-semibold text-xs border-none px-2 py-0.5">
              {user.role_display || user.role}
            </Tag>
          </div>
        </div>
      </div>

      <div className="space-y-4 py-4 text-sm">
        <div className="flex items-start gap-3">
          <MailOutlined className="text-emerald-600 text-lg mt-0.5" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t('email', 'Email')}</div>
            <div className="text-slate-800 dark:text-slate-200">{user.email}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <EnvironmentOutlined className="text-emerald-600 text-lg mt-0.5" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t('location_scope', 'Location Scope')}</div>
            <div className="text-slate-800 dark:text-slate-200">{user.location_summary || 'System Level'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <IdcardOutlined className="text-emerald-600 text-lg mt-0.5" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t('status', 'Account Status')}</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold">{user.status}</div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
