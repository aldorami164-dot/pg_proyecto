const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservas.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  crearReservaSchema,
  actualizarReservaSchema,
  cambiarEstadoSchema,
  disponibilidadQuerySchema,
  listarReservasQuerySchema,
  crearGrupoReservasSchema  // ← NUEVO
} = require('../validators/reservas.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/reservas
 * @desc    Listar reservas con filtros y paginación
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/',
  verificarToken,
  esPersonal,
  validateQuery(listarReservasQuerySchema),
  reservasController.listarReservas
);

/**
 * @route   GET /api/reservas/disponibilidad
 * @desc    Consultar habitaciones disponibles en rango de fechas
 * @access  Public (útil para frontend)
 */
router.get(
  '/disponibilidad',
  validateQuery(disponibilidadQuerySchema),
  reservasController.consultarDisponibilidad
);

/**
 * @route   GET /api/reservas/:id
 * @desc    Obtener detalles de una reserva
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/:id',
  verificarToken,
  esPersonal,
  reservasController.obtenerReserva
);

/**
 * @route   POST /api/reservas
 * @desc    Crear nueva reserva (con huésped nuevo o existente)
 * @access  Private (admin/recepcionista)
 */
router.post(
  '/',
  verificarToken,
  esPersonal,
  createLimiter,
  validate(crearReservaSchema),
  reservasController.crearReserva
);

/**
 * @route   POST /api/reservas/grupo
 * @desc    Crear grupo de reservas (múltiples habitaciones para un mismo huésped)
 * @access  Private (admin/recepcionista)
 */
router.post(
  '/grupo',
  verificarToken,
  esPersonal,
  createLimiter,
  validate(crearGrupoReservasSchema),
  reservasController.crearGrupoReservas
);

/**
 * @route   PUT /api/reservas/:id
 * @desc    Actualizar reserva existente
 * @access  Private (admin/recepcionista)
 */
router.put(
  '/:id',
  verificarToken,
  esPersonal,
  validate(actualizarReservaSchema),
  reservasController.actualizarReserva
);

/**
 * @route   PATCH /api/reservas/:id/estado
 * @desc    Cambiar estado de reserva (check-in, check-out, cancelar)
 * @access  Private (admin/recepcionista)
 */
router.patch(
  '/:id/estado',
  verificarToken,
  esPersonal,
  validate(cambiarEstadoSchema),
  reservasController.cambiarEstado
);

/**
 * @route   DELETE /api/reservas/:id
 * @desc    Eliminar reserva cancelada (solo permitido para reservas canceladas)
 * @access  Private (admin/recepcionista)
 */
router.delete(
  '/:id',
  verificarToken,
  esPersonal,
  reservasController.eliminarReserva
);

module.exports = router;
