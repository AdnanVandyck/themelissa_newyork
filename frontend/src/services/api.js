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

// Unit API endpoints - UPDATED: Added Cloudinary layout support
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
  
  // Existing image upload methods (now using Cloudinary backend)
  uploadImage: (imageFile) => {
    console.log('📸 Uploading single image to Cloudinary...');
    const formData = new FormData()
    formData.append('image', imageFile)
    return api.post('/api/units/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImages: (imageFiles) => {
    console.log('📸 Uploading multiple images to Cloudinary...');
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
  },

  // NEW: Layout image management methods
  uploadLayout: (unitId, layoutFile) => {
    console.log('📐 Uploading layout image to Cloudinary for unit:', unitId);
    const formData = new FormData()
    formData.append('layout', layoutFile)
    return api.post(`/api/units/${unitId}/layout`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteLayout: (unitId) => {
    console.log('🗑️ Deleting layout image from Cloudinary for unit:', unitId);
    return api.delete(`/api/units/${unitId}/layout`)
  }
}

// Auth API endpoints
// export const authAPI = {
//   login: (credentials) => api.post('/api/auth/login', credentials),
//   register: (userData) => api.post('/api/auth/register', userData),
//   verify: () => api.get('/api/auth/verify')
// }
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  verify: () => api.get('/api/auth/verify'),
  
  // NEW: Add these endpoints for enhanced registration
  registerPublic: (userData) => {
    console.log('👤 Public user registration to:', API_URL + '/api/auth/register-public');
    return api.post('/api/auth/register-public', userData);
  },
  verifyEmail: (token) => {
    console.log('📧 Verifying email token:', token);
    return api.post(`/api/auth/verify-email/${token}`);
  },
  resendVerification: (email) => {
    console.log('📧 Resending verification email to:', email);
    return api.post('/api/auth/resend-verification', { email });
  },
  getPendingApprovals: () => {
    console.log('👥 Fetching pending user approvals');
    return api.get('/api/auth/pending-approvals');
  },
  approveUser: (userId) => {
    console.log('✅ Approving user:', userId);
    return api.post(`/api/auth/approve-user/${userId}`);
  },
  rejectUser: (userId, reason) => {
    console.log('❌ Rejecting user:', userId);
    return api.post(`/api/auth/reject-user/${userId}`, { reason });
  },
  getUserStats: () => {
    console.log('📊 Fetching user statistics');
    return api.get('/api/auth/user-stats');
  },
  getAllUsers: () => {
    console.log('👥 Fetching all users');
    return api.get('/api/auth/users');
  }
}


// Contact API endpoints
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

// Gallery API endpoints
export const galleryAPI = {
  getPublic: (category = '') => api.get(`/api/gallery/public${category ? `?category=${category}` : ''}`),
  getAll: (params = {}) => api.get('/api/gallery', { params }),
  upload: (formData) => api.post('/api/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/gallery/${id}`, data),
  delete: (id) => api.delete(`/api/gallery/${id}`)
}

// UPDATED: Enhanced image URL helper for Cloudinary support
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('No image path provided');
    return null;
  }
  
  console.log('🖼️ Processing image path:', imagePath);
  
  // If it's already a Cloudinary URL, return as-is
  if (imagePath.includes('cloudinary.com')) {
    console.log('🖼️ Cloudinary URL detected:', imagePath);
    return imagePath;
  }
  
  // Determine if we're in local development
  const isLocalDev = window.location.hostname === 'localhost' || 
                    window.location.hostname.startsWith('192.168.') ||
                    window.location.hostname.startsWith('10.0.0.');
  
  // Use local URL only if we're actually running locally
  const BASE_URL = isLocalDev && import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : 'https://themelissa-backend.onrender.com';
  
  console.log('🖼️ Is local dev:', isLocalDev);
  console.log('🖼️ Using BASE_URL:', BASE_URL);
  
  // If it's already a full URL (legacy local storage), fix it if needed
  if (imagePath.startsWith('http')) {
    // Always replace local IPs with production URL for live sites
    if (!isLocalDev && (imagePath.includes('localhost') || imagePath.includes('192.168.') || imagePath.includes('10.0.0.'))) {
      const correctedUrl = imagePath.replace(/http:\/\/(localhost|192\.168\.\d+\.\d+|10\.0\.0\.\d+):\d+/, 'https://themelissa-backend.onrender.com');
      console.log('🖼️ URL corrected for production:', correctedUrl);
      return correctedUrl;
    }
    return imagePath;
  }
  
  // If it starts with /uploads (legacy local storage), use it directly
  if (imagePath.startsWith('/uploads/')) {
    const fullUrl = `${BASE_URL}${imagePath}`;
    console.log('🖼️ Legacy image URL created:', fullUrl);
    return fullUrl;
  }
  
  // If it's just a filename (legacy local storage), add the full path
  const fullUrl = `${BASE_URL}/uploads/${imagePath}`;
  console.log('🖼️ Legacy image URL created from filename:', fullUrl);
  return fullUrl;
};

// NEW: Test backend connection and capabilities
export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await api.get('/api/health');
    const data = response.data;
    
    console.log('✅ Backend health check:', data);
    
    return {
      connected: true,
      cloudinary: data.cloudinary === 'Connected',
      database: data.database === 'Connected',
      version: data.version,
      imageStorage: data.imageStorage
    };
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return {
      connected: false,
      cloudinary: false,
      database: false,
      error: error.message
    };
  }
};

// NEW: Cloudinary image URL validator
export const validateImageUrl = async (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/');
    
    if (isValid) {
      console.log('✅ Image URL is valid:', imageUrl);
    } else {
      console.warn('❌ Image URL is invalid:', imageUrl, 'Status:', response.status);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error validating image URL:', imageUrl, error);
    return false;
  }
};

// NEW: Migration helper to check image storage type
export const getImageStorageInfo = (imageUrl) => {
  if (!imageUrl) return { type: 'none' };
  
  if (imageUrl.includes('cloudinary.com')) {
    return { 
      type: 'cloudinary', 
      persistent: true,
      optimized: true 
    };
  }
  
  if (imageUrl.includes('/uploads/')) {
    return { 
      type: 'local', 
      persistent: false,
      optimized: false 
    };
  }
  
  return { type: 'unknown' };
};

export default api