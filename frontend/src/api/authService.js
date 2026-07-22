import axiosInstance from './axiosInstance';

export const authService = {
  register: (data) => axiosInstance.post('/auth/register/', data),
  verifyEmail: (token) => axiosInstance.post('/auth/verify-email/', { token }),
  resendVerification: (email) => axiosInstance.post('/auth/resend-verification/', { email }),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password/', data),
  changePassword: (data) => axiosInstance.post('/auth/change-password/', data),
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.patch('/auth/profile/', data),
};

export const locationService = {
  getFullTree: () => axiosInstance.get('/locations/tree/'),
};