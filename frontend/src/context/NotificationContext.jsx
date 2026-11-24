import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../api/notificationService';
import { useLocation } from 'react-router-dom';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
    }
  }, [isAuthenticated]);

  // Fetch unread count on login/auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Smart polling: refresh when switching between major pages
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [location.pathname, isAuthenticated, fetchUnreadCount]);

  // Periodic polling: every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    unreadCount,
    setUnreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
