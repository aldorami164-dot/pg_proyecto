const express = require('express');
const router = express.Router();
const multer = require('multer');
const galeriaController = require('../controllers/galeria.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const {
  listarImagenesQuerySchema,
  actualizarImagenSchema
} = require('../validators/galeria.validator');

// Configurar multer para manejar uploads en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

/**
 * @route   GET /api/galeria
 * @desc    Listar imágenes de la galería
 * @access  Public
 */
router.get(
  '/',
  validateQuery(listarImagenesQuerySchema),
  galeriaController.listarImagenes
);

/**
 * @route   POST /api/galeria
 * @desc    Subir imagen a Supabase Storage
 * @access  Private (SOLO admin)
 */
router.post(
  '/',
  verificarToken,
  esAdmin,
  upload.single('imagen'), // El campo del formulario debe llamarse 'imagen'
  galeriaController.subirImagen
);

/**
 * @route   PUT /api/galeria/:id
 * @desc    Actualizar información de imagen (NO la imagen en sí)
 * @access  Private (SOLO admin)
 */
router.put(
  '/:id',
  verificarToken,
  esAdmin,
  validate(actualizarImagenSchema),
  galeriaController.actualizarImagen
);

/**
 * @route   DELETE /api/galeria/:id
 * @desc    Eliminar imagen de Supabase Storage y BD
 * @access  Private (SOLO admin)
 */
router.delete(
  '/:id',
  verificarToken,
  esAdmin,
  galeriaController.eliminarImagen
);

/**
 * @route   PATCH /api/galeria/:id/toggle-activo
 * @desc    Activar/desactivar imagen
 * @access  Private (SOLO admin)
 */
router.patch(
  '/:id/toggle-activo',
  verificarToken,
  esAdmin,
  galeriaController.toggleActivo
);

module.exports = router;
