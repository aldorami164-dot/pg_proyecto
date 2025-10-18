const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/lugares-turisticos
 * Listar lugares turísticos con filtros e incluye imagen principal
 * @access Private (admin)
 */
const listarLugares = async (req, res, next) => {
  try {
    const { categoria, activo } = req.query;

    let queryText = `
      SELECT
        l.*,
        img.id as imagen_id,
        img.titulo as imagen_titulo,
        img.url_imagen as imagen_url,
        img.descripcion as imagen_descripcion,
        (
          SELECT COUNT(*)
          FROM lugares_imagenes li2
          WHERE li2.lugar_id = l.id
        ) as total_imagenes
      FROM lugares_turisticos l
      LEFT JOIN LATERAL (
        SELECT ig.id, ig.titulo, ig.url_imagen, ig.descripcion
        FROM lugares_imagenes li
        INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
        WHERE li.lugar_id = l.id
          AND ig.activo = true
        ORDER BY li.es_principal DESC, li.orden ASC, li.creado_en ASC
        LIMIT 1
      ) img ON true
      WHERE 1=1
    `;

    const params = [];
    let paramCounter = 1;

    if (categoria) {
      queryText += ` AND l.categoria = $${paramCounter}`;
      params.push(categoria);
      paramCounter++;
    }

    if (activo !== undefined) {
      queryText += ` AND l.activo = $${paramCounter}`;
      params.push(activo === 'true' || activo === true);
      paramCounter++;
    }

    queryText += ' ORDER BY l.orden ASC';

    const result = await query(queryText, params);

    log.success(`${result.rows.length} lugares turísticos listados por ${req.user.email}`);

    return success(res, {
      lugares: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al listar lugares turísticos:', err);
    next(err);
  }
};

/**
 * GET /api/lugares-turisticos/:id
 * Obtener detalles de un lugar turístico con todas sus imágenes
 * @access Private (admin)
 */
const obtenerLugar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM lugares_turisticos WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Lugar turístico no encontrado', 404);
    }

    // Obtener todas las imágenes asociadas a este lugar
    const imagenesResult = await query(
      `SELECT
        li.id as relacion_id,
        li.orden,
        li.es_principal,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM lugares_imagenes li
      INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
      WHERE li.lugar_id = $1
      ORDER BY li.es_principal DESC, li.orden ASC, li.creado_en ASC`,
      [id]
    );

    const lugar = result.rows[0];
    lugar.imagenes = imagenesResult.rows;

    log.success(`Lugar turístico ${id} obtenido por ${req.user.email}`);

    return success(res, lugar);

  } catch (err) {
    log.error('Error al obtener lugar turístico:', err);
    next(err);
  }
};

/**
 * POST /api/lugares-turisticos
 * Crear nuevo lugar turístico (SOLO admin)
 */
const crearLugar = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      ubicacion,
      categoria,
      url_maps,
      telefono,
      horario,
      precio_entrada,
      orden
    } = req.body;

    // Crear lugar turístico
    const result = await query(
      `INSERT INTO lugares_turisticos
        (nombre, descripcion, ubicacion, categoria, url_maps, telefono, horario, precio_entrada, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nombre,
        descripcion || null,
        ubicacion || null,
        categoria,
        url_maps || null,
        telefono || null,
        horario || null,
        precio_entrada || 0,
        orden || 0
      ]
    );

    log.success(`Lugar turístico creado: ${nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Lugar turístico creado exitosamente', 201);

  } catch (err) {
    log.error('Error al crear lugar turístico:', err);
    next(err);
  }
};

/**
 * PUT /api/lugares-turisticos/:id
 * Actualizar lugar turístico (SOLO admin)
 */
const actualizarLugar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      ubicacion,
      categoria,
      url_maps,
      telefono,
      horario,
      precio_entrada,
      orden
    } = req.body;

    // Verificar que el lugar existe
    const lugarExiste = await query(
      'SELECT id, nombre FROM lugares_turisticos WHERE id = $1',
      [id]
    );

    if (lugarExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Lugar turístico no encontrado' };
    }

    // Construir query de actualización
    const campos = [];
    const valores = [];
    let contador = 1;

    if (nombre !== undefined) {
      campos.push(`nombre = $${contador}`);
      valores.push(nombre);
      contador++;
    }

    if (descripcion !== undefined) {
      campos.push(`descripcion = $${contador}`);
      valores.push(descripcion);
      contador++;
    }

    if (ubicacion !== undefined) {
      campos.push(`ubicacion = $${contador}`);
      valores.push(ubicacion);
      contador++;
    }

    if (categoria !== undefined) {
      campos.push(`categoria = $${contador}`);
      valores.push(categoria);
      contador++;
    }

    if (url_maps !== undefined) {
      campos.push(`url_maps = $${contador}`);
      valores.push(url_maps);
      contador++;
    }

    if (telefono !== undefined) {
      campos.push(`telefono = $${contador}`);
      valores.push(telefono);
      contador++;
    }

    if (horario !== undefined) {
      campos.push(`horario = $${contador}`);
      valores.push(horario);
      contador++;
    }

    if (precio_entrada !== undefined) {
      campos.push(`precio_entrada = $${contador}`);
      valores.push(precio_entrada);
      contador++;
    }

    if (orden !== undefined) {
      campos.push(`orden = $${contador}`);
      valores.push(orden);
      contador++;
    }

    if (campos.length === 0) {
      throw { statusCode: 400, message: 'No hay campos para actualizar' };
    }

    valores.push(id);

    const updateQuery = `
      UPDATE lugares_turisticos
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const result = await query(updateQuery, valores);

    log.success(`Lugar turístico ${id} actualizado por ${req.user.email}`);

    return success(res, result.rows[0], 'Lugar turístico actualizado exitosamente');

  } catch (err) {
    log.error('Error al actualizar lugar turístico:', err);
    next(err);
  }
};

/**
 * DELETE /api/lugares-turisticos/:id
 * Desactivar lugar turístico (soft delete)
 * @access Private (admin)
 */
const desactivarLugar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el lugar existe
    const lugarResult = await query(
      'SELECT nombre FROM lugares_turisticos WHERE id = $1',
      [id]
    );

    if (lugarResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Lugar turístico no encontrado' };
    }

    // Desactivar lugar
    const result = await query(
      'UPDATE lugares_turisticos SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );

    log.success(`Lugar turístico desactivado: ${lugarResult.rows[0].nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Lugar turístico desactivado exitosamente');

  } catch (err) {
    log.error('Error al desactivar lugar turístico:', err);
    next(err);
  }
};

/**
 * POST /api/lugares-turisticos/:id/imagenes
 * Vincular una imagen de la galería a un lugar turístico
 * @access Private (admin)
 */
const vincularImagenLugar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imagen_id, orden, es_principal } = req.body;

    // Verificar que el lugar existe
    const lugarExiste = await query(
      'SELECT nombre FROM lugares_turisticos WHERE id = $1',
      [id]
    );

    if (lugarExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Lugar turístico no encontrado' };
    }

    // Verificar que la imagen existe y está activa
    const imagenExiste = await query(
      'SELECT titulo FROM imagenes_galeria WHERE id = $1 AND activo = true',
      [imagen_id]
    );

    if (imagenExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Imagen no encontrada o inactiva' };
    }

    // Verificar si ya existe esta relación
    const relacionExiste = await query(
      'SELECT id FROM lugares_imagenes WHERE lugar_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionExiste.rows.length > 0) {
      throw { statusCode: 409, message: 'Esta imagen ya está vinculada al lugar turístico' };
    }

    // Insertar la relación
    const result = await query(
      `INSERT INTO lugares_imagenes (lugar_id, imagen_id, orden, es_principal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, imagen_id, orden || 0, es_principal || false]
    );

    log.success(`Imagen ${imagen_id} vinculada a lugar turístico ${lugarExiste.rows[0].nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen vinculada exitosamente', 201);

  } catch (err) {
    log.error('Error al vincular imagen a lugar turístico:', err);
    next(err);
  }
};

/**
 * DELETE /api/lugares-turisticos/:id/imagenes/:imagen_id
 * Desvincular una imagen de un lugar turístico
 * @access Private (admin)
 */
const desvincularImagenLugar = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM lugares_imagenes WHERE lugar_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada al lugar turístico' };
    }

    // Eliminar la relación
    await query(
      'DELETE FROM lugares_imagenes WHERE lugar_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} desvinculada de lugar turístico ${id} por ${req.user.email}`);

    return success(res, null, 'Imagen desvinculada exitosamente');

  } catch (err) {
    log.error('Error al desvincular imagen de lugar turístico:', err);
    next(err);
  }
};

/**
 * PATCH /api/lugares-turisticos/:id/imagenes/:imagen_id/principal
 * Establecer una imagen como principal para un lugar turístico
 * @access Private (admin)
 */
const establecerImagenPrincipal = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM lugares_imagenes WHERE lugar_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada al lugar turístico' };
    }

    // Marcar como principal (el trigger se encarga de desmarcar las demás)
    const result = await query(
      `UPDATE lugares_imagenes
       SET es_principal = true
       WHERE lugar_id = $1 AND imagen_id = $2
       RETURNING *`,
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} establecida como principal para lugar turístico ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen principal establecida exitosamente');

  } catch (err) {
    log.error('Error al establecer imagen principal:', err);
    next(err);
  }
};

/**
 * GET /api/lugares-turisticos/:id/imagenes
 * Obtener todas las imágenes de un lugar turístico
 * @access Private (admin)
 */
const obtenerImagenesLugar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el lugar existe
    const lugarExiste = await query(
      'SELECT nombre FROM lugares_turisticos WHERE id = $1',
      [id]
    );

    if (lugarExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Lugar turístico no encontrado' };
    }

    // Obtener todas las imágenes
    const result = await query(
      `SELECT
        li.id as relacion_id,
        li.orden,
        li.es_principal,
        li.creado_en,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM lugares_imagenes li
      INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
      WHERE li.lugar_id = $1
      ORDER BY li.es_principal DESC, li.orden ASC, li.creado_en ASC`,
      [id]
    );

    log.success(`Imágenes de lugar turístico ${id} obtenidas por ${req.user.email}`);

    return success(res, {
      lugar_id: parseInt(id),
      lugar_nombre: lugarExiste.rows[0].nombre,
      imagenes: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al obtener imágenes de lugar turístico:', err);
    next(err);
  }
};

module.exports = {
  listarLugares,
  obtenerLugar,
  crearLugar,
  actualizarLugar,
  desactivarLugar,
  vincularImagenLugar,
  desvincularImagenLugar,
  establecerImagenPrincipal,
  obtenerImagenesLugar
};
