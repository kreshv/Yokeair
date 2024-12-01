import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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

export const login = (credentials) => api.post('/users/login', credentials);
export const register = (userData) => api.post('/users/register', userData);
export const getApartments = (filters) => api.get('/apartments', { params: filters });
export const getApartment = (id) => api.get(`/apartments/${id}`);
export const createApplication = (data) => api.post('/applications', data);
export const getLocations = () => api.get('/locations/boroughs');
export const getAmenities = () => api.get('/amenities');
export const createProperty = (propertyData) => api.post('/properties', propertyData);
export const checkUnitAvailability = (address, borough, unitNumber) => 
  api.get('/properties/check-unit', { params: { address, borough, unitNumber } });
export const checkEmailAvailability = (email) => 
  api.get('/users/check-email', { params: { email } });
export const updateProperty = (propertyId, data) => 
  api.patch(`/properties/${propertyId}`, data);
export const getBrokerProperties = () => api.get('/properties/broker');

export default api; 