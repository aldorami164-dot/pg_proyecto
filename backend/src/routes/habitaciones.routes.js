const express = require('express');
const router = express.Router();
const habitacionesController = require('../controllers/habitaciones.controller');
const { verificarToken, esAdmin, esPersonal } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  crearHabitacionSchema,
  actualizarHabitacionSchema,
  cambiarEstadoHabitacionSchema,
  listarHabitacionesQuerySchema,
  vincularImagenHabitacionSchema
} = require('../validators/habitaciones.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/habitaciones
 * @desc    Listar habitaciones con filtros
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/',
  verificarToken,
  esPersonal,
  validateQuery(listarHabitacionesQuerySchema),
  habitacionesController.listarHabitaciones
);

/**
 * @route   GET /api/habitaciones/:id
 * @desc    Obtener detalles de una habitación
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/:id',
  verificarToken,
  esPersonal,
  habitacionesController.obtenerHabitacion
);

/**
 * @route   POST /api/habitaciones
 * @desc    Crear nueva habitación (NO genera QR automáticamente)
 * @access  Private (SOLO admin)
 */
router.post(
  '/',
  verificarToken,
  esAdmin,
  createLimiter,
  validate(crearHabitacionSchema),
  habitacionesController.crearHabitacion
);

/**
 * @route   PUT /api/habitaciones/:id
 * @desc    Actualizar habitación (precio, descripción)
 * @access  Private (SOLO admin)
 */
router.put(
  '/:id',
  verificarToken,
  esAdmin,
  validate(actualizarHabitacionSchema),
  habitacionesController.actualizarHabitacion
);

/**
 * @route   PATCH /api/habitaciones/:id/estado
 * @desc    Cambiar estado de habitación (limpieza, mantenimiento, disponible)
 * @access  Private (admin/recepcionista)
 */
router.patch(
  '/:id/estado',
  verificarToken,
  esPersonal,
  validate(cambiarEstadoHabitacionSchema),
  habitacionesController.cambiarEstado
);

/**
 * @route   DELETE /api/habitaciones/:id
 * @desc    Desactivar habitación (soft delete)
 * @access  Private (SOLO admin)
 */
router.delete(
  '/:id',
  verificarToken,
  esAdmin,
  habitacionesController.desactivarHabitacion
);

/**
 * @route   GET /api/habitaciones/:id/imagenes
 * @desc    Obtener todas las imágenes de una habitación
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/:id/imagenes',
  verificarToken,
  esPersonal,
  habitacionesController.obtenerImagenesHabitacion
);

/**
 * @route   POST /api/habitaciones/:id/imagenes
 * @desc    Vincular una imagen de la galería a una habitación
 * @access  Private (SOLO admin)
 */
router.post(
  '/:id/imagenes',
  verificarToken,
  esAdmin,
  validate(vincularImagenHabitacionSchema),
  habitacionesController.vincularImagenHabitacion
);

/**
 * @route   DELETE /api/habitaciones/:id/imagenes/:imagen_id
 * @desc    Desvincular una imagen de una habitación
 * @access  Private (SOLO admin)
 */
router.delete(
  '/:id/imagenes/:imagen_id',
  verificarToken,
  esAdmin,
  habitacionesController.desvincularImagenHabitacion
);

/**
 * @route   PATCH /api/habitaciones/:id/imagenes/:imagen_id/principal
 * @desc    Establecer una imagen como principal para una habitación
 * @access  Private (SOLO admin)
 */
router.patch(
  '/:id/imagenes/:imagen_id/principal',
  verificarToken,
  esAdmin,
  habitacionesController.establecerImagenPrincipal
);

module.exports = router;
