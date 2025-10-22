-- =====================================================================
-- MIGRACIÓN: AGREGAR COLUMNAS A experiencias_turisticas
-- =====================================================================
-- Fecha: 2025-01-16
-- Propósito: Agregar columnas duracion y capacidad a experiencias_turisticas
-- =====================================================================

-- PASO 1: Eliminar el constraint antiguo primero
ALTER TABLE experiencias_turisticas
DROP CONSTRAINT IF EXISTS experiencias_turisticas_categoria_check;

-- PASO 2: Agregar columnas nuevas
ALTER TABLE experiencias_turisticas
ADD COLUMN IF NOT EXISTS duracion VARCHAR(100);

ALTER TABLE experiencias_turisticas
ADD COLUMN IF NOT EXISTS capacidad INTEGER;

-- PASO 3: Agregar comentarios descriptivos
COMMENT ON COLUMN experiencias_turisticas.duracion IS 'Duración de la experiencia (ej: "2 horas", "Medio día", "1 día completo")';
COMMENT ON COLUMN experiencias_turisticas.capacidad IS 'Capacidad máxima de personas para la experiencia';

-- PASO 4: Actualizar los datos existentes para que coincidan con las nuevas categorías
-- Mapeo: 'atracciones' -> 'aventura', 'actividades' -> 'aventura'
UPDATE experiencias_turisticas
SET categoria = CASE
    WHEN categoria = 'atracciones' THEN 'aventura'
    WHEN categoria = 'actividades' THEN 'aventura'
    WHEN categoria NOT IN ('aventura', 'cultura', 'naturaleza', 'gastronomia') THEN 'aventura'
    ELSE categoria
END;

-- PASO 5: Crear el nuevo constraint con las categorías correctas
ALTER TABLE experiencias_turisticas
ADD CONSTRAINT experiencias_turisticas_categoria_check
CHECK (categoria IN ('aventura', 'cultura', 'naturaleza', 'gastronomia'));

-- Verificación
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'experiencias_turisticas'
        AND column_name = 'duracion'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'experiencias_turisticas'
        AND column_name = 'capacidad'
    ) THEN
        RAISE NOTICE '✓ Columnas agregadas exitosamente a experiencias_turisticas';
        RAISE NOTICE '  • duracion (VARCHAR)';
        RAISE NOTICE '  • capacidad (INTEGER)';
        RAISE NOTICE '✓ Categorías actualizadas: aventura, cultura, naturaleza, gastronomia';
    ELSE
        RAISE EXCEPTION '✗ Error: No se pudieron agregar las columnas';
    END IF;
END $$;
