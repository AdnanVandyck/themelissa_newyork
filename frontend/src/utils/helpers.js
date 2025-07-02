// src/utils/helpers.js

// Constants
export const API_BASE_URL = 'http://localhost:5000/api';

// Standalone API function for non-component usage
export const makeRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      return { success: false, message: 'Session expired' };
    }

    const data = await response.json();
    
    return { 
      success: response.ok, 
      data, 
      status: response.status,
      message: data.message || (response.ok ? 'Success' : 'Error')
    };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.',
      error: error.message 
    };
  }
};

// Utility functions for common operations
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    message: password.length >= 6 ? '' : 'Password must be at least 6 characters long'
  };
};

export const validateRequired = (value, fieldName) => {
  return {
    isValid: value && value.trim().length > 0,
    message: value && value.trim().length > 0 ? '' : `${fieldName} is required`
  };
};

// Local storage helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Error handling helpers
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || fallbackMessage;
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || fallbackMessage;
  }
};

// File upload helpers
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Please select a valid image file (JPEG, PNG, or GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'File size must be less than 5MB'
    };
  }

  return { isValid: true, message: '' };
};

export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// URL helpers
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it starts with /uploads, return as is
  if (imagePath.startsWith('/uploads')) return imagePath;
  
  // Otherwise, prepend /uploads/
  return `/uploads/${imagePath}`;
};

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

// Loading state helpers
export const createLoadingState = () => {
  return {
    loading: false,
    error: null,
    data: null
  };
};

export const setLoading = (state, loading = true) => {
  return {
    ...state,
    loading,
    error: loading ? null : state.error
  };
};

export const setError = (state, error) => {
  return {
    ...state,
    loading: false,
    error
  };
};

export const setData = (state, data) => {
  return {
    ...state,
    loading: false,
    error: null,
    data
  };
};

// API helper functions that can be used with or without React context
export const apiHelpers = {
  // Units API calls
  units: {
    getAll: () => makeRequest('/units'),
    getPublic: () => makeRequest('/units/public'),
    getById: (id) => makeRequest(`/units/${id}`),
    create: (unitData) => makeRequest('/units', {
      method: 'POST',
      body: JSON.stringify(unitData)
    }),
    update: (id, unitData) => makeRequest(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unitData)
    }),
    delete: (id) => makeRequest(`/units/${id}`, {
      method: 'DELETE'
    }),
    uploadImage: (formData) => makeRequest('/units/upload-image', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    })
  },

  // Auth API calls
  auth: {
    register: (userData) => makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    verify: () => makeRequest('/auth/verify')
  }
};

// Export default object with all helpers
const helpers = {
  // API helpers
  makeRequest,
  apiHelpers,
  handleApiError,
  
  // Formatting helpers
  formatCurrency,
  formatDate,
  formatDateTime,
  
  // Validation helpers
  validateEmail,
  validatePassword,
  validateRequired,
  validateImageFile,
  
  // Storage helpers
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // File helpers
  createImagePreview,
  getImageUrl,
  
  // Utility helpers
  debounce,
  buildQueryString,
  
  // State helpers
  createLoadingState,
  setLoading,
  setError,
  setData
};

export default helpers;