-- =====================================================================
-- MIGRACIÓN: SISTEMA DE LUGARES TURÍSTICOS CON IMÁGENES
-- =====================================================================
-- Fecha: 2025-01-15
-- Propósito: Crear sistema completo para lugares turísticos con galería de imágenes
-- Patrón: Espejo del sistema de habitaciones_imagenes
-- =====================================================================
-- INSTRUCCIONES:
-- 1. Copia todo este script
-- 2. Pégalo en Supabase SQL Editor
-- 3. Ejecuta (Run)
-- 4. Verifica que no haya errores
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA 18: lugares_turisticos
-- Propósito: Almacenar información de lugares turísticos de Santiago Atitlán
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lugares_turisticos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    categoria VARCHAR(100), -- ej: 'cultura', 'naturaleza', 'gastronomia', 'aventura'
    url_maps TEXT, -- URL de Google Maps
    telefono VARCHAR(20),
    horario VARCHAR(255),
    precio_entrada DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0, -- Para ordenar en el frontend
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE lugares_turisticos IS 'Lugares turísticos de Santiago Atitlán para mostrar en la plataforma pública';
COMMENT ON COLUMN lugares_turisticos.nombre IS 'Nombre del lugar turístico (ej: Lago Atitlán, Iglesia Parroquial)';
COMMENT ON COLUMN lugares_turisticos.descripcion IS 'Descripción detallada del lugar';
COMMENT ON COLUMN lugares_turisticos.ubicacion IS 'Dirección o ubicación del lugar';
COMMENT ON COLUMN lugares_turisticos.categoria IS 'Categoría del lugar (cultura, naturaleza, gastronomía, aventura)';
COMMENT ON COLUMN lugares_turisticos.url_maps IS 'URL de Google Maps para ubicación';
COMMENT ON COLUMN lugares_turisticos.orden IS 'Orden de visualización en el frontend (menor = primero)';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_lugares_turisticos_activo ON lugares_turisticos(activo);
CREATE INDEX IF NOT EXISTS idx_lugares_turisticos_categoria ON lugares_turisticos(categoria);
CREATE INDEX IF NOT EXISTS idx_lugares_turisticos_orden ON lugares_turisticos(orden);

-- ---------------------------------------------------------------------
-- TABLA 19: lugares_imagenes
-- Propósito: Relación muchos a muchos entre lugares turísticos e imágenes
-- Patrón: Igual que habitaciones_imagenes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lugares_imagenes (
    id SERIAL PRIMARY KEY,
    lugar_id INTEGER NOT NULL REFERENCES lugares_turisticos(id) ON DELETE CASCADE,
    imagen_id INTEGER NOT NULL REFERENCES imagenes_galeria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Un lugar no puede tener la misma imagen duplicada
    CONSTRAINT unique_lugar_imagen UNIQUE(lugar_id, imagen_id)
);

COMMENT ON TABLE lugares_imagenes IS 'Tabla de relación muchos a muchos entre lugares turísticos e imágenes de galería';
COMMENT ON COLUMN lugares_imagenes.lugar_id IS 'ID del lugar turístico (FK a lugares_turisticos)';
COMMENT ON COLUMN lugares_imagenes.imagen_id IS 'ID de la imagen (FK a imagenes_galeria)';
COMMENT ON COLUMN lugares_imagenes.orden IS 'Orden de visualización de las imágenes (0 = primera)';
COMMENT ON COLUMN lugares_imagenes.es_principal IS 'TRUE si es la imagen principal del lugar. Solo puede haber UNA imagen principal por lugar';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_lugares_imagenes_lugar
    ON lugares_imagenes(lugar_id);

CREATE INDEX IF NOT EXISTS idx_lugares_imagenes_imagen
    ON lugares_imagenes(imagen_id);

CREATE INDEX IF NOT EXISTS idx_lugares_imagenes_principal
    ON lugares_imagenes(lugar_id, es_principal)
    WHERE es_principal = TRUE;

CREATE INDEX IF NOT EXISTS idx_lugares_imagenes_orden
    ON lugares_imagenes(lugar_id, orden);

-- ---------------------------------------------------------------------
-- TRIGGER: Garantizar solo UNA imagen principal por lugar
-- Patrón: Igual que habitaciones_imagenes
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validar_imagen_principal_lugar()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando como principal (TRUE)
    IF NEW.es_principal = TRUE THEN
        -- Desmarcar todas las demás imágenes de este lugar como principal
        UPDATE lugares_imagenes
        SET es_principal = FALSE
        WHERE lugar_id = NEW.lugar_id
          AND id != COALESCE(NEW.id, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_imagen_principal_lugar
BEFORE INSERT OR UPDATE ON lugares_imagenes
FOR EACH ROW
EXECUTE FUNCTION validar_imagen_principal_lugar();

COMMENT ON FUNCTION validar_imagen_principal_lugar() IS 'Trigger que asegura que solo haya UNA imagen principal por lugar turístico. Al marcar una imagen como principal, automáticamente desmarca las demás';

-- ---------------------------------------------------------------------
-- FUNCIÓN HELPER: Obtener imagen principal de un lugar
-- Patrón: Igual que habitaciones
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION obtener_imagen_principal_lugar(p_lugar_id INTEGER)
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
    FROM lugares_imagenes li
    INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
    WHERE li.lugar_id = p_lugar_id
      AND li.es_principal = TRUE
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
        FROM lugares_imagenes li
        INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
        WHERE li.lugar_id = p_lugar_id
          AND ig.activo = TRUE
        ORDER BY li.orden ASC, li.creado_en ASC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_imagen_principal_lugar(INTEGER) IS 'Obtiene la imagen principal de un lugar turístico. Si no hay imagen marcada como principal, devuelve la primera imagen disponible ordenada por orden/fecha';

-- ---------------------------------------------------------------------
-- FUNCIÓN: Trigger para actualizar timestamp
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_timestamp_lugares()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_timestamp_lugares
BEFORE UPDATE ON lugares_turisticos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_lugares();

-- ---------------------------------------------------------------------
-- DATOS DE EJEMPLO: 8 Lugares Turísticos de Santiago Atitlán
-- (Puedes modificar o eliminar estos datos según tus necesidades)
-- ---------------------------------------------------------------------
INSERT INTO lugares_turisticos (nombre, descripcion, ubicacion, categoria, orden, activo) VALUES
(
    'Lago de Atitlán',
    'Uno de los lagos más hermosos del mundo, rodeado de volcanes y pueblos mayas. Ideal para kayak, natación y paseos en lancha.',
    'Santiago Atitlán, Sololá',
    'naturaleza',
    1,
    TRUE
),
(
    'Iglesia Parroquial Santiago Apóstol',
    'Iglesia católica histórica con arquitectura colonial y sincretismo religioso maya. Lugar sagrado para la comunidad Tz''utujil.',
    'Centro de Santiago Atitlán',
    'cultura',
    2,
    TRUE
),
(
    'Cofradía de Maximón',
    'Sitio sagrado donde se venera a Maximón (San Simón), deidad maya-cristiana única de Santiago Atitlán. Experiencia cultural auténtica.',
    'Santiago Atitlán, Sololá',
    'cultura',
    3,
    TRUE
),
(
    'Volcán San Pedro',
    'Volcán de 3,020 metros con sendero de trekking. Vista panorámica del Lago Atitlán desde la cima. Ideal para excursionistas.',
    'San Pedro La Laguna (cerca de Santiago)',
    'aventura',
    4,
    TRUE
),
(
    'Volcán Tolimán',
    'Volcán gemelo con el Atitlán, 3,158 metros de altura. Ascenso desafiante con vistas espectaculares del lago y la región.',
    'Santiago Atitlán, Sololá',
    'aventura',
    5,
    TRUE
),
(
    'Mercado Municipal',
    'Mercado tradicional con artesanías mayas, textiles hechos a mano, frutas locales y comida típica. Experiencia cultural auténtica.',
    'Centro de Santiago Atitlán',
    'gastronomia',
    6,
    TRUE
),
(
    'Parque Central',
    'Plaza principal del pueblo con vista al lago, rodeada de tiendas locales y restaurantes. Punto de encuentro comunitario.',
    'Centro de Santiago Atitlán',
    'cultura',
    7,
    TRUE
),
(
    'Cooperativas de Tejido Maya',
    'Talleres donde mujeres Tz''utujil elaboran huipiles y textiles tradicionales. Tour educativo sobre técnicas ancestrales de tejido.',
    'Santiago Atitlán, Sololá',
    'cultura',
    8,
    TRUE
);

-- Agregar ANALYZE para optimización
ANALYZE lugares_turisticos;
ANALYZE lugares_imagenes;

-- =====================================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================================
DO $$
DECLARE
    total_lugares INTEGER;
BEGIN
    -- Verificar que las tablas se crearon
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lugares_turisticos') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lugares_imagenes') THEN

        RAISE NOTICE '✓ Tabla lugares_turisticos creada correctamente';
        RAISE NOTICE '✓ Tabla lugares_imagenes creada correctamente';
        RAISE NOTICE '✓ Índices agregados (7 índices en total)';
        RAISE NOTICE '✓ Trigger validar_imagen_principal_lugar instalado';
        RAISE NOTICE '✓ Función helper obtener_imagen_principal_lugar creada';
        RAISE NOTICE '✓ Trigger actualizar_timestamp_lugares instalado';

        -- Contar lugares insertados
        SELECT COUNT(*) INTO total_lugares FROM lugares_turisticos;
        RAISE NOTICE '✓ % lugares turísticos insertados como datos de ejemplo', total_lugares;

        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════════════════════';
        RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
        RAISE NOTICE '═══════════════════════════════════════════════════════';
        RAISE NOTICE 'Tablas agregadas al esquema:';
        RAISE NOTICE '  • TABLA 18: lugares_turisticos';
        RAISE NOTICE '  • TABLA 19: lugares_imagenes';
        RAISE NOTICE '';
        RAISE NOTICE 'Puedes modificar los datos de ejemplo ejecutando:';
        RAISE NOTICE '  UPDATE lugares_turisticos SET nombre = ''...'', descripcion = ''...'' WHERE id = 1;';
        RAISE NOTICE '';
        RAISE NOTICE 'O eliminar todos los datos de ejemplo:';
        RAISE NOTICE '  DELETE FROM lugares_turisticos;';

    ELSE
        RAISE EXCEPTION '✗ Error: No se pudieron crear las tablas';
    END IF;
END $$;

-- =====================================================================
-- CONSULTAS ÚTILES PARA VERIFICAR
-- =====================================================================

-- Ver todos los lugares turísticos
-- SELECT * FROM lugares_turisticos ORDER BY orden;

-- Ver lugares por categoría
-- SELECT categoria, COUNT(*) as total FROM lugares_turisticos GROUP BY categoria;

-- Ver imagen principal de un lugar (usando la función helper)
-- SELECT * FROM obtener_imagen_principal_lugar(1);

-- Ver todas las vinculaciones lugar-imagen
-- SELECT
--   lt.nombre as lugar,
--   ig.titulo as imagen,
--   li.es_principal,
--   li.orden
-- FROM lugares_imagenes li
-- INNER JOIN lugares_turisticos lt ON li.lugar_id = lt.id
-- INNER JOIN imagenes_galeria ig ON li.imagen_id = ig.id
-- ORDER BY lt.nombre, li.es_principal DESC, li.orden ASC;

-- =====================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================
