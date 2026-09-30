import axios from 'axios';
import config from './config';

// Session token: kept in localStorage when "Remember me" is ticked, otherwise in
// sessionStorage so it is gone when the browser closes.
export const authStore = {
  get() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },
  getUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  },
  set(token, user, remember) {
    this.clear();
    const store = remember ? localStorage : sessionStorage;
    store.setItem('authToken', token);
    if (user) store.setItem('user', JSON.stringify(user));
  },
  clear() {
    if (typeof window === 'undefined') return;
    for (const s of [localStorage, sessionStorage]) {
      s.removeItem('authToken');
      s.removeItem('user');
    }
  },
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired/invalid session on an authenticated call → back to login. A
    // failed login attempt itself is left for the login form to show.
    const isLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin && authStore.get()) {
      authStore.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API factory functions
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
};

export const productsAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  // create/update take a FormData (optional image upload) — sent as multipart.
  create: (formData) => apiClient.post('/products', formData, multipart),
  update: (id, formData) => apiClient.put(`/products/${id}`, formData, multipart),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (userData) => apiClient.post('/users', userData),
  update: (id, userData) => apiClient.put(`/users/${id}`, userData),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

// Announcements — create/update accept a FormData (optional image upload).
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const announcementsAPI = {
  getAll: () => apiClient.get('/announcements'),
  getById: (id) => apiClient.get(`/announcements/${id}`),
  create: (formData) => apiClient.post('/announcements', formData, multipart),
  update: (id, formData) => apiClient.put(`/announcements/${id}`, formData, multipart),
  delete: (id) => apiClient.delete(`/announcements/${id}`),
};

// Ads — banner/sidebar/popup promos with an optional image.
export const adsAPI = {
  getAll: () => apiClient.get('/ads'),
  create: (formData) => apiClient.post('/ads', formData, multipart),
  update: (id, formData) => apiClient.put(`/ads/${id}`, formData, multipart),
  delete: (id) => apiClient.delete(`/ads/${id}`),
};

// Careers — plain JSON (no image).
export const careersAPI = {
  getAll: () => apiClient.get('/careers'),
  getById: (id) => apiClient.get(`/careers/${id}`),
  create: (data) => apiClient.post('/careers', data),
  update: (id, data) => apiClient.put(`/careers/${id}`, data),
  delete: (id) => apiClient.delete(`/careers/${id}`),
};

// Job applications — public submit (multipart with the CV file), admin-only
// list / CV download / .docx preview / status / delete.
export const applicationsAPI = {
  submit: (formData) => apiClient.post('/applications', formData, { ...multipart, timeout: 60000 }),
  getAll: () => apiClient.get('/applications'),
  getCv: (id) => apiClient.get(`/applications/${id}/cv`, { responseType: 'blob', timeout: 60000 }),
  getPreview: (id) => apiClient.get(`/applications/${id}/preview`, { timeout: 60000 }),
  updateStatus: (id, status) => apiClient.patch(`/applications/${id}`, { status }),
  delete: (id) => apiClient.delete(`/applications/${id}`),
};

// Resolve an uploaded image path (e.g. "/uploads/x.webp") to an absolute URL on
// the API origin. Pass-through for absolute URLs; null-safe.
export function imageUrl(pathValue) {
  if (!pathValue) return null;
  if (/^https?:\/\//i.test(pathValue)) return pathValue;
  const origin = (config.API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${origin}${pathValue}`;
}

// Generic API function for custom endpoints
export const apiCall = (method, endpoint, data = null) => {
  return apiClient[method](endpoint, data);
};

export default apiClient;