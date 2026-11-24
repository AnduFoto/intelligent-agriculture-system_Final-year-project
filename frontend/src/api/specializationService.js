import axiosInstance from './axiosInstance';

const specializationService = {
  // Officer's own Lead Officer status (reused from Step 1)
  getMyLeadKebele: async () => {
    const response = await axiosInstance.get('/auth/my-lead-kebele/');
    return response.data;
  },

  listSpecializations: async (kebeleId) => {
    const response = await axiosInstance.get(`/consultations/kebeles/${kebeleId}/specializations/`);
    return response.data;
  },

  createSpecialization: async (kebeleId, { name, description }) => {
    const response = await axiosInstance.post(
      `/consultations/kebeles/${kebeleId}/specializations/`,
      { name, description }
    );
    return response.data;
  },

  updateSpecialization: async (kebeleId, specializationId, payload) => {
    const response = await axiosInstance.patch(
      `/consultations/kebeles/${kebeleId}/specializations/${specializationId}/`,
      payload
    );
    return response.data;
  },

  toggleActive: async (kebeleId, specializationId, isActive) => {
    const response = await axiosInstance.patch(
      `/consultations/kebeles/${kebeleId}/specializations/${specializationId}/`,
      { is_active: isActive }
    );
    return response.data;
  },

  getEligibleOfficers: async (kebeleId) => {
    const response = await axiosInstance.get(`/consultations/kebeles/${kebeleId}/eligible-officers/`);
    return response.data;
  },

  assignOfficerSpecialization: async (kebeleId, officerId, specializationId) => {
    const response = await axiosInstance.post(
      `/consultations/kebeles/${kebeleId}/officer-specializations/`,
      { officer: officerId, specialization: specializationId }
    );
    return response.data;
  },

  removeOfficerSpecialization: async (kebeleId, officerSpecializationId) => {
    const response = await axiosInstance.delete(
      `/consultations/kebeles/${kebeleId}/officer-specializations/${officerSpecializationId}/`
    );
    return response.data;
  },
};

export default specializationService;