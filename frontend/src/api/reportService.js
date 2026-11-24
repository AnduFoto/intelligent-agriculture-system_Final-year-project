import axiosInstance from './axiosInstance';

export const reportService = {
  getOverview: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/overview/', { params: filters });
    return response.data;
  },

  getConsultations: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/consultations/', { params: filters });
    return response.data;
  },

  getAI: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/ai/', { params: filters });
    return response.data;
  },

  getEducation: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/education/', { params: filters });
    return response.data;
  },

  getUsers: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/users/', { params: filters });
    return response.data;
  },

  getFarmers: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/farmers/', { params: filters });
    return response.data;
  },

  getCrops: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/crops/', { params: filters });
    return response.data;
  },

  getSpecializations: async (filters = {}) => {
    const response = await axiosInstance.get('/reports/specializations/', { params: filters });
    return response.data;
  },

  getExportUrl: (type, format, filters = {}) => {
    const params = new URLSearchParams({ type, export_format: format, ...filters });
    return `/reports/export/?${params.toString()}`;
  },
  
  downloadExport: async (type, format, filters = {}) => {
    const params = { type, export_format: format, ...filters };
    const response = await axiosInstance.get('/reports/export/', {
      params,
      responseType: 'blob', // Important for downloading files
    });
    
    // Create a Blob from the PDF/CSV Stream
    const blob = new Blob([response.data], { 
      type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
    });
    
    // Create a link element, use it to download the file and remove it
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header if possible, else generate one
    const disposition = response.headers['content-disposition'];
    let filename = `${type}_report.${format}`;
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
