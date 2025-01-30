import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://yokeair.onrender.com/api'
    : 'http://localhost:5000/api';

// Configure axios with default headers and timeout
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response interceptor for handling errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Property endpoints
export const getProperty = async (id) => {
    try {
        const response = await api.get(`/properties/${id}`);
        return response;
    } catch (error) {
        console.error('Error fetching property:', error);
        throw error.response?.data || error.message;
    }
};

export const updateProperty = async (id, data) => {
    try {
        const response = await api.put(`/properties/${id}`, data);
        return response;
    } catch (error) {
        console.error('Error updating property:', error);
        throw error.response?.data || error.message;
    }
};

export const uploadPropertyImages = async (propertyId, formData, onProgress) => {
    try {
        const response = await api.post(
            `/properties/${propertyId}/images`,
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
        console.error('Error uploading images:', error);
        throw error.response?.data || error.message;
    }
};

export default api; 