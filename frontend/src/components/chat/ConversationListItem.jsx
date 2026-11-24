import React from 'react';
import { Badge, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export const ConversationListItem = ({
  conversation,
  isSelected,
  onClick
}) => {
  const otherUser = conversation.other_user;
  const lastMsg = conversation.last_message;
  const unreadCount = conversation.unread_count;
  const isTyping = conversation.is_typing;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'gold';
      case 'OFFICER': return 'emerald';
      case 'FARMER': return 'blue';
      default: return 'default';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
          : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
      }`}
    >
      {/* User Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg flex-shrink-0">
          {otherUser?.first_name ? otherUser.first_name[0].toUpperCase() : <UserOutlined />}
        </div>
      </div>

      {/* Item Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
            {otherUser?.full_name || 'User'}
          </h4>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 whitespace-nowrap">
            {formatTime(conversation.updated_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate flex-1">
            {isTyping ? (
              <span className="text-emerald-600 dark:text-emerald-400 italic font-medium">typing...</span>
            ) : lastMsg ? (
              lastMsg.message_type === 'TEXT' ? lastMsg.text : `[${lastMsg.message_type.toLowerCase()}]`
            ) : (
              <span className="italic text-slate-400">No messages yet</span>
            )}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {otherUser?.role && (
              <Tag color={getRoleColor(otherUser.role)} className="m-0 text-[10px] font-semibold border-none px-1.5 py-0">
                {otherUser.role_display || otherUser.role}
              </Tag>
            )}

            {unreadCount > 0 && (
              <Badge count={unreadCount} overflowCount={99} className="flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
