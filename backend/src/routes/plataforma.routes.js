const express = require('express');
const router = express.Router();
const plataformaController = require('../controllers/plataforma.controller');
const { validate, validateQuery } = require('../middleware/validation');
const {
  obtenerContenidoQuerySchema,
  obtenerExperienciasQuerySchema,
  listarComentariosQuerySchema,
  crearComentarioSchema
} = require('../validators/plataforma.validator');
const { createLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/plataforma/contenido
 * @desc    Obtener contenido CMS por idioma
 * @access  Public
 */
router.get(
  '/contenido',
  validateQuery(obtenerContenidoQuerySchema),
  plataformaController.obtenerContenido
);

/**
 * @route   GET /api/plataforma/experiencias
 * @desc    Obtener experiencias turísticas
 * @access  Public
 */
router.get(
  '/experiencias',
  validateQuery(obtenerExperienciasQuerySchema),
  plataformaController.obtenerExperiencias
);

/**
 * @route   GET /api/plataforma/experiencias/:id/imagenes
 * @desc    Obtener imágenes de una experiencia
 * @access  Public
 */
router.get(
  '/experiencias/:id/imagenes',
  plataformaController.obtenerImagenesExperiencia
);

/**
 * @route   GET /api/plataforma/lugares-turisticos
 * @desc    Obtener lugares turísticos
 * @access  Public
 */
router.get(
  '/lugares-turisticos',
  plataformaController.obtenerLugaresTuristicos
);

/**
 * @route   GET /api/plataforma/lugares-turisticos/:id/imagenes
 * @desc    Obtener imágenes de un lugar turístico
 * @access  Public
 */
router.get(
  '/lugares-turisticos/:id/imagenes',
  plataformaController.obtenerImagenesLugar
);

/**
 * @route   GET /api/plataforma/servicios
 * @desc    Obtener servicios disponibles
 * @access  Public
 */
router.get(
  '/servicios',
  plataformaController.obtenerServicios
);

/**
 * @route   POST /api/plataforma/comentarios
 * @desc    Crear comentario de huésped
 * @access  Public
 */
router.post(
  '/comentarios',
  createLimiter,
  validate(crearComentarioSchema),
  plataformaController.crearComentario
);

/**
 * @route   GET /api/plataforma/comentarios
 * @desc    Obtener comentarios activos
 * @access  Public
 */
router.get(
  '/comentarios',
  validateQuery(listarComentariosQuerySchema),
  plataformaController.listarComentarios
);

module.exports = router;
