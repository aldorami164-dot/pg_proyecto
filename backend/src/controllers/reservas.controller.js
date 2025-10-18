const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/reservas
 * Listar reservas con filtros y paginación
 */
const listarReservas = async (req, res, next) => {
  try {
    const { estado, estados_excluir, canal, fecha_desde, fecha_hasta, habitacion_id, page, limit } = req.query;
    const offset = (page - 1) * limit;

    // Construir query dinámicamente
    let queryText = `
      SELECT
        r.*,
        h.nombre as huesped_nombre,
        h.apellido as huesped_apellido,
        h.email as huesped_email,
        h.telefono as huesped_telefono,
        hab.numero as habitacion_numero,
        th.nombre as tipo_habitacion,
        er.nombre as estado_nombre,
        er.color_hex as estado_color,
        u.nombre as creado_por_nombre
      FROM reservas r
      INNER JOIN huespedes h ON r.huesped_id = h.id
      INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
      INNER JOIN tipos_habitacion th ON hab.tipo_habitacion_id = th.id
      INNER JOIN estados_reserva er ON r.estado_id = er.id
      LEFT JOIN usuarios u ON r.creado_por = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCounter = 1;

    // Filtro de estado único
    if (estado) {
      queryText += ` AND er.nombre = $${paramCounter}`;
      params.push(estado);
      paramCounter++;
    }

    // NUEVO: Filtro para excluir múltiples estados
    if (estados_excluir) {
      const estadosArray = estados_excluir.split(',').map(e => e.trim());
      const placeholders = estadosArray.map((_, idx) => `$${paramCounter + idx}`).join(',');
      queryText += ` AND er.nombre NOT IN (${placeholders})`;
      estadosArray.forEach(e => params.push(e));
      paramCounter += estadosArray.length;
    }

    if (canal) {
      queryText += ` AND r.canal_reserva = $${paramCounter}`;
      params.push(canal);
      paramCounter++;
    }

    if (fecha_desde) {
      queryText += ` AND r.fecha_checkin >= $${paramCounter}`;
      params.push(fecha_desde);
      paramCounter++;
    }

    if (fecha_hasta) {
      queryText += ` AND r.fecha_checkout <= $${paramCounter}`;
      params.push(fecha_hasta);
      paramCounter++;
    }

    if (habitacion_id) {
      queryText += ` AND r.habitacion_id = $${paramCounter}`;
      params.push(habitacion_id);
      paramCounter++;
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM (${queryText}) as count_query`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Agregar ordenamiento y paginación
    queryText += ` ORDER BY r.creado_en DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Formatear fechas en todas las reservas
    const reservasFormateadas = result.rows.map(r => ({
      ...r,
      fecha_checkin: r.fecha_checkin?.toISOString().split('T')[0],
      fecha_checkout: r.fecha_checkout?.toISOString().split('T')[0]
    }));

    return success(res, {
      reservas: reservasFormateadas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    log.error('Error al listar reservas:', err);
    next(err);
  }
};

/**
 * POST /api/reservas
 * Crear nueva reserva (con huésped nuevo o existente)
 */
const crearReserva = async (req, res, next) => {
  const client = await getClient();

  try {
    log.info('📥 Datos recibidos en crearReserva:', JSON.stringify(req.body, null, 2));

    await client.query('BEGIN');

    let huesped_id;

    // 1. Crear o usar huésped existente
    if (req.body.huesped_id) {
      log.info('🔍 Usando huésped existente:', req.body.huesped_id);
      huesped_id = req.body.huesped_id;

      // Verificar que el huésped existe
      const huespedExiste = await client.query(
        'SELECT id FROM huespedes WHERE id = $1',
        [huesped_id]
      );

      if (huespedExiste.rows.length === 0) {
        throw { statusCode: 404, message: 'Huésped no encontrado' };
      }
    } else {
      // Crear nuevo huésped
      log.info('✨ Creando nuevo huésped:', req.body.huesped);
      const { nombre, apellido, dpi_pasaporte, email, telefono, pais, direccion, fecha_nacimiento } = req.body.huesped;

      const nuevoHuesped = await client.query(
        `INSERT INTO huespedes (nombre, apellido, dpi_pasaporte, email, telefono, pais, direccion, fecha_nacimiento)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [nombre, apellido || null, dpi_pasaporte || null, email || null, telefono || null, pais || null, direccion || null, fecha_nacimiento || null]
      );

      huesped_id = nuevoHuesped.rows[0].id;
      log.success('✅ Huésped creado con ID:', huesped_id);
    }

    // 2. Obtener precio de la habitación
    const habitacionResult = await client.query(
      `SELECT h.precio_por_noche, h.activo, h.numero, th.nombre as tipo, th.capacidad_maxima
       FROM habitaciones h
       INNER JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
       WHERE h.id = $1`,
      [req.body.habitacion_id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    const habitacion = habitacionResult.rows[0];

    if (!habitacion.activo) {
      throw { statusCode: 400, message: 'La habitación no está activa' };
    }

    // Verificar que número de huéspedes no exceda capacidad
    if (req.body.numero_huespedes > habitacion.capacidad_maxima) {
      throw {
        statusCode: 400,
        message: `La habitación ${habitacion.tipo} tiene capacidad máxima de ${habitacion.capacidad_maxima} huéspedes`
      };
    }

    // 3. VALIDAR SOLAPAMIENTO (CRÍTICO) - Temporal: usar las fechas del req.body original
    // Nota: Las fechas se sanitizarán después en el paso 4
    let tempCheckin = req.body.fecha_checkin;
    let tempCheckout = req.body.fecha_checkout;

    if (tempCheckin instanceof Date) tempCheckin = tempCheckin.toISOString().split('T')[0];
    if (tempCheckout instanceof Date) tempCheckout = tempCheckout.toISOString().split('T')[0];
    if (typeof tempCheckin === 'string' && tempCheckin.includes('T')) tempCheckin = tempCheckin.split('T')[0];
    if (typeof tempCheckout === 'string' && tempCheckout.includes('T')) tempCheckout = tempCheckout.split('T')[0];

    const validacion = await client.query(
      'SELECT validar_solapamiento_reservas($1, $2, $3, NULL) as disponible',
      [req.body.habitacion_id, tempCheckin, tempCheckout]
    );

    if (!validacion.rows[0].disponible) {
      throw {
        statusCode: 409,
        message: `La habitación ${habitacion.numero} no está disponible del ${tempCheckin} al ${tempCheckout}`
      };
    }

    // 4. Crear reserva
    log.info('📅 FECHAS RECIBIDAS EN BACKEND (ANTES DE SANITIZAR):');
    log.info('   fecha_checkin:', req.body.fecha_checkin, typeof req.body.fecha_checkin);
    log.info('   fecha_checkout:', req.body.fecha_checkout, typeof req.body.fecha_checkout);

    // FIX FINAL: Forzar conversión a string si es Date object
    let fechaCheckinFinal = req.body.fecha_checkin;
    let fechaCheckoutFinal = req.body.fecha_checkout;

    if (fechaCheckinFinal instanceof Date) {
      fechaCheckinFinal = fechaCheckinFinal.toISOString().split('T')[0];
      log.info('   ⚠️  fecha_checkin era Date, convertida a:', fechaCheckinFinal);
    } else if (typeof fechaCheckinFinal === 'string' && fechaCheckinFinal.includes('T')) {
      fechaCheckinFinal = fechaCheckinFinal.split('T')[0];
      log.info('   ⚠️  fecha_checkin tenía hora, limpiada a:', fechaCheckinFinal);
    }

    if (fechaCheckoutFinal instanceof Date) {
      fechaCheckoutFinal = fechaCheckoutFinal.toISOString().split('T')[0];
      log.info('   ⚠️  fecha_checkout era Date, convertida a:', fechaCheckoutFinal);
    } else if (typeof fechaCheckoutFinal === 'string' && fechaCheckoutFinal.includes('T')) {
      fechaCheckoutFinal = fechaCheckoutFinal.split('T')[0];
      log.info('   ⚠️  fecha_checkout tenía hora, limpiada a:', fechaCheckoutFinal);
    }

    log.info('📅 FECHAS FINALES A INSERTAR:');
    log.info('   fecha_checkin:', fechaCheckinFinal, typeof fechaCheckinFinal);
    log.info('   fecha_checkout:', fechaCheckoutFinal, typeof fechaCheckoutFinal);

    // FIX CRÍTICO: PostgreSQL interpreta fechas como UTC y las convierte a timezone local
    // Al insertar "2025-10-27" lo toma como "2025-10-27 00:00:00 UTC"
    // que en Guatemala (UTC-6) se convierte a "2025-10-26 18:00:00"
    // SOLUCIÓN: Convertir explícitamente a tipo DATE sin timezone
    const reservaResult = await client.query(
      `INSERT INTO reservas (
        huesped_id, habitacion_id, fecha_checkin, fecha_checkout,
        precio_por_noche, numero_huespedes, canal_reserva, estado_id, notas, creado_por
      ) VALUES (
        $1, $2, $3::date, $4::date, $5, $6, $7,
        (SELECT id FROM estados_reserva WHERE nombre = 'pendiente'),
        $8, $9
      ) RETURNING *`,
      [
        huesped_id,
        req.body.habitacion_id,
        fechaCheckinFinal,  // Usar la fecha sanitizada
        fechaCheckoutFinal, // Usar la fecha sanitizada
        habitacion.precio_por_noche,
        req.body.numero_huespedes,
        req.body.canal_reserva,
        req.body.notas || null,
        req.user.id
      ]
    );

    log.info('✅ Reserva insertada:', reservaResult.rows[0].id);
    log.info('   fecha_checkin guardada:', reservaResult.rows[0].fecha_checkin);
    log.info('   fecha_checkout guardada:', reservaResult.rows[0].fecha_checkout);

    const reserva = reservaResult.rows[0];

    // 5. Obtener datos completos de la reserva creada
    const reservaCompleta = await client.query(
      `SELECT
        r.*,
        h.nombre as huesped_nombre,
        h.apellido as huesped_apellido,
        hab.numero as habitacion_numero,
        th.nombre as tipo_habitacion,
        er.nombre as estado_nombre
      FROM reservas r
      INNER JOIN huespedes h ON r.huesped_id = h.id
      INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
      INNER JOIN tipos_habitacion th ON hab.tipo_habitacion_id = th.id
      INNER JOIN estados_reserva er ON r.estado_id = er.id
      WHERE r.id = $1`,
      [reserva.id]
    );

    await client.query('COMMIT');

    log.success(`Reserva creada: ${reserva.codigo_reserva} por usuario ${req.user.email}`);

    // Formatear fechas antes de enviar respuesta
    const reservaFormateada = {
      ...reservaCompleta.rows[0],
      fecha_checkin: reservaCompleta.rows[0].fecha_checkin?.toISOString().split('T')[0],
      fecha_checkout: reservaCompleta.rows[0].fecha_checkout?.toISOString().split('T')[0]
    };

    return success(res, reservaFormateada, 'Reserva creada exitosamente', 201);

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al crear reserva:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/reservas/:id
 * Actualizar reserva existente
 */
const actualizarReserva = async (req, res, next) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar que la reserva existe y no está completada/cancelada
    const reservaActual = await client.query(
      `SELECT r.*, er.nombre as estado
       FROM reservas r
       INNER JOIN estados_reserva er ON r.estado_id = er.id
       WHERE r.id = $1`,
      [id]
    );

    if (reservaActual.rows.length === 0) {
      throw { statusCode: 404, message: 'Reserva no encontrada' };
    }

    const reserva = reservaActual.rows[0];

    if (['completada', 'cancelada'].includes(reserva.estado)) {
      throw {
        statusCode: 400,
        message: `No se puede editar una reserva ${reserva.estado}`
      };
    }

    // Si cambian fechas, validar solapamiento
    const fecha_checkin = req.body.fecha_checkin || reserva.fecha_checkin;
    const fecha_checkout = req.body.fecha_checkout || reserva.fecha_checkout;

    if (req.body.fecha_checkin || req.body.fecha_checkout) {
      const validacion = await client.query(
        'SELECT validar_solapamiento_reservas($1, $2, $3, $4) as disponible',
        [reserva.habitacion_id, fecha_checkin, fecha_checkout, id]
      );

      if (!validacion.rows[0].disponible) {
        throw {
          statusCode: 409,
          message: 'Las nuevas fechas no están disponibles para esta habitación'
        };
      }
    }

    // Actualizar campos permitidos
    const campos = [];
    const valores = [];
    let contador = 1;

    if (req.body.fecha_checkin) {
      // FIX: Cast a ::date para evitar conversión de timezone
      campos.push(`fecha_checkin = $${contador}::date`);
      valores.push(req.body.fecha_checkin);
      contador++;
    }

    if (req.body.fecha_checkout) {
      // FIX: Cast a ::date para evitar conversión de timezone
      campos.push(`fecha_checkout = $${contador}::date`);
      valores.push(req.body.fecha_checkout);
      contador++;
    }

    if (req.body.numero_huespedes) {
      campos.push(`numero_huespedes = $${contador}`);
      valores.push(req.body.numero_huespedes);
      contador++;
    }

    if (req.body.notas !== undefined) {
      campos.push(`notas = $${contador}`);
      valores.push(req.body.notas);
      contador++;
    }

    if (campos.length === 0) {
      throw { statusCode: 400, message: 'No hay campos para actualizar' };
    }

    valores.push(id);

    const updateQuery = `
      UPDATE reservas
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const result = await client.query(updateQuery, valores);

    await client.query('COMMIT');

    log.success(`Reserva actualizada: ${id} por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Reserva actualizada exitosamente');

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al actualizar reserva:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/reservas/:id/estado
 * Cambiar estado de reserva (check-in, check-out, cancelar)
 */
const cambiarEstado = async (req, res, next) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const { estado } = req.body;

    await client.query('BEGIN');

    // Obtener estado actual
    const reservaActual = await client.query(
      `SELECT r.*, er.nombre as estado_actual
       FROM reservas r
       INNER JOIN estados_reserva er ON r.estado_id = er.id
       WHERE r.id = $1`,
      [id]
    );

    if (reservaActual.rows.length === 0) {
      throw { statusCode: 404, message: 'Reserva no encontrada' };
    }

    const reserva = reservaActual.rows[0];

    // Validar transiciones de estado
    const transicionesValidas = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['completada', 'cancelada'],
      'completada': [], // No se puede cambiar
      'cancelada': [] // No se puede cambiar
    };

    if (!transicionesValidas[reserva.estado_actual].includes(estado)) {
      throw {
        statusCode: 400,
        message: `No se puede cambiar de ${reserva.estado_actual} a ${estado}`
      };
    }

    // Actualizar estado
    const camposActualizar = ['estado_id = (SELECT id FROM estados_reserva WHERE nombre = $1)'];
    const valores = [estado];
    let contador = 2;

    // Si se confirma, registrar quién hizo check-in
    if (estado === 'confirmada') {
      camposActualizar.push(`checkin_por = $${contador}`);
      valores.push(req.user.id);
      contador++;
    }

    // Si se completa, registrar quién hizo check-out
    if (estado === 'completada') {
      camposActualizar.push(`checkout_por = $${contador}`);
      valores.push(req.user.id);
      contador++;
    }

    // Si se cancela, registrar fecha de cancelación
    if (estado === 'cancelada') {
      camposActualizar.push(`fecha_cancelacion = CURRENT_TIMESTAMP`);
    }

    valores.push(id);

    const updateQuery = `
      UPDATE reservas
      SET ${camposActualizar.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const result = await client.query(updateQuery, valores);

    await client.query('COMMIT');

    log.success(`Estado de reserva cambiado: ${id} -> ${estado} por usuario ${req.user.email}`);

    // El trigger actualizar_estado_habitacion se ejecutará automáticamente

    return success(res, result.rows[0], `Reserva ${estado} exitosamente`);

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al cambiar estado de reserva:', err);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/reservas/disponibilidad
 * Consultar habitaciones disponibles en rango de fechas
 */
const consultarDisponibilidad = async (req, res, next) => {
  try {
    let { fecha_checkin, fecha_checkout, tipo_habitacion_id } = req.query;

    log.info('🔍 Consultando disponibilidad (ANTES de sanitizar):');
    log.info('   fecha_checkin:', fecha_checkin, typeof fecha_checkin);
    log.info('   fecha_checkout:', fecha_checkout, typeof fecha_checkout);

    // Validar que se proporcionen las fechas
    if (!fecha_checkin || !fecha_checkout) {
      return error(res, 'Se requieren fecha_checkin y fecha_checkout', 400);
    }

    // FIX: Sanitizar fechas de query params (pueden venir como Date objects o strings con hora)
    // Express convierte query params que parecen fechas en Date objects
    if (fecha_checkin instanceof Date) {
      fecha_checkin = fecha_checkin.toISOString().split('T')[0];
      log.info('   ⚠️ fecha_checkin era Date object, convertida a:', fecha_checkin);
    } else if (typeof fecha_checkin === 'string' && fecha_checkin.includes('T')) {
      fecha_checkin = fecha_checkin.split('T')[0];
      log.info('   ⚠️ fecha_checkin tenía hora, limpiada a:', fecha_checkin);
    }

    if (fecha_checkout instanceof Date) {
      fecha_checkout = fecha_checkout.toISOString().split('T')[0];
      log.info('   ⚠️ fecha_checkout era Date object, convertida a:', fecha_checkout);
    } else if (typeof fecha_checkout === 'string' && fecha_checkout.includes('T')) {
      fecha_checkout = fecha_checkout.split('T')[0];
      log.info('   ⚠️ fecha_checkout tenía hora, limpiada a:', fecha_checkout);
    }

    log.info('🔍 Consultando disponibilidad (DESPUÉS de sanitizar):');
    log.info('   fecha_checkin:', fecha_checkin, typeof fecha_checkin);
    log.info('   fecha_checkout:', fecha_checkout, typeof fecha_checkout);

    let queryText = `
      SELECT
        h.id,
        h.numero,
        h.precio_por_noche,
        h.descripcion,
        th.nombre as tipo,
        th.capacidad_maxima
      FROM habitaciones h
      INNER JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      WHERE h.activo = true
    `;

    const params = [];
    let paramCounter = 1;

    if (tipo_habitacion_id) {
      queryText += ` AND h.tipo_habitacion_id = $${paramCounter}`;
      params.push(tipo_habitacion_id);
      paramCounter++;
    }

    const habitacionesResult = await query(queryText, params);

    // Validar disponibilidad de cada habitación
    const disponibles = [];

    log.info(`   Validando ${habitacionesResult.rows.length} habitaciones...`);

    for (const habitacion of habitacionesResult.rows) {
      // Verificar si hay reservas para esta habitación en estas fechas
      const reservasExistentes = await query(
        `SELECT r.id, r.codigo_reserva, r.fecha_checkin, r.fecha_checkout, er.nombre as estado
         FROM reservas r
         INNER JOIN estados_reserva er ON r.estado_id = er.id
         WHERE r.habitacion_id = $1
           AND er.nombre != 'cancelada'
           AND (
             (r.fecha_checkin >= $2 AND r.fecha_checkin < $3)
             OR (r.fecha_checkout > $2 AND r.fecha_checkout <= $3)
             OR (r.fecha_checkin <= $2 AND r.fecha_checkout >= $3)
           )`,
        [habitacion.id, fecha_checkin, fecha_checkout]
      );

      const validacion = await query(
        'SELECT validar_solapamiento_reservas($1, $2, $3, NULL) as disponible',
        [habitacion.id, fecha_checkin, fecha_checkout]
      );

      const estaDisponible = validacion.rows[0].disponible;

      if (reservasExistentes.rows.length > 0) {
        log.info(`   Habitación ${habitacion.numero}: ${estaDisponible ? '✅ DISPONIBLE' : '❌ OCUPADA'} - Reservas encontradas: ${reservasExistentes.rows.length}`);
        reservasExistentes.rows.forEach(r => {
          log.info(`      → Reserva ${r.codigo_reserva}: ${r.fecha_checkin} al ${r.fecha_checkout} (${r.estado})`);
        });
      } else {
        log.info(`   Habitación ${habitacion.numero}: ${estaDisponible ? '✅ DISPONIBLE' : '❌ OCUPADA'}`);
      }

      if (estaDisponible) {
        disponibles.push(habitacion);
      }
    }

    log.success(`✅ Disponibilidad consultada: ${disponibles.length} habitaciones disponibles`);

    return success(res, {
      fecha_checkin,  // Ya está sanitizada arriba
      fecha_checkout, // Ya está sanitizada arriba
      disponibles,
      total: disponibles.length
    });

  } catch (err) {
    log.error('Error al consultar disponibilidad:', err);
    next(err);
  }
};

/**
 * GET /api/reservas/:id
 * Obtener detalles de una reserva
 */
const obtenerReserva = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        r.*,
        json_build_object(
          'id', h.id,
          'nombre', h.nombre,
          'apellido', h.apellido,
          'email', h.email,
          'telefono', h.telefono,
          'dpi_pasaporte', h.dpi_pasaporte,
          'pais', h.pais
        ) as huesped,
        json_build_object(
          'id', hab.id,
          'numero', hab.numero,
          'tipo', th.nombre,
          'precio_por_noche', hab.precio_por_noche
        ) as habitacion,
        json_build_object(
          'nombre', er.nombre,
          'color', er.color_hex
        ) as estado
      FROM reservas r
      INNER JOIN huespedes h ON r.huesped_id = h.id
      INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
      INNER JOIN tipos_habitacion th ON hab.tipo_habitacion_id = th.id
      INNER JOIN estados_reserva er ON r.estado_id = er.id
      WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Reserva no encontrada', 404);
    }

    return success(res, result.rows[0]);

  } catch (err) {
    log.error('Error al obtener reserva:', err);
    next(err);
  }
};

/**
 * DELETE /api/reservas/:id
 * Eliminar reserva completada, cancelada o confirmada
 */
const eliminarReserva = async (req, res, next) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar que la reserva existe
    const reservaActual = await client.query(
      `SELECT r.*, er.nombre as estado_nombre
       FROM reservas r
       INNER JOIN estados_reserva er ON r.estado_id = er.id
       WHERE r.id = $1`,
      [id]
    );

    if (reservaActual.rows.length === 0) {
      throw { statusCode: 404, message: 'Reserva no encontrada' };
    }

    const reserva = reservaActual.rows[0];

    // No permitir eliminar reservas pendientes (para evitar errores)
    if (reserva.estado_nombre === 'pendiente') {
      throw {
        statusCode: 400,
        message: 'No se pueden eliminar reservas pendientes. Primero debes confirmarlas o cancelarlas.'
      };
    }

    // Permitir eliminar reservas: canceladas, completadas o confirmadas
    const estadosPermitidos = ['cancelada', 'completada', 'confirmada'];
    if (!estadosPermitidos.includes(reserva.estado_nombre)) {
      throw {
        statusCode: 400,
        message: `Solo se pueden eliminar reservas ${estadosPermitidos.join(', ')}`
      };
    }

    // Eliminar la reserva (hard delete)
    await client.query('DELETE FROM reservas WHERE id = $1', [id]);

    await client.query('COMMIT');

    log.success(`Reserva ${reserva.estado_nombre} eliminada: ${id} por usuario ${req.user.email}`);

    return success(res, { id }, 'Reserva eliminada exitosamente');

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al eliminar reserva:', err);
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  listarReservas,
  crearReserva,
  actualizarReserva,
  cambiarEstado,
  consultarDisponibilidad,
  obtenerReserva,
  eliminarReserva
};
