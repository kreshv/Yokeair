// Add timeout to axios instance
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds
    withCredentials: true
});

instance.interceptors.response.use(
    response => {
        // Handle empty responses
        if (!response.data) {
            return {
                ...response,
                data: {
                    success: false,
                    message: 'Empty response from server',
                    data: null
                }
            };
        }
        return {
            ...response,
            data: {
                success: true,
                ...response.data
            }
        };
    },
    error => {
        // Handle cancelled requests
        if (error.code === 'ECONNABORTED') {
            return Promise.reject({
                response: {
                    data: {
                        success: false,
                        message: 'Request timed out',
                        data: null
                    }
                }
            });
        }

        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                response: {
                    data: {
                        success: false,
                        message: 'Cannot connect to server',
                        data: null
                    }
                }
            });
        }

        // Handle server errors
        const message = error.response.data?.message || 
                      error.message || 
                      `Server error (${error.response.status})`;
                  
        return Promise.reject({
            response: {
                data: {
                    success: false,
                    message,
                    data: null,
                    status: error.response.status
                }
            }
        });
    }
); 