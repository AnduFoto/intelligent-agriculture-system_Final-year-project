import axiosInstance from './axiosInstance';

const cropTypeService = {
  // Global catalog — any authenticated user can read; Admin can write
  listCropTypes: async () => {
    const response = await axiosInstance.get('/consultations/crop-types/');
    return response.data;
  },

  getCropTypes: async () => {
    const response = await axiosInstance.get('/consultations/crop-types/');
    return response.data;
  },

  createCropType: async ({ name, description }) => {
    const response = await axiosInstance.post('/consultations/crop-types/', {
      name,
      description,
    });
    return response.data;
  },

  updateCropType: async (cropId, payload) => {
    const response = await axiosInstance.patch(`/consultations/crop-types/${cropId}/`, payload);
    return response.data;
  },

  toggleCropActive: async (cropId, isActive) => {
    const response = await axiosInstance.patch(`/consultations/crop-types/${cropId}/`, {
      is_active: isActive,
    });
    return response.data;
  },

  // Lead-Officer-scoped mapping
  listKebeleCropMappings: async (kebeleId) => {
    const response = await axiosInstance.get(`/consultations/kebeles/${kebeleId}/crop-mappings/`);
    return response.data;
  },

  mapSpecializationToCrop: async (kebeleId, cropId, specializationId) => {
    const response = await axiosInstance.post(
      `/consultations/kebeles/${kebeleId}/crop-mappings/${cropId}/`,
      { specialization_id: specializationId }
    );
    return response.data;
  },

  unmapSpecializationFromCrop: async (kebeleId, cropId, specializationId) => {
    const response = await axiosInstance.delete(
      `/consultations/kebeles/${kebeleId}/crop-mappings/${cropId}/`,
      { params: { specialization_id: specializationId } }
    );
    return response.data;
  },
};

export default cropTypeService;