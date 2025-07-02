import axios from 'axios'

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://themelissa_newyork.railway.app'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
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
  // Public endpoint - no authentication required
  getPublic: () => api.get('/units/public'),
  getPublicById: (id) => api.get(`/units/public/${id}`),
  
  // Protected endpoints - require admin authentication
  getAll: () => api.get('/units'),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  delete: (id) => api.delete(`/units/${id}`),

  // Add image upload function
  uploadImage: (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return api.post('/units/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

   // Multiple images upload (NEW)
  uploadImages: (imageFiles) => {
    const formData = new FormData()
    
    // Add each file to FormData
    Array.from(imageFiles).forEach(file => {
      formData.append('images', file)
    })
    
    return api.post('/units/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Add images to existing unit (NEW)
  addImagesToUnit: (unitId, imageUrls) => {
    return api.put(`/units/${unitId}/images`, { imageUrls })
  },

  // Remove image from unit (NEW)
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
  // Submit contact form (public)
  submitForm: (formData) => api.post('/contacts', formData),
  
  // Admin endpoints
  getAll: (params = {}) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  updateStatus: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`)
}

export const galleryAPI = {
  // Public endpoints
  getPublic: (category = '') => api.get(`/gallery/public${category ? `?category=${category}` : ''}`),
  
  // Admin endpoints
  getAll: (params = {}) => api.get('/gallery', { params }),
  upload: (formData) => api.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`)
}



export default api