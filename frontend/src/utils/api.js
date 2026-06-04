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
    axios.get('/api/auth/me', getAuthHeaders())
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
  delete: (id) =>
    axios.delete(`/api/products/${id}`, getAuthHeaders())
};

// User API (Admin only)
export const userAPI = {
  getAll: () =>
    axios.get('/api/users', getAuthHeaders()),
  getOne: (id) =>
    axios.get(`/api/users/${id}`, getAuthHeaders()),
  delete: (id) =>
    axios.delete(`/api/users/${id}`, getAuthHeaders())
};

// Add existing and export them as APIs
export const API = {
    auth: authAPI,
    product: productAPI,
    user: userAPI
};
