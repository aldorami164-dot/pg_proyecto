-- =====================================================================
-- MIGRACIÓN: AGREGAR TABLA servicios_imagenes
-- =====================================================================
-- Fecha: 2025-10-21
-- Propósito: Vincular imágenes de galería con servicios (igual que habitaciones)
-- Autor: Sistema de gestión Casa Josefa
-- =====================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu base de datos PostgreSQL
-- 2. Verifica con las queries de prueba al final
-- 3. Si todo funciona, avisa para continuar con backend
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO 1: CREAR TABLA servicios_imagenes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios_imagenes (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    imagen_id INTEGER NOT NULL REFERENCES imagenes_galeria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Un servicio no puede tener la misma imagen duplicada
    CONSTRAINT unique_servicio_imagen UNIQUE(servicio_id, imagen_id)
);

COMMENT ON TABLE servicios_imagenes IS 'Tabla de relación muchos a muchos entre servicios e imágenes de galería. Permite múltiples imágenes por servicio y reutilización de imágenes (mismo patrón que habitaciones)';
COMMENT ON COLUMN servicios_imagenes.servicio_id IS 'ID del servicio (FK a servicios)';
COMMENT ON COLUMN servicios_imagenes.imagen_id IS 'ID de la imagen (FK a imagenes_galeria)';
COMMENT ON COLUMN servicios_imagenes.orden IS 'Orden de visualización de las imágenes (0 = primera)';
COMMENT ON COLUMN servicios_imagenes.es_principal IS 'TRUE si es la imagen principal que se muestra en cards. Solo puede haber UNA imagen principal por servicio';

-- ---------------------------------------------------------------------
-- PASO 2: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_servicios_imagenes_servicio
    ON servicios_imagenes(servicio_id);

CREATE INDEX IF NOT EXISTS idx_servicios_imagenes_imagen
    ON servicios_imagenes(imagen_id);

CREATE INDEX IF NOT EXISTS idx_servicios_imagenes_principal
    ON servicios_imagenes(servicio_id, es_principal)
    WHERE es_principal = TRUE;

CREATE INDEX IF NOT EXISTS idx_servicios_imagenes_orden
    ON servicios_imagenes(servicio_id, orden);

COMMENT ON INDEX idx_servicios_imagenes_servicio IS 'Índice para búsquedas por servicio (JOIN frecuente)';
COMMENT ON INDEX idx_servicios_imagenes_imagen IS 'Índice para búsquedas por imagen (saber dónde está vinculada)';
COMMENT ON INDEX idx_servicios_imagenes_principal IS 'Índice parcial para imagen principal (búsqueda rápida)';
COMMENT ON INDEX idx_servicios_imagenes_orden IS 'Índice compuesto para ordenamiento de imágenes';

-- ---------------------------------------------------------------------
-- PASO 3: TRIGGER PARA GARANTIZAR SOLO UNA IMAGEN PRINCIPAL
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validar_imagen_principal_servicio()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando como principal (TRUE)
    IF NEW.es_principal = TRUE THEN
        -- Desmarcar todas las demás imágenes de este servicio como principal
        UPDATE servicios_imagenes
        SET es_principal = FALSE
        WHERE servicio_id = NEW.servicio_id
          AND id != COALESCE(NEW.id, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_imagen_principal_servicio
BEFORE INSERT OR UPDATE ON servicios_imagenes
FOR EACH ROW
EXECUTE FUNCTION validar_imagen_principal_servicio();

COMMENT ON FUNCTION validar_imagen_principal_servicio() IS 'Trigger que asegura que solo haya UNA imagen principal por servicio. Al marcar una imagen como principal, automáticamente desmarca las demás';

-- ---------------------------------------------------------------------
-- PASO 4: FUNCIÓN HELPER PARA OBTENER IMAGEN PRINCIPAL
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION obtener_imagen_principal_servicio(p_servicio_id INTEGER)
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
    FROM servicios_imagenes si
    INNER JOIN imagenes_galeria ig ON si.imagen_id = ig.id
    WHERE si.servicio_id = p_servicio_id
      AND si.es_principal = TRUE
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
        FROM servicios_imagenes si
        INNER JOIN imagenes_galeria ig ON si.imagen_id = ig.id
        WHERE si.servicio_id = p_servicio_id
          AND ig.activo = TRUE
        ORDER BY si.orden ASC, si.creado_en ASC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_imagen_principal_servicio(INTEGER) IS 'Obtiene la imagen principal de un servicio. Si no hay imagen marcada como principal, devuelve la primera imagen disponible ordenada por orden/fecha';

-- ---------------------------------------------------------------------
-- PASO 5: AGREGAR ANALYZE PARA OPTIMIZACIÓN
-- ---------------------------------------------------------------------
ANALYZE servicios_imagenes;

-- =====================================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================================
DO $$
DECLARE
    v_tabla_existe BOOLEAN;
    v_indices_count INTEGER;
    v_trigger_existe BOOLEAN;
    v_function_existe BOOLEAN;
BEGIN
    -- Verificar tabla
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'servicios_imagenes'
    ) INTO v_tabla_existe;

    -- Contar índices
    SELECT COUNT(*) INTO v_indices_count
    FROM pg_indexes
    WHERE tablename = 'servicios_imagenes';

    -- Verificar trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trigger_validar_imagen_principal_servicio'
    ) INTO v_trigger_existe;

    -- Verificar función
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'validar_imagen_principal_servicio'
    ) INTO v_function_existe;

    -- Mostrar resultados
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN';
    RAISE NOTICE '========================================';

    IF v_tabla_existe THEN
        RAISE NOTICE '✓ Tabla servicios_imagenes creada correctamente';
    ELSE
        RAISE EXCEPTION '✗ ERROR: No se pudo crear la tabla servicios_imagenes';
    END IF;

    RAISE NOTICE '✓ Índices creados: % de 4', v_indices_count;

    IF v_indices_count < 4 THEN
        RAISE WARNING '⚠ Se esperaban 4 índices, se crearon %', v_indices_count;
    END IF;

    IF v_trigger_existe THEN
        RAISE NOTICE '✓ Trigger validar_imagen_principal_servicio instalado';
    ELSE
        RAISE EXCEPTION '✗ ERROR: No se pudo crear el trigger';
    END IF;

    IF v_function_existe THEN
        RAISE NOTICE '✓ Función helper obtener_imagen_principal_servicio creada';
    ELSE
        RAISE EXCEPTION '✗ ERROR: No se pudo crear la función helper';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE ✓';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora puedes ejecutar las queries de prueba.';

END $$;

-- =====================================================================
-- FIN DE LA MIGRACIÓN PRINCIPAL
-- =====================================================================
