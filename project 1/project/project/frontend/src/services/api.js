import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Policies APIs
export const policiesAPI = {
  getPolicies: (params) => api.get('/policies/', { params }),
  calculatePremium: (data) => api.post('/policies/calculate', data),
};

// Recommendations APIs
export const recommendationsAPI = {
  generate: (data) => api.post('/recommendations/generate', data),
  getMyRecommendations: (params) => api.get('/recommendations/my-recommendations', { params }),
  deleteRecommendation: (id) => api.delete(`/recommendations/my-recommendations/${id}`),
};

// Profile APIs
export const profileAPI = {
  createOrUpdateRiskProfile: (data) => api.post('/profile/risk-profile', data),
  getRiskProfile: () => api.get('/profile/risk-profile'),
  updatePreferences: (data) => api.patch('/profile/preferences', data),
};
export const userAPI = {
  savePreferences: (data) =>
    api.post("/users/preferences", data),
};



export default api;
