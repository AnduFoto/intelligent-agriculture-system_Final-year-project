import React from 'react';
import { Button, Dropdown, Tag } from 'antd';
import { ArrowLeftOutlined, UserOutlined, MoreOutlined, FlagOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export const ChatHeader = ({
  conversation,
  onBack,
  onOpenProfile,
  onBlockToggle,
  onReport
}) => {
  const { t } = useTranslation();
  const otherUser = conversation?.other_user;
  const isBlocked = conversation?.is_blocked;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'gold';
      case 'OFFICER': return 'emerald';
      case 'FARMER': return 'blue';
      default: return 'default';
    }
  };

  const actionItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('view_profile', 'View Profile'),
      onClick: onOpenProfile
    },
    {
      key: 'block',
      icon: isBlocked ? <UnlockOutlined className="text-emerald-500" /> : <LockOutlined className="text-red-500" />,
      label: isBlocked ? <span className="text-emerald-500">{t('unblock_user', 'Unblock User')}</span> : <span className="text-red-500">{t('block_user', 'Block User')}</span>,
      onClick: onBlockToggle
    },
    {
      key: 'report',
      icon: <FlagOutlined className="text-amber-500" />,
      label: <span className="text-amber-500">{t('report_conversation', 'Report Conversation')}</span>,
      onClick: onReport
    }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 rounded-t-2xl transition-colors">
      
      {/* Left: Partner Profile Summary */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Mobile Back Button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="md:hidden p-0 w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300"
          onClick={onBack}
        />

        {/* Avatar */}
        <div 
          className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-base cursor-pointer flex-shrink-0"
          onClick={onOpenProfile}
        >
          {otherUser?.first_name ? otherUser.first_name[0].toUpperCase() : <UserOutlined />}
        </div>

        {/* Info */}
        <div className="min-w-0 cursor-pointer" onClick={onOpenProfile}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
              {otherUser?.full_name || t('user', 'User')}
            </h3>
            {otherUser?.role && (
              <Tag color={getRoleBadgeColor(otherUser.role)} className="m-0 text-[10px] font-semibold border-none">
                {otherUser.role_display || otherUser.role}
              </Tag>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
            {otherUser?.location_summary || t('chat_partner', 'Chat Partner')}
          </p>
        </div>
      </div>

      {/* Right: Actions Menu */}
      <div className="flex items-center gap-1">
        <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined className="text-lg text-slate-600 dark:text-slate-300" />} />
        </Dropdown>
      </div>

    </div>
  );
};
