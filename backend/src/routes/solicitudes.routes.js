const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  crearSolicitudSchema,
  listarSolicitudesQuerySchema
} = require('../validators/solicitudes.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/solicitudes
 * @desc    Listar solicitudes de servicio con filtros
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/',
  verificarToken,
  esPersonal,
  validateQuery(listarSolicitudesQuerySchema),
  solicitudesController.listarSolicitudes
);

/**
 * @route   GET /api/solicitudes/:id
 * @desc    Obtener detalles de una solicitud
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/:id',
  verificarToken,
  esPersonal,
  solicitudesController.obtenerSolicitud
);

/**
 * @route   POST /api/solicitudes
 * @desc    Crear solicitud de servicio (PÚBLICO - desde plataforma QR)
 * @access  Public
 */
router.post(
  '/',
  createLimiter,
  validate(crearSolicitudSchema),
  solicitudesController.crearSolicitud
);

/**
 * @route   PATCH /api/solicitudes/:id/completar
 * @desc    Marcar solicitud como completada
 * @access  Private (admin/recepcionista)
 */
router.patch(
  '/:id/completar',
  verificarToken,
  esPersonal,
  solicitudesController.completarSolicitud
);

module.exports = router;
