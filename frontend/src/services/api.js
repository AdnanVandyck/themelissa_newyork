import axios from 'axios'

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Unit API endpoints
export const unitAPI = {
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
  }

}

export default api