import axios from 'axios'

const API_BASE = 'http://localhost:8000'
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})
export const loginUser = (email, password) => {
  return api.post('/login', { email, password })
}

export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`)
}

export const updateRiskProfile = (userId, riskProfile) => {
  return api.put(`/users/${userId}/risk-profile`, { risk_profile: riskProfile })
}

export default api;