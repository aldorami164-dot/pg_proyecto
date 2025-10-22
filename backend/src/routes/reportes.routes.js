const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  generarReporteSchema,
  listarReportesQuerySchema
} = require('../validators/reportes.validator');

/**
 * @route   POST /api/reportes/ocupacion
 * @desc    Generar reporte de ocupación
 * @access  Private (admin only)
 */
router.post(
  '/ocupacion',
  verificarToken,
  esAdmin,
  validate(generarReporteSchema),
  reportesController.generarReporte
);

/**
 * @route   GET /api/reportes/ocupacion
 * @desc    Listar reportes históricos
 * @access  Private (admin only)
 */
router.get(
  '/ocupacion',
  verificarToken,
  esAdmin,
  validateQuery(listarReportesQuerySchema),
  reportesController.listarReportes
);

/**
 * @route   GET /api/reportes/ocupacion/:id
 * @desc    Obtener detalles de un reporte
 * @access  Private (admin only)
 */
router.get(
  '/ocupacion/:id',
  verificarToken,
  esAdmin,
  reportesController.obtenerReporte
);

/**
 * @route   DELETE /api/reportes/ocupacion/:id
 * @desc    Eliminar un reporte
 * @access  Private (admin only)
 */
router.delete(
  '/ocupacion/:id',
  verificarToken,
  esAdmin,
  reportesController.eliminarReporte
);

module.exports = router;
