import api from '../config/api';

export const recommendationService = {
    generateRecommendations: async (preferences = {}) => {
        const response = await api.post('/recommendations/generate', preferences);
        return response.data;
    },

    getMyRecommendations: async () => {
        const response = await api.get('/recommendations/my-recommendations');
        return response.data;
    },
};

export default recommendationService;
