import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store authentication data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userEmail', user.email);
    
    // Set default auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const register = async (name, email, password, role) => {
  try {
    const response = await api.post('/api/auth/register', { 
      name, 
      email, 
      password, 
      role 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get('/api/auth/verify');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userEmail');
  delete api.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Protected route component helper
export const requireAuth = (Component) => {
  return (props) => {
    if (!isAuthenticated()) {
      window.location.href = '/';
      return null;
    }
    return <Component {...props} />;
  };
};

// Admin route component helper
export const requireAdmin = (Component) => {
  return (props) => {
    if (!isAuthenticated()) {
      window.location.href = '/';
      return null;
    }
    if (!isAdmin()) {
      window.location.href = '/user-dashboard';
      return null;
    }
    return <Component {...props} />;
  };
};

export default api; 