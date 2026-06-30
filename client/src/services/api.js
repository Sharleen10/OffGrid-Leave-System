import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

export const leaveAPI = {
  submitRequest: (formData) => api.post('/api/leave/request', formData),
  getMyRequests: () => api.get('/api/leave/my-requests'),
  getMyBalance: () => api.get('/api/leave/my-balance'),
  cancelRequest: (id) => api.put(`/api/leave/request/${id}/cancel`),
  uploadAttachment: (formData) => api.post('/api/leave/upload-attachment', formData),

  getTeamRequests: () => api.get('/api/leave/team-requests'),
  getDashboardSummary: () => api.get('/api/leave/dashboard-summary'),
  getRequestDetail: (id) => api.get(`/api/leave/request/${id}/detail`),
  updateRequestStatus: (id, status, comments) => 
    api.put(`/api/leave/request/${id}`, { status, comments }),
  getTeamSummary: () => api.get('/api/leave/team-summary', { responseType: 'blob' }),
  adjustBalance: (data) => api.post('/api/leave/adjust-balance', data),
  getRecentActivity: () => api.get('/api/leave/recent-activity'),
  getTeamBalances: () => api.get('/api/leave/team-balances'),
  getReports: () => api.get('/api/leave/reports'),

  // Admin
  getAllLeaveRequestsAdmin: (status) => api.get('/api/leave/admin/all-requests', { params: { status } }),
  adminOverrideStatus: (id, status, comments) => api.put(`/api/leave/admin/request/${id}/override`, { status, comments }),
  getCompanyCalendar: () => api.get('/api/leave/admin/calendar'),
  getAdminReports: () => api.get('/api/leave/admin/reports'),
  getAdminNotifications: () => api.get('/api/leave/admin/notifications'),
  getDepartments: () => api.get('/api/users/departments'),
};

export const userAPI = {
  getAllUsers: () => api.get('/api/users'),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  resetPassword: (email) => api.post('/api/users/reset-password', { email }),
  getSupervisors: () => api.get('/api/users/supervisors'),
  changeMyPassword: (newPassword) => api.put('/api/users/change-password', { newPassword }),
  getAdminSummary: () => api.get('/api/users/admin-summary'),
  deactivateUser: (id) => api.put(`/api/users/${id}/deactivate`),
  reactivateUser: (id) => api.put(`/api/users/${id}/reactivate`),
  getSystemSettings: () => api.get('/api/users/settings'),
  updateSystemSetting: (key, value) => api.put('/api/users/settings', { key, value }),
};

export default api;