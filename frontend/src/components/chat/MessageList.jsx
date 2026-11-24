import React, { useRef, useEffect } from 'react';
import { Spin } from 'antd';
import { MessageBubble } from './MessageBubble';
import { useTranslation } from 'react-i18next';

export const MessageList = ({
  messages,
  loading,
  isTyping,
  otherUser,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onToggleReaction,
  onToggleFavorite
}) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatDateDivider = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today', 'Today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday', 'Yesterday');
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Group messages by Date
  const groupedMessages = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ type: 'DATE', date: msg.created_at, key: `date-${msgDate}` });
    }
    groupedMessages.push({ type: 'MSG', data: msg, key: `msg-${msg.id}` });
  });

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors">
      
      {loading && (
        <div className="flex justify-center py-4">
          <Spin size="small" />
        </div>
      )}

      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-500 py-12">
          <span className="text-4xl mb-2">💬</span>
          <p className="text-sm font-medium">{t('no_messages_yet', 'No messages yet. Say hello!')}</p>
        </div>
      )}

      {groupedMessages.map((item) => {
        if (item.type === 'DATE') {
          return (
            <div key={item.key} className="flex justify-center my-4">
              <span className="bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {formatDateDivider(item.date)}
              </span>
            </div>
          );
        }

        return (
          <MessageBubble
            key={item.key}
            message={item.data}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            onToggleReaction={onToggleReaction}
            onToggleFavorite={onToggleFavorite}
          />
        );
      })}

      {/* Real-time Typing Indicator Bubble */}
      {isTyping && (
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 text-slate-500 text-xs italic">
            <span>{otherUser?.full_name || t('user', 'User')} {t('is_typing', 'is typing')}</span>
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
