import api from '../config/api';

export const claimService = {
    getUserPolicies: async () => {
        const response = await api.get('/claims/user-policies');
        return response.data;
    },

    getClaims: async (status = null) => {
        const params = status ? `?status=${status}` : '';
        const response = await api.get(`/claims${params}`);
        return response.data;
    },

    getClaimDetails: async (claimId) => {
        const response = await api.get(`/claims/${claimId}`);
        return response.data;
    },

    fileClaim: async (claimData) => {
        const response = await api.post('/claims', claimData);
        return response.data;
    },

    uploadDocument: async (claimId, file, docType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);

        const response = await api.post(`/claims/${claimId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default claimService;
