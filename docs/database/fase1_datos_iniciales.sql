-- =====================================================================
-- DATOS INICIALES DEL SISTEMA
-- =====================================================================

-- =====================================================================
-- 1. ROLES
-- =====================================================================
INSERT INTO roles (nombre, descripcion) VALUES
('administrador', 'Control total del sistema: gestión de habitaciones, precios, usuarios, QR y reportes'),
('recepcionista', 'Gestión de reservas y servicios: crear/editar reservas, cambiar estados, atender solicitudes');

-- =====================================================================
-- 2. ESTADOS DE RESERVA
-- =====================================================================
INSERT INTO estados_reserva (nombre, descripcion, color_hex) VALUES
('pendiente', 'Reserva registrada en el sistema, sin check-in realizado', '#FFA500'),
('confirmada', 'Check-in realizado a las 12:00 PM, huésped en habitación', '#00FF00'),
('completada', 'Check-out realizado a las 11:00 AM, reserva finalizada', '#0000FF'),
('cancelada', 'Reserva cancelada por el huésped en plataforma externa', '#FF0000');

-- =====================================================================
-- 3. TIPOS DE HABITACIÓN
-- =====================================================================
INSERT INTO tipos_habitacion (nombre, capacidad_maxima, descripcion) VALUES
('Individual', 1, 'Habitación para una persona con cama individual'),
('Doble', 2, 'Habitación con cama doble o dos camas individuales'),
('Triple', 3, 'Habitación amplia con capacidad para tres personas'),
('Familiar', 6, 'Suite familiar con capacidad para hasta seis personas');

-- =====================================================================
-- 4. SERVICIOS PREDEFINIDOS
-- =====================================================================
INSERT INTO servicios (nombre, categoria, descripcion, precio, tiene_costo, horario_inicio, horario_fin) VALUES
(
    'Servicio de Lavandería',
    'lavanderia',
    'Lavado, secado y planchado de prendas',
    50.00,
    TRUE,
    '08:00',
    '18:00'
),
(
    'Uso de Sauna',
    'sauna',
    'Acceso al sauna del hotel con reserva previa',
    100.00,
    TRUE,
    '10:00',
    '20:00'
),
(
    'Limpieza Extra',
    'limpieza',
    'Limpieza adicional de habitación a solicitud del huésped',
    0.00,
    FALSE,
    '09:00',
    '17:00'
),
(
    'Uso de Cocina',
    'cocina',
    'Acceso a cocina compartida del hotel',
    0.00,
    FALSE,
    '06:00',
    '22:00'
);

-- =====================================================================
-- 5. CONTENIDO DE PLATAFORMA QR (Bilingüe ES/EN)
-- =====================================================================

-- 5.1 Bienvenida
INSERT INTO contenido_plataforma (
    seccion,
    titulo_es,
    titulo_en,
    contenido_es,
    contenido_en,
    orden
) VALUES (
    'bienvenida',
    '¡Bienvenido a Hotel Casa Josefa!',
    'Welcome to Hotel Casa Josefa!',
    'Nos complace recibirle en nuestro hotel boutique en el corazón de Santiago Atitlán. Esperamos que su estadía sea memorable y disfrute de la belleza del Lago Atitlán y la cultura maya local.',
    'We are pleased to welcome you to our boutique hotel in the heart of Santiago Atitlán. We hope your stay will be memorable and that you enjoy the beauty of Lake Atitlán and the local Mayan culture.',
    1
);

-- 5.2 Normas del Hotel
INSERT INTO contenido_plataforma (
    seccion,
    titulo_es,
    titulo_en,
    contenido_es,
    contenido_en,
    orden
) VALUES (
    'normas_hotel',
    'Normas y Horarios del Hotel',
    'Hotel Rules and Schedules',
    E'• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Horario de silencio: 10:00 PM - 7:00 AM\n• No se permiten mascotas\n• Prohibido fumar en habitaciones\n• Mantener las áreas comunes limpias\n• Respetar la cultura y costumbres locales',
    E'• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Quiet hours: 10:00 PM - 7:00 AM\n• Pets not allowed\n• No smoking in rooms\n• Keep common areas clean\n• Respect local culture and customs',
    2
);

-- 5.3 Horarios de Servicios
INSERT INTO contenido_plataforma (
    seccion,
    titulo_es,
    titulo_en,
    contenido_es,
    contenido_en,
    orden
) VALUES (
    'horarios',
    'Horarios de Servicios',
    'Service Hours',
    E'• Recepción: 24 horas\n• Desayuno: 7:00 AM - 10:00 AM\n• Sauna: 10:00 AM - 8:00 PM (reservar con anticipación)\n• Cocina compartida: 6:00 AM - 10:00 PM\n• Lavandería: 8:00 AM - 6:00 PM',
    E'• Reception: 24 hours\n• Breakfast: 7:00 AM - 10:00 AM\n• Sauna: 10:00 AM - 8:00 PM (reservation required)\n• Shared kitchen: 6:00 AM - 10:00 PM\n• Laundry: 8:00 AM - 6:00 PM',
    3
);

-- 5.4 WiFi
INSERT INTO contenido_plataforma (
    seccion,
    titulo_es,
    titulo_en,
    contenido_es,
    contenido_en,
    orden
) VALUES (
    'wifi',
    'Información de WiFi',
    'WiFi Information',
    E'Red WiFi: CasaJosefa_Guest\nContraseña: Atitlan2025\n\nLa conexión está disponible en todas las áreas del hotel. Si tiene problemas de conexión, por favor contacte a recepción.',
    E'WiFi Network: CasaJosefa_Guest\nPassword: Atitlan2025\n\nConnection is available in all areas of the hotel. If you have connection problems, please contact reception.',
    4
);

-- 5.5 Contacto de Emergencia
INSERT INTO contenido_plataforma (
    seccion,
    titulo_es,
    titulo_en,
    contenido_es,
    contenido_en,
    orden
) VALUES (
    'contacto_emergencia',
    'Contactos de Emergencia',
    'Emergency Contacts',
    E'• Recepción Hotel: +502 1234-5678\n• Emergencias Médicas: 123\n• Bomberos: 122\n• Policía Nacional: 110\n• Hospital Atitlán: +502 7721-2201\n• Centro de Salud Santiago: +502 7721-7272',
    E'• Hotel Reception: +502 1234-5678\n• Medical Emergencies: 123\n• Fire Department: 122\n• National Police: 110\n• Atitlán Hospital: +502 7721-2201\n• Santiago Health Center: +502 7721-7272',
    5
);

-- =====================================================================
-- 6. EXPERIENCIAS TURÍSTICAS DE SANTIAGO ATITLÁN
-- =====================================================================

INSERT INTO experiencias_turisticas (
    nombre,
    categoria,
    descripcion,
    ubicacion,
    destacado
) VALUES
(
    'Tour en Lancha por el Lago Atitlán',
    'actividades',
    'Recorrido en lancha por el majestuoso Lago Atitlán visitando los pueblos cercanos de San Pedro, San Juan y Santa Cruz. Duración: 3-4 horas. Incluye guía local.',
    'Embarcadero principal de Santiago Atitlán',
    TRUE
),
(
    'Ceremonia Maya Tradicional',
    'cultura',
    'Participe en una auténtica ceremonia maya dirigida por un sacerdote maya local (Ajq''ij). Experimente la espiritualidad ancestral y aprenda sobre el calendario maya y las tradiciones sagradas.',
    'Centro Ceremonial Maya - Santiago Atitlán',
    TRUE
),
(
    'Taller de Textiles Tradicionales',
    'cultura',
    'Aprenda el arte del tejido maya en telar de cintura con maestras artesanas locales. Conozca los significados de los símbolos y colores tradicionales. Incluye creación de su propia pieza.',
    'Cooperativa de Tejedoras Tz''utujil',
    TRUE
),
(
    'Iglesia de Santiago Apóstol',
    'atracciones',
    'Visite la histórica iglesia colonial que alberga la figura de Maximón (Rilaj Maam), una deidad maya-católica única de Santiago Atitlán. Arquitectura colonial con elementos mayas.',
    'Centro de Santiago Atitlán, frente al parque central',
    FALSE
),
(
    'Mercado Local de Santiago',
    'gastronomia',
    'Explore el colorido mercado local lleno de textiles, artesanías, frutas y verduras frescas. Ideal para comprar souvenirs auténticos y probar comida típica guatemalteca.',
    'Mercado Municipal de Santiago Atitlán',
    FALSE
),
(
    'Senderismo al Mirador Indian Nose',
    'actividades',
    'Caminata de 2-3 horas hasta el mirador con forma de nariz que ofrece vistas panorámicas espectaculares del lago y los volcanes. Mejor al amanecer.',
    'Inicio del sendero en Santa Clara La Laguna',
    FALSE
);

-- =====================================================================
-- 7. USUARIO ADMINISTRADOR POR DEFECTO
-- =====================================================================
-- IMPORTANTE: Este password debe ser cambiado inmediatamente en producción
-- Password: Admin123! (hash bcrypt generado con cost factor 10)

INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id) VALUES
(
    'Administrador',
    'Sistema',
    'admin@casajosefa.com',
    '$2b$10$rKXQvN8aN7FO5HhGvz4qauBKZPGZZL.YOYgE7c.Wd1qBF/3vLz8G.',  -- Password: Admin123!
    (SELECT id FROM roles WHERE nombre = 'administrador')
);

-- =====================================================================
-- NOTAS IMPORTANTES PARA PRODUCCIÓN
-- =====================================================================
-- 1. Cambiar inmediatamente el password del usuario administrador
-- 2. Crear usuarios reales del personal (recepcionistas)
-- 3. Crear habitaciones reales del hotel con precios actualizados
-- 4. Actualizar números de teléfono de emergencia en contenido_plataforma
-- 5. Actualizar red WiFi y contraseña en contenido_plataforma
-- 6. Revisar y ajustar horarios de servicios según operación real
-- 7. Agregar imágenes a la galería usando Supabase Storage
-- 8. Personalizar experiencias turísticas según acuerdos locales
