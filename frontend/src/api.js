import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios with default headers
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

// Property endpoints
export const getProperty = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/properties/${id}`);
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateProperty = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/properties/${id}`, data);
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const uploadPropertyImages = async (propertyId, formData, onProgress) => {
    try {
        const response = await axios.post(
            `${API_URL}/properties/${propertyId}/images`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressEvent => {
                    if (onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                }
            }
        );
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 