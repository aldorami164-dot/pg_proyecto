-- =====================================================================
-- FIX: ELIMINAR CONSTRAINT DE CATEGORÍA EN TABLA servicios
-- =====================================================================
-- Propósito: Permitir categorías dinámicas sin restricciones
-- =====================================================================

-- Eliminar el constraint de categoría si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'servicios'
          AND con.conname = 'servicios_categoria_check'
    ) THEN
        ALTER TABLE servicios DROP CONSTRAINT servicios_categoria_check;
        RAISE NOTICE '✓ Constraint servicios_categoria_check eliminado';
    ELSE
        RAISE NOTICE '✓ Constraint servicios_categoria_check no existe';
    END IF;
END $$;

-- Verificar que se eliminó correctamente
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM pg_constraint con
            INNER JOIN pg_class rel ON rel.oid = con.conrelid
            WHERE rel.relname = 'servicios'
              AND con.contype = 'c'
              AND con.conname LIKE '%categoria%'
        ) THEN 'AÚN EXISTE'
        ELSE 'ELIMINADO EXITOSAMENTE'
    END as resultado;
