const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/experiencias
 * Listar experiencias con filtros e incluye imagen principal
 * @access Private (admin)
 */
const listarExperiencias = async (req, res, next) => {
  try {
    const { categoria, destacado, activo } = req.query;

    let queryText = `
      SELECT
        e.*,
        img.id as imagen_id,
        img.titulo as imagen_titulo,
        img.url_imagen as imagen_url,
        img.descripcion as imagen_descripcion,
        (
          SELECT COUNT(*)
          FROM experiencias_imagenes ei2
          WHERE ei2.experiencia_id = e.id
        ) as total_imagenes
      FROM experiencias_turisticas e
      LEFT JOIN LATERAL (
        SELECT ig.id, ig.titulo, ig.url_imagen, ig.descripcion
        FROM experiencias_imagenes ei
        INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
        WHERE ei.experiencia_id = e.id
          AND ig.activo = true
        ORDER BY ei.es_principal DESC, ei.orden ASC, ei.creado_en ASC
        LIMIT 1
      ) img ON true
      WHERE 1=1
    `;

    const params = [];
    let paramCounter = 1;

    if (categoria) {
      queryText += ` AND e.categoria = $${paramCounter}`;
      params.push(categoria);
      paramCounter++;
    }

    if (destacado !== undefined) {
      queryText += ` AND e.destacado = $${paramCounter}`;
      params.push(destacado === 'true' || destacado === true);
      paramCounter++;
    }

    if (activo !== undefined) {
      queryText += ` AND e.activo = $${paramCounter}`;
      params.push(activo === 'true' || activo === true);
      paramCounter++;
    }

    queryText += ' ORDER BY e.destacado DESC, e.orden ASC';

    const result = await query(queryText, params);

    log.success(`${result.rows.length} experiencias listadas por ${req.user.email}`);

    return success(res, {
      experiencias: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al listar experiencias:', err);
    next(err);
  }
};

/**
 * GET /api/experiencias/:id
 * Obtener detalles de una experiencia con todas sus imágenes
 * @access Private (admin)
 */
const obtenerExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM experiencias_turisticas WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Experiencia no encontrada', 404);
    }

    // Obtener todas las imágenes asociadas a esta experiencia
    const imagenesResult = await query(
      `SELECT
        ei.id as relacion_id,
        ei.orden,
        ei.es_principal,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM experiencias_imagenes ei
      INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
      WHERE ei.experiencia_id = $1
      ORDER BY ei.es_principal DESC, ei.orden ASC, ei.creado_en ASC`,
      [id]
    );

    const experiencia = result.rows[0];
    experiencia.imagenes = imagenesResult.rows;

    log.success(`Experiencia ${id} obtenida por ${req.user.email}`);

    return success(res, experiencia);

  } catch (err) {
    log.error('Error al obtener experiencia:', err);
    next(err);
  }
};

/**
 * POST /api/experiencias
 * Crear nueva experiencia turística (SOLO admin)
 */
const crearExperiencia = async (req, res, next) => {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      ubicacion,
      duracion,
      capacidad,
      destacado,
      orden
    } = req.body;

    // Crear experiencia
    const result = await query(
      `INSERT INTO experiencias_turisticas
        (nombre, categoria, descripcion, ubicacion, duracion, capacidad, destacado, orden, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nombre,
        categoria,
        descripcion || null,
        ubicacion || null,
        duracion || null,
        capacidad || null,
        destacado || false,
        orden || 0,
        req.user.id
      ]
    );

    log.success(`Experiencia creada: ${nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Experiencia creada exitosamente', 201);

  } catch (err) {
    log.error('Error al crear experiencia:', err);
    next(err);
  }
};

/**
 * PUT /api/experiencias/:id
 * Actualizar experiencia (SOLO admin)
 */
const actualizarExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria,
      descripcion,
      ubicacion,
      duracion,
      capacidad,
      destacado,
      orden
    } = req.body;

    // Verificar que la experiencia existe
    const experienciaExiste = await query(
      'SELECT id, nombre FROM experiencias_turisticas WHERE id = $1',
      [id]
    );

    if (experienciaExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Experiencia no encontrada' };
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

    if (categoria !== undefined) {
      campos.push(`categoria = $${contador}`);
      valores.push(categoria);
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

    if (duracion !== undefined) {
      campos.push(`duracion = $${contador}`);
      valores.push(duracion);
      contador++;
    }

    if (capacidad !== undefined) {
      campos.push(`capacidad = $${contador}`);
      valores.push(capacidad);
      contador++;
    }

    if (destacado !== undefined) {
      campos.push(`destacado = $${contador}`);
      valores.push(destacado);
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
      UPDATE experiencias_turisticas
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const result = await query(updateQuery, valores);

    log.success(`Experiencia ${id} actualizada por ${req.user.email}`);

    return success(res, result.rows[0], 'Experiencia actualizada exitosamente');

  } catch (err) {
    log.error('Error al actualizar experiencia:', err);
    next(err);
  }
};

/**
 * DELETE /api/experiencias/:id
 * Desactivar experiencia (soft delete)
 * @access Private (admin)
 */
const desactivarExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la experiencia existe
    const experienciaResult = await query(
      'SELECT nombre FROM experiencias_turisticas WHERE id = $1',
      [id]
    );

    if (experienciaResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Experiencia no encontrada' };
    }

    // Desactivar experiencia
    const result = await query(
      'UPDATE experiencias_turisticas SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );

    log.success(`Experiencia desactivada: ${experienciaResult.rows[0].nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Experiencia desactivada exitosamente');

  } catch (err) {
    log.error('Error al desactivar experiencia:', err);
    next(err);
  }
};

/**
 * POST /api/experiencias/:id/imagenes
 * Vincular una imagen de la galería a una experiencia
 * @access Private (admin)
 */
const vincularImagenExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imagen_id, orden, es_principal } = req.body;

    // Verificar que la experiencia existe
    const experienciaExiste = await query(
      'SELECT nombre FROM experiencias_turisticas WHERE id = $1',
      [id]
    );

    if (experienciaExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Experiencia no encontrada' };
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
      'SELECT id FROM experiencias_imagenes WHERE experiencia_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionExiste.rows.length > 0) {
      throw { statusCode: 409, message: 'Esta imagen ya está vinculada a la experiencia' };
    }

    // Insertar la relación
    const result = await query(
      `INSERT INTO experiencias_imagenes (experiencia_id, imagen_id, orden, es_principal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, imagen_id, orden || 0, es_principal || false]
    );

    log.success(`Imagen ${imagen_id} vinculada a experiencia ${experienciaExiste.rows[0].nombre} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen vinculada exitosamente', 201);

  } catch (err) {
    log.error('Error al vincular imagen a experiencia:', err);
    next(err);
  }
};

/**
 * DELETE /api/experiencias/:id/imagenes/:imagen_id
 * Desvincular una imagen de una experiencia
 * @access Private (admin)
 */
const desvincularImagenExperiencia = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM experiencias_imagenes WHERE experiencia_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada a la experiencia' };
    }

    // Eliminar la relación
    await query(
      'DELETE FROM experiencias_imagenes WHERE experiencia_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} desvinculada de experiencia ${id} por ${req.user.email}`);

    return success(res, null, 'Imagen desvinculada exitosamente');

  } catch (err) {
    log.error('Error al desvincular imagen de experiencia:', err);
    next(err);
  }
};

/**
 * PATCH /api/experiencias/:id/imagenes/:imagen_id/principal
 * Establecer una imagen como principal para una experiencia
 * @access Private (admin)
 */
const establecerImagenPrincipal = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM experiencias_imagenes WHERE experiencia_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada a la experiencia' };
    }

    // Marcar como principal (el trigger se encarga de desmarcar las demás)
    const result = await query(
      `UPDATE experiencias_imagenes
       SET es_principal = true
       WHERE experiencia_id = $1 AND imagen_id = $2
       RETURNING *`,
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} establecida como principal para experiencia ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen principal establecida exitosamente');

  } catch (err) {
    log.error('Error al establecer imagen principal:', err);
    next(err);
  }
};

/**
 * GET /api/experiencias/:id/imagenes
 * Obtener todas las imágenes de una experiencia
 * @access Private (admin)
 */
const obtenerImagenesExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la experiencia existe
    const experienciaExiste = await query(
      'SELECT nombre FROM experiencias_turisticas WHERE id = $1',
      [id]
    );

    if (experienciaExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Experiencia no encontrada' };
    }

    // Obtener todas las imágenes
    const result = await query(
      `SELECT
        ei.id as relacion_id,
        ei.orden,
        ei.es_principal,
        ei.creado_en,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM experiencias_imagenes ei
      INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
      WHERE ei.experiencia_id = $1
      ORDER BY ei.es_principal DESC, ei.orden ASC, ei.creado_en ASC`,
      [id]
    );

    log.success(`Imágenes de experiencia ${id} obtenidas por ${req.user.email}`);

    return success(res, {
      experiencia_id: parseInt(id),
      experiencia_nombre: experienciaExiste.rows[0].nombre,
      imagenes: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al obtener imágenes de experiencia:', err);
    next(err);
  }
};

module.exports = {
  listarExperiencias,
  obtenerExperiencia,
  crearExperiencia,
  actualizarExperiencia,
  desactivarExperiencia,
  vincularImagenExperiencia,
  desvincularImagenExperiencia,
  establecerImagenPrincipal,
  obtenerImagenesExperiencia
};
