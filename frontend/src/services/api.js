import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const API = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if unauthenticated on a private route
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authService = {
  signup: (userData) => API.post('/auth/signup', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

export const resourceService = {
  getResources: (params) => API.get('/resources', { params }),
  getResourceById: (id) => API.get(`/resources/${id}`),
  checkDuplicate: (resourceData) => API.post('/resources/check-duplicate', resourceData),
  uploadResource: (formData) => API.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  rateResource: (id, rating) => API.post(`/resources/${id}/rate`, { rating }),
  downloadResource: (id) => API.post(`/resources/${id}/download`),
  reportResource: (id, reportData) => API.post(`/resources/${id}/report`, reportData),
  getRecommendations: (id) => API.get(`/resources/${id}/recommendations`),
};

export const userService = {
  updateProfile: (profileData) => API.put('/users/profile', profileData),
  toggleBookmark: (resourceId) => API.post(`/users/bookmarks/${resourceId}`),
  getBookmarks: () => API.get('/users/bookmarks'),
  getMyUploads: () => API.get('/users/uploads'),
  getMyDownloads: () => API.get('/users/downloads'),
  getNotifications: () => API.get('/users/notifications'),
  markNotificationsRead: () => API.put('/users/notifications/read'),
  getLeaderboard: () => API.get('/users/leaderboard'),
};

export const adminService = {
  getStats: () => API.get('/admin/stats'),
  verifyResource: (id) => API.put(`/admin/resources/${id}/verify`),
  deleteResource: (id) => API.delete(`/admin/resources/${id}`),
  getReports: () => API.get('/admin/reports'),
  resolveReport: (id) => API.put(`/admin/reports/${id}/resolve`),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
