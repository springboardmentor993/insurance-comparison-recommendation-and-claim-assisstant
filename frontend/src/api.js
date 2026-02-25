import axios from 'axios';
import API_BASE_URL from './config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
};

// Policy endpoints
export const policyAPI = {
    getMyPolicies: () => api.get('/policies/me'),
    getAll: (params) => api.get('/policies', { params }),
    getById: (id) => api.get(`/policies/${id}`),
    compare: (ids) => api.get('/policies/compare/multiple', { params: { policy_ids: ids } }),
    calculatePremium: (id, params) => api.get(`/policies/calculate-premium/${id}`, { params }),
    enrollInPolicy: (id) => api.post(`/policies/${id}/enroll`),
};

// Recommendations
export const recommendationAPI = {
    get: () => api.get('/recommendations'),
    regenerate: () => api.post('/recommendations/regenerate'),
};

// Claims
export const claimAPI = {
    create: (data) => api.post('/claims', data),
    getAll: (params) => api.get('/claims', { params }),
    getById: (id) => api.get(`/claims/${id}`),
    update: (id, data) => api.put(`/claims/${id}`, data),
    uploadDocument: (id, formData) => api.post(`/claims/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    submit: (id) => api.post(`/claims/${id}/submit`),
};

// Admin
export const adminAPI = {
    getAllClaims: (params) => api.get('/admin/claims/all', { params }),
    updateClaimStatus: (id, status) => api.put(`/admin/claims/${id}/status`, null, { params: { status } }),
    getFraudFlags: (params) => api.get('/admin/fraud-flags', { params }),
    getClaimStats: () => api.get('/admin/statistics/claims'),
    getPolicyStats: () => api.get('/admin/statistics/policies'),
    getLogs: (params) => api.get('/admin/logs', { params }),
    getClaimDocuments: (claimId) => api.get(`/admin/claims/${claimId}/documents`),
    getUsers: (params) => api.get('/admin/users', { params }),
};

export default api;
