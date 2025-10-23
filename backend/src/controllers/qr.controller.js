const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE CÓDIGOS QR
// =============================================================================

/**
 * GET /api/qr
 * Listar códigos QR con filtros
 * @access Private (SOLO admin)
 */
const listarQr = async (req, res, next) => {
  try {
    const { estado, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramCount = 1;

    if (estado) {
      whereClause = `WHERE cq.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    // Consulta con paginación
    const result = await query(
      `SELECT
        cq.id,
        cq.codigo,
        cq.url_destino,
        cq.estado,
        cq.habitacion_id,
        h.numero as habitacion_numero,
        cq.total_lecturas,
        cq.ultima_lectura,
        cq.fecha_asignacion,
        cq.creado_en,
        u.nombre || ' ' || u.apellido as creado_por_nombre
      FROM codigos_qr cq
      LEFT JOIN habitaciones h ON cq.habitacion_id = h.id
      LEFT JOIN usuarios u ON cq.creado_por = u.id
      ${whereClause}
      ORDER BY cq.creado_en DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Contar total de registros
    const countResult = await query(
      `SELECT COUNT(*) as total FROM codigos_qr cq ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    log.success(`Listado de ${result.rows.length} códigos QR`);

    return success(res, {
      codigos_qr: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (err) {
    log.error('Error al listar códigos QR:', err.message);
    next(err);
  }
};

/**
 * POST /api/qr/generar
 * Generar múltiples códigos QR en stock
 * @access Private (SOLO admin)
 */
const generarQr = async (req, res, next) => {
  try {
    const { cantidad } = req.body;
    const creado_por = req.user.id;

    const codigosGenerados = [];
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Generar múltiples QR en una sola transacción
    for (let i = 0; i < cantidad; i++) {
      const result = await query(
        `INSERT INTO codigos_qr
          (url_destino, estado, creado_por)
        VALUES
          ($1, 'sin_asignar', $2)
        RETURNING id, codigo, url_destino, estado, creado_en`,
        [`${FRONTEND_URL}/plataforma/habitacion/PENDIENTE`, creado_por]
      );

      codigosGenerados.push(result.rows[0]);
    }

    log.success(`Generados ${cantidad} códigos QR por usuario ${req.user.email}`);

    return success(res, {
      generados: cantidad,
      codigos_qr: codigosGenerados
    }, `${cantidad} código(s) QR generado(s) exitosamente`, 201);
  } catch (err) {
    log.error('Error al generar códigos QR:', err.message);
    next(err);
  }
};

/**
 * PATCH /api/qr/:id/asignar
 * Asignar QR a una habitación
 * @access Private (SOLO admin)
 */
const asignarQr = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { habitacion_id } = req.body;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. Verificar que el QR existe y está disponible
    const qrResult = await client.query(
      `SELECT id, estado, habitacion_id as habitacion_actual
       FROM codigos_qr
       WHERE id = $1`,
      [id]
    );

    if (qrResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Código QR no encontrado' };
    }

    const qr = qrResult.rows[0];

    if (qr.estado === 'asignado' && qr.habitacion_actual) {
      throw {
        statusCode: 400,
        message: 'Este código QR ya está asignado a una habitación. Desasígnalo primero.'
      };
    }

    // 2. Verificar que la habitación existe y no tiene QR asignado
    const habitacionResult = await client.query(
      `SELECT id, numero, qr_asignado_id, activo
       FROM habitaciones
       WHERE id = $1`,
      [habitacion_id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    const habitacion = habitacionResult.rows[0];

    if (!habitacion.activo) {
      throw { statusCode: 400, message: 'La habitación no está activa' };
    }

    if (habitacion.qr_asignado_id) {
      throw {
        statusCode: 400,
        message: 'Esta habitación ya tiene un código QR asignado. Desasígnalo primero.'
      };
    }

    // 3. Obtener el código UUID del QR para construir la URL
    const qrCodeResult = await client.query(
      `SELECT codigo FROM codigos_qr WHERE id = $1`,
      [id]
    );
    const codigoUUID = qrCodeResult.rows[0].codigo;

    // 4. Actualizar código QR con URL que incluye el UUID
    const updateQrResult = await client.query(
      `UPDATE codigos_qr
       SET
         habitacion_id = $1,
         url_destino = $2,
         estado = 'asignado',
         fecha_asignacion = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, codigo, url_destino, habitacion_id, estado, fecha_asignacion`,
      [habitacion_id, `${FRONTEND_URL}/plataforma/habitacion/${codigoUUID}`, id]
    );

    // 5. Actualizar habitación
    await client.query(
      `UPDATE habitaciones
       SET qr_asignado_id = $1
       WHERE id = $2`,
      [id, habitacion_id]
    );

    await client.query('COMMIT');

    log.success(`QR ${id} asignado a habitación ${habitacion.numero} por usuario ${req.user.email}`);

    return success(res, {
      ...updateQrResult.rows[0],
      habitacion: {
        id: habitacion.id,
        numero: habitacion.numero
      }
    }, 'Código QR asignado exitosamente');
  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al asignar código QR:', err.message);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/qr/:id/desasignar
 * Desasignar QR de una habitación
 * @access Private (SOLO admin)
 */
const desasignarQr = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. Verificar que el QR existe y está asignado
    const qrResult = await client.query(
      `SELECT id, estado, habitacion_id
       FROM codigos_qr
       WHERE id = $1`,
      [id]
    );

    if (qrResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Código QR no encontrado' };
    }

    const qr = qrResult.rows[0];

    if (qr.estado !== 'asignado' || !qr.habitacion_id) {
      throw {
        statusCode: 400,
        message: 'Este código QR no está asignado a ninguna habitación'
      };
    }

    // 2. Actualizar habitación (quitar referencia al QR)
    await client.query(
      `UPDATE habitaciones
       SET qr_asignado_id = NULL
       WHERE qr_asignado_id = $1`,
      [id]
    );

    // 3. Actualizar código QR
    const updateQrResult = await client.query(
      `UPDATE codigos_qr
       SET
         habitacion_id = NULL,
         url_destino = $1,
         estado = 'sin_asignar',
         fecha_asignacion = NULL
       WHERE id = $2
       RETURNING id, codigo, url_destino, estado`,
      [`${FRONTEND_URL}/plataforma/habitacion/PENDIENTE`, id]
    );

    await client.query('COMMIT');

    log.success(`QR ${id} desasignado de habitación por usuario ${req.user.email}`);

    return success(res, updateQrResult.rows[0], 'Código QR desasignado exitosamente');
  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al desasignar código QR:', err.message);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/qr/:codigo/habitacion
 * Obtener información de habitación al escanear QR (PÚBLICO)
 * @access Public
 */
const escanearQr = async (req, res, next) => {
  try {
    const { codigo } = req.params;

    // 1. Buscar QR por UUID
    const qrResult = await query(
      `SELECT id, codigo, estado, habitacion_id
       FROM codigos_qr
       WHERE codigo = $1`,
      [codigo]
    );

    if (qrResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Código QR no encontrado' };
    }

    const qr = qrResult.rows[0];

    if (qr.estado === 'inactivo') {
      throw { statusCode: 403, message: 'Este código QR ha sido desactivado' };
    }

    if (!qr.habitacion_id) {
      throw {
        statusCode: 400,
        message: 'Este código QR aún no ha sido asignado a una habitación'
      };
    }

    // 2. Actualizar estadísticas de lectura
    await query(
      `UPDATE codigos_qr
       SET
         total_lecturas = total_lecturas + 1,
         ultima_lectura = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [qr.id]
    );

    // 3. Obtener información de la habitación
    const habitacionResult = await query(
      `SELECT
        h.id,
        h.numero,
        th.nombre as tipo,
        th.descripcion as tipo_descripcion,
        th.capacidad_maxima,
        h.descripcion
      FROM habitaciones h
      INNER JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      WHERE h.id = $1 AND h.activo = true`,
      [qr.habitacion_id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada o inactiva' };
    }

    log.info(`QR ${codigo} escaneado - Habitación ${habitacionResult.rows[0].numero}`);

    return success(res, {
      habitacion: habitacionResult.rows[0],
      mensaje_bienvenida: '¡Bienvenido a Hotel Casa Josefa!'
    });
  } catch (err) {
    log.error('Error al escanear código QR:', err.message);
    next(err);
  }
};

module.exports = {
  listarQr,
  generarQr,
  asignarQr,
  desasignarQr,
  escanearQr
};
