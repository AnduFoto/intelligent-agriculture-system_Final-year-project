import axiosInstance from './axiosInstance';

export const locationService = {
  getRegions: async () => {
    const res = await axiosInstance.get('/locations/regions/');
    return res.data;
  },
  getZones: async (params) => {
    const res = await axiosInstance.get('/locations/zones/', { params });
    return res.data;
  },
  getSpecialWoredas: async (params) => {
    const res = await axiosInstance.get('/locations/special-woredas/', { params });
    return res.data;
  },
  getWoredas: async (params) => {
    const res = await axiosInstance.get('/locations/woredas/', { params });
    return res.data;
  },
  getKebeles: async (params) => {
    const res = await axiosInstance.get('/locations/kebeles/', { params });
    return res.data;
  }
};

export default locationService;
