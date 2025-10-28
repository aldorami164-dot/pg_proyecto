import api from './api'

/**
 * Servicio de reservas
 */
const reservasService = {
  /**
   * Obtener todas las reservas con filtros opcionales
   */
  getReservas: async (params = {}) => {
    const response = await api.get('/reservas', { params })
    return response.data.data
  },

  /**
   * Obtener una reserva por ID
   */
  getReserva: async (id) => {
    const response = await api.get(`/reservas/${id}`)
    return response.data.data
  },

  /**
   * Crear nueva reserva
   */
  createReserva: async (reservaData) => {
    // FIX: Serializar las fechas explícitamente como strings
    const sanitizedData = {
      ...reservaData,
      fecha_checkin: String(reservaData.fecha_checkin),
      fecha_checkout: String(reservaData.fecha_checkout)
    }
    const response = await api.post('/reservas', sanitizedData)
    return response.data.data
  },

  /**
   * Actualizar reserva
   */
  updateReserva: async (id, reservaData) => {
    // FIX: Serializar las fechas explícitamente como strings
    const sanitizedData = {
      ...reservaData,
      fecha_checkin: reservaData.fecha_checkin ? String(reservaData.fecha_checkin) : undefined,
      fecha_checkout: reservaData.fecha_checkout ? String(reservaData.fecha_checkout) : undefined
    }
    console.log('🔒 reservasService.updateReserva - Datos sanitizados:', sanitizedData)
    const response = await api.put(`/reservas/${id}`, sanitizedData)
    return response.data.data
  },

  /**
   * Cambiar estado de reserva
   */
  cambiarEstado: async (id, estado, motivo_cancelacion = null) => {
    const response = await api.patch(`/reservas/${id}/estado`, {
      estado,
      motivo_cancelacion,
    })
    return response.data.data
  },

  /**
   * Verificar disponibilidad de habitaciones
   */
  verificarDisponibilidad: async (fecha_checkin, fecha_checkout, tipo_habitacion = null) => {
    // FIX: Forzar conversión a string para prevenir que Axios convierta a Date
    const params = {
      fecha_checkin: String(fecha_checkin),
      fecha_checkout: String(fecha_checkout)
    }
    if (tipo_habitacion) {
      params.tipo_habitacion = tipo_habitacion
    }

    console.log('📤 Enviando params al endpoint de disponibilidad:', params)

    const response = await api.get('/reservas/disponibilidad', { params })

    console.log('📥 Respuesta RAW del backend:', response.data)

    return response.data.data
  },

  /**
   * Eliminar reserva cancelada
   */
  eliminarReserva: async (id) => {
    const response = await api.delete(`/reservas/${id}`)
    return response.data.data
  },

  /**
   * Crear grupo de reservas (múltiples habitaciones)
   */
  crearGrupoReservas: async (grupoData) => {
    // Sanitizar fechas
    const sanitizedData = {
      ...grupoData,
      fecha_checkin: String(grupoData.fecha_checkin),
      fecha_checkout: String(grupoData.fecha_checkout)
    }
    console.log('🏨 reservasService.crearGrupoReservas - Datos enviados:', sanitizedData)
    const response = await api.post('/reservas/grupo', sanitizedData)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getReservas(params) },
  crear: function(data) { return this.createReserva(data) },
  actualizar: function(id, data) { return this.updateReserva(id, data) },
  cambiar: function(id, estado, motivo) { return this.cambiarEstado(id, estado, motivo) },
  eliminar: function(id) { return this.eliminarReserva(id) },
  crearGrupo: function(data) { return this.crearGrupoReservas(data) },  // ← NUEVO ALIAS
}

export default reservasService
