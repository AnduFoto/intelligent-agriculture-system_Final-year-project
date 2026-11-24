import React from 'react';
import { Badge, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';
import { useTranslation } from 'react-i18next';

export const ChatButton = () => {
  const { t } = useTranslation();
  const { unreadChatCount } = useChatContext();
  const navigate = useNavigate();

  return (
    <Badge count={unreadChatCount} overflowCount={99} size="small">
      <Button
        type="text"
        icon={<MessageOutlined className="text-xl text-slate-600 dark:text-slate-300" />}
        className="flex items-center justify-center w-10 h-10 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        onClick={() => navigate('/chat')}
        title={t('chat', 'Chat')}
      />
    </Badge>
  );
};
