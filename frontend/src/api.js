// src/api.js
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Attach Firebase token to every request automatically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.warn('Failed to fetch Firebase token:', err);
    }
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API 401 Unauthorized: User session expired or unauthenticated.');
    }
    return Promise.reject(error);
  }
);

export default api;