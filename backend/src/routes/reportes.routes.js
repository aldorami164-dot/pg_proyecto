const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  generarReporteSchema,
  listarReportesQuerySchema
} = require('../validators/reportes.validator');

/**
 * @route   POST /api/reportes/ocupacion
 * @desc    Generar reporte de ocupación
 * @access  Private (admin/recepcionista)
 */
router.post(
  '/ocupacion',
  verificarToken,
  esPersonal,
  validate(generarReporteSchema),
  reportesController.generarReporte
);

/**
 * @route   GET /api/reportes/ocupacion
 * @desc    Listar reportes históricos
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/ocupacion',
  verificarToken,
  esPersonal,
  validateQuery(listarReportesQuerySchema),
  reportesController.listarReportes
);

/**
 * @route   GET /api/reportes/ocupacion/:id
 * @desc    Obtener detalles de un reporte
 * @access  Private (admin/recepcionista)
 */
router.get(
  '/ocupacion/:id',
  verificarToken,
  esPersonal,
  reportesController.obtenerReporte
);

module.exports = router;
