import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers
  });
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export const getBrokerPublicListings = async (brokerId) => {
  try {
    const response = await axios.get(`${API_URL}/api/brokers/${brokerId}/listings`);
    return response;
  } catch (error) {
    console.error('Error fetching broker listings:', error);
    throw error;
  }
};

// Search Service
const searchService = {
  // Search properties with filters
  searchProperties: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add search term if exists
      if (params.search) queryParams.append('search', params.search);
      
      // Add filters if they exist
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms);
      if (params.bathrooms) queryParams.append('bathrooms', params.bathrooms);
      if (params.amenities?.length) queryParams.append('amenities', params.amenities.join(','));
      if (params.features?.length) queryParams.append('features', params.features.join(','));
      if (params.neighborhoods?.length) queryParams.append('neighborhoods', params.neighborhoods.join(','));
      if (params.boroughs?.length) queryParams.append('boroughs', params.boroughs.join(','));

      const url = `${API_URL}/api/properties/search?${queryParams.toString()}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Search properties error:', error.response || error);
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to search properties'
      };
    }
  },

  // Search brokerages
  searchBrokerages: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      
      const url = `${API_URL}/api/brokers/search?${queryParams.toString()}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Search brokerages error:', error.response || error);
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to search brokerages'
      };
    }
  }
};

export { searchService }; 