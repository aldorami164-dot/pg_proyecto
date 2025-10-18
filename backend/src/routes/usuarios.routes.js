const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  listarUsuariosQuerySchema
} = require('../validators/usuarios.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/usuarios
 * @desc    Listar usuarios con filtros
 * @access  Private (SOLO admin)
 */
router.get(
  '/',
  verificarToken,
  esAdmin,
  validateQuery(listarUsuariosQuerySchema),
  usuariosController.listarUsuarios
);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener detalles de un usuario
 * @access  Private (SOLO admin)
 */
router.get(
  '/:id',
  verificarToken,
  esAdmin,
  usuariosController.obtenerUsuario
);

/**
 * @route   POST /api/usuarios
 * @desc    Crear nuevo usuario
 * @access  Private (SOLO admin)
 */
router.post(
  '/',
  verificarToken,
  esAdmin,
  createLimiter,
  validate(crearUsuarioSchema),
  usuariosController.crearUsuario
);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Private (SOLO admin)
 */
router.put(
  '/:id',
  verificarToken,
  esAdmin,
  validate(actualizarUsuarioSchema),
  usuariosController.actualizarUsuario
);

/**
 * @route   PATCH /api/usuarios/:id/toggle-activo
 * @desc    Activar/desactivar usuario (soft delete)
 * @access  Private (SOLO admin)
 */
router.patch(
  '/:id/toggle-activo',
  verificarToken,
  esAdmin,
  usuariosController.toggleActivo
);

module.exports = router;
