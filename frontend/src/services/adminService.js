import api from '../config/api';

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllClaims: async (status = null, flagged = false) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (flagged) params.append('flagged', 'true');
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`/admin/claims${query}`);
        return response.data;
    },

    getClaimDetails: async (claimId) => {
        const response = await api.get(`/claims/${claimId}`);
        return response.data;
    },

    updateClaimStatus: async (claimId, status, adminNotes = null) => {
        const response = await api.put(`/admin/claims/${claimId}/status`, {
            status,
            admin_notes: adminNotes,
        });
        return response.data;
    },

    flagFraud: async (claimId, reason) => {
        const response = await api.post(`/admin/claims/${claimId}/fraud`, {
            reason,
        });
        return response.data;
    },

    getClaimDocuments: async (claimId) => {
        const response = await api.get(`/admin/claims/${claimId}/documents`);
        return response.data;
    },

    getLogs: async () => {
        const response = await api.get('/admin/logs');
        return response.data;
    },
};

export default adminService;
