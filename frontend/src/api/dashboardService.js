import axiosInstance from './axiosInstance';

const dashboardService = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/auth/dashboard-stats/');
    return response.data;
  }
};

export default dashboardService;
