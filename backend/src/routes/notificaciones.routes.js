const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const {
  listarNotificacionesQuerySchema
} = require('../validators/notificaciones.validator');

/**
 * @route   GET /api/notificaciones
 * @desc    Listar notificaciones con filtros
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/',
  verificarToken,
  esPersonal,
  validateQuery(listarNotificacionesQuerySchema),
  notificacionesController.listarNotificaciones
);

/**
 * @route   GET /api/notificaciones/:id
 * @desc    Obtener detalles de una notificación
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/:id',
  verificarToken,
  esPersonal,
  notificacionesController.obtenerNotificacion
);

/**
 * @route   PATCH /api/notificaciones/:id/leer
 * @desc    Marcar notificación como leída
 * @access  Private (admin/recepcionista)
 */
router.patch(
  '/:id/leer',
  verificarToken,
  esPersonal,
  notificacionesController.marcarComoLeida
);

/**
 * @route   PATCH /api/notificaciones/leer-todas
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private (admin/recepcionista)
 */
router.patch(
  '/leer-todas',
  verificarToken,
  esPersonal,
  notificacionesController.marcarTodasComoLeidas
);

module.exports = router;
