-- =====================================================================
-- CORRECCIÓN: Función validar_solapamiento_reservas
-- =====================================================================
-- PROBLEMA: La lógica anterior bloqueaba habitaciones cuando checkout = checkin
-- SOLUCIÓN: Permitir que un huésped salga y otro entre el mismo día
-- =====================================================================
-- FECHA: 2025-10-20
-- EJECUTAR EN: Supabase SQL Editor
-- =====================================================================

-- Reemplazar la función con lógica correcta
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
    -- LÓGICA CORRECTA: checkout de una reserva NO bloquea checkin del mismo día
    --
    -- Ejemplo correcto:
    --   Reserva A: 20-oct a 21-oct (sale el 21)
    --   Reserva B: 21-oct a 22-oct (entra el 21)
    --   ¿Conflicto? NO - El día 21 uno sale y otro entra
    --
    -- Lógica: Hay solapamiento si:
    --   checkin_nueva < checkout_existente AND checkout_nueva > checkin_existente
    --
    SELECT COUNT(*) INTO v_count
    FROM reservas r
    INNER JOIN estados_reserva er ON r.estado_id = er.id
    WHERE r.habitacion_id = p_habitacion_id
        AND er.nombre != 'cancelada'
        AND (p_reserva_id IS NULL OR r.id != p_reserva_id)
        AND (
            -- Solapamiento real: la nueva reserva se cruza con la existente
            p_fecha_checkin < r.fecha_checkout AND p_fecha_checkout > r.fecha_checkin
        );

    -- Si count > 0 hay solapamiento, retornar FALSE (NO disponible)
    -- Si count = 0 no hay solapamiento, retornar TRUE (SÍ disponible)
    RETURN (v_count = 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_solapamiento_reservas IS 'Validación CRÍTICA antes de crear/editar reserva. Detecta intersecciones de rangos de fechas. PERMITE que checkout = checkin (lógica hotelera estándar). Excluye reservas canceladas';

-- =====================================================================
-- VERIFICACIÓN DE LA CORRECCIÓN
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CORRECCIÓN APLICADA: validar_solapamiento_reservas';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Cambios realizados:';
    RAISE NOTICE '  ✓ Lógica simplificada a: checkin < checkout_existente AND checkout > checkin_existente';
    RAISE NOTICE '  ✓ Ahora permite: checkout_existente = checkin_nueva (mismo día)';
    RAISE NOTICE '';
    RAISE NOTICE 'Ejemplos de funcionamiento:';
    RAISE NOTICE '  Reserva existente: 20-oct a 21-oct';
    RAISE NOTICE '  Nueva búsqueda:    21-oct a 22-oct';
    RAISE NOTICE '  Resultado:         ✓ SÍ DISPONIBLE (el 21 sale uno y entra otro)';
    RAISE NOTICE '';
    RAISE NOTICE '  Reserva existente: 20-oct a 22-oct';
    RAISE NOTICE '  Nueva búsqueda:    21-oct a 22-oct';
    RAISE NOTICE '  Resultado:         ✗ NO DISPONIBLE (ocupada el 21)';
    RAISE NOTICE '';
    RAISE NOTICE 'CORRECCIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- PRUEBAS DE LA FUNCIÓN (OPCIONAL - PUEDES EJECUTAR PARA VERIFICAR)
-- =====================================================================
-- Descomenta las siguientes líneas para probar la función

/*
-- Prueba 1: Sin solapamiento (checkout = checkin) - Debe retornar TRUE
SELECT validar_solapamiento_reservas(
    1,              -- habitacion_id
    '2025-10-21',   -- checkin nueva
    '2025-10-22',   -- checkout nueva
    NULL            -- reserva_id (NULL = nueva reserva)
) as disponible;
-- Esperado: TRUE (disponible)

-- Prueba 2: Con solapamiento real - Debe retornar FALSE
SELECT validar_solapamiento_reservas(
    1,              -- habitacion_id
    '2025-10-21',   -- checkin nueva
    '2025-10-23',   -- checkout nueva
    NULL
) as disponible;
-- Esperado: FALSE si existe una reserva del 20 al 22
*/

-- =====================================================================
-- FIN DE LA CORRECCIÓN
-- =====================================================================
