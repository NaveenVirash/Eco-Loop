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
  getMyProducts: () =>
    axios.get('/api/products/my-products', getAuthHeaders()),
  getOne: (id) =>
    axios.get(`/api/products/${id}`),
  getExpired: () =>
    axios.get('/api/products/expired', getAuthHeaders()),
  // All active recycling listings (for collectors / company dashboard)
  getRecycling: () =>
    axios.get('/api/products/recycling', getAuthHeaders()),
  create: (data) => {
    // Do NOT manually set Content-Type for FormData — axios automatically sets
    // 'multipart/form-data' with the correct boundary so multer can parse it.
    return axios.post('/api/products', data, getAuthHeaders());
  },
  update: (id, data) => {
    const config = getAuthHeaders();
    if (data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    return axios.put(`/api/products/${id}`, data, config);
  },
  delete: (id) =>
    axios.delete(`/api/products/${id}`, getAuthHeaders()),

  // ── Dual-Confirmation workflow ─────────────────────────────────────────────
  // Collector claims a listing (sets collectorConfirmed = true, status = pending_collection)
  claimCollection: (id) =>
    axios.put(`/api/products/${id}/claim`, {}, getAuthHeaders()),
  // Collector re-confirms (idempotent)
  confirmCollector: (id) =>
    axios.put(`/api/products/${id}/confirm-collector`, {}, getAuthHeaders()),
  // Donor confirms the collector picked up the item
  confirmDonor: (id) =>
    axios.put(`/api/products/${id}/confirm-donor`, {}, getAuthHeaders()),
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
    axios.put(`/api/users/${id}/status`, { status }, getAuthHeaders()),
  rateUser: (id, ratingData) =>
    axios.post(`/api/users/${id}/rate`, ratingData, getAuthHeaders())
};

// Message API
export const messageAPI = {
  getPartners: () =>
    axios.get('/api/messages/partners', getAuthHeaders()),
  getChatPartners: () =>
    axios.get('/api/messages/chat-partners', getAuthHeaders()),
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
