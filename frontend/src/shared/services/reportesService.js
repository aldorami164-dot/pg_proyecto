import api from './api'

/**
 * Servicio de reportes
 */
const reportesService = {
  /**
   * Generar reporte de ocupación
   */
  generarReporteOcupacion: async (reporteData) => {
    const response = await api.post('/reportes/ocupacion', reporteData)
    return response.data.data
  },

  /**
   * Obtener todos los reportes de ocupación
   */
  getReportesOcupacion: async (params = {}) => {
    const response = await api.get('/reportes/ocupacion', { params })
    return response.data.data
  },

  /**
   * Obtener un reporte de ocupación por ID
   */
  getReporteOcupacion: async (id) => {
    const response = await api.get(`/reportes/ocupacion/${id}`)
    return response.data.data
  },

  /**
   * Eliminar un reporte de ocupación
   */
  eliminarReporteOcupacion: async (id) => {
    const response = await api.delete(`/reportes/ocupacion/${id}`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  generar: function(data) { return this.generarReporteOcupacion(data) },
  listar: function(params) { return this.getReportesOcupacion(params) },
  obtener: function(id) { return this.getReporteOcupacion(id) },
  eliminar: function(id) { return this.eliminarReporteOcupacion(id) },
}

export default reportesService
