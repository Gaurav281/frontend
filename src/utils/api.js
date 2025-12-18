import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ GLOBAL FLAG (VERY IMPORTANT)
let networkErrorShown = false;

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // ✅ Backend is reachable again → reset flag
    networkErrorShown = false;
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle network errors
    if (!response) {
      if (!networkErrorShown) {
        networkErrorShown = true;
        toast.error('Network error. Please check your connection.', {
          id: 'network-error',   // 🔒 prevents duplicate red toast
          duration: 2000         // ⏱ auto dismiss
        });
      }
      return Promise.reject(error);
    }

    const { status, data } = response;

    // Handle specific error codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (data.message !== 'Not authorized to access this route') {
          toast.error('Session expired. Please login again.');
        }
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error('Access denied. You do not have permission.');
        break;

      case 404:
        // Not Found
        toast.error(data.message || 'Resource not found');
        break;

      case 429:
        // Rate limit exceeded
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        // Server error
        toast.error('Server error. Please try again later.');
        break;

      default:
        // Other errors
        if (data && data.message) {
          toast.error(data.message);
        } else {
          toast.error('An error occurred. Please try again.');
        }
    }

    return Promise.reject(error);
  }
);

// Helper methods for common API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password })
};

export const servicesAPI = {
  getAll: (params = {}) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getRelated: (id) => api.get(`/services/related/${id}`),
  getPopular: () => api.get('/services/popular'),

  // Admin endpoints
  getAllAdmin: () => api.get('/services/admin/services'),
  create: (serviceData) => api.post('/services/admin/services', serviceData),
  update: (id, serviceData) => api.put(`/services/admin/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/admin/services/${id}`),
  toggleStatus: (id) => api.patch(`/services/admin/services/${id}/status`)
};

export const paymentsAPI = {
  // User payment endpoints
  create: (paymentData) => api.post('/payments', paymentData),
  chooseType: (data) => api.post('/payments/choose-type', data),
  payInstallment: (id, data) => api.post(`/payments/${id}/pay-installment`, data),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getDetails: (id) => api.get(`/payments/${id}/details`),
  markComplete: (id) => api.patch(`/payments/${id}/complete`),
  getQR: (serviceId, amount) => api.get(`/payments/qr/${serviceId}${amount ? `?amount=${amount}` : ''}`),

  // Admin endpoints
  updateStatus: (id, status, notes) => api.patch(`/admin/payments/${id}/status`, { status, notes }),
  sendNotification: (id, data) => api.post(`/admin/payments/${id}/notify`, data),
  updateDates: (id, dates) => api.patch(`/admin/payments/${id}/dates`, dates),
  getStats: () => api.get('/payments/admin/stats'),
  getAllAdmin: (params) => api.get('/admin/payments', { params }),
  deletePayment: (id) => api.delete(`/admin/payments/${id}`),
  checkOverdue: () => api.get('/payments/admin/check-overdue')
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  changePassword: (data) => api.put('/user/change-password', data),
  getEnrolledServices: () => api.get('/user/services'),
  getDashboardStats: () => api.get('/user/dashboard'),
  deleteAccount: () => api.delete('/user/account')
};

export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  toggleSuspicionStatus: (id, isSuspicious) => api.patch(`/admin/users/${id}/suspicion`, { isSuspicious }),

  // Installment management
  manageInstallments: (id, data) => api.patch(`/admin/users/${id}/installments`, data),
  setInstallmentSplits: (id, splits) => api.post(`/admin/users/${id}/installments/splits`, { splits }),

  // Payment management
  getPayments: (params) => api.get('/admin/payments', { params }),
  getRecentPayments: () => api.get('/admin/payments/recent'),
  sendPaymentNotification: (id) => api.post(`/admin/payments/${id}/notify`),
  checkOverduePayments: () => api.get('/admin/check-overdue-payments'),

  // Delete operations
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deletePayment: (id) => api.delete(`/admin/payments/${id}`),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  deleteBroadcast: (id) => api.delete(`/admin/broadcast/${id}`)
};

export const broadcastAPI = {
  getActive: () => api.get('/broadcast/active'),
  getAll: () => api.get('/admin/broadcast'),
  create: (data) => api.post('/admin/broadcast', data),
  update: (id, data) => api.put(`/admin/broadcast/${id}`, data),
  delete: (id) => api.delete(`/admin/broadcast/${id}`),
  toggleStatus: (id) => api.patch(`/admin/broadcast/${id}/status`)
};

export const contactAPI = {
  sendMessage: (data) => api.post('/contact', data)
};

export default api;