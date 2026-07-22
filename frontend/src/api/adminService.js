import axiosInstance from './axiosInstance';

export const adminService = {
  listUsers: (params) => axiosInstance.get('/auth/admin/users/', { params }),
  createUser: (data) => axiosInstance.post('/auth/admin/users/create/', data),
  getUser: (id) => axiosInstance.get(`/auth/admin/users/${id}/`),
  updateUserStatus: (id, status) => axiosInstance.patch(`/auth/admin/users/${id}/status/`, { status }),
};