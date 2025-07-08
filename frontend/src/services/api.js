
import axios from 'axios'

// Render API URL - Production
const API_URL = 'https://themelissa-backend.onrender.com'

console.log('🚀 API URL (Render):', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Longer timeout for Render
})

// Request interceptor to add auth token AND debug logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 Making request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ Successful response from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    console.error('❌ Failed URL:', error.config?.url);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error)
  }
)

// Unit API endpoints - FIXED: Added /api prefix to all endpoints
export const unitAPI = {
  getPublic: () => {
    console.log('🏠 Fetching public units from:', API_URL + '/api/units/public');
    return api.get('/api/units/public');
  },
  getPublicById: (id) => api.get(`/api/units/public/${id}`),
  getAll: () => api.get('/api/units'),
  getById: (id) => api.get(`/api/units/${id}`),
  create: (data) => api.post('/api/units', data),
  update: (id, data) => api.put(`/api/units/${id}`, data),
  delete: (id) => api.delete(`/api/units/${id}`),
  uploadImage: (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return api.post('/api/units/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImages: (imageFiles) => {
    const formData = new FormData()
    Array.from(imageFiles).forEach(file => {
      formData.append('images', file)
    })
    return api.post('/api/units/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  addImagesToUnit: (unitId, imageUrls) => {
    return api.put(`/api/units/${unitId}/images`, { imageUrls })
  },
  removeImageFromUnit: (unitId, imageIndex) => {
    return api.delete(`/api/units/${unitId}/images/${imageIndex}`)
  }
}

// Auth API endpoints - FIXED: Added /api prefix
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  verify: () => api.get('/api/auth/verify')
}

// Contact API endpoints - FIXED: Added /api prefix
export const contactAPI = {
  submitForm: (formData) => {
    console.log('📝 Submitting contact form to:', API_URL + '/api/contacts');
    return api.post('/api/contacts', formData);
  },
  getAll: (params = {}) => api.get('/api/contacts', { params }),
  getById: (id) => api.get(`/api/contacts/${id}`),
  updateStatus: (id, data) => api.put(`/api/contacts/${id}`, data),
  delete: (id) => api.delete(`/api/contacts/${id}`)
}

// Gallery API endpoints - FIXED: Added /api prefix
export const galleryAPI = {
  getPublic: (category = '') => api.get(`/api/gallery/public${category ? `?category=${category}` : ''}`),
  getAll: (params = {}) => api.get('/api/gallery', { params }),
  upload: (formData) => api.post('/api/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/gallery/${id}`, data),
  delete: (id) => api.delete(`/api/gallery/${id}`)
}

// Helper function to get correct image URL - FIXES the localhost issue
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('No image path provided');
    return null;
  }
  
  // Use the same API_URL logic as the rest of the app
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://themelissa-backend.onrender.com';
  
  console.log('🖼️ Processing image path:', imagePath);
  console.log('🖼️ Using BASE_URL:', BASE_URL);
  
  // If it's already a full URL, return as-is (but ensure it matches current environment)
  if (imagePath.startsWith('http')) {
    // If we're in development and the image URL is production, replace it
    if (BASE_URL.includes('localhost') && imagePath.includes('onrender.com')) {
      const correctedUrl = imagePath.replace('https://themelissa-backend.onrender.com', BASE_URL);
      console.log('🖼️ URL corrected for development:', correctedUrl);
      return correctedUrl;
    }
    // If we're in production and the image URL is localhost, replace it  
    if (!BASE_URL.includes('localhost') && imagePath.includes('localhost')) {
      const correctedUrl = imagePath.replace(/http:\/\/localhost:\d+/, BASE_URL);
      console.log('🖼️ URL corrected for production:', correctedUrl);
      return correctedUrl;
    }
    return imagePath;
  }
  
  // If it starts with /uploads, use it directly
  if (imagePath.startsWith('/uploads/')) {
    const fullUrl = `${BASE_URL}${imagePath}`;
    console.log('🖼️ Image URL created:', fullUrl);
    return fullUrl;
  }
  
  // If it's just a filename, add the full path
  const fullUrl = `${BASE_URL}/uploads/${imagePath}`;
  console.log('🖼️ Image URL created from filename:', fullUrl);
  return fullUrl;
};

export default api