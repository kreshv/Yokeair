import axios from 'axios';

const API_BASE_URL = 'https://yokeair-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getApartments = (filters) => api.get('/apartments', { params: filters });
export const getApartment = (id) => api.get(`/apartments/${id}`);
export const createApplication = (data) => api.post('/applications', data);
export const getLocations = () => api.get('/locations/boroughs');
export const getAmenities = () => api.get('/amenities');
export const createProperty = (propertyData) => api.post('/properties', propertyData);
export const checkUnitAvailability = (address, borough, unitNumber) => 
  api.get('/properties/check-unit', { params: { address, borough, unitNumber } });
export const checkEmailAvailability = (email) => 
  api.get('/auth/check-email', { params: { email } });
export const getBrokerProperties = () => api.get('/properties/broker');
export const searchProperties = (params) => 
  api.get('/properties/search', { params });
export const updatePropertyStatus = (propertyId, status) => 
  api.patch(`/properties/${propertyId}/status`, { status });
export const deleteProperty = async (propertyId) => {
    try {
        const response = await api.delete(`/properties/${propertyId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
    }
};
export const uploadPropertyImages = async (propertyId, formData) => {
    try {
        const response = await api.post(`/properties/${propertyId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            transformRequest: [function (data) {
                return data;
            }]
        });
        return response.data;
    } catch (error) {
        console.error('Error in uploadPropertyImages:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        throw error;
    }
};
export const deletePropertyImage = (propertyId, imageId) =>
    api.delete(`/properties/${propertyId}/images/${imageId}`);
export const updateUserProfile = async (userData) => {
    console.log('Sending User Profile Update:', userData);
    const response = await api.put('/users/profile', userData);
    return response;
};
export const getUserApplications = () => api.get('/applications/user');
export const getSavedListings = () => api.get('/users/saved-listings');
export const saveListing = (propertyId) => api.post(`/users/saved-listings/${propertyId}`);
export const removeSavedListing = (propertyId) => api.delete(`/users/saved-listings/${propertyId}`);
export const getProperty = (id) => api.get(`/properties/${id}`);
export const updateProperty = (id, data) => api.patch(`/properties/${id}`, data);
export const updateProfilePicture = async (imageUrl) => {
    console.log('Updating Profile Picture:', imageUrl);
    const response = await api.put('/users/profile-picture', { profilePicture: imageUrl });
    return response.data;
};
export const deleteUserAccount = () => api.delete('/users/account');
export const resetPassword = async (passwordData) => {
    const response = await api.put('/users/reset-password', passwordData);
    return response.data;
};

export default api; 