import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password })

export const register = (name: string, email: string, password: string, phone: string) => 
  api.post('/auth/register', { name, email, password, phone })

// Services
export const getServices = () => api.get('/services')

// Barbers
export const getBarbers = () => api.get('/barbers')

// Appointments
export const getAppointments = () => api.get('/appointments')

export const createAppointment = (data: {
  service_id: number
  barber_id: number
  date: string
  time: string
}) => api.post('/appointments', data)

export const cancelAppointment = (id: number) => 
  api.delete(`/appointments/${id}`)

// Admin
export const getMetrics = () => api.get('/admin/metrics')

export const getAdminAppointments = () => api.get('/admin/appointments')

export const getAdminUsers = () => api.get('/admin/users')

export const createService = (data: {
  name: string
  description: string
  price: number
  duration: number
}) => api.post('/admin/services', data)

export const deleteService = (id: number) => 
  api.delete(`/admin/services/${id}`)

export const createBarber = (data: { name: string; phone: string }) => 
  api.post('/admin/barbers', data)

export const deleteBarber = (id: number) => 
  api.delete(`/admin/barbers/${id}`)

export default api
