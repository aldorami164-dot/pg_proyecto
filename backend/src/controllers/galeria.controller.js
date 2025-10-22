const { query, getClient } = require('../config/database');
const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE GALERÍA (Supabase Storage)
// =============================================================================

/**
 * GET /api/galeria
 * Listar imágenes de la galería
 * @access Public
 */
const listarImagenes = async (req, res, next) => {
  try {
    const { categoria, activo, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (categoria) {
      whereClause += ` AND ig.categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (activo !== undefined) {
      whereClause += ` AND ig.activo = $${paramCount}`;
      params.push(activo === 'true' || activo === true);
      paramCount++;
    }

    const result = await query(
      `SELECT
        ig.id,
        ig.titulo,
        ig.descripcion,
        ig.url_imagen,
        ig.categoria,
        ig.orden,
        ig.activo,
        ig.creado_en,
        -- Contadores de vinculación
        COALESCE(
          (SELECT COUNT(*) FROM habitaciones_imagenes hi WHERE hi.imagen_id = ig.id), 0
        ) +
        COALESCE(
          (SELECT COUNT(*) FROM experiencias_imagenes ei WHERE ei.imagen_id = ig.id), 0
        ) +
        COALESCE(
          (SELECT COUNT(*) FROM lugares_imagenes li WHERE li.imagen_id = ig.id), 0
        ) as total_vinculos,
        COALESCE(
          (SELECT COUNT(*) FROM habitaciones_imagenes hi WHERE hi.imagen_id = ig.id), 0
        ) as vinculos_habitaciones,
        COALESCE(
          (SELECT COUNT(*) FROM experiencias_imagenes ei WHERE ei.imagen_id = ig.id), 0
        ) as vinculos_experiencias,
        COALESCE(
          (SELECT COUNT(*) FROM lugares_imagenes li WHERE li.imagen_id = ig.id), 0
        ) as vinculos_lugares
      FROM imagenes_galeria ig
      ${whereClause}
      ORDER BY ig.orden ASC, ig.creado_en DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM imagenes_galeria ig ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    log.success(`Listado de ${result.rows.length} imágenes de galería`);

    return success(res, {
      imagenes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (err) {
    log.error('Error al listar imágenes:', err.message);
    next(err);
  }
};

/**
 * POST /api/galeria
 * Subir imagen a Supabase Storage y registrar en BD
 * @access Private (SOLO admin)
 */
const subirImagen = async (req, res, next) => {
  try {
    if (!req.file) {
      throw { statusCode: 400, message: 'No se proporcionó ninguna imagen' };
    }

    const { titulo, descripcion, categoria = 'hotel_exterior', orden = 0 } = req.body;
    const file = req.file;

    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw {
        statusCode: 400,
        message: 'Formato de imagen no permitido. Use: JPEG, PNG o WEBP'
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw {
        statusCode: 400,
        message: 'La imagen excede el tamaño máximo permitido de 5MB'
      };
    }

    // Generar nombre único para el archivo
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `galeria/${fileName}`;

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('galeria')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      log.error('Error al subir imagen a Supabase:', uploadError);

      // Mensajes de error más descriptivos
      let errorMessage = 'Error al subir la imagen al almacenamiento';

      if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
        errorMessage = 'El bucket "galeria" no existe en Supabase Storage. Por favor créalo primero.';
      } else if (uploadError.message?.includes('Policy')) {
        errorMessage = 'Error de permisos. Verifica las políticas del bucket "galeria".';
      } else if (uploadError.message) {
        errorMessage = `Error de Supabase: ${uploadError.message}`;
      }

      throw {
        statusCode: 500,
        message: errorMessage,
        details: uploadError
      };
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('galeria')
      .getPublicUrl(filePath);

    const url_imagen = urlData.publicUrl;

    // Insertar en base de datos
    const result = await query(
      `INSERT INTO imagenes_galeria
        (titulo, descripcion, url_imagen, categoria, orden, subido_por, activo)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING
        id,
        titulo,
        descripcion,
        url_imagen,
        categoria,
        orden,
        activo,
        creado_en`,
      [titulo || fileName, descripcion || null, url_imagen, categoria, parseInt(orden), req.user.id]
    );

    log.success(`Imagen subida a galería por ${req.user.email}: ${fileName}`);

    return success(res, result.rows[0], 'Imagen subida exitosamente', 201);
  } catch (err) {
    log.error('Error al subir imagen:', err.message);
    next(err);
  }
};

/**
 * PUT /api/galeria/:id
 * Actualizar información de imagen (NO la imagen en sí)
 * @access Private (SOLO admin)
 */
const actualizarImagen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria, orden } = req.body;

    // Verificar que la imagen existe
    const imagenExiste = await query(
      `SELECT id FROM imagenes_galeria WHERE id = $1`,
      [id]
    );

    if (imagenExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Imagen no encontrada' };
    }

    // Construir query dinámica
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (titulo !== undefined) {
      updates.push(`titulo = $${paramCount}`);
      params.push(titulo);
      paramCount++;
    }

    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramCount}`);
      params.push(descripcion);
      paramCount++;
    }

    if (categoria !== undefined) {
      updates.push(`categoria = $${paramCount}`);
      params.push(categoria);
      paramCount++;
    }

    if (orden !== undefined) {
      updates.push(`orden = $${paramCount}`);
      params.push(parseInt(orden));
      paramCount++;
    }

    if (updates.length === 0) {
      throw { statusCode: 400, message: 'No se proporcionaron campos para actualizar' };
    }

    params.push(id);

    const result = await query(
      `UPDATE imagenes_galeria
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );

    log.success(`Imagen ${id} actualizada por ${req.user.email}`);

    return success(res, result.rows[0], 'Imagen actualizada exitosamente');
  } catch (err) {
    log.error('Error al actualizar imagen:', err.message);
    next(err);
  }
};

/**
 * DELETE /api/galeria/:id
 * Eliminar imagen de Supabase Storage y BD
 * @access Private (SOLO admin)
 */
const eliminarImagen = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Obtener URL de la imagen
    const imagenResult = await client.query(
      `SELECT id, url_imagen FROM imagenes_galeria WHERE id = $1`,
      [id]
    );

    if (imagenResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Imagen no encontrada' };
    }

    const imagen = imagenResult.rows[0];

    // Extraer path del archivo desde la URL
    const url = new URL(imagen.url_imagen);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('galeria')).join('/');

    // Eliminar de Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('galeria')
      .remove([filePath]);

    if (deleteError) {
      log.warning(`No se pudo eliminar archivo de Storage: ${deleteError.message}`);
      // Continuar para eliminar registro de BD de todos modos
    }

    // Eliminar registro de BD
    await client.query(
      `DELETE FROM imagenes_galeria WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    log.success(`Imagen ${id} eliminada por ${req.user.email}`);

    return success(res, { id }, 'Imagen eliminada exitosamente');
  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Error al eliminar imagen:', err.message);
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/galeria/:id/toggle-activo
 * Activar/desactivar imagen
 * @access Private (SOLO admin)
 */
const toggleActivo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const imagenResult = await query(
      `SELECT id, activo FROM imagenes_galeria WHERE id = $1`,
      [id]
    );

    if (imagenResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Imagen no encontrada' };
    }

    const nuevoEstado = !imagenResult.rows[0].activo;

    const result = await query(
      `UPDATE imagenes_galeria
       SET activo = $1
       WHERE id = $2
       RETURNING *`,
      [nuevoEstado, id]
    );

    log.success(`Imagen ${id} ${nuevoEstado ? 'activada' : 'desactivada'} por ${req.user.email}`);

    return success(res, result.rows[0], `Imagen ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`);
  } catch (err) {
    log.error('Error al cambiar estado de imagen:', err.message);
    next(err);
  }
};

module.exports = {
  listarImagenes,
  subirImagen,
  actualizarImagen,
  eliminarImagen,
  toggleActivo
};
