import axiosInstance from './axiosInstance';

const consultationService = {
  listCropTypes: async () => {
    const response = await axiosInstance.get('/consultations/crop-types/');
    return response.data;
  },

  createConsultation: async ({ cropTypeId, title, description, images }) => {
    const formData = new FormData();
    formData.append('crop_type_id', cropTypeId);
    formData.append('title', title);
    formData.append('description', description);
    (images || []).forEach((file) => formData.append('images', file));

    const response = await axiosInstance.post('/consultations/consultations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  listMyConsultations: async () => {
    const response = await axiosInstance.get('/consultations/consultations/mine/');
    return response.data;
  },

  getConsultationDetail: async (id) => {
    const response = await axiosInstance.get(`/consultations/consultations/${id}/`);
    return response.data;
  },

  sendMessage: async (id, message) => {
    const response = await axiosInstance.post(`/consultations/consultations/${id}/messages/`, {
      message,
    });
    return response.data;
  },

  closeConsultation: async (id) => {
    const response = await axiosInstance.post(`/consultations/consultations/${id}/close/`);
    return response.data;
  },

  // Lead Officer oversight
listKebeleConsultations: async (kebeleId) => {
  const response = await axiosInstance.get(`/consultations/kebeles/${kebeleId}/consultations/`);
  return response.data;
},

getKebeleOfficerWorkload: async (kebeleId) => {
  const response = await axiosInstance.get(`/consultations/kebeles/${kebeleId}/officer-workload/`);
  return response.data;
},

reassignConsultation: async (consultationId, officerId, reason) => {
  const response = await axiosInstance.post(`/consultations/consultations/${consultationId}/reassign/`, {
    officer_id: officerId,
    reason: reason || '',
  });
  return response.data;
},


// AI-assisted diagnosis
runAICheck: async (consultationId, imageId) => {
  const response = await axiosInstance.post(
    `/consultations/consultations/${consultationId}/ai-check/`,
    { image_id: imageId }
  );
  return response.data;
},

listAIResults: async (consultationId) => {
  const response = await axiosInstance.get(
    `/consultations/consultations/${consultationId}/ai-results/`
  );
  return response.data;
},

sendAIResult: async (consultationId, resultId, message) => {
  const response = await axiosInstance.post(
    `/consultations/consultations/${consultationId}/ai-results/${resultId}/send/`,
    { message }
  );
  return response.data;
},

listNotes: async (consultationId) => {
  const response = await axiosInstance.get(`/consultations/consultations/${consultationId}/notes/`);
  return response.data;
},

createNote: async (consultationId, note) => {
  const response = await axiosInstance.post(`/consultations/consultations/${consultationId}/notes/`, { note });
  return response.data;
},

getTimeline: async (consultationId) => {
  const response = await axiosInstance.get(`/consultations/consultations/${consultationId}/timeline/`);
  return response.data;
},
};

export default consultationService;
