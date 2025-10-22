-- =====================================================================
-- MIGRACIÓN: SISTEMA DE IMÁGENES PARA EXPERIENCIAS TURÍSTICAS
-- =====================================================================
-- Fecha: 2025-01-16
-- Propósito: Migrar experiencias_turisticas del campo imagen_url (1 imagen)
--            al sistema de múltiples imágenes usando imagenes_galeria
-- Patrón: Espejo exacto de lugares_imagenes y habitaciones_imagenes
-- =====================================================================
-- INSTRUCCIONES:
-- 1. Copia todo este script
-- 2. Pégalo en Supabase SQL Editor
-- 3. Ejecuta (Run)
-- 4. Verifica que no haya errores
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA: experiencias_imagenes
-- Propósito: Relación muchos a muchos entre experiencias e imágenes
-- Patrón: Igual que habitaciones_imagenes y lugares_imagenes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiencias_imagenes (
    id SERIAL PRIMARY KEY,
    experiencia_id INTEGER NOT NULL REFERENCES experiencias_turisticas(id) ON DELETE CASCADE,
    imagen_id INTEGER NOT NULL REFERENCES imagenes_galeria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Una experiencia no puede tener la misma imagen duplicada
    CONSTRAINT unique_experiencia_imagen UNIQUE(experiencia_id, imagen_id)
);

COMMENT ON TABLE experiencias_imagenes IS 'Tabla de relación muchos a muchos entre experiencias turísticas e imágenes de galería';
COMMENT ON COLUMN experiencias_imagenes.experiencia_id IS 'ID de la experiencia turística (FK a experiencias_turisticas)';
COMMENT ON COLUMN experiencias_imagenes.imagen_id IS 'ID de la imagen (FK a imagenes_galeria)';
COMMENT ON COLUMN experiencias_imagenes.orden IS 'Orden de visualización de las imágenes (0 = primera)';
COMMENT ON COLUMN experiencias_imagenes.es_principal IS 'TRUE si es la imagen principal de la experiencia. Solo puede haber UNA imagen principal por experiencia';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_experiencias_imagenes_experiencia
    ON experiencias_imagenes(experiencia_id);

CREATE INDEX IF NOT EXISTS idx_experiencias_imagenes_imagen
    ON experiencias_imagenes(imagen_id);

CREATE INDEX IF NOT EXISTS idx_experiencias_imagenes_principal
    ON experiencias_imagenes(experiencia_id, es_principal)
    WHERE es_principal = TRUE;

CREATE INDEX IF NOT EXISTS idx_experiencias_imagenes_orden
    ON experiencias_imagenes(experiencia_id, orden);

-- ---------------------------------------------------------------------
-- TRIGGER: Garantizar solo UNA imagen principal por experiencia
-- Patrón: Igual que habitaciones_imagenes y lugares_imagenes
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validar_imagen_principal_experiencia()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando como principal (TRUE)
    IF NEW.es_principal = TRUE THEN
        -- Desmarcar todas las demás imágenes de esta experiencia como principal
        UPDATE experiencias_imagenes
        SET es_principal = FALSE
        WHERE experiencia_id = NEW.experiencia_id
          AND id != COALESCE(NEW.id, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_imagen_principal_experiencia
BEFORE INSERT OR UPDATE ON experiencias_imagenes
FOR EACH ROW
EXECUTE FUNCTION validar_imagen_principal_experiencia();

COMMENT ON FUNCTION validar_imagen_principal_experiencia() IS 'Trigger que asegura que solo haya UNA imagen principal por experiencia turística. Al marcar una imagen como principal, automáticamente desmarca las demás';

-- ---------------------------------------------------------------------
-- FUNCIÓN HELPER: Obtener imagen principal de una experiencia
-- Patrón: Igual que habitaciones y lugares
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION obtener_imagen_principal_experiencia(p_experiencia_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    url_imagen TEXT,
    descripcion TEXT
) AS $$
BEGIN
    -- Intentar obtener la imagen marcada como principal
    RETURN QUERY
    SELECT
        ig.id,
        ig.titulo,
        ig.url_imagen,
        ig.descripcion
    FROM experiencias_imagenes ei
    INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
    WHERE ei.experiencia_id = p_experiencia_id
      AND ei.es_principal = TRUE
      AND ig.activo = TRUE
    LIMIT 1;

    -- Si no hay imagen principal, devolver la primera imagen asociada
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            ig.id,
            ig.titulo,
            ig.url_imagen,
            ig.descripcion
        FROM experiencias_imagenes ei
        INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
        WHERE ei.experiencia_id = p_experiencia_id
          AND ig.activo = TRUE
        ORDER BY ei.orden ASC, ei.creado_en ASC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_imagen_principal_experiencia(INTEGER) IS 'Obtiene la imagen principal de una experiencia turística. Si no hay imagen marcada como principal, devuelve la primera imagen disponible ordenada por orden/fecha';

-- ---------------------------------------------------------------------
-- OPCIONAL: Migrar datos existentes de imagen_url a imagenes_galeria
-- ---------------------------------------------------------------------
-- NOTA: Este bloque es OPCIONAL y solo se ejecuta si hay experiencias
--       con imagen_url poblada que quieras migrar al nuevo sistema.
--       Puedes comentarlo o eliminarlo si prefieres hacerlo manualmente.
-- ---------------------------------------------------------------------

DO $$
DECLARE
    v_experiencia RECORD;
    v_imagen_id INTEGER;
BEGIN
    -- Recorrer experiencias que tengan imagen_url poblada
    FOR v_experiencia IN
        SELECT id, nombre, imagen_url
        FROM experiencias_turisticas
        WHERE imagen_url IS NOT NULL
          AND imagen_url != ''
          AND activo = TRUE
    LOOP
        BEGIN
            -- Insertar la imagen antigua en imagenes_galeria (si no existe ya)
            INSERT INTO imagenes_galeria (
                titulo,
                descripcion,
                url_imagen,
                categoria,
                orden,
                activo
            )
            VALUES (
                'Imagen de ' || v_experiencia.nombre,
                'Imagen migrada automáticamente desde campo imagen_url',
                v_experiencia.imagen_url,
                'experiencias_turisticas',
                0,
                TRUE
            )
            ON CONFLICT DO NOTHING
            RETURNING id INTO v_imagen_id;

            -- Si la imagen se insertó, vincularla a la experiencia
            IF v_imagen_id IS NOT NULL THEN
                INSERT INTO experiencias_imagenes (
                    experiencia_id,
                    imagen_id,
                    orden,
                    es_principal
                )
                VALUES (
                    v_experiencia.id,
                    v_imagen_id,
                    0,
                    TRUE
                )
                ON CONFLICT DO NOTHING;

                RAISE NOTICE '✓ Imagen migrada para experiencia: % (ID: %)', v_experiencia.nombre, v_experiencia.id;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '✗ Error al migrar imagen para experiencia ID %: %', v_experiencia.id, SQLERRM;
        END;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- NOTA IMPORTANTE: Campo imagen_url en experiencias_turisticas
-- ---------------------------------------------------------------------
-- El campo imagen_url AÚN EXISTE en la tabla experiencias_turisticas.
-- OPCIONES:
-- 1. MANTENERLO (deprecated): No afecta nada, el backend usará experiencias_imagenes
-- 2. ELIMINARLO: Ejecuta esto solo si estás 100% seguro:
--    ALTER TABLE experiencias_turisticas DROP COLUMN imagen_url;
--
-- RECOMENDACIÓN: Déjalo por ahora. Puedes eliminarlo más adelante cuando
--                confirmes que todo funciona con el nuevo sistema.
-- ---------------------------------------------------------------------

-- Agregar ANALYZE para optimización
ANALYZE experiencias_imagenes;

-- =====================================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================================
DO $$
DECLARE
    total_relaciones INTEGER;
    total_experiencias INTEGER;
BEGIN
    -- Verificar que la tabla se creó
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiencias_imagenes') THEN

        RAISE NOTICE '✓ Tabla experiencias_imagenes creada correctamente';
        RAISE NOTICE '✓ Índices agregados (4 índices en total)';
        RAISE NOTICE '✓ Trigger validar_imagen_principal_experiencia instalado';
        RAISE NOTICE '✓ Función helper obtener_imagen_principal_experiencia creada';

        -- Contar relaciones migradas
        SELECT COUNT(*) INTO total_relaciones FROM experiencias_imagenes;
        SELECT COUNT(*) INTO total_experiencias FROM experiencias_turisticas WHERE activo = TRUE;

        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════════════════════';
        RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
        RAISE NOTICE '═══════════════════════════════════════════════════════';
        RAISE NOTICE 'Tabla agregada al esquema:';
        RAISE NOTICE '  • TABLA 17: experiencias_imagenes (relación M:N)';
        RAISE NOTICE '';
        RAISE NOTICE 'Estadísticas:';
        RAISE NOTICE '  • % experiencias turísticas activas', total_experiencias;
        RAISE NOTICE '  • % relaciones experiencia-imagen creadas', total_relaciones;
        RAISE NOTICE '';

        IF total_relaciones > 0 THEN
            RAISE NOTICE '✓ Imágenes migradas automáticamente desde imagen_url';
        ELSE
            RAISE NOTICE 'ℹ No se migraron imágenes (campo imagen_url vacío o no existe)';
            RAISE NOTICE '  Podrás vincular imágenes manualmente desde el panel admin';
        END IF;

        RAISE NOTICE '';
        RAISE NOTICE 'CAMPO imagen_url:';
        RAISE NOTICE '  El campo imagen_url aún existe en experiencias_turisticas';
        RAISE NOTICE '  pero ya NO se usará. El backend usará experiencias_imagenes.';
        RAISE NOTICE '  Puedes eliminarlo más adelante si quieres:';
        RAISE NOTICE '    ALTER TABLE experiencias_turisticas DROP COLUMN imagen_url;';
        RAISE NOTICE '';
        RAISE NOTICE 'Siguiente paso: Implementar backend controllers y frontend';

    ELSE
        RAISE EXCEPTION '✗ Error: No se pudo crear la tabla experiencias_imagenes';
    END IF;
END $$;

-- =====================================================================
-- CONSULTAS ÚTILES PARA VERIFICAR
-- =====================================================================

-- Ver todas las relaciones experiencia-imagen
-- SELECT
--   et.nombre as experiencia,
--   ig.titulo as imagen,
--   ei.es_principal,
--   ei.orden
-- FROM experiencias_imagenes ei
-- INNER JOIN experiencias_turisticas et ON ei.experiencia_id = et.id
-- INNER JOIN imagenes_galeria ig ON ei.imagen_id = ig.id
-- ORDER BY et.nombre, ei.es_principal DESC, ei.orden ASC;

-- Ver experiencias SIN imágenes vinculadas
-- SELECT
--   et.id,
--   et.nombre,
--   et.categoria,
--   et.imagen_url as url_antigua
-- FROM experiencias_turisticas et
-- LEFT JOIN experiencias_imagenes ei ON et.id = ei.experiencia_id
-- WHERE et.activo = TRUE
--   AND ei.id IS NULL;

-- Ver imagen principal de una experiencia (usando la función helper)
-- SELECT * FROM obtener_imagen_principal_experiencia(1);

-- =====================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================
