import axiosInstance from './axiosInstance';

export const getMyProfile = async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
};

export const updateMyProfile = async (formData) => {
    const response = await axiosInstance.patch('/auth/profile/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const changePassword = async (data) => {
    const response = await axiosInstance.post('/auth/change-password/', data);
    return response.data;
};
