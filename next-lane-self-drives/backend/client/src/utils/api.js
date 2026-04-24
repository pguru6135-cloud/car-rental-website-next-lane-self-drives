import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('nextlane-auth') || '{}')
  const token = stored?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nextlane-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Cars
export const carAPI = {
  getAll: (params) => api.get('/cars', { params }),
  getOne: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
  checkAvailability: (id, start, end) =>
    api.get(`/cars/${id}/availability`, { params: { start, end } }),
}

// Bookings
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  verifyPayment: (id, formData) => api.patch(`/bookings/${id}/payment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  resendWhatsApp: (id) => api.post(`/bookings/${id}/resend-whatsapp`),
}

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadDocuments: (formData) => api.patch('/auth/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  uploadQR: (formData) => api.post('/admin/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPaymentSettings: () => api.get('/admin/payment-settings'),
  getWhatsAppStatus: () => api.get('/admin/whatsapp-status'),
}

export default api
