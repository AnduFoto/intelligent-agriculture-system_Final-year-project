import axiosInstance from './axiosInstance';

/**
 * Service for interacting with the Notifications API.
 */
const notificationService = {
  /**
   * Get a paginated list of notifications with optional filters.
   */
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications/', { params });
    return response.data;
  },

  /**
   * Get the current unread notification count.
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count/');
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.post(`/notifications/${id}/read/`);
    return response.data;
  },

  /**
   * Soft-delete a specific notification.
   */
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}/`);
    return response.data;
  },

  /**
   * Mark all unread notifications as read.
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.post('/notifications/read-all/');
    return response.data;
  },

  /**
   * Soft-delete all active notifications for the user.
   */
  deleteAll: async () => {
    const response = await axiosInstance.delete('/notifications/delete-all/');
    return response.data;
  },

  /**
   * Perform batch actions (read or delete) on a list of notification IDs.
   * @param {string} action - 'read' or 'delete'
   * @param {Array<number>} notificationIds - List of notification IDs
   */
  batchAction: async (action, notificationIds) => {
    const response = await axiosInstance.post(`/notifications/batch/${action}/`, {
      notification_ids: notificationIds,
    });
    return response.data;
  }
};

export default notificationService;
