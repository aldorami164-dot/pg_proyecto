-- =====================================================================
-- MIGRACIÓN: AGREGAR TABLA habitaciones_imagenes
-- =====================================================================
-- Fecha: 2025-01-15
-- Propósito: Vincular imágenes de galería con habitaciones
-- =====================================================================
-- INSTRUCCIONES:
-- Esta migración agrega la tabla 17 al esquema de base de datos
-- Para mantener referencia actualizada, agregue esto al final de la
-- SECCIÓN 1 en EJECUTAR_COMPLETO.sql (después de TABLA 16)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA 17: habitaciones_imagenes
-- Propósito: Relación muchos a muchos entre habitaciones e imágenes
-- AGREGADA: 2025-01-15
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitaciones_imagenes (
    id SERIAL PRIMARY KEY,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    imagen_id INTEGER NOT NULL REFERENCES imagenes_galeria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Una habitación no puede tener la misma imagen duplicada
    CONSTRAINT unique_habitacion_imagen UNIQUE(habitacion_id, imagen_id)
);

COMMENT ON TABLE habitaciones_imagenes IS 'Tabla de relación muchos a muchos entre habitaciones e imágenes de galería. Permite múltiples imágenes por habitación y reutilización de imágenes';
COMMENT ON COLUMN habitaciones_imagenes.habitacion_id IS 'ID de la habitación (FK a habitaciones)';
COMMENT ON COLUMN habitaciones_imagenes.imagen_id IS 'ID de la imagen (FK a imagenes_galeria)';
COMMENT ON COLUMN habitaciones_imagenes.orden IS 'Orden de visualización de las imágenes (0 = primera)';
COMMENT ON COLUMN habitaciones_imagenes.es_principal IS 'TRUE si es la imagen principal que se muestra en cards y thumbnails. Solo puede haber UNA imagen principal por habitación';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_habitaciones_imagenes_habitacion
    ON habitaciones_imagenes(habitacion_id);

CREATE INDEX IF NOT EXISTS idx_habitaciones_imagenes_imagen
    ON habitaciones_imagenes(imagen_id);

CREATE INDEX IF NOT EXISTS idx_habitaciones_imagenes_principal
    ON habitaciones_imagenes(habitacion_id, es_principal)
    WHERE es_principal = TRUE;

CREATE INDEX IF NOT EXISTS idx_habitaciones_imagenes_orden
    ON habitaciones_imagenes(habitacion_id, orden);

-- Trigger para garantizar solo UNA imagen principal por habitación
CREATE OR REPLACE FUNCTION validar_imagen_principal_habitacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando como principal (TRUE)
    IF NEW.es_principal = TRUE THEN
        -- Desmarcar todas las demás imágenes de esta habitación como principal
        UPDATE habitaciones_imagenes
        SET es_principal = FALSE
        WHERE habitacion_id = NEW.habitacion_id
          AND id != COALESCE(NEW.id, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_imagen_principal_habitacion
BEFORE INSERT OR UPDATE ON habitaciones_imagenes
FOR EACH ROW
EXECUTE FUNCTION validar_imagen_principal_habitacion();

COMMENT ON FUNCTION validar_imagen_principal_habitacion() IS 'Trigger que asegura que solo haya UNA imagen principal por habitación. Al marcar una imagen como principal, automáticamente desmarca las demás';

-- Función helper para obtener imagen principal de una habitación
CREATE OR REPLACE FUNCTION obtener_imagen_principal_habitacion(p_habitacion_id INTEGER)
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
    FROM habitaciones_imagenes hi
    INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
    WHERE hi.habitacion_id = p_habitacion_id
      AND hi.es_principal = TRUE
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
        FROM habitaciones_imagenes hi
        INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
        WHERE hi.habitacion_id = p_habitacion_id
          AND ig.activo = TRUE
        ORDER BY hi.orden ASC, hi.creado_en ASC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_imagen_principal_habitacion(INTEGER) IS 'Obtiene la imagen principal de una habitación. Si no hay imagen marcada como principal, devuelve la primera imagen disponible ordenada por orden/fecha';

-- Agregar ANALYZE para esta tabla
ANALYZE habitaciones_imagenes;

-- =====================================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habitaciones_imagenes') THEN
        RAISE NOTICE '✓ Tabla habitaciones_imagenes creada correctamente';
        RAISE NOTICE '✓ Índices agregados (4 índices)';
        RAISE NOTICE '✓ Trigger validar_imagen_principal_habitacion instalado';
        RAISE NOTICE '✓ Función helper obtener_imagen_principal_habitacion creada';
        RAISE NOTICE '';
        RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
        RAISE NOTICE 'La tabla 17 (habitaciones_imagenes) ha sido agregada al esquema';
    ELSE
        RAISE EXCEPTION '✗ Error: No se pudo crear la tabla habitaciones_imagenes';
    END IF;
END $$;

-- =====================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================
