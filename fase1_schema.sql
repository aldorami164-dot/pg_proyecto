-- =====================================================================
-- SISTEMA DE GESTIÓN HOTELERA - HOTEL CASA JOSEFA
-- FASE 1: ESQUEMA DE BASE DE DATOS POSTGRESQL
-- =====================================================================
-- Versión: 1.0
-- Fecha: 2025-10-05
-- Base de datos: PostgreSQL (Supabase)
-- =====================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- TABLA 1: roles
-- Propósito: Control de acceso al sistema
-- =====================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('administrador', 'recepcionista')),
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Control de acceso: administrador (control total) y recepcionista (gestión de reservas)';

-- =====================================================================
-- TABLA 2: usuarios
-- Propósito: Autenticación del personal del hotel
-- =====================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Personal del hotel con autenticación JWT manual';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt generado en backend';

-- =====================================================================
-- TABLA 3: tipos_habitacion
-- Propósito: Clasificación de habitaciones por capacidad
-- =====================================================================
CREATE TABLE tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('Individual', 'Doble', 'Triple', 'Familiar')),
    capacidad_maxima INTEGER NOT NULL CHECK (capacidad_maxima > 0),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tipos_habitacion IS 'Tipos predefinidos: Individual, Doble, Triple, Familiar';

-- =====================================================================
-- TABLA 4: habitaciones
-- Propósito: Registro de habitaciones físicas del hotel
-- =====================================================================
CREATE TABLE habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo_habitacion_id INTEGER NOT NULL REFERENCES tipos_habitacion(id) ON DELETE RESTRICT,
    precio_por_noche DECIMAL(10, 2) NOT NULL CHECK (precio_por_noche >= 0),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'limpieza', 'mantenimiento')),
    descripcion TEXT,
    qr_asignado_id INTEGER, -- FK a codigos_qr, se crea después
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE habitaciones IS 'Habitaciones del hotel. Estados automáticos: check-in→ocupada, check-out→disponible. Manuales: limpieza, mantenimiento';
COMMENT ON COLUMN habitaciones.qr_asignado_id IS 'Una habitación solo puede tener UN QR activo. NULL si no tiene QR asignado';

-- =====================================================================
-- TABLA 5: codigos_qr
-- Propósito: Gestión independiente de códigos QR (TABLA CLAVE)
-- =====================================================================
CREATE TABLE codigos_qr (
    id SERIAL PRIMARY KEY,
    codigo UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    url_destino TEXT NOT NULL,
    habitacion_id INTEGER REFERENCES habitaciones(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'sin_asignar' CHECK (estado IN ('sin_asignar', 'asignado', 'inactivo')),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP,
    total_lecturas INTEGER DEFAULT 0,
    ultima_lectura TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE codigos_qr IS 'Gestión independiente de QR. NO se crean automáticamente. Admin genera manualmente desde panel dedicado';
COMMENT ON COLUMN codigos_qr.url_destino IS 'Formato: https://casajosefa.com/habitacion/{numero}';
COMMENT ON COLUMN codigos_qr.estado IS 'sin_asignar: QR en stock | asignado: vinculado a habitación | inactivo: desactivado';

-- Agregar FK de habitaciones a codigos_qr
ALTER TABLE habitaciones
ADD CONSTRAINT fk_habitaciones_qr
FOREIGN KEY (qr_asignado_id) REFERENCES codigos_qr(id) ON DELETE SET NULL;

-- =====================================================================
-- TABLA 6: huespedes
-- Propósito: Registro de clientes del hotel
-- =====================================================================
CREATE TABLE huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    dpi_pasaporte VARCHAR(50),
    email VARCHAR(255),
    telefono VARCHAR(20),
    pais VARCHAR(100),
    direccion TEXT,
    fecha_nacimiento DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE huespedes IS 'Solo nombre es obligatorio. NO detectar duplicados automáticamente. Permite registros rápidos (nombre+fechas) o completos';
COMMENT ON COLUMN huespedes.dpi_pasaporte IS 'Documento de identidad o pasaporte (opcional pero recomendado)';

-- =====================================================================
-- TABLA 7: estados_reserva
-- Propósito: Ciclo de vida de reservas
-- =====================================================================
CREATE TABLE estados_reserva (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    descripcion TEXT,
    color_hex VARCHAR(7) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE estados_reserva IS 'Estados predefinidos: pendiente (sin check-in), confirmada (check-in 12pm), completada (check-out 11am), cancelada';

-- =====================================================================
-- TABLA 8: reservas
-- Propósito: Centralización MANUAL de reservas de múltiples canales
-- =====================================================================
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    huesped_id INTEGER NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id) ON DELETE RESTRICT,
    fecha_checkin DATE NOT NULL,
    fecha_checkout DATE NOT NULL CHECK (fecha_checkout > fecha_checkin),
    numero_noches INTEGER GENERATED ALWAYS AS (fecha_checkout - fecha_checkin) STORED,
    precio_por_noche DECIMAL(10, 2) NOT NULL CHECK (precio_por_noche >= 0),
    precio_total DECIMAL(10, 2) GENERATED ALWAYS AS (precio_por_noche * (fecha_checkout - fecha_checkin)) STORED,
    numero_huespedes INTEGER DEFAULT 1 CHECK (numero_huespedes > 0),
    canal_reserva VARCHAR(20) NOT NULL CHECK (canal_reserva IN ('booking', 'whatsapp', 'facebook', 'telefono', 'presencial')),
    estado_id INTEGER NOT NULL REFERENCES estados_reserva(id) ON DELETE RESTRICT,
    notas TEXT,
    fecha_cancelacion TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    checkin_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    checkout_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reservas IS 'Centraliza reservas YA HECHAS en otras plataformas (Booking, WhatsApp, Facebook). Validación crítica: verificar solapamiento antes de crear/editar';
COMMENT ON COLUMN reservas.canal_reserva IS 'Origen de la reserva: booking, whatsapp, facebook, telefono, presencial';
COMMENT ON COLUMN reservas.notas IS 'Observaciones internas para recepción/administración';
COMMENT ON COLUMN reservas.fecha_cancelacion IS 'Fecha en que se canceló la reserva (si aplica)';

-- =====================================================================
-- TABLA 9: servicios
-- Propósito: Catálogo de servicios del hotel
-- =====================================================================
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('lavanderia', 'sauna', 'limpieza', 'cocina')),
    descripcion TEXT,
    precio DECIMAL(10, 2) DEFAULT 0 CHECK (precio >= 0),
    tiene_costo BOOLEAN NOT NULL,
    horario_inicio TIME,
    horario_fin TIME,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE servicios IS 'Servicios predefinidos. De pago: Lavandería (Q50), Sauna (Q100). Gratuitos: Limpieza extra, Uso de cocina';
COMMENT ON COLUMN servicios.tiene_costo IS 'true: servicio de pago | false: servicio gratuito';

-- =====================================================================
-- TABLA 10: solicitudes_servicios
-- Propósito: Gestión de pedidos desde plataforma QR
-- =====================================================================
CREATE TABLE solicitudes_servicios (
    id SERIAL PRIMARY KEY,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id) ON DELETE RESTRICT,
    servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada')),
    origen VARCHAR(20) DEFAULT 'plataforma_qr' CHECK (origen IN ('plataforma_qr', 'recepcion')),
    notas TEXT,
    atendido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_atencion TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE solicitudes_servicios IS 'Huésped escanea QR→URL contiene número habitación→solicita servicio→trigger crea notificación automática';
COMMENT ON COLUMN solicitudes_servicios.origen IS 'plataforma_qr: desde QR escaneado | recepcion: creada manualmente';

-- =====================================================================
-- TABLA 11: notificaciones
-- Propósito: Sistema de notificaciones en tiempo real
-- =====================================================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('solicitud_servicio', 'alerta', 'informacion')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('alta', 'normal', 'baja')),
    habitacion_numero VARCHAR(10),
    solicitud_servicio_id INTEGER REFERENCES solicitudes_servicios(id) ON DELETE CASCADE,
    leida BOOLEAN DEFAULT FALSE,
    leida_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_lectura TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notificaciones IS 'Creadas automáticamente por trigger al insertar solicitud_servicios. Backend enviará vía WebSocket manual en tiempo real';
COMMENT ON COLUMN notificaciones.prioridad IS 'alta: servicio de pago | normal: servicio gratuito';

-- =====================================================================
-- TABLA 12: reportes_ocupacion
-- Propósito: Almacenamiento de reportes generados
-- =====================================================================
CREATE TABLE reportes_ocupacion (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin >= fecha_inicio),
    tipo_periodo VARCHAR(20) NOT NULL CHECK (tipo_periodo IN ('semanal', 'mensual')),
    total_habitaciones INTEGER NOT NULL,
    habitaciones_ocupadas INTEGER NOT NULL,
    porcentaje_ocupacion DECIMAL(5, 2) NOT NULL,
    total_reservas INTEGER NOT NULL,
    generado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reportes_ocupacion IS 'Reportes históricos generados manualmente. Excluye reservas canceladas. No se eliminan';

-- =====================================================================
-- TABLA 13: contenido_plataforma
-- Propósito: CMS para contenido editable de plataforma QR (bilingüe)
-- =====================================================================
CREATE TABLE contenido_plataforma (
    id SERIAL PRIMARY KEY,
    seccion VARCHAR(50) UNIQUE NOT NULL CHECK (seccion IN ('bienvenida', 'normas_hotel', 'horarios', 'wifi', 'contacto_emergencia')),
    titulo_es VARCHAR(255) NOT NULL,
    titulo_en VARCHAR(255) NOT NULL,
    contenido_es TEXT NOT NULL,
    contenido_en TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    actualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE contenido_plataforma IS 'CMS bilingüe (ES/EN) para plataforma QR. Solo admin puede editar. Secciones predefinidas';

-- =====================================================================
-- TABLA 14: experiencias_turisticas
-- Propósito: Información turística de Santiago Atitlán
-- =====================================================================
CREATE TABLE experiencias_turisticas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('atracciones', 'actividades', 'gastronomia', 'cultura')),
    descripcion TEXT NOT NULL,
    ubicacion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE experiencias_turisticas IS 'Información turística administrada por admin. Destacadas aparecen en home de plataforma QR';

-- =====================================================================
-- TABLA 15: imagenes_galeria
-- Propósito: Galería de fotos del hotel (OPCIONAL)
-- =====================================================================
CREATE TABLE imagenes_galeria (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url_imagen TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('hotel_exterior', 'habitaciones', 'servicios', 'restaurante', 'piscina', 'vistas')),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE imagenes_galeria IS 'Galería administrada por admin. URLs almacenadas en Supabase Storage';

-- =====================================================================
-- TABLA 16: comentarios_huespedes
-- Propósito: Feedback público de huéspedes visible en plataforma QR
-- =====================================================================
CREATE TABLE comentarios_huespedes (
    id SERIAL PRIMARY KEY,
    nombre_huesped VARCHAR(200) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comentarios_huespedes IS 'Comentarios públicos dejados por huéspedes desde plataforma QR. Visibles para otros huéspedes';
COMMENT ON COLUMN comentarios_huespedes.calificacion IS 'Calificación de 1 a 5 estrellas';
