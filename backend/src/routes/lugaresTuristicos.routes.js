const express = require('express');
const router = express.Router();
const {
  listarLugares,
  obtenerLugar,
  crearLugar,
  actualizarLugar,
  desactivarLugar,
  vincularImagenLugar,
  desvincularImagenLugar,
  establecerImagenPrincipal,
  obtenerImagenesLugar
} = require('../controllers/lugaresTuristicos.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  crearLugarSchema,
  actualizarLugarSchema,
  vincularImagenSchema
} = require('../validators/lugaresTuristicos.validator');

// CRUD de lugares turísticos (requiere autenticación y rol de administrador)
router.get('/', verificarToken, esAdmin, listarLugares);
router.get('/:id', verificarToken, esAdmin, obtenerLugar);
router.post('/', verificarToken, esAdmin, validate(crearLugarSchema), crearLugar);
router.put('/:id', verificarToken, esAdmin, validate(actualizarLugarSchema), actualizarLugar);
router.delete('/:id', verificarToken, esAdmin, desactivarLugar);

// Gestión de imágenes (requiere autenticación y rol de administrador)
router.get('/:id/imagenes', verificarToken, esAdmin, obtenerImagenesLugar);
router.post('/:id/imagenes', verificarToken, esAdmin, validate(vincularImagenSchema), vincularImagenLugar);
router.delete('/:id/imagenes/:imagen_id', verificarToken, esAdmin, desvincularImagenLugar);
router.patch('/:id/imagenes/:imagen_id/principal', verificarToken, esAdmin, establecerImagenPrincipal);

module.exports = router;
