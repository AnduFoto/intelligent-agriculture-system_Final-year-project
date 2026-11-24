import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import chatService from '../api/chatService';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await chatService.getUnreadCount();
      setUnreadChatCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread chat count:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadChatCount(0);
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    // 30-second HTTP polling
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <ChatContext.Provider value={{ unreadChatCount, refreshUnreadCount: fetchUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
