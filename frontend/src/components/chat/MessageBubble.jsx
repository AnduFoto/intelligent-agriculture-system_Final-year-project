import React from 'react';
import { Dropdown, Tooltip } from 'antd';
import { 
  CheckOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  RollbackOutlined, 
  FlagOutlined, 
  MoreOutlined, 
  FileTextOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { VoiceMessage } from './VoiceMessage';
import { ImageMessage } from './ImageMessage';
import { VideoMessage } from './VideoMessage';
import { useTranslation } from 'react-i18next';

const EMOJI_MAP = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😂',
  CRY: '😢',
  CARE: '🥰',
  SAD: '☹️'
};

export const MessageBubble = ({
  message,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onToggleReaction,
  onToggleFavorite
}) => {
  const { t } = useTranslation();
  const isSender = message.is_sender;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const actionMenuItems = [
    {
      key: 'reply',
      icon: <RollbackOutlined />,
      label: t('reply', 'Reply'),
      onClick: () => onReply(message)
    },
    {
      key: 'favorite',
      icon: message.is_favorite ? <StarFilled className="text-amber-400" /> : <StarOutlined />,
      label: message.is_favorite ? t('unfavorite', 'Remove Favorite') : t('favorite', 'Favorite Message'),
      onClick: () => onToggleFavorite && onToggleFavorite(message)
    },
    ...(isSender && message.message_type === 'TEXT' && !message.is_deleted ? [{
      key: 'edit',
      icon: <EditOutlined />,
      label: t('edit', 'Edit'),
      onClick: () => onEdit(message)
    }] : []),
    ...(isSender && !message.is_deleted ? [{
      key: 'delete',
      icon: <DeleteOutlined className="text-red-500" />,
      label: <span className="text-red-500">{t('delete', 'Delete')}</span>,
      onClick: () => onDelete(message)
    }] : []),
    ...(!isSender ? [{
      key: 'report',
      icon: <FlagOutlined className="text-amber-500" />,
      label: <span className="text-amber-500">{t('report_message', 'Report Message')}</span>,
      onClick: () => onReport(message)
    }] : [])
  ];

  return (
    <div className={`flex flex-col mb-3 group ${isSender ? 'items-end' : 'items-start'}`}>
      
      {/* Reply Banner */}
      {message.reply_to && (
        <div className={`text-xs px-3 py-1.5 rounded-t-lg max-w-xs sm:max-w-md mb-1 border-l-4 border-emerald-500 ${
          isSender ? 'bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
        }`}>
          <span className="font-semibold">{message.reply_to.sender_name}: </span>
          <span className="truncate">{message.reply_to.text || t('attachment', 'Attachment')}</span>
        </div>
      )}

      {/* Main Bubble Content Container */}
      <div className="relative flex items-center gap-1.5 max-w-[85%] sm:max-w-[75%]">
        
        {/* Floating Reaction Bar on Hover */}
        {!message.is_deleted && (
          <div className={`absolute -top-9 z-20 hidden group-hover:flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-slate-200 dark:border-zinc-700 transition-all ${
            isSender ? 'right-0' : 'left-0'
          }`}>
            {Object.entries(EMOJI_MAP).map(([key, symbol]) => (
              <button
                key={key}
                onClick={() => onToggleReaction && onToggleReaction(message.id, key)}
                className="hover:scale-125 transition-transform p-0.5 text-base leading-none focus:outline-none"
                title={key}
              >
                {symbol}
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(message)}
              className="hover:scale-110 text-amber-400 p-0.5 text-xs transition-transform"
              title={message.is_favorite ? "Unfavorite" : "Favorite"}
            >
              {message.is_favorite ? <StarFilled /> : <StarOutlined className="text-slate-400 dark:text-zinc-400 hover:text-amber-400" />}
            </button>
          </div>
        )}

        {/* Actions Dropdown for Sent Messages (left side) */}
        {isSender && (
          <Dropdown menu={{ items: actionMenuItems }} trigger={['click']} placement="bottomRight">
            <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity">
              <MoreOutlined />
            </button>
          </Dropdown>
        )}

        <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words transition-all ${
          isSender
            ? 'bg-emerald-600 text-white rounded-br-none'
            : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-zinc-700 rounded-bl-none'
        }`}>
          
          {/* Favorite Star Badge Indicator */}
          {message.is_favorite && (
            <div className={`absolute -top-1.5 ${isSender ? '-left-1.5' : '-right-1.5'} bg-amber-400 text-zinc-900 p-0.5 rounded-full shadow text-[10px]`}>
              <StarFilled />
            </div>
          )}

          {/* Message Sender Name (for incoming messages) */}
          {!isSender && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              {message.sender?.full_name}
            </div>
          )}

          {/* Media Content */}
          {message.message_type === 'IMAGE' && message.media_file && (
            <ImageMessage imageUrl={message.media_file} fileName={message.file_name} />
          )}

          {message.message_type === 'VIDEO' && message.media_file && (
            <VideoMessage videoUrl={message.media_file} fileName={message.file_name} />
          )}

          {message.message_type === 'VOICE' && message.media_file && (
            <VoiceMessage audioUrl={message.media_file} isSender={isSender} />
          )}

          {message.message_type === 'FILE' && message.media_file && (
            <a 
              href={message.media_file} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                isSender ? 'bg-emerald-700 border-emerald-500 text-white' : 'bg-slate-100 dark:bg-zinc-700 border-slate-200 dark:border-zinc-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <FileTextOutlined className="text-xl" />
              <div className="flex-1 truncate">
                <div className="font-medium text-xs truncate">{message.file_name || 'Document'}</div>
                {message.file_size && <div className="text-[10px] opacity-80">{(message.file_size / 1024).toFixed(1)} KB</div>}
              </div>
            </a>
          )}

          {/* Text Content */}
          {message.text && (
            <p className={`whitespace-pre-wrap mt-1 ${message.is_deleted ? 'italic opacity-70' : ''}`}>
              {message.text}
            </p>
          )}

          {/* Timestamp & Status Footer */}
          <div className={`flex items-center justify-end gap-1.5 text-[10px] mt-1.5 select-none ${
            isSender ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-400'
          }`}>
            {message.is_edited && <span>{t('edited', 'Edited')}</span>}
            <span>{formatTime(message.created_at)}</span>

            {/* Sent ✓ vs Read ✓✓ Indicators */}
            {isSender && (
              <span className="font-bold flex items-center">
                {message.is_read ? (
                  <Tooltip title={t('read', 'Read')}>
                    <span className="text-accent-300 font-extrabold text-xs">✓✓</span>
                  </Tooltip>
                ) : (
                  <Tooltip title={t('sent', 'Sent')}>
                    <span className="text-emerald-200 text-xs">✓</span>
                  </Tooltip>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Actions Dropdown for Received Messages (right side) */}
        {!isSender && (
          <Dropdown menu={{ items: actionMenuItems }} trigger={['click']} placement="bottomLeft">
            <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity">
              <MoreOutlined />
            </button>
          </Dropdown>
        )}

      </div>

      {/* Reaction Badges Container below message */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
          {message.reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onToggleReaction && onToggleReaction(message.id, r.emoji)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-transform hover:scale-105 ${
                r.user_reacted
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>{EMOJI_MAP[r.emoji] || r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
