import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://acadvaultsite.onrender.com/api';
export const API_URL = rawApiUrl.replace(/\/$/, '') + (rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') ? '' : '/api');
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const LEGACY_TYPE_MAP = {
  pdf: 'pdf',
  ppt: 'ppt',
  docx: 'docx',
  zip: 'zip',
  youtube: 'youtube',
  drive: 'drive',
  website: 'website',
  github: 'github',
  link: 'website',
  assignments: 'pdf',
  notes: 'pdf',
  document: 'pdf',
};

const mapLegacyResourceType = (resource) => {
  if (resource.resourceType) return resource.resourceType;

  const candidates = [resource.resource_type, resource.file_type, resource.fileType]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  for (const candidate of candidates) {
    if (LEGACY_TYPE_MAP[candidate]) {
      return LEGACY_TYPE_MAP[candidate];
    }
  }

  const rawUrl = (resource.file_url || resource.fileUrl || '').toLowerCase();
  if (rawUrl.includes('youtu.be') || rawUrl.includes('youtube.com')) return 'youtube';
  if (rawUrl.includes('drive.google.com')) return 'drive';
  if (rawUrl.includes('github.com')) return 'github';

  return 'pdf';
};

const isExternalResource = (resourceType) =>
  ['youtube', 'drive', 'website', 'github'].includes(resourceType);

export const normalizeResource = (resource) => {
  if (!resource || typeof resource !== 'object') return resource;

  const rest = { ...resource };
  delete rest.file_data;
  const resourceType = mapLegacyResourceType(rest);
  const rawUrl = rest.fileUrl || rest.file_url || '';
  const linkUrl = rest.linkUrl || (isExternalResource(resourceType) ? rawUrl : '');

  let fileUrl = rawUrl;
  if (rest.file_data || rawUrl.includes('localhost') || (!isExternalResource(resourceType) && rawUrl.startsWith('/uploads/'))) {
    fileUrl = `/api/resources/${rest._id}/file`;
  } else if (isExternalResource(resourceType) && rawUrl) {
    fileUrl = rawUrl;
  }

  return {
    ...rest,
    resourceType,
    fileUrl,
    linkUrl,
    downloadsCount: rest.downloadsCount ?? rest.downloads ?? 0,
    isVerified: rest.isVerified ?? rest.verified ?? false,
    branch: rest.branch || rest.subject || rest.category || 'General',
    semester: rest.semester || 1,
  };
};

export const resolveResourceUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SERVER_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const normalizeResourcesPayload = (data) => {
  if (!data) return data;

  if (Array.isArray(data.resources)) {
    return {
      ...data,
      resources: data.resources.map(normalizeResource),
    };
  }

  if (data._id && (data.title || data.resourceType || data.resource_type)) {
    return normalizeResource(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      item?._id && (item.title || item.resourceType || item.resource_type)
        ? normalizeResource(item)
        : item
    );
  }

  return data;
};

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
  (response) => {
    if (response.data) {
      response.data = normalizeResourcesPayload(response.data);
    }
    return response;
  },
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
