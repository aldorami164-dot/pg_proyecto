-- =====================================================================
-- VERIFICAR COLUMNAS EN TABLA servicios
-- =====================================================================
-- Ejecuta este script para verificar si las columnas existen
-- =====================================================================

-- Ver todas las columnas de la tabla servicios
SELECT
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'servicios'
ORDER BY ordinal_position;

-- Verificar específicamente las columnas solicitable e icono
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'servicios' AND column_name = 'solicitable'
        ) THEN 'SÍ EXISTE'
        ELSE 'NO EXISTE'
    END as columna_solicitable,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'servicios' AND column_name = 'icono'
        ) THEN 'SÍ EXISTE'
        ELSE 'NO EXISTE'
    END as columna_icono;
