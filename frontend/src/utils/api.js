import axios from 'axios';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Auth API
export const authAPI = {
  register: (name, email, password, role) =>
    axios.post('/api/auth/register', { name, email, password, role }),
  login: (email, password) =>
    axios.post('/api/auth/login', { email, password }),
  getMe: () =>
    axios.get('/api/auth/me', getAuthHeaders()),
  updateDetails: (data) =>
    axios.put('/api/auth/updatedetails', data, getAuthHeaders())
};

// Product API
export const productAPI = {
  getAll: () =>
    axios.get('/api/products'),
  create: (data) => {
    const config = getAuthHeaders();
    config.headers['Content-Type'] = 'multipart/form-data';
    return axios.post('/api/products', data, config);
  },
  update: (id, data) => {
    const config = getAuthHeaders();
    if (data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    return axios.put(`/api/products/${id}`, data, config);
  },
  delete: (id) =>
    axios.delete(`/api/products/${id}`, getAuthHeaders())
};

// User API (Admin only)
export const userAPI = {
  getLeaderboard: () =>
    axios.get('/api/users/leaderboard'),
  getAll: () =>
    axios.get('/api/users', getAuthHeaders()),
  getOne: (id) =>
    axios.get(`/api/users/${id}`, getAuthHeaders()),
  getProfile: (id) =>
    axios.get(`/api/users/${id}/profile`, getAuthHeaders()),
  delete: (id) =>
    axios.delete(`/api/users/${id}`, getAuthHeaders()),
  updateStatus: (id, status) =>
    axios.put(`/api/users/${id}/status`, { status }, getAuthHeaders())
};

// Message API
export const messageAPI = {
  getPartners: () =>
    axios.get('/api/messages/partners', getAuthHeaders()),
  getMessages: (partnerId) => {
    let url = '/api/messages';
    if (partnerId) {
      url += `?partnerId=${partnerId}`;
    }
    return axios.get(url, getAuthHeaders());
  },
  getConversation: (partnerId) =>
    axios.get(`/api/messages/conversation/${partnerId}`, getAuthHeaders()),
  getConversationList: () =>
    axios.get('/api/messages/conversations/list', getAuthHeaders()),
  sendMessage: (receiverId, subject, body) =>
    axios.post('/api/messages', { receiverId, subject, body }, getAuthHeaders()),
  markAsRead: (messageId) =>
    axios.put(`/api/messages/${messageId}/read`, {}, getAuthHeaders()),
  getUnreadCount: () =>
    axios.get('/api/messages/unread/count', getAuthHeaders())
};

// Add existing and export them as APIs
export const API = {
    auth: authAPI,
    product: productAPI,
    user: userAPI,
    message: messageAPI
};
