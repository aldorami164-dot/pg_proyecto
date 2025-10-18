const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/habitaciones
 * Listar habitaciones con filtros e incluye imagen principal
 */
const listarHabitaciones = async (req, res, next) => {
  try {
    const { estado, tipo_habitacion_id, activo } = req.query;

    let queryText = `
      SELECT
        h.*,
        th.nombre as tipo_habitacion_nombre,
        th.capacidad_maxima,
        CASE
          WHEN h.qr_asignado_id IS NOT NULL THEN true
          ELSE false
        END as tiene_qr_asignado,
        img.id as imagen_id,
        img.titulo as imagen_titulo,
        img.url_imagen as imagen_url,
        img.descripcion as imagen_descripcion
      FROM habitaciones h
      INNER JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      LEFT JOIN LATERAL (
        SELECT ig.id, ig.titulo, ig.url_imagen, ig.descripcion
        FROM habitaciones_imagenes hi
        INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
        WHERE hi.habitacion_id = h.id
          AND ig.activo = true
        ORDER BY hi.es_principal DESC, hi.orden ASC, hi.creado_en ASC
        LIMIT 1
      ) img ON true
      WHERE 1=1
    `;

    const params = [];
    let paramCounter = 1;

    if (estado) {
      queryText += ` AND h.estado = $${paramCounter}`;
      params.push(estado);
      paramCounter++;
    }

    if (tipo_habitacion_id) {
      queryText += ` AND h.tipo_habitacion_id = $${paramCounter}`;
      params.push(tipo_habitacion_id);
      paramCounter++;
    }

    if (activo !== undefined) {
      queryText += ` AND h.activo = $${paramCounter}`;
      params.push(activo);
      paramCounter++;
    }

    queryText += ' ORDER BY h.numero ASC';

    const result = await query(queryText, params);

    return success(res, {
      habitaciones: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al listar habitaciones:', err);
    next(err);
  }
};

/**
 * GET /api/habitaciones/:id
 * Obtener detalles de una habitación con todas sus imágenes
 */
const obtenerHabitacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        h.*,
        th.nombre as tipo_habitacion_nombre,
        th.capacidad_maxima,
        th.descripcion as tipo_descripcion,
        qr.codigo as qr_codigo,
        qr.url_destino as qr_url
      FROM habitaciones h
      INNER JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      LEFT JOIN codigos_qr qr ON h.qr_asignado_id = qr.id
      WHERE h.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Habitación no encontrada', 404);
    }

    // Obtener todas las imágenes asociadas a esta habitación
    const imagenesResult = await query(
      `SELECT
        hi.id as relacion_id,
        hi.orden,
        hi.es_principal,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM habitaciones_imagenes hi
      INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
      WHERE hi.habitacion_id = $1
      ORDER BY hi.es_principal DESC, hi.orden ASC, hi.creado_en ASC`,
      [id]
    );

    const habitacion = result.rows[0];
    habitacion.imagenes = imagenesResult.rows;

    return success(res, habitacion);

  } catch (err) {
    log.error('Error al obtener habitación:', err);
    next(err);
  }
};

/**
 * POST /api/habitaciones
 * Crear nueva habitación (SOLO admin)
 * IMPORTANTE: NO genera QR automáticamente
 */
const crearHabitacion = async (req, res, next) => {
  try {
    const { numero, tipo_habitacion_id, precio_por_noche, descripcion } = req.body;

    // Verificar que el número no exista
    const existe = await query(
      'SELECT id FROM habitaciones WHERE LOWER(numero) = LOWER($1)',
      [numero]
    );

    if (existe.rows.length > 0) {
      throw { statusCode: 409, message: `Ya existe una habitación con el número ${numero}` };
    }

    // Verificar que el tipo de habitación existe
    const tipoExiste = await query(
      'SELECT nombre FROM tipos_habitacion WHERE id = $1',
      [tipo_habitacion_id]
    );

    if (tipoExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Tipo de habitación no encontrado' };
    }

    // Crear habitación
    const result = await query(
      `INSERT INTO habitaciones (numero, tipo_habitacion_id, precio_por_noche, descripcion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [numero, tipo_habitacion_id, precio_por_noche, descripcion || null]
    );

    log.success(`Habitación creada: ${numero} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Habitación creada exitosamente. El QR debe asignarse manualmente desde el panel de QR', 201);

  } catch (err) {
    log.error('Error al crear habitación:', err);
    next(err);
  }
};

/**
 * PUT /api/habitaciones/:id
 * Actualizar habitación (SOLO admin puede cambiar precio)
 */
const actualizarHabitacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { precio_por_noche, descripcion } = req.body;

    // Verificar que la habitación existe
    const habitacionExiste = await query(
      'SELECT id, numero FROM habitaciones WHERE id = $1',
      [id]
    );

    if (habitacionExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    // Construir query de actualización
    const campos = [];
    const valores = [];
    let contador = 1;

    if (precio_por_noche !== undefined) {
      campos.push(`precio_por_noche = $${contador}`);
      valores.push(precio_por_noche);
      contador++;
    }

    if (descripcion !== undefined) {
      campos.push(`descripcion = $${contador}`);
      valores.push(descripcion);
      contador++;
    }

    if (campos.length === 0) {
      throw { statusCode: 400, message: 'No hay campos para actualizar' };
    }

    valores.push(id);

    const updateQuery = `
      UPDATE habitaciones
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const result = await query(updateQuery, valores);

    log.success(`Habitación actualizada: ${habitacionExiste.rows[0].numero} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Habitación actualizada exitosamente');

  } catch (err) {
    log.error('Error al actualizar habitación:', err);
    next(err);
  }
};

/**
 * PATCH /api/habitaciones/:id/estado
 * Cambiar estado de habitación (limpieza, mantenimiento, disponible)
 * El estado 'ocupada' se maneja automáticamente por triggers
 */
const cambiarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que la habitación existe
    const habitacionResult = await query(
      `SELECT h.numero, h.estado as estado_actual, er.nombre as estado_reserva
       FROM habitaciones h
       LEFT JOIN reservas r ON h.id = r.habitacion_id AND r.estado_id = (SELECT id FROM estados_reserva WHERE nombre = 'confirmada')
       LEFT JOIN estados_reserva er ON r.estado_id = er.id
       WHERE h.id = $1`,
      [id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    const habitacion = habitacionResult.rows[0];

    // Validar que no se intente cambiar manualmente a 'ocupada'
    if (estado === 'ocupada') {
      throw {
        statusCode: 400,
        message: 'El estado "ocupada" se maneja automáticamente al hacer check-in de una reserva'
      };
    }

    // Advertir si hay una reserva activa
    if (habitacion.estado_reserva === 'confirmada' && estado !== 'disponible') {
      log.warn(`Cambiando estado de habitación ${habitacion.numero} a ${estado} pero tiene una reserva confirmada`);
    }

    // Actualizar estado
    const result = await query(
      'UPDATE habitaciones SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    log.success(`Estado de habitación ${habitacion.numero} cambiado a ${estado} por usuario ${req.user.email}`);

    return success(res, result.rows[0], `Estado cambiado a ${estado} exitosamente`);

  } catch (err) {
    log.error('Error al cambiar estado de habitación:', err);
    next(err);
  }
};

/**
 * DELETE /api/habitaciones/:id
 * Desactivar habitación (soft delete)
 */
const desactivarHabitacion = async (req, res, next) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar que la habitación existe
    const habitacionResult = await client.query(
      'SELECT numero FROM habitaciones WHERE id = $1',
      [id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    // Verificar que no tiene reservas activas (pendientes o confirmadas)
    const reservasActivas = await client.query(
      `SELECT COUNT(*) as total
       FROM reservas r
       INNER JOIN estados_reserva er ON r.estado_id = er.id
       WHERE r.habitacion_id = $1
       AND er.nombre IN ('pendiente', 'confirmada')`,
      [id]
    );

    if (parseInt(reservasActivas.rows[0].total) > 0) {
      throw {
        statusCode: 400,
        message: 'No se puede desactivar una habitación con reservas activas'
      };
    }

    // Desactivar habitación
    const result = await client.query(
      'UPDATE habitaciones SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    log.success(`Habitación desactivada: ${habitacionResult.rows[0].numero} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Habitación desactivada exitosamente');

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al desactivar habitación:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * POST /api/habitaciones/:id/imagenes
 * Vincular una imagen de la galería a una habitación
 */
const vincularImagenHabitacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imagen_id, orden, es_principal } = req.body;

    // Verificar que la habitación existe
    const habitacionExiste = await query(
      'SELECT numero FROM habitaciones WHERE id = $1',
      [id]
    );

    if (habitacionExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
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
      'SELECT id FROM habitaciones_imagenes WHERE habitacion_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionExiste.rows.length > 0) {
      throw { statusCode: 409, message: 'Esta imagen ya está vinculada a la habitación' };
    }

    // Insertar la relación
    const result = await query(
      `INSERT INTO habitaciones_imagenes (habitacion_id, imagen_id, orden, es_principal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, imagen_id, orden || 0, es_principal || false]
    );

    log.success(`Imagen ${imagen_id} vinculada a habitación ${habitacionExiste.rows[0].numero} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen vinculada exitosamente', 201);

  } catch (err) {
    log.error('Error al vincular imagen a habitación:', err);
    next(err);
  }
};

/**
 * DELETE /api/habitaciones/:id/imagenes/:imagen_id
 * Desvincular una imagen de una habitación
 */
const desvincularImagenHabitacion = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM habitaciones_imagenes WHERE habitacion_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada a la habitación' };
    }

    // Eliminar la relación
    await query(
      'DELETE FROM habitaciones_imagenes WHERE habitacion_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} desvinculada de habitación ${id} por usuario ${req.user.email}`);

    return success(res, null, 'Imagen desvinculada exitosamente');

  } catch (err) {
    log.error('Error al desvincular imagen de habitación:', err);
    next(err);
  }
};

/**
 * PATCH /api/habitaciones/:id/imagenes/:imagen_id/principal
 * Establecer una imagen como principal para una habitación
 */
const establecerImagenPrincipal = async (req, res, next) => {
  try {
    const { id, imagen_id } = req.params;

    // Verificar que la relación existe
    const relacionResult = await query(
      'SELECT id FROM habitaciones_imagenes WHERE habitacion_id = $1 AND imagen_id = $2',
      [id, imagen_id]
    );

    if (relacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Esta imagen no está vinculada a la habitación' };
    }

    // Marcar como principal (el trigger se encarga de desmarcar las demás)
    const result = await query(
      `UPDATE habitaciones_imagenes
       SET es_principal = true
       WHERE habitacion_id = $1 AND imagen_id = $2
       RETURNING *`,
      [id, imagen_id]
    );

    log.success(`Imagen ${imagen_id} establecida como principal para habitación ${id} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen principal establecida exitosamente');

  } catch (err) {
    log.error('Error al establecer imagen principal:', err);
    next(err);
  }
};

/**
 * GET /api/habitaciones/:id/imagenes
 * Obtener todas las imágenes de una habitación
 */
const obtenerImagenesHabitacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la habitación existe
    const habitacionExiste = await query(
      'SELECT numero FROM habitaciones WHERE id = $1',
      [id]
    );

    if (habitacionExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    // Obtener todas las imágenes
    const result = await query(
      `SELECT
        hi.id as relacion_id,
        hi.orden,
        hi.es_principal,
        hi.creado_en,
        ig.id as imagen_id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ig.activo
      FROM habitaciones_imagenes hi
      INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
      WHERE hi.habitacion_id = $1
      ORDER BY hi.es_principal DESC, hi.orden ASC, hi.creado_en ASC`,
      [id]
    );

    return success(res, {
      habitacion_id: parseInt(id),
      habitacion_numero: habitacionExiste.rows[0].numero,
      imagenes: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    log.error('Error al obtener imágenes de habitación:', err);
    next(err);
  }
};

module.exports = {
  listarHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  actualizarHabitacion,
  cambiarEstado,
  desactivarHabitacion,
  vincularImagenHabitacion,
  desvincularImagenHabitacion,
  establecerImagenPrincipal,
  obtenerImagenesHabitacion
};
