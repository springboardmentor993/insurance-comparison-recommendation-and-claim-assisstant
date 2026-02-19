import api from '../config/api';

export const profileService = {
    getMe: async () => {
        const response = await api.get('/profile/me');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/profile/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/profile/profile', profileData);
        return response.data;
    },
};

export default profileService;
