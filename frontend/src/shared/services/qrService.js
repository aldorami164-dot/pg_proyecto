import api from './api'

/**
 * Servicio de códigos QR
 */
const qrService = {
  /**
   * Obtener todos los códigos QR
   */
  getCodigosQR: async (params = {}) => {
    const response = await api.get('/qr', { params })
    return response.data.data
  },

  /**
   * Generar nuevos códigos QR
   * @param {number} cantidad - Cantidad de códigos a generar (default: 1)
   */
  generarCodigoQR: async (cantidad = 1) => {
    const response = await api.post('/qr/generar', { cantidad })
    return response.data.data
  },

  /**
   * Asignar código QR a habitación
   */
  asignarQR: async (id, habitacion_id) => {
    const response = await api.patch(`/qr/${id}/asignar`, { habitacion_id })
    return response.data.data
  },

  /**
   * Desasignar código QR de habitación
   */
  desasignarQR: async (id) => {
    const response = await api.patch(`/qr/${id}/desasignar`)
    return response.data.data
  },

  /**
   * Obtener información de habitación por código QR (público)
   */
  getHabitacionPorCodigo: async (codigo) => {
    const response = await api.get(`/qr/${codigo}/habitacion`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getCodigosQR(params) },
  generar: function(cantidad = 1) { return this.generarCodigoQR(cantidad) },
  asignar: function(id, habitacion_id) { return this.asignarQR(id, habitacion_id) },
  desasignar: function(id) { return this.desasignarQR(id) },
}

export default qrService
