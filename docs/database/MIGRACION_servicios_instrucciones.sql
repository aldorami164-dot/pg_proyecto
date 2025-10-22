-- =====================================================================
-- MIGRACIÓN: AGREGAR TABLA servicios_instrucciones
-- =====================================================================
-- Fecha: 2025-10-20
-- Propósito: Permitir gestión dinámica de instrucciones por servicio
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO 1: CREAR TABLA servicios_instrucciones
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios_instrucciones (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    texto_instruccion TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE servicios_instrucciones IS 'Instrucciones dinámicas por servicio. Permite agregar/editar/eliminar instrucciones desde el panel admin';
COMMENT ON COLUMN servicios_instrucciones.servicio_id IS 'ID del servicio (FK a servicios)';
COMMENT ON COLUMN servicios_instrucciones.texto_instruccion IS 'Texto de la instrucción que se muestra al huésped';
COMMENT ON COLUMN servicios_instrucciones.orden IS 'Orden de visualización (0 = primera)';
COMMENT ON COLUMN servicios_instrucciones.activo IS 'Si FALSE, la instrucción no se muestra';

-- ---------------------------------------------------------------------
-- PASO 2: CREAR ÍNDICES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_servicios_instrucciones_servicio
    ON servicios_instrucciones(servicio_id);

CREATE INDEX IF NOT EXISTS idx_servicios_instrucciones_orden
    ON servicios_instrucciones(servicio_id, orden)
    WHERE activo = TRUE;

-- ---------------------------------------------------------------------
-- PASO 3: CREAR TRIGGER PARA ACTUALIZAR FECHA
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_fecha_servicios_instrucciones()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_servicios_instrucciones
BEFORE UPDATE ON servicios_instrucciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_servicios_instrucciones();

-- ---------------------------------------------------------------------
-- PASO 4: AGREGAR CAMPOS A TABLA servicios
-- ---------------------------------------------------------------------
-- Agregar campo 'solicitable' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'servicios' AND column_name = 'solicitable'
    ) THEN
        ALTER TABLE servicios ADD COLUMN solicitable BOOLEAN DEFAULT TRUE;
        COMMENT ON COLUMN servicios.solicitable IS 'TRUE = solicitable desde habitación vía QR, FALSE = acceso libre';
        RAISE NOTICE '✓ Campo solicitable agregado a tabla servicios';
    ELSE
        RAISE NOTICE '✓ Campo solicitable ya existe';
    END IF;
END $$;

-- Agregar campo 'icono' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'servicios' AND column_name = 'icono'
    ) THEN
        ALTER TABLE servicios ADD COLUMN icono VARCHAR(50) DEFAULT 'CheckCircle';
        COMMENT ON COLUMN servicios.icono IS 'Nombre del icono de lucide-react (ej: Shirt, Waves, UtensilsCrossed)';
        RAISE NOTICE '✓ Campo icono agregado a tabla servicios';
    ELSE
        RAISE NOTICE '✓ Campo icono ya existe';
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- PASO 5: ACTUALIZAR SERVICIOS EXISTENTES CON ICONOS
-- ---------------------------------------------------------------------
UPDATE servicios SET icono = 'Shirt', solicitable = TRUE WHERE LOWER(categoria) = 'lavanderia';
UPDATE servicios SET icono = 'Waves', solicitable = TRUE WHERE LOWER(categoria) = 'sauna';
UPDATE servicios SET icono = 'UtensilsCrossed', solicitable = TRUE WHERE LOWER(categoria) = 'cocina';
UPDATE servicios SET icono = 'Sparkles', solicitable = TRUE WHERE LOWER(categoria) = 'limpieza';
UPDATE servicios SET icono = 'Droplets', solicitable = FALSE WHERE LOWER(categoria) = 'piscina';

-- ---------------------------------------------------------------------
-- PASO 6: MIGRAR INSTRUCCIONES HARDCODEADAS
-- ---------------------------------------------------------------------

-- Instrucciones de LAVANDERÍA
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT s.id, unnest(ARRAY[
    'Deja tu ropa en la bolsa de lavandería',
    'Tiempo de entrega: 24 horas',
    'Servicio incluye lavado, secado y planchado',
    'Disponible de lunes a domingo'
]), generate_series(1, 4)
FROM servicios s
WHERE LOWER(s.categoria) = 'lavanderia'
AND NOT EXISTS (
    SELECT 1 FROM servicios_instrucciones si WHERE si.servicio_id = s.id
);

-- Instrucciones de SAUNA
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT s.id, unnest(ARRAY[
    'Horario: 9:00 AM - 9:00 PM',
    'Duración máxima: 30 minutos por sesión',
    'Traer toalla y ropa cómoda',
    'Hidrátate bien antes y después',
    'Reserva con anticipación en recepción'
]), generate_series(1, 5)
FROM servicios s
WHERE LOWER(s.categoria) = 'sauna'
AND NOT EXISTS (
    SELECT 1 FROM servicios_instrucciones si WHERE si.servicio_id = s.id
);

-- Instrucciones de COCINA
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT s.id, unnest(ARRAY[
    'Horario: 6:00 AM - 10:00 PM',
    'Limpia después de usar',
    'Respeta el espacio de otros huéspedes',
    'Utensilios y ollas disponibles',
    'Solicita acceso indicando tu horario preferido'
]), generate_series(1, 5)
FROM servicios s
WHERE LOWER(s.categoria) = 'cocina'
AND NOT EXISTS (
    SELECT 1 FROM servicios_instrucciones si WHERE si.servicio_id = s.id
);

-- Instrucciones de LIMPIEZA
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT s.id, unnest(ARRAY[
    'Servicio diario de 8:00 AM - 2:00 PM',
    'Incluye cambio de sábanas y toallas',
    'Limpieza extra disponible bajo solicitud',
    'Indica el horario que prefieras en el mensaje',
    'Respetamos el cartel "No Molestar"'
]), generate_series(1, 5)
FROM servicios s
WHERE LOWER(s.categoria) = 'limpieza'
AND NOT EXISTS (
    SELECT 1 FROM servicios_instrucciones si WHERE si.servicio_id = s.id
);

-- Instrucciones de PISCINA
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT s.id, unnest(ARRAY[
    'Horario: Lunes a Domingo 8:00 AM - 7:00 PM',
    'Llevar ropa de baño adecuada',
    'Ducha obligatoria antes de ingresar',
    'Si usa cremas o aceites, bañarse primero',
    'No está permitido correr alrededor de la piscina',
    'Niños menores de 12 años con supervisión de adulto',
    'Toallas disponibles en recepción'
]), generate_series(1, 7)
FROM servicios s
WHERE LOWER(s.categoria) = 'piscina'
AND NOT EXISTS (
    SELECT 1 FROM servicios_instrucciones si WHERE si.servicio_id = s.id
);

-- ---------------------------------------------------------------------
-- PASO 7: ANÁLISIS DE LA TABLA
-- ---------------------------------------------------------------------
ANALYZE servicios_instrucciones;

-- =====================================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================================
DO $$
DECLARE
    count_instrucciones INTEGER;
    count_servicios INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_instrucciones FROM servicios_instrucciones;
    SELECT COUNT(*) INTO count_servicios FROM servicios WHERE activo = TRUE;

    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Tabla servicios_instrucciones creada';
    RAISE NOTICE '✓ Índices agregados (2 índices)';
    RAISE NOTICE '✓ Trigger de actualización instalado';
    RAISE NOTICE '✓ Campos solicitable e icono agregados a servicios';
    RAISE NOTICE '✓ % servicios activos encontrados', count_servicios;
    RAISE NOTICE '✓ % instrucciones migradas desde código', count_instrucciones;
    RAISE NOTICE '';
    RAISE NOTICE 'Próximo paso: Implementar backend y frontend';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================
