-- =====================================================================
-- FUNCIONES DE NEGOCIO
-- =====================================================================

-- =====================================================================
-- FUNCIÓN 1: validar_solapamiento_reservas
-- Propósito: Validar que no haya conflicto de fechas antes de crear/editar reserva
-- Retorna: TRUE si fechas disponibles, FALSE si hay solapamiento
-- =====================================================================
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

-- =====================================================================
-- FUNCIÓN 2: generar_reporte_ocupacion
-- Propósito: Calcular métricas de ocupación y guardar reporte
-- Retorna: ID del reporte creado
-- =====================================================================
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
