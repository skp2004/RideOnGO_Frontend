import api from './api';

const locationService = {
    // Get all cities
    getCities: async () => {
        const response = await api.get('/bms/locations/cities');
        return response.data;
    },

    // Get bikes by location ID
    getBikesByCity: async (locationId) => {
        const response = await api.get(`/bms/bikes/location/${locationId}`);
        return response.data;
    },
};

export default locationService;
