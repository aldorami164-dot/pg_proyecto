-- =====================================================================
-- TRIGGERS DEL SISTEMA
-- =====================================================================

-- =====================================================================
-- TRIGGER 1: actualizar_estado_habitacion
-- Tabla afectada: reservas
-- Evento: AFTER UPDATE OF estado_id
-- Propósito: Cambiar estado de habitación automáticamente según check-in/check-out
-- =====================================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION trg_actualizar_estado_habitacion()
RETURNS TRIGGER AS $$
DECLARE
    v_estado_nombre VARCHAR(50);
BEGIN
    -- Solo ejecutar si el estado realmente cambió
    IF OLD.estado_id != NEW.estado_id THEN

        -- Obtener nombre del nuevo estado
        SELECT nombre INTO v_estado_nombre
        FROM estados_reserva
        WHERE id = NEW.estado_id;

        -- Actualizar estado de habitación según el estado de la reserva
        CASE v_estado_nombre
            WHEN 'confirmada' THEN
                -- Check-in realizado → habitación ocupada
                UPDATE habitaciones
                SET estado = 'ocupada',
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = NEW.habitacion_id;

            WHEN 'completada' THEN
                -- Check-out realizado → habitación disponible
                UPDATE habitaciones
                SET estado = 'disponible',
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = NEW.habitacion_id;

            WHEN 'cancelada' THEN
                -- Reserva cancelada → habitación disponible
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

COMMENT ON FUNCTION trg_actualizar_estado_habitacion IS 'Actualiza automáticamente estado de habitación: confirmada→ocupada, completada/cancelada→disponible';

-- =====================================================================
-- TRIGGER 2: notificar_solicitud_servicio
-- Tabla afectada: solicitudes_servicios
-- Evento: AFTER INSERT
-- Propósito: Crear notificación automática al registrar solicitud de servicio
-- =====================================================================

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

-- =====================================================================
-- TRIGGER 3: actualizar_timestamp
-- Tablas afectadas: Todas las tablas con campo actualizado_en
-- Evento: BEFORE UPDATE
-- Propósito: Actualizar automáticamente el timestamp de modificación
-- =====================================================================

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

-- =====================================================================
-- TRIGGER 4: generar_codigo_reserva
-- Tabla afectada: reservas
-- Evento: BEFORE INSERT
-- Propósito: Generar código único de reserva automáticamente
-- =====================================================================

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
