const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/alertas
 * @desc    Obtener alertas inteligentes para el dashboard
 * @access  Private (admin/recepcionista)
 * @returns {Object} Alertas críticas, advertencias e información adicional
 */
router.get(
  '/alertas',
  verificarToken,
  esPersonal,
  dashboardController.obtenerAlertas
);

/**
 * @route   GET /api/dashboard/stats-detalladas
 * @desc    Obtener estadísticas detalladas para las cards del dashboard
 * @access  Private (admin/recepcionista)
 * @returns {Object} Stats con tendencias, ocupación histórica y próximas liberaciones
 */
router.get(
  '/stats-detalladas',
  verificarToken,
  esPersonal,
  dashboardController.obtenerStatsDetalladas
);

/**
 * @route   GET /api/dashboard/acciones-rapidas
 * @desc    Obtener datos para el panel de acciones rápidas
 * @access  Private (admin/recepcionista)
 * @returns {Object} Top reservas pendientes, solicitudes y habitaciones ocupadas
 */
router.get(
  '/acciones-rapidas',
  verificarToken,
  esPersonal,
  dashboardController.obtenerAccionesRapidas
);

/**
 * @route   POST /api/dashboard/procesar-reservas-vencidas
 * @desc    Auto-cancela reservas pendientes cuya fecha de check-in ya pasó
 * @access  Private (admin/recepcionista)
 * @returns {Object} Número de reservas canceladas automáticamente
 */
router.post(
  '/procesar-reservas-vencidas',
  verificarToken,
  esPersonal,
  dashboardController.procesarReservasVencidas
);

module.exports = router;
