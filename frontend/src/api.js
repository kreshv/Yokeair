import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Use the environment variable
});

export const fetchData = async () => {
    const response = await api.get('/your-endpoint'); // Adjust the endpoint as needed
    return response.data;
};

export const uploadPropertyImages = async (id, formData) => {
    const response = await api.post(`/properties/${id}/images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}; 