const { query } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE PLATAFORMA PÚBLICA (SIN AUTENTICACIÓN)
// =============================================================================

/**
 * GET /api/plataforma/contenido
 * Obtener contenido CMS por idioma
 * @access Public
 */
const obtenerContenido = async (req, res, next) => {
  try {
    const { idioma = 'es' } = req.query;

    const tituloField = idioma === 'es' ? 'titulo_es' : 'titulo_en';
    const contenidoField = idioma === 'es' ? 'contenido_es' : 'contenido_en';

    const result = await query(
      `SELECT
        id,
        seccion,
        ${tituloField} as titulo,
        ${contenidoField} as contenido,
        orden
      FROM contenido_plataforma
      WHERE activo = true
      ORDER BY orden ASC`
    );

    log.info(`Contenido de plataforma obtenido (idioma: ${idioma})`);

    return success(res, result.rows);
  } catch (err) {
    log.error('Error al obtener contenido:', err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/experiencias
 * Obtener experiencias turísticas activas con imagen principal
 * @access Public
 * NOTA: NO devuelve campo precio (los precios varían según temporada)
 */
const obtenerExperiencias = async (req, res, next) => {
  try {
    const { categoria, destacado } = req.query;

    let whereClause = 'WHERE e.activo = true';
    const params = [];
    let paramCount = 1;

    if (categoria) {
      whereClause += ` AND e.categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (destacado !== undefined) {
      whereClause += ` AND e.destacado = $${paramCount}`;
      params.push(destacado === 'true' || destacado === true);
      paramCount++;
    }

    const result = await query(
      `SELECT
        e.id,
        e.nombre,
        e.categoria,
        e.descripcion,
        e.ubicacion,
        e.duracion,
        e.capacidad,
        e.destacado,
        e.orden,
        img.url_imagen as imagen_principal,
        (
          SELECT COUNT(*)
          FROM experiencias_imagenes ei2
          WHERE ei2.experiencia_id = e.id
        ) as total_imagenes
      FROM experiencias_turisticas e
      LEFT JOIN LATERAL (
        SELECT ig.url_imagen
        FROM experiencias_imagenes ei
        INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
        WHERE ei.experiencia_id = e.id
          AND ig.activo = true
        ORDER BY ei.es_principal DESC, ei.orden ASC, ei.creado_en ASC
        LIMIT 1
      ) img ON true
      ${whereClause}
      ORDER BY
        CASE WHEN e.destacado = true THEN 0 ELSE 1 END,
        e.orden ASC`,
      params
    );

    log.info(`${result.rows.length} experiencias turísticas obtenidas (plataforma pública)`);

    return success(res, result.rows);
  } catch (err) {
    log.error('Error al obtener experiencias:', err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/servicios
 * Obtener servicios disponibles con instrucciones e imagen principal
 * @access Public
 */
const obtenerServicios = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        s.id,
        s.nombre,
        s.descripcion,
        s.categoria,
        s.precio,
        s.tiene_costo,
        s.horario_inicio,
        s.horario_fin,
        s.solicitable,
        s.icono,
        img.url_imagen as imagen_principal
      FROM servicios s
      LEFT JOIN LATERAL (
        SELECT ig.url_imagen
        FROM servicios_imagenes si
        INNER JOIN imagenes_galeria ig ON si.imagen_id = ig.id
        WHERE si.servicio_id = s.id
          AND ig.activo = true
        ORDER BY si.es_principal DESC, si.orden ASC, si.creado_en ASC
        LIMIT 1
      ) img ON true
      WHERE s.activo = true
      ORDER BY s.tiene_costo DESC, s.nombre ASC`
    );

    // Obtener instrucciones para cada servicio
    const serviciosConInstrucciones = await Promise.all(
      result.rows.map(async (servicio) => {
        const instruccionesResult = await query(
          `SELECT texto_instruccion
           FROM servicios_instrucciones
           WHERE servicio_id = $1 AND activo = true
           ORDER BY orden ASC`,
          [servicio.id]
        );

        return {
          ...servicio,
          horario: servicio.horario_inicio && servicio.horario_fin
            ? `${servicio.horario_inicio} - ${servicio.horario_fin}`
            : null,
          instrucciones: instruccionesResult.rows.map(i => i.texto_instruccion),
          horario_inicio: undefined,
          horario_fin: undefined
        };
      })
    );

    log.info(`${serviciosConInstrucciones.length} servicios obtenidos con instrucciones`);

    return success(res, serviciosConInstrucciones);
  } catch (err) {
    log.error('Error al obtener servicios:', err.message);
    next(err);
  }
};

/**
 * POST /api/plataforma/comentarios
 * Crear comentario de huésped
 * @access Public
 */
const crearComentario = async (req, res, next) => {
  try {
    const { nombre_huesped, comentario, calificacion } = req.body;

    const result = await query(
      `INSERT INTO comentarios_huespedes
        (nombre_huesped, comentario, calificacion, activo)
      VALUES ($1, $2, $3, true)
      RETURNING
        id,
        nombre_huesped,
        comentario,
        calificacion,
        creado_en`,
      [nombre_huesped, comentario, calificacion]
    );

    log.success(`Comentario creado por ${nombre_huesped} (calificación: ${calificacion})`);

    return success(
      res,
      result.rows[0],
      'Comentario creado exitosamente. Será visible una vez aprobado.',
      201
    );
  } catch (err) {
    log.error('Error al crear comentario:', err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/comentarios
 * Obtener comentarios activos y aprobados
 * @access Public
 */
const listarComentarios = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT
        id,
        nombre_huesped,
        comentario,
        calificacion,
        creado_en
      FROM comentarios_huespedes
      WHERE activo = true
      ORDER BY creado_en DESC
      LIMIT $1`,
      [limit]
    );

    // Calcular promedio de calificaciones
    const promedioResult = await query(
      `SELECT AVG(calificacion)::NUMERIC(3,2) as promedio
       FROM comentarios_huespedes
       WHERE activo = true`
    );

    const promedio = parseFloat(promedioResult.rows[0].promedio) || 0;

    log.info(`${result.rows.length} comentarios obtenidos`);

    return success(res, {
      comentarios: result.rows,
      total: result.rows.length,
      promedio_calificacion: promedio
    });
  } catch (err) {
    log.error('Error al listar comentarios:', err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/lugares-turisticos
 * Obtener lugares turísticos activos con imagen principal
 * @access Public
 * NOTA: SÍ devuelve campo precio_entrada (los precios son fijos)
 */
const obtenerLugaresTuristicos = async (req, res, next) => {
  try {
    const { categoria } = req.query;

    let whereClause = 'WHERE l.activo = true';
    const params = [];

    if (categoria) {
      whereClause += ` AND l.categoria = $1`;
      params.push(categoria);
    }

    const result = await query(
      `SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.ubicacion,
        l.categoria,
        l.url_maps,
        l.telefono,
        l.horario,
        l.precio_entrada,
        l.orden,
        img.url_imagen as imagen_principal,
        (
          SELECT COUNT(*)
          FROM lugares_imagenes li2
          WHERE li2.lugar_id = l.id
        ) as total_imagenes
      FROM lugares_turisticos l
      LEFT JOIN LATERAL (
        SELECT ig.url_imagen
        FROM lugares_imagenes li
        INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
        WHERE li.lugar_id = l.id
          AND ig.activo = true
        ORDER BY li.es_principal DESC, li.orden ASC, li.creado_en ASC
        LIMIT 1
      ) img ON true
      ${whereClause}
      ORDER BY l.orden ASC`,
      params
    );

    log.info(`${result.rows.length} lugares turísticos obtenidos (plataforma pública)`);

    return success(res, result.rows);
  } catch (err) {
    log.error('Error al obtener lugares turísticos:', err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/experiencias/:id/imagenes
 * Obtener imágenes de una experiencia específica (público)
 * @access Public
 */
const obtenerImagenesExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        ig.id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        ei.es_principal,
        ei.orden
      FROM experiencias_imagenes ei
      INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
      WHERE ei.experiencia_id = $1
        AND ig.activo = true
      ORDER BY ei.es_principal DESC, ei.orden ASC, ei.creado_en ASC`,
      [id]
    );

    log.info(`${result.rows.length} imágenes obtenidas para experiencia ID ${id}`);

    return success(res, result.rows);
  } catch (err) {
    log.error(`Error al obtener imágenes de experiencia ${req.params.id}:`, err.message);
    next(err);
  }
};

/**
 * GET /api/plataforma/lugares/:id/imagenes
 * Obtener imágenes de un lugar turístico específico (público)
 * @access Public
 */
const obtenerImagenesLugar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        ig.id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion,
        li.es_principal,
        li.orden
      FROM lugares_imagenes li
      INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
      WHERE li.lugar_id = $1
        AND ig.activo = true
      ORDER BY li.es_principal DESC, li.orden ASC, li.creado_en ASC`,
      [id]
    );

    log.info(`${result.rows.length} imágenes obtenidas para lugar ID ${id}`);

    return success(res, result.rows);
  } catch (err) {
    log.error(`Error al obtener imágenes de lugar ${req.params.id}:`, err.message);
    next(err);
  }
};

module.exports = {
  obtenerContenido,
  obtenerExperiencias,
  obtenerLugaresTuristicos,
  obtenerServicios,
  crearComentario,
  listarComentarios,
  obtenerImagenesExperiencia,
  obtenerImagenesLugar
};
