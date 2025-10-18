const express = require('express');
const router = express.Router();
const huespedesController = require('../controllers/huespedes.controller');
const { verificarToken, esPersonal } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { actualizarHuespedSchema } = require('../validators/huespedes.validator');

/**
 * @route   GET /api/huespedes
 * @desc    Listar huéspedes con filtros
 * @query   tipo: 'activos' | 'checkin' | 'historicos' | 'todos'
 * @query   search: búsqueda por nombre, apellido, email, teléfono, DPI
 * @query   page: número de página
 * @query   limit: resultados por página
 * @access  Private (admin/recepcionista)
 */
router.get('/', verificarToken, esPersonal, huespedesController.listar);

/**
 * @route   GET /api/huespedes/:id
 * @desc    Obtener detalle de huésped con sus reservas
 * @access  Private (admin/recepcionista)
 */
router.get('/:id', verificarToken, esPersonal, huespedesController.obtener);

/**
 * @route   PUT /api/huespedes/:id
 * @desc    Actualizar información de huésped
 * @access  Private (admin/recepcionista)
 */
router.put('/:id', verificarToken, esPersonal, validate(actualizarHuespedSchema), huespedesController.actualizar);

/**
 * @route   DELETE /api/huespedes/:id
 * @desc    Eliminar huésped (solo si todas sus reservas están completadas/canceladas)
 * @access  Private (admin/recepcionista)
 */
router.delete('/:id', verificarToken, esPersonal, huespedesController.eliminar);

module.exports = router;
