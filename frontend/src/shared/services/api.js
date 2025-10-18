import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para enviar cookies
})

// FIX CRÍTICO: Sobrescribir transformRequest COMPLETAMENTE
// Esto previene que Axios convierta strings de fechas en Date objects
api.defaults.transformRequest = [
  (data, headers) => {
    // Si no hay data, retornar
    if (!data) return data

    // Si es FormData (para uploads), no tocar
    if (data instanceof FormData) return data

    // Para todo lo demás, serializar manualmente a JSON
    // Esto previene que Axios detecte y convierta fechas
    return JSON.stringify(data)
  }
]

// También sobrescribir transformResponse
api.defaults.transformResponse = [
  (data) => {
    if (!data) return data

    try {
      // Solo parsear JSON, sin conversiones adicionales
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }
]

// Interceptor para agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si el token expiró (401) y no hemos intentado refrescar aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Obtener refreshToken de localStorage
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Intentar refrescar el token enviando refreshToken en el header
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          }
        )

        // El backend envuelve la respuesta en: { success, message, data }
        const { accessToken } = response.data.data

        // Guardar nuevo access token
        localStorage.setItem('accessToken', accessToken)

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo y redirigir a login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/gestion/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
