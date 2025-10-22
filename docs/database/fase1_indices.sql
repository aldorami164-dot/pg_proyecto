-- =====================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- =====================================================================

-- =====================================================================
-- ÍNDICES EN FOREIGN KEYS (para mejorar JOINs)
-- =====================================================================

-- Tabla: usuarios
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);

-- Tabla: habitaciones
CREATE INDEX idx_habitaciones_tipo_habitacion_id ON habitaciones(tipo_habitacion_id);
CREATE INDEX idx_habitaciones_qr_asignado_id ON habitaciones(qr_asignado_id);
CREATE INDEX idx_habitaciones_estado ON habitaciones(estado) WHERE activo = TRUE;

-- Tabla: codigos_qr
CREATE INDEX idx_codigos_qr_habitacion_id ON codigos_qr(habitacion_id);
CREATE INDEX idx_codigos_qr_creado_por ON codigos_qr(creado_por);
CREATE INDEX idx_codigos_qr_estado ON codigos_qr(estado);

-- Tabla: reservas
CREATE INDEX idx_reservas_huesped_id ON reservas(huesped_id);
CREATE INDEX idx_reservas_habitacion_id ON reservas(habitacion_id);
CREATE INDEX idx_reservas_estado_id ON reservas(estado_id);
CREATE INDEX idx_reservas_creado_por ON reservas(creado_por);
CREATE INDEX idx_reservas_checkin_por ON reservas(checkin_por);
CREATE INDEX idx_reservas_checkout_por ON reservas(checkout_por);

-- Tabla: solicitudes_servicios
CREATE INDEX idx_solicitudes_servicios_habitacion_id ON solicitudes_servicios(habitacion_id);
CREATE INDEX idx_solicitudes_servicios_servicio_id ON solicitudes_servicios(servicio_id);
CREATE INDEX idx_solicitudes_servicios_atendido_por ON solicitudes_servicios(atendido_por);
CREATE INDEX idx_solicitudes_servicios_estado ON solicitudes_servicios(estado);

-- Tabla: notificaciones
CREATE INDEX idx_notificaciones_solicitud_servicio_id ON notificaciones(solicitud_servicio_id);
CREATE INDEX idx_notificaciones_leida_por ON notificaciones(leida_por);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida) WHERE leida = FALSE;

-- Tabla: reportes_ocupacion
CREATE INDEX idx_reportes_ocupacion_generado_por ON reportes_ocupacion(generado_por);

-- Tabla: contenido_plataforma
CREATE INDEX idx_contenido_plataforma_actualizado_por ON contenido_plataforma(actualizado_por);
CREATE INDEX idx_contenido_plataforma_activo ON contenido_plataforma(activo, orden) WHERE activo = TRUE;

-- Tabla: experiencias_turisticas
CREATE INDEX idx_experiencias_turisticas_creado_por ON experiencias_turisticas(creado_por);
CREATE INDEX idx_experiencias_turisticas_categoria ON experiencias_turisticas(categoria) WHERE activo = TRUE;
CREATE INDEX idx_experiencias_turisticas_destacado ON experiencias_turisticas(destacado) WHERE destacado = TRUE AND activo = TRUE;

-- Tabla: imagenes_galeria
CREATE INDEX idx_imagenes_galeria_subido_por ON imagenes_galeria(subido_por);
CREATE INDEX idx_imagenes_galeria_categoria ON imagenes_galeria(categoria, orden) WHERE activo = TRUE;

-- =====================================================================
-- ÍNDICES COMPUESTOS PARA CONSULTAS CRÍTICAS
-- =====================================================================

-- Validación de solapamiento de reservas (ÍNDICE CRÍTICO)
-- Optimiza la función validar_solapamiento_reservas()
CREATE INDEX idx_reservas_validacion_solapamiento ON reservas(habitacion_id, fecha_checkin, fecha_checkout, estado_id);

COMMENT ON INDEX idx_reservas_validacion_solapamiento IS 'Índice compuesto CRÍTICO para optimizar validación de solapamiento de fechas en reservas';

-- Búsqueda de reservas por rango de fechas
-- Índice sin subquery (PostgreSQL no permite subqueries en WHERE de índices parciales)
CREATE INDEX idx_reservas_rango_fechas ON reservas(fecha_checkin, fecha_checkout);

-- Búsqueda de habitaciones disponibles
CREATE INDEX idx_habitaciones_disponibilidad ON habitaciones(estado, tipo_habitacion_id) WHERE activo = TRUE;

-- Notificaciones no leídas (para dashboard en tiempo real)
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(creado_en DESC) WHERE leida = FALSE;

-- Solicitudes de servicio pendientes
CREATE INDEX idx_solicitudes_pendientes ON solicitudes_servicios(creado_en DESC) WHERE estado = 'pendiente';

-- Búsqueda de reportes por período
CREATE INDEX idx_reportes_periodo ON reportes_ocupacion(fecha_inicio, fecha_fin, tipo_periodo);

-- =====================================================================
-- ÍNDICES ÚNICOS ADICIONALES (para constraints de negocio)
-- =====================================================================

-- Email único en usuarios (case-insensitive)
CREATE UNIQUE INDEX idx_usuarios_email_unique ON usuarios(LOWER(email));

-- Número de habitación único (case-insensitive)
CREATE UNIQUE INDEX idx_habitaciones_numero_unique ON habitaciones(LOWER(numero));

-- Código de reserva único
CREATE UNIQUE INDEX idx_reservas_codigo_unique ON reservas(codigo_reserva);

-- =====================================================================
-- ÍNDICES DE TEXTO COMPLETO (para búsquedas)
-- =====================================================================

-- Búsqueda de huéspedes por nombre
CREATE INDEX idx_huespedes_nombre_completo ON huespedes USING gin(to_tsvector('spanish', COALESCE(nombre, '') || ' ' || COALESCE(apellido, '')));

-- Búsqueda de experiencias turísticas
CREATE INDEX idx_experiencias_busqueda ON experiencias_turisticas USING gin(to_tsvector('spanish', COALESCE(nombre, '') || ' ' || COALESCE(descripcion, '')));

-- =====================================================================
-- ÍNDICES PARA ORDENAMIENTO Y PAGINACIÓN
-- =====================================================================

-- Reservas ordenadas por fecha de creación (más recientes primero)
CREATE INDEX idx_reservas_creado_en_desc ON reservas(creado_en DESC);

-- Solicitudes de servicio ordenadas por fecha
CREATE INDEX idx_solicitudes_creado_en_desc ON solicitudes_servicios(creado_en DESC);

-- Comentarios de huéspedes ordenados por fecha
CREATE INDEX idx_comentarios_creado_en_desc ON comentarios_huespedes(creado_en DESC) WHERE activo = TRUE;

-- Experiencias ordenadas por orden de visualización
CREATE INDEX idx_experiencias_orden ON experiencias_turisticas(orden ASC) WHERE activo = TRUE;

-- Contenido de plataforma ordenado
CREATE INDEX idx_contenido_orden ON contenido_plataforma(orden ASC) WHERE activo = TRUE;

-- Galería de imágenes ordenada
CREATE INDEX idx_galeria_orden ON imagenes_galeria(orden ASC, creado_en DESC) WHERE activo = TRUE;

-- =====================================================================
-- ANÁLISIS DE TABLAS (para actualizar estadísticas del optimizador)
-- =====================================================================

ANALYZE roles;
ANALYZE usuarios;
ANALYZE tipos_habitacion;
ANALYZE habitaciones;
ANALYZE codigos_qr;
ANALYZE huespedes;
ANALYZE estados_reserva;
ANALYZE reservas;
ANALYZE servicios;
ANALYZE solicitudes_servicios;
ANALYZE notificaciones;
ANALYZE reportes_ocupacion;
ANALYZE contenido_plataforma;
ANALYZE experiencias_turisticas;
ANALYZE imagenes_galeria;
ANALYZE comentarios_huespedes;
