export const getBrokerPublicListings = async (brokerId) => {
  try {
    const response = await axios.get(`${API_URL}/api/brokers/${brokerId}/listings`);
    return response;
  } catch (error) {
    throw error;
  }
}; 