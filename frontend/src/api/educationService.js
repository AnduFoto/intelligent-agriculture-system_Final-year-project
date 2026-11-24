import axiosInstance from './axiosInstance';

export const getPublishers = async (params) => {
    const response = await axiosInstance.get('/education/publishers/', { params });
    return response.data;
};

export const getPublisher = async (id) => {
    const response = await axiosInstance.get(`/education/publishers/${id}/`);
    return response.data;
};

export const updatePublisher = async (id, formData) => {
    const response = await axiosInstance.patch(`/education/publishers/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getCategories = async (params) => {
    const response = await axiosInstance.get('/education/categories/', { params });
    return response.data;
};

export const createCategory = async (data) => {
    const response = await axiosInstance.post('/education/categories/', data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await axiosInstance.patch(`/education/categories/${id}/`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axiosInstance.delete(`/education/categories/${id}/`);
    return response.data;
};

export const getTopics = async (params) => {
    const response = await axiosInstance.get('/education/topics/', { params });
    return response.data;
};

export const createTopic = async (data) => {
    const response = await axiosInstance.post('/education/topics/', data);
    return response.data;
};

export const getResources = async (params) => {
    const response = await axiosInstance.get('/education/resources/', { params });
    return response.data;
};

export const getResource = async (id) => {
    const response = await axiosInstance.get(`/education/resources/${id}/`);
    return response.data;
};

export const getBookmarkedResources = async () => {
    const response = await axiosInstance.get('/education/resources/bookmarked/');
    return response.data;
};

export const createResource = async (formData) => {
    const response = await axiosInstance.post('/education/resources/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateResource = async (id, formData) => {
    const response = await axiosInstance.patch(`/education/resources/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteResource = async (id) => {
    const response = await axiosInstance.delete(`/education/resources/${id}/`);
    return response.data;
};

export const toggleBookmark = async (id) => {
    const response = await axiosInstance.post(`/education/resources/${id}/bookmark/`);
    return response.data;
};

export const getRecommendations = async (topics) => {
    // topics is an array of strings
    const topicsParam = topics.join(',');
    const response = await axiosInstance.get(`/education/recommendations/?topics=${topicsParam}`);
    return response.data;
};

export const attachToConsultation = async (consultationId, resourceId, messageId = null) => {
    const data = { consultation: consultationId, resource: resourceId };
    if (messageId) data.message = messageId;
    const response = await axiosInstance.post('/education/attachments/', data);
    return response.data;
};

export const getConsultationAttachments = async (consultationId) => {
    const response = await axiosInstance.get(`/education/attachments/?consultation=${consultationId}`);
    return response.data;
};

// Manager Assignments
export const getWoredaManagers = async (params) => {
    const response = await axiosInstance.get('/education/woreda-managers/', { params });
    return response.data;
};

export const assignWoredaManager = async (data) => {
    const response = await axiosInstance.post('/education/woreda-managers/', data);
    return response.data;
};

export const removeWoredaManager = async (id) => {
    const response = await axiosInstance.delete(`/education/woreda-managers/${id}/`);
    return response.data;
};

export const getKebeleManagers = async (params) => {
    const response = await axiosInstance.get('/education/kebele-managers/', { params });
    return response.data;
};

export const assignKebeleManager = async (data) => {
    const response = await axiosInstance.post('/education/kebele-managers/', data);
    return response.data;
};

export const removeKebeleManager = async (id) => {
    const response = await axiosInstance.delete(`/education/kebele-managers/${id}/`);
    return response.data;
};
