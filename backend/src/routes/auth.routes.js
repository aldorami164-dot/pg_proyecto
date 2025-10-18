const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { loginSchema } = require('../validators/auth.validator');
const { loginLimiter } = require('../middleware/rateLimit');

/**
 * @route   POST /api/auth/login
 * @desc    Login con email + password
 * @access  Public
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public (pero requiere refresh token válido)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', verificarToken, authController.me);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
