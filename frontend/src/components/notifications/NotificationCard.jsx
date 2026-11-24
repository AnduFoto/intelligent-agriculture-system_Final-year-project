import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { NotificationIcon } from './NotificationIcon';

export const NotificationCard = ({ notification, onClick, className = '' }) => {
  const { t, i18n } = useTranslation();
  const { is_read, category, notification_type, title, message, created_at } = notification;

  // Render relative time
  let timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  if (i18n.language === 'am') {
    timeAgo = timeAgo
      .replace('about', 'ወደ')
      .replace('hours', 'ሰዓታት')
      .replace('hour', 'ሰዓት')
      .replace('minutes', 'ደቂቃዎች')
      .replace('minute', 'ደቂቃ')
      .replace('days', 'ቀናት')
      .replace('day', 'ቀን')
      .replace('months', 'ወራት')
      .replace('month', 'ወር')
      .replace('years', 'ዓመታት')
      .replace('year', 'ዓመት')
      .replace('ago', 'በፊት')
      .replace('less than a minute', 'ከአንድ ደቂቃ በታች');
  }

  const handleClick = (e) => {
    if (onClick) {
      onClick(notification, e);
    }
  };

  let parsedTitle = title;
  let parsedMessage = message;

  if (title === 'New User Registered') {
    parsedTitle = t('notif_new_user', 'New User Registered');
  } else if (title.startsWith("New Message: ")) {
    parsedTitle = t('notif_new_message_prefix', 'New Message: ') + title.replace("New Message: ", "");
  } else if (title === "Disease Prediction Complete") {
    parsedTitle = t('notif_prediction_complete', 'Disease Prediction Complete');
  }

  if (message && message.includes('joined as')) {
    const parts = message.split(' joined as ');
    if (parts.length === 2) {
      parsedMessage = parts[0] + " " + t('notif_joined_as', 'joined as') + " " + parts[1];
    }
  } else if (message && message.includes("sent a new message.")) {
    parsedMessage = message.replace(" sent a new message.", "") + " " + t('notif_message_sent_prefix', 'sent a new message.');
  } else if (message && message.startsWith("Analysis of ") && message.includes("completed: ")) {
    const match = message.match(/Analysis of (.+) completed: (.+)/);
    if (match) {
      parsedMessage = t('notif_analysis_of', 'Analysis of ') + match[1] + t('notif_completed', ' completed: ') + match[2];
    }
  }

  return (
    <div 
      onClick={handleClick}
      className={`
        relative p-4 rounded-2xl flex items-start space-x-4
        transition-all duration-300 ease-in-out cursor-pointer border
        ${is_read 
          ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-soft dark:hover:shadow-2xl' 
          : 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-500/30 shadow-sm hover:shadow-md hover:bg-primary-100/50 dark:hover:bg-primary-900/40'
        }
        ${className}
      `}
    >
      {/* Unread dot indicator */}
      {!is_read && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
          is_read 
            ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400' 
            : 'bg-white dark:bg-primary-900/40 border-primary-200 dark:border-primary-500/30 text-primary-600 dark:text-primary-400'
        }`}>
          <NotificationIcon category={category} type={notification_type} />
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
          <h4 className={`text-sm font-bold truncate ${is_read ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-900 dark:text-white'}`}>
            {parsedTitle}
          </h4>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 whitespace-nowrap flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        <p className={`text-sm mt-1 line-clamp-2 leading-relaxed ${is_read ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-700 dark:text-zinc-300'}`}>
          {parsedMessage}
        </p>
      </div>
    </div>
  );
};
