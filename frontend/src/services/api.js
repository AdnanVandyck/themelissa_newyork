import axios from 'axios'

// Vercel API URL - will be updated after deployment
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://your-vercel-app.vercel.app/api'  // Update this after deployment
    : 'http://localhost:5000/api'
  )

console.log('🚀 API URL (Vercel):', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Longer timeout for Vercel
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

// Unit API endpoints
export const unitAPI = {
  getPublic: () => {
    console.log('🏠 Fetching public units from:', API_URL + '/units/public');
    return api.get('/units/public');
  },
  getPublicById: (id) => api.get(`/units/public/${id}`),
  getAll: () => api.get('/units'),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  delete: (id) => api.delete(`/units/${id}`),
  uploadImage: (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return api.post('/units/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImages: (imageFiles) => {
    const formData = new FormData()
    Array.from(imageFiles).forEach(file => {
      formData.append('images', file)
    })
    return api.post('/units/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  addImagesToUnit: (unitId, imageUrls) => {
    return api.put(`/units/${unitId}/images`, { imageUrls })
  },
  removeImageFromUnit: (unitId, imageIndex) => {
    return api.delete(`/units/${unitId}/images/${imageIndex}`)
  }
}

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify')
}

export const contactAPI = {
  submitForm: (formData) => {
    console.log('📝 Submitting contact form to:', API_URL + '/contacts');
    return api.post('/contacts', formData);
  },
  getAll: (params = {}) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  updateStatus: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`)
}

export const galleryAPI = {
  getPublic: (category = '') => api.get(`/gallery/public${category ? `?category=${category}` : ''}`),
  getAll: (params = {}) => api.get('/gallery', { params }),
  upload: (formData) => api.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`)
}

export default api