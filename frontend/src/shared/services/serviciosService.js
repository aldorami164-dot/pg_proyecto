import api from './api';

// =============================================================================
// SERVICIOS API - ADMINISTRACIÓN (PANEL ADMIN)
// =============================================================================

/**
 * Listar todos los servicios (admin)
 */
const getServicios = async (params = {}) => {
  const response = await api.get('/servicios', { params });
  return response.data.data;
};

/**
 * Obtener un servicio por ID (admin)
 */
const getServicio = async (id) => {
  const response = await api.get(`/servicios/${id}`);
  return response.data.data;
};

/**
 * Crear nuevo servicio (admin)
 */
const createServicio = async (data) => {
  const response = await api.post('/servicios', data);
  return response.data.data;
};

/**
 * Actualizar servicio (admin)
 */
const updateServicio = async (id, data) => {
  const response = await api.put(`/servicios/${id}`, data);
  return response.data.data;
};

/**
 * Desactivar servicio (admin)
 */
const deleteServicio = async (id) => {
  const response = await api.delete(`/servicios/${id}`);
  return response.data.data;
};

/**
 * Obtener instrucciones de un servicio (admin)
 */
const getInstrucciones = async (servicioId) => {
  const response = await api.get(`/servicios/${servicioId}/instrucciones`);
  return response.data.data;
};

/**
 * Agregar instrucción a un servicio (admin)
 */
const createInstruccion = async (servicioId, data) => {
  const response = await api.post(`/servicios/${servicioId}/instrucciones`, data);
  return response.data.data;
};

/**
 * Actualizar instrucción (admin)
 */
const updateInstruccion = async (servicioId, instruccionId, data) => {
  const response = await api.put(`/servicios/${servicioId}/instrucciones/${instruccionId}`, data);
  return response.data.data;
};

/**
 * Eliminar instrucción (admin)
 */
const deleteInstruccion = async (servicioId, instruccionId) => {
  const response = await api.delete(`/servicios/${servicioId}/instrucciones/${instruccionId}`);
  return response.data.data;
};

// =============================================================================
// GESTIÓN DE IMÁGENES (NUEVO)
// =============================================================================

/**
 * Vincular imagen a servicio
 */
const vincularImagen = async (servicioId, data) => {
  const response = await api.post(`/servicios/${servicioId}/imagenes`, data);
  return response.data.data;
};

/**
 * Desvincular imagen de servicio
 */
const desvincularImagen = async (servicioId, vinculoId) => {
  const response = await api.delete(`/servicios/${servicioId}/imagenes/${vinculoId}`);
  return response.data.data;
};

/**
 * Marcar imagen como principal
 */
const marcarImagenPrincipal = async (servicioId, vinculoId) => {
  const response = await api.patch(`/servicios/${servicioId}/imagenes/${vinculoId}/principal`);
  return response.data.data;
};

export default {
  getServicios,
  getServicio,
  createServicio,
  updateServicio,
  deleteServicio,
  getInstrucciones,
  createInstruccion,
  updateInstruccion,
  deleteInstruccion,
  // NUEVO: Alias para compatibilidad
  listar: getServicios,
  // NUEVO: Gestión de imágenes
  vincularImagen,
  desvincularImagen,
  marcarImagenPrincipal
};
