import axiosInstance from './axiosInstance';
import { adminService } from './adminService';

const leadOfficerService = {
  searchKebeles: async (search = '') => {
    const response = await axiosInstance.get('/locations/kebeles/', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  // Reuses the existing, already-working adminService call rather than
  // duplicating the KebeleOfficersView request logic.
  getKebeleOfficers: async (kebeleId) => {
    const response = await adminService.getKebeleOfficers(kebeleId);
    return response.data; // flat array: [{ officer_id, officer_name, officer_email, assigned_at, assigned_by_email }]
  },

  getLeadOfficer: async (kebeleId) => {
    try {
      const response = await axiosInstance.get(`/auth/admin/kebeles/${kebeleId}/lead-officer/`);
      return { lead_officer: response.data };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { lead_officer: null };
      }
      throw error;
    }
  },

  assignLeadOfficer: async (kebeleId, officerId) => {
    const response = await axiosInstance.post(
      `/auth/admin/kebeles/${kebeleId}/lead-officer/`,
      { officer_id: officerId }
    );
    return response.data;
  },

  removeLeadOfficer: async (kebeleId) => {
    const response = await axiosInstance.delete(`/auth/admin/kebeles/${kebeleId}/lead-officer/`);
    return response.data;
  },
};

export default leadOfficerService;