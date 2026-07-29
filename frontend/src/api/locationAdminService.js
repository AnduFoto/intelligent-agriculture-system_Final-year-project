import axiosInstance from './axiosInstance';

export const locationAdminService = {
  listRegions: () => axiosInstance.get('/locations/regions/'),
  createRegion: (data) => axiosInstance.post('/locations/regions/', data),
  updateRegion: (id, data) => axiosInstance.patch(`/locations/regions/${id}/`, data),
  deleteRegion: (id) => axiosInstance.delete(`/locations/regions/${id}/`),

  listZones: (regionId) => axiosInstance.get('/locations/zones/', { params: { region: regionId } }),
  createZone: (data) => axiosInstance.post('/locations/zones/', data),
  updateZone: (id, data) => axiosInstance.patch(`/locations/zones/${id}/`, data),
  deleteZone: (id) => axiosInstance.delete(`/locations/zones/${id}/`),

  listSpecialWoredas: (regionId) => axiosInstance.get('/locations/special-woredas/', { params: { region: regionId } }),
  createSpecialWoreda: (data) => axiosInstance.post('/locations/special-woredas/', data),
  updateSpecialWoreda: (id, data) => axiosInstance.patch(`/locations/special-woredas/${id}/`, data),
  deleteSpecialWoreda: (id) => axiosInstance.delete(`/locations/special-woredas/${id}/`),

  listWoredas: (zoneId) => axiosInstance.get('/locations/woredas/', { params: { zone: zoneId } }),
  createWoreda: (data) => axiosInstance.post('/locations/woredas/', data),
  updateWoreda: (id, data) => axiosInstance.patch(`/locations/woredas/${id}/`, data),
  deleteWoreda: (id) => axiosInstance.delete(`/locations/woredas/${id}/`),

  listKebelesByWoreda: (woredaId) => axiosInstance.get('/locations/kebeles/', { params: { woreda: woredaId } }),
  listKebelesBySpecialWoreda: (specialWoredaId) => axiosInstance.get('/locations/kebeles/', { params: { special_woreda: specialWoredaId } }),
  createKebele: (data) => axiosInstance.post('/locations/kebeles/', data),
  updateKebele: (id, data) => axiosInstance.patch(`/locations/kebeles/${id}/`, data),
  deleteKebele: (id) => axiosInstance.delete(`/locations/kebeles/${id}/`),
  searchKebeles: (query) => axiosInstance.get('/locations/kebeles/', { params: { search: query } }),
};