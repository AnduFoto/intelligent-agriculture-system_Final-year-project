import axiosInstance from './axiosInstance';

export const adminService = {
  listUsers: (params) => axiosInstance.get('/auth/admin/users/', { params }),
  createUser: (data) => axiosInstance.post('/auth/admin/users/create/', data),
  getUser: (id) => axiosInstance.get(`/auth/admin/users/${id}/`),
  deleteUser: (id) => axiosInstance.delete(`/auth/admin/users/${id}/`),
  updateUserStatus: (id, status) => axiosInstance.patch(`/auth/admin/users/${id}/status/`, { status }),

  listOfficerKebeles: (id) => axiosInstance.get(`/auth/admin/users/${id}/kebeles/`),
  assignOfficerKebeles: (id, kebeleIds) => axiosInstance.post(`/auth/admin/users/${id}/kebeles/assign/`, { kebele_ids: kebeleIds }),
  removeOfficerKebele: (id, kebeleId) => axiosInstance.delete(`/auth/admin/users/${id}/kebeles/${kebeleId}/`),
  getKebeleOfficers: (kebeleId) => axiosInstance.get(`/auth/admin/kebeles/${kebeleId}/officers/`),

  // System Administration & Governance endpoints
  getDashboardStats: () => axiosInstance.get('/administration/stats/'),
  getAuditLogs: (params) => axiosInstance.get('/administration/activity/', { params }),
  getAuditLogDetail: (id) => axiosInstance.get(`/administration/activity/${id}/`),
  exportAuditLogsPDF: (params) => axiosInstance.get('/administration/activity/export-pdf/', { params, responseType: 'blob' }),
  
  // Operational Oversight endpoints
  getConsultations: (params) => axiosInstance.get('/consultations/', { params }),
  getEducationResources: (params) => axiosInstance.get('/education/resources/', { params }),
};