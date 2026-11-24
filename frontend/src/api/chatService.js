import api from './axiosInstance';

const chatService = {
  // Fetch active conversations with filters (search, role, kebele, chat_type, sort)
  getConversations: async (params = {}) => {
    const response = await api.get('/chat/conversations/', { params });
    return response.data;
  },

  // Create or retrieve conversation with a target user
  getOrCreateConversation: async (recipientId) => {
    const response = await api.post('/chat/conversations/', { recipient_id: recipientId });
    return response.data;
  },

  // Get specific conversation
  getConversationDetail: async (id) => {
    const response = await api.get(`/chat/conversations/${id}/`);
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (id) => {
    const response = await api.post(`/chat/conversations/${id}/read/`);
    return response.data;
  },

  // Send typing indicator
  sendTyping: async (id) => {
    const response = await api.post(`/chat/conversations/${id}/typing/`);
    return response.data;
  },

  // Fetch messages in a conversation (paginated)
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages/`, { params });
    return response.data;
  },

  // Send a message (text, media, voice, reply)
  sendMessage: async (conversationId, messageData) => {
    // Check if messageData is FormData (for media files)
    const isFormData = messageData instanceof FormData;
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages/`,
      messageData,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return response.data;
  },

  // Edit text message
  editMessage: async (messageId, text) => {
    const response = await api.patch(`/chat/messages/${messageId}/`, { text });
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}/`);
    return response.data;
  },

  // Toggle emoji reaction (LIKE, LOVE, LAUGH, CRY, CARE, SAD)
  toggleReaction: async (messageId, emoji) => {
    const response = await api.post(`/chat/messages/${messageId}/react/`, { emoji });
    return response.data;
  },

  // Toggle favorite / star status
  toggleFavorite: async (messageId) => {
    const response = await api.post(`/chat/messages/${messageId}/favorite/`);
    return response.data;
  },

  // Get favorite messages
  getFavoriteMessages: async (conversationId = null) => {
    const params = conversationId ? { conversation_id: conversationId } : {};
    const response = await api.get('/chat/favorites/', { params });
    return response.data;
  },

  // Get global unread chat count
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count/');
    return response.data;
  },

  // Search users to start new chat
  searchUsers: async (params = {}) => {
    const response = await api.get('/chat/users/search/', { params });
    return response.data;
  },

  // Block a user
  blockUser: async (userId) => {
    const response = await api.post(`/chat/users/${userId}/block/`);
    return response.data;
  },

  // Unblock a user
  unblockUser: async (userId) => {
    const response = await api.delete(`/chat/users/${userId}/block/`);
    return response.data;
  },

  // Get blocked users
  getBlockedUsers: async () => {
    const response = await api.get('/chat/blocked/');
    return response.data;
  },

  // Submit chat report
  reportChat: async (reportData) => {
    const response = await api.post('/chat/reports/', reportData);
    return response.data;
  },

  // Admin: Get all chat reports
  getChatReports: async (params = {}) => {
    const response = await api.get('/chat/reports/', { params });
    return response.data;
  },

  // Admin: Resolve/update chat report (action_taken: 'DISMISS' | 'WARN' | 'SUSPEND')
  updateChatReport: async (reportId, data) => {
    const response = await api.patch(`/chat/reports/${reportId}/`, data);
    return response.data;
  },

  // Admin: Get chat stats
  getAdminStats: async () => {
    const response = await api.get('/chat/admin/stats/');
    return response.data;
  }
};

export default chatService;
