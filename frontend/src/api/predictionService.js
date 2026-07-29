import axiosInstance from './axiosInstance';

export const predictionService = {
  predict: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return axiosInstance.post('/predictions/predict/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listHistory: () => axiosInstance.get('/predictions/history/'),
  getHistoryDetail: (id) => axiosInstance.get(`/predictions/history/${id}/`),
};