import axiosInstance from './axiosInstance';

export const adminService = {
  listUsers: (params) => axiosInstance.get('/auth/admin/users/', { params }),
  createUser: (data) => axiosInstance.post('/auth/admin/users/create/', data),
  getUser: (id) => axiosInstance.get(`/auth/admin/users/${id}/`),
  updateUserStatus: (id, status) => axiosInstance.patch(`/auth/admin/users/${id}/status/`, { status }),

  listOfficerKebeles: (id) => axiosInstance.get(`/auth/admin/users/${id}/kebeles/`),
  assignOfficerKebeles: (id, kebeleIds) => axiosInstance.post(`/auth/admin/users/${id}/kebeles/assign/`, { kebele_ids: kebeleIds }),
  removeOfficerKebele: (id, kebeleId) => axiosInstance.delete(`/auth/admin/users/${id}/kebeles/${kebeleId}/`),
  getKebeleOfficers: (kebeleId) => axiosInstance.get(`/auth/admin/kebeles/${kebeleId}/officers/`),
};