/**
 * API Client - handles all HTTP requests to backend
 */
const API = {
  /**
   * Get auth token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user data
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'admin' || user.role === 'owner');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Save auth data
   */
  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear auth data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  /**
   * Generic fetch wrapper with auth
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please try again later.');
      }
      throw error;
    }
  },

  // Auth endpoints
  register: (data) => API.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => API.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (data) => API.request('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => API.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => API.request(`/auth/reset-password/${token}`, { method: 'PUT', body: JSON.stringify({ password }) }),
  getMe: () => API.request('/auth/me'),

  // Services
  getServices: (params = '') => API.request(`/services${params ? '?' + params : ''}`),
  getService: (id) => API.request(`/services/${id}`),

  // Appointments
  getSlots: (date, staff) => API.request(`/appointments/slots?date=${date}&staff=${encodeURIComponent(staff)}`),
  bookAppointment: (data) => API.request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getMyAppointments: (params = '') => API.request(`/appointments/my${params ? '?' + params : ''}`),
  cancelAppointment: (id) => API.request(`/appointments/${id}/cancel`, { method: 'PUT' }),

  // Notifications
  getNotifications: () => API.request('/notifications'),
  markNotificationRead: (id) => API.request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => API.request('/notifications/read-all', { method: 'PUT' }),

  // Profile
  updateProfile: (data) => API.request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Gallery
  getGallery: (category = '') => API.request(`/gallery${category ? '?category=' + category : ''}`),

  // Content
  getContent: (section) => API.request(`/content/${section}`),
  submitContact: (data) => API.request('/content/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Admin endpoints
  getDashboardStats: () => API.request('/appointments/stats'),
  getAllAppointments: (params = '') => API.request(`/appointments${params ? '?' + params : ''}`),
  updateAppointmentStatus: (id, data) => API.request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  rescheduleAppointment: (id, data) => API.request(`/appointments/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(data) }),
  downloadReport: (params = '') => `${CONFIG.API_BASE_URL}/appointments/report/download${params ? '?' + params : ''}`,
  getAllServicesAdmin: () => API.request('/services/admin/all'),
  createService: (data) => API.request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => API.request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => API.request(`/services/${id}`, { method: 'DELETE' }),
  getUsers: (params = '') => API.request(`/users${params ? '?' + params : ''}`),
  updateUser: (id, data) => API.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => API.request(`/users/${id}`, { method: 'DELETE' }),
  getAllGalleryAdmin: () => API.request('/gallery/admin/all'),
  deleteGalleryImage: (id) => API.request(`/gallery/${id}`, { method: 'DELETE' }),
  getAllContent: () => API.request('/content'),
  updateContent: (data) => API.request('/content', { method: 'PUT', body: JSON.stringify(data) }),
};
