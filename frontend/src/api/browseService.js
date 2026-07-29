import axiosInstance from './axiosInstance';

export const browseService = {
  listKebeles: (params) => axiosInstance.get('/predictions/browse/kebeles/', { params }),
  listCrops: (kebeleId) => axiosInstance.get(`/predictions/browse/kebeles/${kebeleId}/crops/`),
  listFarmers: (kebeleId, crop) => axiosInstance.get(`/predictions/browse/kebeles/${kebeleId}/crops/${encodeURIComponent(crop)}/farmers/`),
  getFarmerHistory: (farmerId, crop) => axiosInstance.get(`/predictions/browse/farmers/${farmerId}/history/`, { params: crop ? { crop } : {} }),
};