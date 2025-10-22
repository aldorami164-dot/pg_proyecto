const express = require('express');
const router = express.Router();
const {
  listarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  desactivarServicio,
  obtenerInstrucciones,
  agregarInstruccion,
  actualizarInstruccion,
  eliminarInstruccion,
  // NUEVO: Gestión de imágenes
  vincularImagen,
  desvincularImagen,
  marcarImagenPrincipal
} = require('../controllers/servicios.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  crearServicioSchema,
  actualizarServicioSchema,
  crearInstruccionSchema,
  actualizarInstruccionSchema
} = require('../validators/servicios.validator');

// =============================================================================
// RUTAS DE SERVICIOS (ADMIN)
// =============================================================================

// CRUD de servicios (requiere autenticación y rol de administrador)
router.get('/', verificarToken, esAdmin, listarServicios);
router.get('/:id', verificarToken, esAdmin, obtenerServicio);
router.post('/', verificarToken, esAdmin, validate(crearServicioSchema), crearServicio);
router.put('/:id', verificarToken, esAdmin, validate(actualizarServicioSchema), actualizarServicio);
router.delete('/:id', verificarToken, esAdmin, desactivarServicio);

// Gestión de instrucciones (requiere autenticación y rol de administrador)
router.get('/:id/instrucciones', verificarToken, esAdmin, obtenerInstrucciones);
router.post('/:id/instrucciones', verificarToken, esAdmin, validate(crearInstruccionSchema), agregarInstruccion);
router.put('/:id/instrucciones/:instruccion_id', verificarToken, esAdmin, validate(actualizarInstruccionSchema), actualizarInstruccion);
router.delete('/:id/instrucciones/:instruccion_id', verificarToken, esAdmin, eliminarInstruccion);

// NUEVO: Gestión de imágenes (requiere autenticación y rol de administrador)
router.post('/:id/imagenes', verificarToken, esAdmin, vincularImagen);
router.delete('/:id/imagenes/:vinculo_id', verificarToken, esAdmin, desvincularImagen);
router.patch('/:id/imagenes/:vinculo_id/principal', verificarToken, esAdmin, marcarImagenPrincipal);

module.exports = router;
