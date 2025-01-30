import axios from 'axios';

const API_BASE_URL = 'https://yokeair.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout
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
export const uploadPropertyImages = async (propertyId, formData, onProgress) => {
    try {
        // Validate that we have a FormData object
        if (!(formData instanceof FormData)) {
            throw new Error('Invalid form data provided');
        }

        // Get all files from FormData
        const files = formData.getAll('image');
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        // Check number of files
        if (files.length > 15) {
            throw new Error('Please select a maximum of 15 images at a time');
        }

        // Log the upload attempt
        console.log(`Attempting to upload ${files.length} files to property ${propertyId}`);

        // Upload all files in one request
        const response = await api.post(`/properties/${propertyId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000, // 60 second timeout for large uploads
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted + '%');
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            }
        });

        // Log the response
        console.log('Upload response:', response.data);

        if (!response.data.success && !response.data.images) {
            throw new Error(response.data.message || 'Upload failed');
        }

        return response.data;
    } catch (error) {
        console.error('Error in uploadPropertyImages:', error);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Upload timed out. Please try again.');
        }
        if (error.response?.status === 400) {
            throw new Error(error.response?.data?.message || 'Bad request. Please check your input.');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error during upload. Please try again or contact support if the problem persists.');
        }
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (error.message === 'Network Error') {
            throw new Error('Network error. Please check your connection and try again.');
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
export const updateProperty = async (propertyId, updateData) => {
    try {
        const response = await api.patch(`/properties/${propertyId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating property:', error);
        throw error;
    }
};
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
export const bulkDeleteProperties = async (propertyIds, onProgress) => {
    let deletedCount = 0;
    const errors = [];

    for (const propertyId of propertyIds) {
        try {
            await deleteProperty(propertyId);
            deletedCount++;
            if (onProgress) {
                onProgress(deletedCount, propertyIds.length);
            }
        } catch (error) {
            console.error(`Error deleting property ${propertyId}:`, error);
            errors.push({ propertyId, error: error.message });
        }
    }

    return {
        success: deletedCount === propertyIds.length,
        deletedCount,
        errors
    };
};

// Add cancellation token support
export const createCancelToken = () => axios.CancelToken.source();

export default api; 