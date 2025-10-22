-- =====================================================================
-- SCRIPT COMPLETO DE INSTALACIÓN - FASE 1
-- SISTEMA DE GESTIÓN HOTELERA - HOTEL CASA JOSEFA
-- =====================================================================
-- Este archivo contiene TODA la base de datos en un solo script
-- Ejecute directamente en PostgreSQL/Supabase
-- =====================================================================
-- Versión: 1.1
-- Fecha: 2025-10-05
-- Última actualización: 2025-01-15 (Sistema de imágenes para habitaciones)
-- =====================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- SECCIÓN 1: CREACIÓN DE TABLAS (17 TABLAS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA 1: roles
-- Propósito: Control de acceso al sistema
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('administrador', 'recepcionista')),
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Control de acceso: administrador (control total) y recepcionista (gestión de reservas)';

-- ---------------------------------------------------------------------
-- TABLA 2: usuarios
-- Propósito: Autenticación del personal del hotel
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Personal del hotel con autenticación JWT manual';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt generado en backend';

-- ---------------------------------------------------------------------
-- TABLA 3: tipos_habitacion
-- Propósito: Clasificación de habitaciones por capacidad
-- ---------------------------------------------------------------------
CREATE TABLE tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('Individual', 'Doble', 'Triple', 'Familiar')),
    capacidad_maxima INTEGER NOT NULL CHECK (capacidad_maxima > 0),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tipos_habitacion IS 'Tipos predefinidos: Individual, Doble, Triple, Familiar';

-- ---------------------------------------------------------------------
-- TABLA 4: habitaciones
-- Propósito: Registro de habitaciones físicas del hotel
-- ---------------------------------------------------------------------
CREATE TABLE habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo_habitacion_id INTEGER NOT NULL REFERENCES tipos_habitacion(id) ON DELETE RESTRICT,
    precio_por_noche DECIMAL(10, 2) NOT NULL CHECK (precio_por_noche >= 0),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'limpieza', 'mantenimiento')),
    descripcion TEXT,
    qr_asignado_id INTEGER, -- FK a codigos_qr, se crea después
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE habitaciones IS 'Habitaciones del hotel. Estados automáticos: check-in→ocupada, check-out→disponible. Manuales: limpieza, mantenimiento';
COMMENT ON COLUMN habitaciones.qr_asignado_id IS 'Una habitación solo puede tener UN QR activo. NULL si no tiene QR asignado';

-- ---------------------------------------------------------------------
-- TABLA 5: codigos_qr
-- Propósito: Gestión independiente de códigos QR (TABLA CLAVE)
-- ---------------------------------------------------------------------
CREATE TABLE codigos_qr (
    id SERIAL PRIMARY KEY,
    codigo UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    url_destino TEXT NOT NULL,
    habitacion_id INTEGER REFERENCES habitaciones(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'sin_asignar' CHECK (estado IN ('sin_asignar', 'asignado', 'inactivo')),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP,
    total_lecturas INTEGER DEFAULT 0,
    ultima_lectura TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE codigos_qr IS 'Gestión independiente de QR. NO se crean automáticamente. Admin genera manualmente desde panel dedicado';
COMMENT ON COLUMN codigos_qr.url_destino IS 'Formato: https://casajosefa.com/habitacion/{numero}';
COMMENT ON COLUMN codigos_qr.estado IS 'sin_asignar: QR en stock | asignado: vinculado a habitación | inactivo: desactivado';

-- Agregar FK de habitaciones a codigos_qr
ALTER TABLE habitaciones
ADD CONSTRAINT fk_habitaciones_qr
FOREIGN KEY (qr_asignado_id) REFERENCES codigos_qr(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- TABLA 6: huespedes
-- Propósito: Registro de clientes del hotel
-- ---------------------------------------------------------------------
CREATE TABLE huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    dpi_pasaporte VARCHAR(50),
    email VARCHAR(255),
    telefono VARCHAR(20),
    pais VARCHAR(100),
    direccion TEXT,
    fecha_nacimiento DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE huespedes IS 'Solo nombre es obligatorio. NO detectar duplicados automáticamente. Permite registros rápidos (nombre+fechas) o completos';
COMMENT ON COLUMN huespedes.dpi_pasaporte IS 'Documento de identidad o pasaporte (opcional pero recomendado)';

-- ---------------------------------------------------------------------
-- TABLA 7: estados_reserva
-- Propósito: Ciclo de vida de reservas
-- ---------------------------------------------------------------------
CREATE TABLE estados_reserva (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    descripcion TEXT,
    color_hex VARCHAR(7) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE estados_reserva IS 'Estados predefinidos: pendiente (sin check-in), confirmada (check-in 12pm), completada (check-out 11am), cancelada';

-- ---------------------------------------------------------------------
-- TABLA 8: reservas
-- Propósito: Centralización MANUAL de reservas de múltiples canales
-- ---------------------------------------------------------------------
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    huesped_id INTEGER NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id) ON DELETE RESTRICT,
    fecha_checkin DATE NOT NULL,
    fecha_checkout DATE NOT NULL CHECK (fecha_checkout > fecha_checkin),
    numero_noches INTEGER GENERATED ALWAYS AS (fecha_checkout - fecha_checkin) STORED,
    precio_por_noche DECIMAL(10, 2) NOT NULL CHECK (precio_por_noche >= 0),
    precio_total DECIMAL(10, 2) GENERATED ALWAYS AS (precio_por_noche * (fecha_checkout - fecha_checkin)) STORED,
    numero_huespedes INTEGER DEFAULT 1 CHECK (numero_huespedes > 0),
    canal_reserva VARCHAR(20) NOT NULL CHECK (canal_reserva IN ('booking', 'whatsapp', 'facebook', 'telefono', 'presencial')),
    estado_id INTEGER NOT NULL REFERENCES estados_reserva(id) ON DELETE RESTRICT,
    notas TEXT,
    fecha_cancelacion TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    checkin_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    checkout_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reservas IS 'Centraliza reservas YA HECHAS en otras plataformas (Booking, WhatsApp, Facebook). Validación crítica: verificar solapamiento antes de crear/editar';
COMMENT ON COLUMN reservas.canal_reserva IS 'Origen de la reserva: booking, whatsapp, facebook, telefono, presencial';
COMMENT ON COLUMN reservas.notas IS 'Observaciones internas para recepción/administración';
COMMENT ON COLUMN reservas.fecha_cancelacion IS 'Fecha en que se canceló la reserva (si aplica)';

-- ---------------------------------------------------------------------
-- TABLA 9: servicios
-- Propósito: Catálogo de servicios del hotel
-- ---------------------------------------------------------------------
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('lavanderia', 'sauna', 'limpieza', 'cocina')),
    descripcion TEXT,
    precio DECIMAL(10, 2) DEFAULT 0 CHECK (precio >= 0),
    tiene_costo BOOLEAN NOT NULL,
    horario_inicio TIME,
    horario_fin TIME,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE servicios IS 'Servicios predefinidos. De pago: Lavandería (Q50), Sauna (Q100). Gratuitos: Limpieza extra, Uso de cocina';
COMMENT ON COLUMN servicios.tiene_costo IS 'true: servicio de pago | false: servicio gratuito';

-- ---------------------------------------------------------------------
-- TABLA 10: solicitudes_servicios
-- Propósito: Gestión de pedidos desde plataforma QR
-- ---------------------------------------------------------------------
CREATE TABLE solicitudes_servicios (
    id SERIAL PRIMARY KEY,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id) ON DELETE RESTRICT,
    servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada')),
    origen VARCHAR(20) DEFAULT 'plataforma_qr' CHECK (origen IN ('plataforma_qr', 'recepcion')),
    notas TEXT,
    atendido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_atencion TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE solicitudes_servicios IS 'Huésped escanea QR→URL contiene número habitación→solicita servicio→trigger crea notificación automática';
COMMENT ON COLUMN solicitudes_servicios.origen IS 'plataforma_qr: desde QR escaneado | recepcion: creada manualmente';

-- ---------------------------------------------------------------------
-- TABLA 11: notificaciones
-- Propósito: Sistema de notificaciones en tiempo real
-- ---------------------------------------------------------------------
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('solicitud_servicio', 'alerta', 'informacion')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('alta', 'normal', 'baja')),
    habitacion_numero VARCHAR(10),
    solicitud_servicio_id INTEGER REFERENCES solicitudes_servicios(id) ON DELETE CASCADE,
    leida BOOLEAN DEFAULT FALSE,
    leida_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_lectura TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notificaciones IS 'Creadas automáticamente por trigger al insertar solicitud_servicios. Backend enviará vía WebSocket manual en tiempo real';
COMMENT ON COLUMN notificaciones.prioridad IS 'alta: servicio de pago | normal: servicio gratuito';

-- ---------------------------------------------------------------------
-- TABLA 12: reportes_ocupacion
-- Propósito: Almacenamiento de reportes generados
-- ---------------------------------------------------------------------
CREATE TABLE reportes_ocupacion (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin >= fecha_inicio),
    tipo_periodo VARCHAR(20) NOT NULL CHECK (tipo_periodo IN ('semanal', 'mensual')),
    total_habitaciones INTEGER NOT NULL,
    habitaciones_ocupadas INTEGER NOT NULL,
    porcentaje_ocupacion DECIMAL(5, 2) NOT NULL,
    total_reservas INTEGER NOT NULL,
    generado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reportes_ocupacion IS 'Reportes históricos generados manualmente. Excluye reservas canceladas. No se eliminan';

-- ---------------------------------------------------------------------
-- TABLA 13: contenido_plataforma
-- Propósito: CMS para contenido editable de plataforma QR (bilingüe)
-- ---------------------------------------------------------------------
CREATE TABLE contenido_plataforma (
    id SERIAL PRIMARY KEY,
    seccion VARCHAR(50) UNIQUE NOT NULL CHECK (seccion IN ('bienvenida', 'normas_hotel', 'horarios', 'wifi', 'contacto_emergencia')),
    titulo_es VARCHAR(255) NOT NULL,
    titulo_en VARCHAR(255) NOT NULL,
    contenido_es TEXT NOT NULL,
    contenido_en TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    actualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE contenido_plataforma IS 'CMS bilingüe (ES/EN) para plataforma QR. Solo admin puede editar. Secciones predefinidas';

-- ---------------------------------------------------------------------
-- TABLA 14: experiencias_turisticas
-- Propósito: Información turística de Santiago Atitlán
-- ---------------------------------------------------------------------
CREATE TABLE experiencias_turisticas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('atracciones', 'actividades', 'gastronomia', 'cultura')),
    descripcion TEXT NOT NULL,
    ubicacion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE experiencias_turisticas IS 'Información turística administrada por admin. Destacadas aparecen en home de plataforma QR';

-- ---------------------------------------------------------------------
-- TABLA 15: imagenes_galeria
-- Propósito: Galería de fotos del hotel (OPCIONAL)
-- ---------------------------------------------------------------------
CREATE TABLE imagenes_galeria (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url_imagen TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('hotel_exterior', 'habitaciones', 'servicios', 'restaurante', 'piscina', 'vistas')),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE imagenes_galeria IS 'Galería administrada por admin. URLs almacenadas en Supabase Storage';

-- ---------------------------------------------------------------------
-- TABLA 16: comentarios_huespedes
-- Propósito: Feedback público de huéspedes visible en plataforma QR
-- ---------------------------------------------------------------------
CREATE TABLE comentarios_huespedes (
    id SERIAL PRIMARY KEY,
    nombre_huesped VARCHAR(200) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comentarios_huespedes IS 'Comentarios públicos dejados por huéspedes desde plataforma QR. Visibles para otros huéspedes';
COMMENT ON COLUMN comentarios_huespedes.calificacion IS 'Calificación de 1 a 5 estrellas';

-- =====================================================================
-- SECCIÓN 2: FUNCIONES DE NEGOCIO (2 FUNCIONES)
-- =====================================================================

-- ---------------------------------------------------------------------
-- FUNCIÓN 1: validar_solapamiento_reservas
-- Propósito: Validar que no haya conflicto de fechas antes de crear/editar reserva
-- Retorna: TRUE si fechas disponibles, FALSE si hay solapamiento
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validar_solapamiento_reservas(
    p_habitacion_id INTEGER,
    p_fecha_checkin DATE,
    p_fecha_checkout DATE,
    p_reserva_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Validar que checkout sea después de checkin
    IF p_fecha_checkout <= p_fecha_checkin THEN
        RETURN FALSE;
    END IF;

    -- Buscar reservas que se solapen con el rango de fechas
    -- Excluir reservas canceladas y la reserva actual (si se está editando)
    SELECT COUNT(*) INTO v_count
    FROM reservas r
    INNER JOIN estados_reserva er ON r.estado_id = er.id
    WHERE r.habitacion_id = p_habitacion_id
        AND er.nombre != 'cancelada'
        AND (p_reserva_id IS NULL OR r.id != p_reserva_id)
        AND (
            -- Caso 1: Nueva reserva empieza durante reserva existente
            (p_fecha_checkin >= r.fecha_checkin AND p_fecha_checkin < r.fecha_checkout)
            OR
            -- Caso 2: Nueva reserva termina durante reserva existente
            (p_fecha_checkout > r.fecha_checkin AND p_fecha_checkout <= r.fecha_checkout)
            OR
            -- Caso 3: Nueva reserva envuelve completamente reserva existente
            (p_fecha_checkin <= r.fecha_checkin AND p_fecha_checkout >= r.fecha_checkout)
        );

    -- Si count > 0 hay solapamiento, retornar FALSE
    -- Si count = 0 no hay solapamiento, retornar TRUE
    RETURN (v_count = 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_solapamiento_reservas IS 'Validación CRÍTICA antes de crear/editar reserva. Detecta cualquier intersección de rangos de fechas. Excluye reservas canceladas';

-- ---------------------------------------------------------------------
-- FUNCIÓN 2: generar_reporte_ocupacion
-- Propósito: Calcular métricas de ocupación y guardar reporte
-- Retorna: ID del reporte creado
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generar_reporte_ocupacion(
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_tipo_periodo VARCHAR(20),
    p_usuario_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_total_habitaciones INTEGER;
    v_habitaciones_ocupadas INTEGER;
    v_porcentaje DECIMAL(5,2);
    v_total_reservas INTEGER;
    v_reporte_id INTEGER;
BEGIN
    -- Validar que fecha_fin >= fecha_inicio
    IF p_fecha_fin < p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha de fin debe ser mayor o igual a la fecha de inicio';
    END IF;

    -- Validar tipo de período
    IF p_tipo_periodo NOT IN ('semanal', 'mensual') THEN
        RAISE EXCEPTION 'Tipo de período inválido. Debe ser: semanal o mensual';
    END IF;

    -- 1. Contar total de habitaciones activas
    SELECT COUNT(*) INTO v_total_habitaciones
    FROM habitaciones
    WHERE activo = TRUE;

    -- 2. Contar habitaciones únicas ocupadas en el período (excluir canceladas)
    SELECT COUNT(DISTINCT r.habitacion_id) INTO v_habitaciones_ocupadas
    FROM reservas r
    INNER JOIN estados_reserva er ON r.estado_id = er.id
    WHERE er.nombre != 'cancelada'
        AND (
            -- Reserva activa durante el período
            (r.fecha_checkin >= p_fecha_inicio AND r.fecha_checkin <= p_fecha_fin)
            OR
            (r.fecha_checkout >= p_fecha_inicio AND r.fecha_checkout <= p_fecha_fin)
            OR
            (r.fecha_checkin <= p_fecha_inicio AND r.fecha_checkout >= p_fecha_fin)
        );

    -- 3. Contar total de reservas en el período (excluir canceladas)
    SELECT COUNT(*) INTO v_total_reservas
    FROM reservas r
    INNER JOIN estados_reserva er ON r.estado_id = er.id
    WHERE er.nombre != 'cancelada'
        AND (
            (r.fecha_checkin >= p_fecha_inicio AND r.fecha_checkin <= p_fecha_fin)
            OR
            (r.fecha_checkout >= p_fecha_inicio AND r.fecha_checkout <= p_fecha_fin)
            OR
            (r.fecha_checkin <= p_fecha_inicio AND r.fecha_checkout >= p_fecha_fin)
        );

    -- 4. Calcular porcentaje de ocupación
    IF v_total_habitaciones > 0 THEN
        v_porcentaje := (v_habitaciones_ocupadas::DECIMAL / v_total_habitaciones::DECIMAL) * 100;
    ELSE
        v_porcentaje := 0;
    END IF;

    -- 5. Insertar registro en reportes_ocupacion
    INSERT INTO reportes_ocupacion (
        fecha_inicio,
        fecha_fin,
        tipo_periodo,
        total_habitaciones,
        habitaciones_ocupadas,
        porcentaje_ocupacion,
        total_reservas,
        generado_por
    ) VALUES (
        p_fecha_inicio,
        p_fecha_fin,
        p_tipo_periodo,
        v_total_habitaciones,
        v_habitaciones_ocupadas,
        v_porcentaje,
        v_total_reservas,
        p_usuario_id
    ) RETURNING id INTO v_reporte_id;

    -- 6. Retornar ID del reporte creado
    RETURN v_reporte_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generar_reporte_ocupacion IS 'Calcula métricas de ocupación para período especificado y guarda reporte. Excluye reservas canceladas. Retorna ID del reporte creado';

-- =====================================================================
-- SECCIÓN 3: TRIGGERS AUTOMÁTICOS (3 TRIGGERS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TRIGGER 1: actualizar_estado_habitacion
-- Tabla afectada: reservas
-- Evento: AFTER UPDATE OF estado_id
-- Propósito: Cambiar estado de habitación automáticamente según check-in/check-out
-- ---------------------------------------------------------------------

-- Función del trigger (CORREGIDA - No bloquea habitaciones con check-in futuro)
CREATE OR REPLACE FUNCTION trg_actualizar_estado_habitacion()
RETURNS TRIGGER AS $$
DECLARE
    v_estado_nombre VARCHAR(50);
    v_fecha_checkin DATE;
    v_fecha_hoy DATE;
BEGIN
    -- Solo ejecutar si el estado realmente cambió
    IF OLD.estado_id != NEW.estado_id THEN

        -- Obtener nombre del nuevo estado
        SELECT nombre INTO v_estado_nombre
        FROM estados_reserva
        WHERE id = NEW.estado_id;

        -- Obtener fecha de check-in y fecha actual
        v_fecha_checkin := NEW.fecha_checkin;
        v_fecha_hoy := CURRENT_DATE;

        -- Actualizar estado de habitación según el estado de la reserva
        CASE v_estado_nombre
            -- CASO 1: Reserva confirmada
            WHEN 'confirmada' THEN
                IF v_fecha_checkin <= v_fecha_hoy THEN
                    -- Check-in es hoy o ya pasó → habitación ocupada
                    UPDATE habitaciones
                    SET estado = 'ocupada',
                        actualizado_en = CURRENT_TIMESTAMP
                    WHERE id = NEW.habitacion_id;
                ELSE
                    -- Check-in es en el futuro → habitación sigue disponible
                    UPDATE habitaciones
                    SET estado = 'disponible',
                        actualizado_en = CURRENT_TIMESTAMP
                    WHERE id = NEW.habitacion_id;
                END IF;

            -- CASO 2: Check-out completado
            WHEN 'completada' THEN
                UPDATE habitaciones
                SET estado = 'disponible',
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = NEW.habitacion_id;

            -- CASO 3: Reserva cancelada
            WHEN 'cancelada' THEN
                UPDATE habitaciones
                SET estado = 'disponible',
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = NEW.habitacion_id;
        END CASE;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_actualizar_estado_habitacion
AFTER UPDATE OF estado_id ON reservas
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_estado_habitacion();

COMMENT ON FUNCTION trg_actualizar_estado_habitacion IS 'Actualiza estado de habitación según reserva: confirmada + fecha_checkin <= HOY → ocupada | confirmada + fecha_checkin > HOY → disponible | completada/cancelada → disponible';

-- ---------------------------------------------------------------------
-- TRIGGER 2: notificar_solicitud_servicio
-- Tabla afectada: solicitudes_servicios
-- Evento: AFTER INSERT
-- Propósito: Crear notificación automática al registrar solicitud de servicio
-- ---------------------------------------------------------------------

-- Función del trigger
CREATE OR REPLACE FUNCTION trg_notificar_solicitud_servicio()
RETURNS TRIGGER AS $$
DECLARE
    v_numero_habitacion VARCHAR(10);
    v_nombre_servicio VARCHAR(100);
    v_tiene_costo BOOLEAN;
    v_prioridad VARCHAR(20);
    v_mensaje TEXT;
BEGIN
    -- Obtener número de habitación
    SELECT numero INTO v_numero_habitacion
    FROM habitaciones
    WHERE id = NEW.habitacion_id;

    -- Obtener información del servicio
    SELECT nombre, tiene_costo
    INTO v_nombre_servicio, v_tiene_costo
    FROM servicios
    WHERE id = NEW.servicio_id;

    -- Determinar prioridad según si el servicio tiene costo
    IF v_tiene_costo THEN
        v_prioridad := 'alta';
    ELSE
        v_prioridad := 'normal';
    END IF;

    -- Construir mensaje
    v_mensaje := 'Habitación ' || v_numero_habitacion || ' solicita: ' || v_nombre_servicio;

    -- Crear notificación
    INSERT INTO notificaciones (
        tipo,
        titulo,
        mensaje,
        prioridad,
        habitacion_numero,
        solicitud_servicio_id,
        leida
    ) VALUES (
        'solicitud_servicio',
        'Nueva solicitud de servicio',
        v_mensaje,
        v_prioridad,
        v_numero_habitacion,
        NEW.id,
        FALSE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_notificar_solicitud_servicio
AFTER INSERT ON solicitudes_servicios
FOR EACH ROW
EXECUTE FUNCTION trg_notificar_solicitud_servicio();

COMMENT ON FUNCTION trg_notificar_solicitud_servicio IS 'Crea notificación automática al insertar solicitud de servicio. Prioridad alta si servicio tiene costo, normal si es gratuito';

-- ---------------------------------------------------------------------
-- TRIGGER 3: actualizar_timestamp
-- Tablas afectadas: Todas las tablas con campo actualizado_en
-- Evento: BEFORE UPDATE
-- Propósito: Actualizar automáticamente el timestamp de modificación
-- ---------------------------------------------------------------------

-- Función del trigger (reutilizable para todas las tablas)
CREATE OR REPLACE FUNCTION trg_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con campo actualizado_en
CREATE TRIGGER trigger_actualizar_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_tipos_habitacion
BEFORE UPDATE ON tipos_habitacion
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_habitaciones
BEFORE UPDATE ON habitaciones
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_huespedes
BEFORE UPDATE ON huespedes
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_reservas
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_servicios
BEFORE UPDATE ON servicios
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_solicitudes_servicios
BEFORE UPDATE ON solicitudes_servicios
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_contenido_plataforma
BEFORE UPDATE ON contenido_plataforma
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_experiencias_turisticas
BEFORE UPDATE ON experiencias_turisticas
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_timestamp_imagenes_galeria
BEFORE UPDATE ON imagenes_galeria
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_timestamp();

COMMENT ON FUNCTION trg_actualizar_timestamp IS 'Actualiza automáticamente el campo actualizado_en antes de guardar cambios';

-- ---------------------------------------------------------------------
-- TRIGGER 4: generar_codigo_reserva
-- Tabla afectada: reservas
-- Evento: BEFORE INSERT
-- Propósito: Generar código único de reserva automáticamente
-- ---------------------------------------------------------------------

-- Secuencia para códigos de reserva
CREATE SEQUENCE IF NOT EXISTS seq_codigo_reserva START 1;

-- Función del trigger
CREATE OR REPLACE FUNCTION trg_generar_codigo_reserva()
RETURNS TRIGGER AS $$
DECLARE
    v_numero INTEGER;
BEGIN
    -- Obtener siguiente número de secuencia
    v_numero := nextval('seq_codigo_reserva');

    -- Generar código: RES-YYYYMMDD-NNNNNN
    NEW.codigo_reserva := 'RES-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(v_numero::TEXT, 6, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_generar_codigo_reserva
BEFORE INSERT ON reservas
FOR EACH ROW
EXECUTE FUNCTION trg_generar_codigo_reserva();

COMMENT ON FUNCTION trg_generar_codigo_reserva IS 'Genera código único de reserva en formato RES-YYYYMMDD-NNNNNN usando secuencia dedicada';

-- =====================================================================
-- SECCIÓN 4: ÍNDICES DE OPTIMIZACIÓN (40+ ÍNDICES)
-- =====================================================================

-- Índices en Foreign Keys
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_habitaciones_tipo_habitacion_id ON habitaciones(tipo_habitacion_id);
CREATE INDEX idx_habitaciones_qr_asignado_id ON habitaciones(qr_asignado_id);
CREATE INDEX idx_habitaciones_estado ON habitaciones(estado) WHERE activo = TRUE;
CREATE INDEX idx_codigos_qr_habitacion_id ON codigos_qr(habitacion_id);
CREATE INDEX idx_codigos_qr_creado_por ON codigos_qr(creado_por);
CREATE INDEX idx_codigos_qr_estado ON codigos_qr(estado);
CREATE INDEX idx_reservas_huesped_id ON reservas(huesped_id);
CREATE INDEX idx_reservas_habitacion_id ON reservas(habitacion_id);
CREATE INDEX idx_reservas_estado_id ON reservas(estado_id);
CREATE INDEX idx_reservas_creado_por ON reservas(creado_por);
CREATE INDEX idx_reservas_checkin_por ON reservas(checkin_por);
CREATE INDEX idx_reservas_checkout_por ON reservas(checkout_por);
CREATE INDEX idx_solicitudes_servicios_habitacion_id ON solicitudes_servicios(habitacion_id);
CREATE INDEX idx_solicitudes_servicios_servicio_id ON solicitudes_servicios(servicio_id);
CREATE INDEX idx_solicitudes_servicios_atendido_por ON solicitudes_servicios(atendido_por);
CREATE INDEX idx_solicitudes_servicios_estado ON solicitudes_servicios(estado);
CREATE INDEX idx_notificaciones_solicitud_servicio_id ON notificaciones(solicitud_servicio_id);
CREATE INDEX idx_notificaciones_leida_por ON notificaciones(leida_por);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida) WHERE leida = FALSE;
CREATE INDEX idx_reportes_ocupacion_generado_por ON reportes_ocupacion(generado_por);
CREATE INDEX idx_contenido_plataforma_actualizado_por ON contenido_plataforma(actualizado_por);
CREATE INDEX idx_contenido_plataforma_activo ON contenido_plataforma(activo, orden) WHERE activo = TRUE;
CREATE INDEX idx_experiencias_turisticas_creado_por ON experiencias_turisticas(creado_por);
CREATE INDEX idx_experiencias_turisticas_categoria ON experiencias_turisticas(categoria) WHERE activo = TRUE;
CREATE INDEX idx_experiencias_turisticas_destacado ON experiencias_turisticas(destacado) WHERE destacado = TRUE AND activo = TRUE;
CREATE INDEX idx_imagenes_galeria_subido_por ON imagenes_galeria(subido_por);
CREATE INDEX idx_imagenes_galeria_categoria ON imagenes_galeria(categoria, orden) WHERE activo = TRUE;

-- Índices Compuestos para Consultas Críticas
CREATE INDEX idx_reservas_validacion_solapamiento ON reservas(habitacion_id, fecha_checkin, fecha_checkout, estado_id);
COMMENT ON INDEX idx_reservas_validacion_solapamiento IS 'Índice compuesto CRÍTICO para optimizar validación de solapamiento de fechas en reservas';

-- Índice sin subquery (PostgreSQL no permite subqueries en WHERE de índices parciales)
CREATE INDEX idx_reservas_rango_fechas ON reservas(fecha_checkin, fecha_checkout);
CREATE INDEX idx_habitaciones_disponibilidad ON habitaciones(estado, tipo_habitacion_id) WHERE activo = TRUE;
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(creado_en DESC) WHERE leida = FALSE;
CREATE INDEX idx_solicitudes_pendientes ON solicitudes_servicios(creado_en DESC) WHERE estado = 'pendiente';
CREATE INDEX idx_reportes_periodo ON reportes_ocupacion(fecha_inicio, fecha_fin, tipo_periodo);

-- Índices Únicos Adicionales
CREATE UNIQUE INDEX idx_usuarios_email_unique ON usuarios(LOWER(email));
CREATE UNIQUE INDEX idx_habitaciones_numero_unique ON habitaciones(LOWER(numero));
CREATE UNIQUE INDEX idx_reservas_codigo_unique ON reservas(codigo_reserva);

-- Índices de Texto Completo
CREATE INDEX idx_huespedes_nombre_completo ON huespedes USING gin(to_tsvector('spanish', COALESCE(nombre, '') || ' ' || COALESCE(apellido, '')));
CREATE INDEX idx_experiencias_busqueda ON experiencias_turisticas USING gin(to_tsvector('spanish', COALESCE(nombre, '') || ' ' || COALESCE(descripcion, '')));

-- Índices para Ordenamiento y Paginación
CREATE INDEX idx_reservas_creado_en_desc ON reservas(creado_en DESC);
CREATE INDEX idx_solicitudes_creado_en_desc ON solicitudes_servicios(creado_en DESC);
CREATE INDEX idx_comentarios_creado_en_desc ON comentarios_huespedes(creado_en DESC) WHERE activo = TRUE;
CREATE INDEX idx_experiencias_orden ON experiencias_turisticas(orden ASC) WHERE activo = TRUE;
CREATE INDEX idx_contenido_orden ON contenido_plataforma(orden ASC) WHERE activo = TRUE;
CREATE INDEX idx_galeria_orden ON imagenes_galeria(orden ASC, creado_en DESC) WHERE activo = TRUE;

-- =====================================================================
-- SECCIÓN 5: DATOS INICIALES
-- =====================================================================

-- 1. ROLES
INSERT INTO roles (nombre, descripcion) VALUES
('administrador', 'Control total del sistema: gestión de habitaciones, precios, usuarios, QR y reportes'),
('recepcionista', 'Gestión de reservas y servicios: crear/editar reservas, cambiar estados, atender solicitudes');

-- 2. ESTADOS DE RESERVA
INSERT INTO estados_reserva (nombre, descripcion, color_hex) VALUES
('pendiente', 'Reserva registrada en el sistema, sin check-in realizado', '#FFA500'),
('confirmada', 'Check-in realizado a las 12:00 PM, huésped en habitación', '#00FF00'),
('completada', 'Check-out realizado a las 11:00 AM, reserva finalizada', '#0000FF'),
('cancelada', 'Reserva cancelada por el huésped en plataforma externa', '#FF0000');

-- 3. TIPOS DE HABITACIÓN
INSERT INTO tipos_habitacion (nombre, capacidad_maxima, descripcion) VALUES
('Individual', 1, 'Habitación para una persona con cama individual'),
('Doble', 2, 'Habitación con cama doble o dos camas individuales'),
('Triple', 3, 'Habitación amplia con capacidad para tres personas'),
('Familiar', 6, 'Suite familiar con capacidad para hasta seis personas');

-- 4. SERVICIOS PREDEFINIDOS
INSERT INTO servicios (nombre, categoria, descripcion, precio, tiene_costo, horario_inicio, horario_fin) VALUES
(
    'Servicio de Lavandería',
    'lavanderia',
    'Lavado, secado y planchado de prendas',
    50.00,
    TRUE,
    '08:00',
    '18:00'
),
(
    'Uso de Sauna',
    'sauna',
    'Acceso al sauna del hotel con reserva previa',
    100.00,
    TRUE,
    '10:00',
    '20:00'
),
(
    'Limpieza Extra',
    'limpieza',
    'Limpieza adicional de habitación a solicitud del huésped',
    0.00,
    FALSE,
    '09:00',
    '17:00'
),
(
    'Uso de Cocina',
    'cocina',
    'Acceso a cocina compartida del hotel',
    0.00,
    FALSE,
    '06:00',
    '22:00'
);

-- 5. CONTENIDO DE PLATAFORMA QR (Bilingüe ES/EN)
INSERT INTO contenido_plataforma (seccion, titulo_es, titulo_en, contenido_es, contenido_en, orden) VALUES
(
    'bienvenida',
    '¡Bienvenido a Hotel Casa Josefa!',
    'Welcome to Hotel Casa Josefa!',
    'Nos complace recibirle en nuestro hotel boutique en el corazón de Santiago Atitlán. Esperamos que su estadía sea memorable y disfrute de la belleza del Lago Atitlán y la cultura maya local.',
    'We are pleased to welcome you to our boutique hotel in the heart of Santiago Atitlán. We hope your stay will be memorable and that you enjoy the beauty of Lake Atitlán and the local Mayan culture.',
    1
),
(
    'normas_hotel',
    'Normas y Horarios del Hotel',
    'Hotel Rules and Schedules',
    E'• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Horario de silencio: 10:00 PM - 7:00 AM\n• No se permiten mascotas\n• Prohibido fumar en habitaciones\n• Mantener las áreas comunes limpias\n• Respetar la cultura y costumbres locales',
    E'• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Quiet hours: 10:00 PM - 7:00 AM\n• Pets not allowed\n• No smoking in rooms\n• Keep common areas clean\n• Respect local culture and customs',
    2
),
(
    'horarios',
    'Horarios de Servicios',
    'Service Hours',
    E'• Recepción: 24 horas\n• Desayuno: 7:00 AM - 10:00 AM\n• Sauna: 10:00 AM - 8:00 PM (reservar con anticipación)\n• Cocina compartida: 6:00 AM - 10:00 PM\n• Lavandería: 8:00 AM - 6:00 PM',
    E'• Reception: 24 hours\n• Breakfast: 7:00 AM - 10:00 AM\n• Sauna: 10:00 AM - 8:00 PM (reservation required)\n• Shared kitchen: 6:00 AM - 10:00 PM\n• Laundry: 8:00 AM - 6:00 PM',
    3
),
(
    'wifi',
    'Información de WiFi',
    'WiFi Information',
    E'Red WiFi: CasaJosefa_Guest\nContraseña: Atitlan2025\n\nLa conexión está disponible en todas las áreas del hotel. Si tiene problemas de conexión, por favor contacte a recepción.',
    E'WiFi Network: CasaJosefa_Guest\nPassword: Atitlan2025\n\nConnection is available in all areas of the hotel. If you have connection problems, please contact reception.',
    4
),
(
    'contacto_emergencia',
    'Contactos de Emergencia',
    'Emergency Contacts',
    E'• Recepción Hotel: +502 1234-5678\n• Emergencias Médicas: 123\n• Bomberos: 122\n• Policía Nacional: 110\n• Hospital Atitlán: +502 7721-2201\n• Centro de Salud Santiago: +502 7721-7272',
    E'• Hotel Reception: +502 1234-5678\n• Medical Emergencies: 123\n• Fire Department: 122\n• National Police: 110\n• Atitlán Hospital: +502 7721-2201\n• Santiago Health Center: +502 7721-7272',
    5
);

-- 6. EXPERIENCIAS TURÍSTICAS DE SANTIAGO ATITLÁN
INSERT INTO experiencias_turisticas (nombre, categoria, descripcion, ubicacion, destacado) VALUES
(
    'Tour en Lancha por el Lago Atitlán',
    'actividades',
    'Recorrido en lancha por el majestuoso Lago Atitlán visitando los pueblos cercanos de San Pedro, San Juan y Santa Cruz. Duración: 3-4 horas. Incluye guía local.',
    'Embarcadero principal de Santiago Atitlán',
    TRUE
),
(
    'Ceremonia Maya Tradicional',
    'cultura',
    'Participe en una auténtica ceremonia maya dirigida por un sacerdote maya local (Ajq''ij). Experimente la espiritualidad ancestral y aprenda sobre el calendario maya y las tradiciones sagradas.',
    'Centro Ceremonial Maya - Santiago Atitlán',
    TRUE
),
(
    'Taller de Textiles Tradicionales',
    'cultura',
    'Aprenda el arte del tejido maya en telar de cintura con maestras artesanas locales. Conozca los significados de los símbolos y colores tradicionales. Incluye creación de su propia pieza.',
    'Cooperativa de Tejedoras Tz''utujil',
    TRUE
),
(
    'Iglesia de Santiago Apóstol',
    'atracciones',
    'Visite la histórica iglesia colonial que alberga la figura de Maximón (Rilaj Maam), una deidad maya-católica única de Santiago Atitlán. Arquitectura colonial con elementos mayas.',
    'Centro de Santiago Atitlán, frente al parque central',
    FALSE
),
(
    'Mercado Local de Santiago',
    'gastronomia',
    'Explore el colorido mercado local lleno de textiles, artesanías, frutas y verduras frescas. Ideal para comprar souvenirs auténticos y probar comida típica guatemalteca.',
    'Mercado Municipal de Santiago Atitlán',
    FALSE
),
(
    'Senderismo al Mirador Indian Nose',
    'actividades',
    'Caminata de 2-3 horas hasta el mirador con forma de nariz que ofrece vistas panorámicas espectaculares del lago y los volcanes. Mejor al amanecer.',
    'Inicio del sendero en Santa Clara La Laguna',
    FALSE
);

-- 7. USUARIO ADMINISTRADOR POR DEFECTO
-- ⚠️ IMPORTANTE: Este password debe ser cambiado inmediatamente en producción
-- Password: Admin123! (hash bcrypt generado con cost factor 10)
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id) VALUES
(
    'Administrador',
    'Sistema',
    'admin@casajosefa.com',
    '$2b$10$rKXQvN8aN7FO5HhGvz4qauBKZPGZZL.YOYgE7c.Wd1qBF/3vLz8G.',
    (SELECT id FROM roles WHERE nombre = 'administrador')
);

-- =====================================================================
-- ANÁLISIS DE TABLAS (actualizar estadísticas del optimizador)
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

-- =====================================================================
-- INSTALACIÓN COMPLETADA
-- =====================================================================

-- Verificación rápida de instalación
DO $$
DECLARE
    v_roles INTEGER;
    v_estados INTEGER;
    v_tipos INTEGER;
    v_servicios INTEGER;
    v_contenido INTEGER;
    v_experiencias INTEGER;
    v_usuarios INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_roles FROM roles;
    SELECT COUNT(*) INTO v_estados FROM estados_reserva;
    SELECT COUNT(*) INTO v_tipos FROM tipos_habitacion;
    SELECT COUNT(*) INTO v_servicios FROM servicios;
    SELECT COUNT(*) INTO v_contenido FROM contenido_plataforma;
    SELECT COUNT(*) INTO v_experiencias FROM experiencias_turisticas;
    SELECT COUNT(*) INTO v_usuarios FROM usuarios;

    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'INSTALACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Resumen de instalación:';
    RAISE NOTICE '  ✓ 16 tablas creadas';
    RAISE NOTICE '  ✓ 2 funciones de negocio instaladas';
    RAISE NOTICE '  ✓ 4 triggers automáticos configurados';
    RAISE NOTICE '  ✓ 40+ índices de optimización creados';
    RAISE NOTICE '  ✓ Datos iniciales insertados';
    RAISE NOTICE '';
    RAISE NOTICE 'Datos insertados:';
    RAISE NOTICE '  - % roles', v_roles;
    RAISE NOTICE '  - % estados de reserva', v_estados;
    RAISE NOTICE '  - % tipos de habitación', v_tipos;
    RAISE NOTICE '  - % servicios', v_servicios;
    RAISE NOTICE '  - % secciones de contenido', v_contenido;
    RAISE NOTICE '  - % experiencias turísticas', v_experiencias;
    RAISE NOTICE '  - % usuario administrador', v_usuarios;
    RAISE NOTICE '';
    RAISE NOTICE 'Usuario administrador creado:';
    RAISE NOTICE '  Email: admin@casajosefa.com';
    RAISE NOTICE '  Password: Admin123!';
    RAISE NOTICE '  ⚠️  CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN';
    RAISE NOTICE '';
    RAISE NOTICE 'Siguiente paso: FASE 2 - Backend Node.js + Express';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
END $$;
