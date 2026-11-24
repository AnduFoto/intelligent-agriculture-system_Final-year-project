import axiosInstance from './axiosInstance';

export const communityService = {
  // Posts Feed & CRUD
  getPosts: async (params = {}) => {
    const response = await axiosInstance.get('/community/posts/', { params });
    return response.data;
  },

  createPost: async (formData) => {
    const response = await axiosInstance.post('/community/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePost: async (id, data) => {
    const response = await axiosInstance.patch(`/community/posts/${id}/`, data);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await axiosInstance.delete(`/community/posts/${id}/`);
    return response.data;
  },

  // Post Likes & Social
  likePost: async (id) => {
    const response = await axiosInstance.post(`/community/posts/${id}/like/`);
    return response.data;
  },

  unlikePost: async (id) => {
    const response = await axiosInstance.delete(`/community/posts/${id}/like/`);
    return response.data;
  },

  // Comments
  getComments: async (postId) => {
    const response = await axiosInstance.get(`/community/posts/${postId}/comments/`);
    return response.data;
  },

  createComment: async (postId, data) => {
    const response = await axiosInstance.post(`/community/posts/${postId}/comments/`, data);
    return response.data;
  },

  updateComment: async (commentId, data) => {
    const response = await axiosInstance.patch(`/community/comments/${commentId}/`, data);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/community/comments/${commentId}/`);
    return response.data;
  },

  likeComment: async (commentId) => {
    const response = await axiosInstance.post(`/community/comments/${commentId}/like/`);
    return response.data;
  },

  unlikeComment: async (commentId) => {
    const response = await axiosInstance.delete(`/community/comments/${commentId}/like/`);
    return response.data;
  },

  // Sharing
  sharePost: async (postId, data = {}) => {
    const response = await axiosInstance.post(`/community/posts/${postId}/share/`, data);
    return response.data;
  },

  // Reporting
  reportPost: async (postId, data) => {
    const response = await axiosInstance.post(`/community/posts/${postId}/report/`, data);
    return response.data;
  },

  reportComment: async (commentId, data) => {
    const response = await axiosInstance.post(`/community/comments/${commentId}/report/`, data);
    return response.data;
  },

  // Admin Moderation
  getCommunityReports: async (params = {}) => {
    const response = await axiosInstance.get('/community/reports/', { params });
    return response.data;
  },

  resolveCommunityReport: async (reportId, data) => {
    const response = await axiosInstance.patch(`/community/reports/${reportId}/`, data);
    return response.data;
  },

  // Trending Insights
  getTrendingCommunity: async () => {
    const response = await axiosInstance.get('/community/trending/');
    return response.data;
  },
};

export default communityService;
