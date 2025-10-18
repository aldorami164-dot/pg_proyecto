const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  generarQrSchema,
  asignarQrSchema,
  listarQrQuerySchema
} = require('../validators/qr.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/qr
 * @desc    Listar códigos QR con filtros
 * @access  Private (SOLO admin)
 */
router.get(
  '/',
  verificarToken,
  esAdmin,
  validateQuery(listarQrQuerySchema),
  qrController.listarQr
);

/**
 * @route   POST /api/qr/generar
 * @desc    Generar múltiples códigos QR en stock
 * @access  Private (SOLO admin)
 */
router.post(
  '/generar',
  verificarToken,
  esAdmin,
  createLimiter,
  validate(generarQrSchema),
  qrController.generarQr
);

/**
 * @route   PATCH /api/qr/:id/asignar
 * @desc    Asignar código QR a una habitación
 * @access  Private (SOLO admin)
 */
router.patch(
  '/:id/asignar',
  verificarToken,
  esAdmin,
  validate(asignarQrSchema),
  qrController.asignarQr
);

/**
 * @route   PATCH /api/qr/:id/desasignar
 * @desc    Desasignar código QR de una habitación
 * @access  Private (SOLO admin)
 */
router.patch(
  '/:id/desasignar',
  verificarToken,
  esAdmin,
  qrController.desasignarQr
);

/**
 * @route   GET /api/qr/:codigo/habitacion
 * @desc    Obtener info de habitación al escanear QR (PÚBLICO)
 * @access  Public
 */
router.get(
  '/:codigo/habitacion',
  qrController.escanearQr
);

module.exports = router;
