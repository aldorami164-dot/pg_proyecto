-- =====================================================================
-- VERIFICAR CONSTRAINT DE CATEGORÍA EN TABLA servicios
-- =====================================================================

-- Ver el constraint de categoría
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'servicios'
  AND con.contype = 'c'
  AND con.conname LIKE '%categoria%';

-- Ver todos los constraints de la tabla servicios
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'servicios'
ORDER BY con.conname;
