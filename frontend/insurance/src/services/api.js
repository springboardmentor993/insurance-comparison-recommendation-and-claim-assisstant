import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const policiesAPI = {
  getAll: (params) => api.get('/policies/', { params }),
  getUserPolicies: () => api.get('/policies/my'),
  calculate: (data) => api.post('/policies/calculate', data),
};

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
};

export const recommendationsAPI = {
  get: () => api.get('/recommendations/'),
};

export const claimsAPI = {
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  create: (formData) => {
    return api.post('/claims', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
  },
  updateStatus: (id, data) => api.patch(`/claims/${id}/status`, data),
  refreshDocumentUrl: (claimId, documentId) =>
    api.get(`/claims/${claimId}/documents/${documentId}/refresh-url`),
};

export default api;