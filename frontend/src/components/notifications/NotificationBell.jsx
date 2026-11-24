import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Dropdown, Button, Spin, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../context/NotificationContext';
import notificationService from '../../api/notificationService';
import { NotificationCard } from './NotificationCard';
import { NotificationDetailModal } from './NotificationDetailModal';

export const NotificationBell = () => {
  const { t } = useTranslation();
  const { unreadCount, refreshUnreadCount } = useNotificationContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const navigate = useNavigate();

  // Load recent unread notifications when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      loadRecentNotifications();
    }
  }, [dropdownOpen]);

  const loadRecentNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        limit: 5,
      });
      setNotifications(data.results || []);
    } catch (error) {
      console.error('Failed to load recent notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not read
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        refreshUnreadCount();
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }

    setDropdownOpen(false);

    // If there is a specific action URL (and it is not generic /notifications), navigate there
    if (notification.action_url && notification.action_url !== '/notifications') {
      navigate(notification.action_url);
    } else {
      // Open detail modal for warnings or general notifications
      setSelectedNotification(notification);
      setDetailModalOpen(true);
    }
  };

  const items = [
    {
      key: 'header',
      label: (
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
          <span className="font-semibold text-slate-800">{t('notifications_title', 'Notifications')}</span>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              className="text-emerald-600 hover:text-emerald-700 p-0"
              onClick={async (e) => {
                e.stopPropagation();
                await notificationService.markAllAsRead();
                refreshUnreadCount();
                loadRecentNotifications();
              }}
            >
              {t('mark_all_read', 'Mark all as read')}
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'list',
      label: (
        <div className="max-h-96 overflow-y-auto w-80 md:w-96 p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center p-4"><Spin /></div>
          ) : notifications.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('no_new_notifications', 'No new notifications')} />
          ) : (
            notifications.map(n => (
              <NotificationCard 
                key={n.id} 
                notification={n} 
                onClick={handleNotificationClick} 
              />
            ))
          )}
        </div>
      ),
    },
    {
      key: 'footer',
      label: (
        <div 
          className="text-center py-2 text-emerald-600 hover:text-emerald-700 bg-slate-50 border-t border-slate-100 rounded-b-lg font-medium cursor-pointer"
          onClick={() => {
            setDropdownOpen(false);
            navigate('/notifications');
          }}
        >
          {t('view_all_notifications', 'View All Notifications')}
        </div>
      ),
    },
  ];

  return (
    <>
      <Dropdown 
        menu={{ items }} 
        trigger={['click']} 
        placement="bottomRight"
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        classNames={{ root: "shadow-xl rounded-lg" }}
      >
        <Badge count={unreadCount} overflowCount={99} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined className="text-xl text-slate-600" />} 
            className="flex items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-full"
          />
        </Badge>
      </Dropdown>

      <NotificationDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        notification={selectedNotification}
      />
    </>
  );
};
