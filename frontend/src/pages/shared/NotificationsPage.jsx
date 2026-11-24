import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import { NotificationDetailModal } from '../../components/notifications/NotificationDetailModal';
import notificationService from '../../api/notificationService';
import { useNotificationContext } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Batch Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const { refreshUnreadCount } = useNotificationContext();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter === 'unread') params.is_read = false;
      if (statusFilter === 'read') params.is_read = true;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const data = await notificationService.getNotifications(params);
      setNotifications(data.results || []);
      setTotal(data.count || 0);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    setSelectedIds([]);
  }, [page, statusFilter, categoryFilter, priorityFilter]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        refreshUnreadCount();
      } catch (err) {
        console.error(err);
      }
    }
    if (notification.action_url && notification.action_url !== '/notifications') {
      navigate(notification.action_url);
    } else {
      setSelectedNotification(notification);
      setDetailModalOpen(true);
    }
  };

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await notificationService.batchAction(action, selectedIds);
      setSelectedIds([]);
      refreshUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(`Failed to ${action} notifications`, err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      refreshUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(t('confirm_delete_all', 'Are you sure you want to delete all notifications? This cannot be undone.'))) return;
    try {
      await notificationService.deleteAll();
      refreshUnreadCount();
      setPage(1);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete all notifications', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('notification_center', 'Notification Center')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('notification_subtitle', 'Manage all your alerts and activities')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleMarkAllRead} variant="outline" className="text-sm py-2">
            {t('mark_all_read', 'Mark All Read')}
          </Button>
          <Button onClick={handleDeleteAll} variant="danger" className="text-sm py-2">
            {t('delete_all', 'Delete All')}
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-4 shadow-soft">
        
        {/* TABS */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['all', 'unread', 'read'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white dark:bg-zinc-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              {t(tab, tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </div>

        {/* DROPDOWNS */}
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="flex-1 md:flex-none bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">{t('all_categories', 'All Categories')}</option>
            <option value="AUTHENTICATION">{t('authentication', 'Authentication')}</option>
            <option value="CONSULTATION">{t('consultation', 'Consultation')}</option>
            <option value="EDUCATION">{t('education', 'Education')}</option>
            <option value="ADMINISTRATION">{t('administration', 'Administration')}</option>
            <option value="AI_PREDICTION">{t('ai_prediction', 'AI Prediction')}</option>
            <option value="ASSIGNMENT">{t('assignment', 'Assignment')}</option>
            <option value="SYSTEM">{t('system', 'System')}</option>
          </select>

          <select 
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="flex-1 md:flex-none bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">{t('all_priorities', 'All Priorities')}</option>
            <option value="HIGH">{t('high', 'High')}</option>
            <option value="CRITICAL">{t('critical', 'Critical')}</option>
            <option value="NORMAL">{t('normal', 'Normal')}</option>
            <option value="LOW">{t('low', 'Low')}</option>
          </select>
        </div>
      </div>

      {/* BULK ACTIONS BANNER */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-500/30 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <span className="text-primary-800 dark:text-primary-300 font-bold text-sm">
            {t('items_selected', { count: selectedIds.length, defaultValue: `${selectedIds.length} selected` })}
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleBatchAction('read')}>
              {t('mark_read', 'Mark Read')}
            </Button>
            <Button size="sm" variant="danger" className="flex-1 sm:flex-none" onClick={() => handleBatchAction('delete')}>
              {t('delete', 'Delete')}
            </Button>
          </div>
        </div>
      )}

      {/* NOTIFICATION LIST */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-soft dark:shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('loading_notifications', 'Loading notifications...')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-500">{t('no_notifications', 'No notifications found')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="pl-2 pb-2 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/80">
              <input 
                type="checkbox"
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600 cursor-pointer"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t('select_all', 'Select All on Page')}
              </span>
            </div>
            
            {notifications.map(n => (
              <div key={n.id} className="flex items-center gap-3 group">
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(n.id)}
                  onChange={(e) => handleSelect(n.id, e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  style={{ opacity: selectedIds.includes(n.id) ? 1 : undefined }}
                />
                <NotificationCard 
                  notification={n} 
                  onClick={handleNotificationClick} 
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {total > 10 && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('previous', 'Previous')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= total}
              >
                {t('next', 'Next')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <NotificationDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        notification={selectedNotification}
      />
    </div>
  );
}
