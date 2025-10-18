const express = require('express');
const router = express.Router();
const {
  listarExperiencias,
  obtenerExperiencia,
  crearExperiencia,
  actualizarExperiencia,
  desactivarExperiencia,
  vincularImagenExperiencia,
  desvincularImagenExperiencia,
  establecerImagenPrincipal,
  obtenerImagenesExperiencia
} = require('../controllers/experiencias.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  crearExperienciaSchema,
  actualizarExperienciaSchema,
  vincularImagenSchema
} = require('../validators/experiencias.validator');

// CRUD de experiencias (requiere autenticación y rol de administrador)
router.get('/', verificarToken, esAdmin, listarExperiencias);
router.get('/:id', verificarToken, esAdmin, obtenerExperiencia);
router.post('/', verificarToken, esAdmin, validate(crearExperienciaSchema), crearExperiencia);
router.put('/:id', verificarToken, esAdmin, validate(actualizarExperienciaSchema), actualizarExperiencia);
router.delete('/:id', verificarToken, esAdmin, desactivarExperiencia);

// Gestión de imágenes (requiere autenticación y rol de administrador)
router.get('/:id/imagenes', verificarToken, esAdmin, obtenerImagenesExperiencia);
router.post('/:id/imagenes', verificarToken, esAdmin, validate(vincularImagenSchema), vincularImagenExperiencia);
router.delete('/:id/imagenes/:imagen_id', verificarToken, esAdmin, desvincularImagenExperiencia);
router.patch('/:id/imagenes/:imagen_id/principal', verificarToken, esAdmin, establecerImagenPrincipal);

module.exports = router;
