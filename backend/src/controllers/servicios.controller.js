const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE SERVICIOS (ADMIN)
// =============================================================================

/**
 * GET /api/servicios
 * Listar servicios con instrucciones e imágenes
 * @access Private (admin)
 */
const listarServicios = async (req, res, next) => {
  try {
    const { activo } = req.query;

    let queryText = `
      SELECT
        s.*,
        (
          SELECT COUNT(*)
          FROM servicios_instrucciones si
          WHERE si.servicio_id = s.id AND si.activo = true
        ) as total_instrucciones,
        -- NUEVO: Contadores de imágenes vinculadas
        COALESCE(
          (SELECT COUNT(*) FROM servicios_imagenes si WHERE si.servicio_id = s.id), 0
        ) as total_imagenes,
        -- NUEVO: Imagen principal
        (
          SELECT json_build_object(
            'id', ig.id,
            'titulo', ig.titulo,
            'url_imagen', ig.url_imagen,
            'descripcion', ig.descripcion
          )
          FROM servicios_imagenes si
          INNER JOIN imagenes_galeria ig ON si.imagen_id = ig.id
          WHERE si.servicio_id = s.id AND si.es_principal = TRUE AND ig.activo = TRUE
          LIMIT 1
        ) as imagen_principal
      FROM servicios s
      WHERE 1=1
    `;

    const params = [];
    let paramCounter = 1;

    if (activo !== undefined) {
      queryText += ` AND s.activo = $${paramCounter}`;
      params.push(activo === 'true' || activo === true);
      paramCounter++;
    }

    queryText += ' ORDER BY s.creado_en DESC';

    const result = await query(queryText, params);

    log.success(`${result.rows.length} servicios listados por ${req.user.email}`);

    return success(res, {
      servicios: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al listar servicios:', err);
    next(err);
  }
};

/**
 * GET /api/servicios/:id
 * Obtener detalles de un servicio con todas sus instrucciones e imágenes
 * @access Private (admin)
 */
const obtenerServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM servicios WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Servicio no encontrado', 404);
    }

    // Obtener todas las instrucciones asociadas
    const instruccionesResult = await query(
      `SELECT
        id,
        texto_instruccion,
        orden,
        activo
      FROM servicios_instrucciones
      WHERE servicio_id = $1
      ORDER BY orden ASC, creado_en ASC`,
      [id]
    );

    // NUEVO: Obtener todas las imágenes vinculadas
    const imagenesResult = await query(
      `SELECT
        si.id as vinculo_id,
        si.orden,
        si.es_principal,
        ig.id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.categoria,
        ig.activo
      FROM servicios_imagenes si
      INNER JOIN imagenes_galeria ig ON si.imagen_id = ig.id
      WHERE si.servicio_id = $1
      ORDER BY si.es_principal DESC, si.orden ASC, si.creado_en ASC`,
      [id]
    );

    const servicio = {
      ...result.rows[0],
      instrucciones: instruccionesResult.rows,
      imagenes: imagenesResult.rows // NUEVO
    };

    log.info(`Servicio ${id} obtenido por ${req.user.email}`);

    return success(res, servicio);

  } catch (err) {
    log.error('Error al obtener servicio:', err);
    next(err);
  }
};

/**
 * POST /api/servicios
 * Crear nuevo servicio
 * @access Private (admin)
 */
const crearServicio = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      nombre,
      descripcion,
      categoria,
      precio,
      tiene_costo,
      horario_inicio,
      horario_fin,
      solicitable,
      icono
    } = req.body;

    const result = await client.query(
      `INSERT INTO servicios (
        nombre,
        descripcion,
        categoria,
        precio,
        tiene_costo,
        horario_inicio,
        horario_fin,
        solicitable,
        icono,
        activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        nombre,
        descripcion,
        categoria,
        precio || null,
        tiene_costo || false,
        horario_inicio || null,
        horario_fin || null,
        solicitable !== undefined ? solicitable : true,
        icono || 'CheckCircle',
        true
      ]
    );

    await client.query('COMMIT');

    log.success(`Servicio "${nombre}" creado por ${req.user.email}`);

    return success(res, result.rows[0], 'Servicio creado exitosamente', 201);

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al crear servicio:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/servicios/:id
 * Actualizar servicio
 * @access Private (admin)
 */
const actualizarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      tiene_costo,
      horario_inicio,
      horario_fin,
      solicitable,
      icono
    } = req.body;

    const result = await query(
      `UPDATE servicios
       SET
         nombre = COALESCE($1, nombre),
         descripcion = COALESCE($2, descripcion),
         categoria = COALESCE($3, categoria),
         precio = COALESCE($4, precio),
         tiene_costo = COALESCE($5, tiene_costo),
         horario_inicio = COALESCE($6, horario_inicio),
         horario_fin = COALESCE($7, horario_fin),
         solicitable = COALESCE($8, solicitable),
         icono = COALESCE($9, icono),
         actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        nombre,
        descripcion,
        categoria,
        precio,
        tiene_costo,
        horario_inicio,
        horario_fin,
        solicitable,
        icono,
        id
      ]
    );

    if (result.rows.length === 0) {
      return error(res, 'Servicio no encontrado', 404);
    }

    log.success(`Servicio ${id} actualizado por ${req.user.email}`);

    return success(res, result.rows[0], 'Servicio actualizado exitosamente');

  } catch (err) {
    log.error('Error al actualizar servicio:', err);
    next(err);
  }
};

/**
 * DELETE /api/servicios/:id
 * Desactivar servicio (soft delete)
 * @access Private (admin)
 */
const desactivarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE servicios
       SET activo = false, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Servicio no encontrado', 404);
    }

    log.success(`Servicio ${id} desactivado por ${req.user.email}`);

    return success(res, result.rows[0], 'Servicio desactivado exitosamente');

  } catch (err) {
    log.error('Error al desactivar servicio:', err);
    next(err);
  }
};

/**
 * GET /api/servicios/:id/instrucciones
 * Obtener instrucciones de un servicio
 * @access Private (admin)
 */
const obtenerInstrucciones = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT *
       FROM servicios_instrucciones
       WHERE servicio_id = $1
       ORDER BY orden ASC, creado_en ASC`,
      [id]
    );

    log.info(`${result.rows.length} instrucciones obtenidas para servicio ${id}`);

    return success(res, {
      instrucciones: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al obtener instrucciones:', err);
    next(err);
  }
};

/**
 * POST /api/servicios/:id/instrucciones
 * Agregar instrucción a un servicio
 * @access Private (admin)
 */
const agregarInstruccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto_instruccion, orden } = req.body;

    // Verificar que el servicio existe
    const servicioResult = await query(
      `SELECT id FROM servicios WHERE id = $1`,
      [id]
    );

    if (servicioResult.rows.length === 0) {
      return error(res, 'Servicio no encontrado', 404);
    }

    const result = await query(
      `INSERT INTO servicios_instrucciones (
        servicio_id,
        texto_instruccion,
        orden,
        activo
      ) VALUES ($1, $2, $3, true)
      RETURNING *`,
      [id, texto_instruccion, orden || 0]
    );

    log.success(`Instrucción agregada a servicio ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Instrucción agregada exitosamente', 201);

  } catch (err) {
    log.error('Error al agregar instrucción:', err);
    next(err);
  }
};

/**
 * PUT /api/servicios/:id/instrucciones/:instruccion_id
 * Actualizar instrucción
 * @access Private (admin)
 */
const actualizarInstruccion = async (req, res, next) => {
  try {
    const { id, instruccion_id } = req.params;
    const { texto_instruccion, orden, activo } = req.body;

    const result = await query(
      `UPDATE servicios_instrucciones
       SET
         texto_instruccion = COALESCE($1, texto_instruccion),
         orden = COALESCE($2, orden),
         activo = COALESCE($3, activo),
         actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $4 AND servicio_id = $5
       RETURNING *`,
      [texto_instruccion, orden, activo, instruccion_id, id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Instrucción no encontrada', 404);
    }

    log.success(`Instrucción ${instruccion_id} actualizada por ${req.user.email}`);

    return success(res, result.rows[0], 'Instrucción actualizada exitosamente');

  } catch (err) {
    log.error('Error al actualizar instrucción:', err);
    next(err);
  }
};

/**
 * DELETE /api/servicios/:id/instrucciones/:instruccion_id
 * Eliminar instrucción
 * @access Private (admin)
 */
const eliminarInstruccion = async (req, res, next) => {
  try {
    const { id, instruccion_id } = req.params;

    const result = await query(
      `DELETE FROM servicios_instrucciones
       WHERE id = $1 AND servicio_id = $2
       RETURNING *`,
      [instruccion_id, id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Instrucción no encontrada', 404);
    }

    log.success(`Instrucción ${instruccion_id} eliminada por ${req.user.email}`);

    return success(res, result.rows[0], 'Instrucción eliminada exitosamente');

  } catch (err) {
    log.error('Error al eliminar instrucción:', err);
    next(err);
  }
};

// =============================================================================
// GESTIÓN DE IMÁGENES (NUEVO)
// =============================================================================

/**
 * POST /api/servicios/:id/imagenes
 * Vincular imagen a servicio
 * @access Private (admin)
 */
const vincularImagen = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { imagen_id, orden = 0, es_principal = false } = req.body;

    // Verificar que el servicio existe
    const servicioResult = await client.query(
      `SELECT id FROM servicios WHERE id = $1`,
      [id]
    );

    if (servicioResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Servicio no encontrado' };
    }

    // Verificar que la imagen existe y está activa
    const imagenResult = await client.query(
      `SELECT id FROM imagenes_galeria WHERE id = $1 AND activo = true`,
      [imagen_id]
    );

    if (imagenResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Imagen no encontrada o inactiva' };
    }

    // Verificar que no esté ya vinculada
    const vinculoExiste = await client.query(
      `SELECT id FROM servicios_imagenes WHERE servicio_id = $1 AND imagen_id = $2`,
      [id, imagen_id]
    );

    if (vinculoExiste.rows.length > 0) {
      throw { statusCode: 400, message: 'Esta imagen ya está vinculada a este servicio' };
    }

    // Si es_principal = true, desmarcar otras imágenes principales (lo hace el trigger automáticamente)
    // Insertar vínculo
    const result = await client.query(
      `INSERT INTO servicios_imagenes (servicio_id, imagen_id, orden, es_principal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, imagen_id, orden, es_principal]
    );

    await client.query('COMMIT');

    log.success(`Imagen ${imagen_id} vinculada a servicio ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen vinculada exitosamente', 201);

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al vincular imagen:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/servicios/:id/imagenes/:vinculo_id
 * Desvincular imagen de servicio
 * @access Private (admin)
 */
const desvincularImagen = async (req, res, next) => {
  try {
    const { id, vinculo_id } = req.params;

    const result = await query(
      `DELETE FROM servicios_imagenes
       WHERE id = $1 AND servicio_id = $2
       RETURNING *`,
      [vinculo_id, id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Vínculo no encontrado' };
    }

    log.success(`Imagen desvinculada de servicio ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen desvinculada exitosamente');

  } catch (err) {
    log.error('Error al desvincular imagen:', err);
    next(err);
  }
};

/**
 * PATCH /api/servicios/:id/imagenes/:vinculo_id/principal
 * Marcar imagen como principal
 * @access Private (admin)
 */
const marcarImagenPrincipal = async (req, res, next) => {
  try {
    const { id, vinculo_id } = req.params;

    // El trigger se encarga de desmarcar las demás automáticamente
    const result = await query(
      `UPDATE servicios_imagenes
       SET es_principal = true
       WHERE id = $1 AND servicio_id = $2
       RETURNING *`,
      [vinculo_id, id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Vínculo no encontrado' };
    }

    log.success(`Imagen marcada como principal para servicio ${id} por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen marcada como principal exitosamente');

  } catch (err) {
    log.error('Error al marcar imagen como principal:', err);
    next(err);
  }
};

module.exports = {
  listarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  desactivarServicio,
  obtenerInstrucciones,
  agregarInstruccion,
  actualizarInstruccion,
  eliminarInstruccion,
  // NUEVO: Gestión de imágenes
  vincularImagen,
  desvincularImagen,
  marcarImagenPrincipal
};
