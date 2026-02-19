import api from '../config/api';

export const policyService = {
    getPolicies: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.policy_type) params.append('policy_type', filters.policy_type);
        if (filters.min_premium) params.append('min_premium', filters.min_premium);
        if (filters.max_premium) params.append('max_premium', filters.max_premium);

        const response = await api.get(`/policies?${params.toString()}`);
        return response.data;
    },

    calculatePremium: async (data) => {
        const response = await api.post('/policies/calculate', data);
        return response.data;
    },

    purchasePolicy: async (data) => {
        const response = await api.post('/policies/purchase', data);
        return response.data;
    },
};

export default policyService;
