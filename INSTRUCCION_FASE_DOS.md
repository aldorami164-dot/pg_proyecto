# SISTEMA DE GESTIÓN HOTELERA - HOTEL CASA JOSEFA
## FASE 2: BACKEND API REST + WEBSOCKETS

### CONTEXTO DEL PROYECTO
Continuación de Fase 1 (Base de datos PostgreSQL completada e instalada en Supabase).

**Sistema de gestión hotelera con dos módulos:**
1. **Módulo Gestión Habitacional (Interno):** API para centralización manual de reservas
2. **Módulo Plataforma QR (Público):** API pública para información y servicios vía QR

---

## STACK TECNOLÓGICO CONFIRMADO

### Backend
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js 4.x
- **Base de datos:** PostgreSQL vía Supabase (conexión directa con driver `pg`)
- **Autenticación:** JWT manual (jsonwebtoken) - NO usar Supabase Auth
- **WebSockets:** ws (manual) - NO usar Supabase Realtime
- **Storage:** Supabase Storage (para imágenes de galería)
- **Validación:** Joi
- **Hash passwords:** bcrypt

### Librerías Requeridas
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "ws": "^8.14.2",
    "@supabase/supabase-js": "^2.38.4",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "cookie-parser": "^1.4.6",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## ARQUITECTURA DEL PROYECTO

### Estructura de Carpetas
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuración PostgreSQL (pg)
│   │   ├── supabase.js         # Cliente Supabase (solo para Storage)
│   │   └── jwt.js              # Configuración JWT
│   ├── middleware/
│   │   ├── auth.js             # Verificación JWT y permisos
│   │   ├── validation.js       # Validación Joi
│   │   ├── errorHandler.js     # Manejo global de errores
│   │   └── rateLimit.js        # Rate limiting
│   ├── routes/
│   │   ├── auth.routes.js      # Login, logout, refresh token
│   │   ├── reservas.routes.js  # CRUD reservas + validación
│   │   ├── habitaciones.routes.js
│   │   ├── qr.routes.js        # Gestión QR (CRÍTICO)
│   │   ├── servicios.routes.js
│   │   ├── solicitudes.routes.js
│   │   ├── notificaciones.routes.js
│   │   ├── reportes.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── plataforma.routes.js # API pública (sin auth)
│   │   └── galeria.routes.js   # Supabase Storage
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── reservas.controller.js
│   │   ├── habitaciones.controller.js
│   │   ├── qr.controller.js
│   │   ├── servicios.controller.js
│   │   ├── solicitudes.controller.js
│   │   ├── notificaciones.controller.js
│   │   ├── reportes.controller.js
│   │   ├── usuarios.controller.js
│   │   ├── plataforma.controller.js
│   │   └── galeria.controller.js
│   ├── services/
│   │   ├── database.service.js  # Queries PostgreSQL
│   │   ├── auth.service.js      # Lógica JWT
│   │   └── storage.service.js   # Supabase Storage
│   ├── websocket/
│   │   └── notificaciones.ws.js # WebSocket server
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── reservas.validator.js
│   │   └── ...
│   ├── utils/
│   │   ├── response.js          # Respuestas estandarizadas
│   │   └── logger.js            # Logs
│   └── app.js                   # Configuración Express
├── .env.example
├── .env
├── package.json
└── server.js                    # Punto de entrada
```

---

## VARIABLES DE ENTORNO (.env)

```env
# Servidor
NODE_ENV=development
PORT=3000

# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DB_HOST=db.[PROJECT_REF].supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=postgres
DB_SSL=true

# JWT
JWT_SECRET=tu_secret_key_muy_seguro_aqui_256_bits
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=otro_secret_diferente_para_refresh
JWT_REFRESH_EXPIRES_IN=30d

# Supabase (solo para Storage)
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key

# WebSocket
WS_PORT=3001

# CORS
CORS_ORIGIN=http://localhost:5173,https://casajosefa.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## ENDPOINTS A IMPLEMENTAR

### 🔐 Autenticación (auth.routes.js)

#### POST /api/auth/login
**Propósito:** Login con email + password
**Body:**
```json
{
  "email": "admin@casajosefa.com",
  "password": "Admin123!"
}
```
**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Administrador",
      "apellido": "Sistema",
      "email": "admin@casajosefa.com",
      "rol": "administrador"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Lógica:**
- Verificar email existe
- Verificar usuario activo
- Comparar password con bcrypt
- Generar accessToken (7 días) y refreshToken (30 días)
- Actualizar campo `ultimo_acceso`

---

#### POST /api/auth/refresh
**Propósito:** Renovar accessToken usando refreshToken
**Headers:** `Authorization: Bearer {refreshToken}`
**Respuesta:** Nuevo accessToken

---

#### POST /api/auth/logout
**Propósito:** Invalidar tokens (opcional: blacklist)
**Headers:** `Authorization: Bearer {accessToken}`

---

#### GET /api/auth/me
**Propósito:** Obtener usuario actual
**Headers:** `Authorization: Bearer {accessToken}`
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@casajosefa.com",
    "rol": "administrador"
  }
}
```

---

### 🛏️ Reservas (reservas.routes.js) - MÓDULO CRÍTICO

#### GET /api/reservas
**Autenticación:** Requerida (admin/recepcionista)
**Query params:**
- `estado` (pendiente|confirmada|completada|cancelada)
- `canal` (booking|whatsapp|facebook|telefono|presencial)
- `fecha_desde` (DATE)
- `fecha_hasta` (DATE)
- `habitacion_id` (INT)
- `page` (default: 1)
- `limit` (default: 20)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "reservas": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

#### POST /api/reservas
**Autenticación:** Requerida (admin/recepcionista)
**Body:**
```json
{
  "huesped": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "dpi_pasaporte": "1234567890101",
    "email": "juan@email.com",
    "telefono": "12345678",
    "pais": "Guatemala"
  },
  "habitacion_id": 1,
  "fecha_checkin": "2025-10-10",
  "fecha_checkout": "2025-10-15",
  "numero_huespedes": 2,
  "canal_reserva": "booking",
  "notas": "Cliente prefiere habitación con vista al lago"
}
```

**Lógica CRÍTICA:**
1. Validar datos con Joi
2. Crear huésped (o usar existente si se proporciona `huesped_id`)
3. Obtener `precio_por_noche` de la habitación
4. **LLAMAR función PostgreSQL `validar_solapamiento_reservas()`**
5. Si retorna FALSE → Error 409 "Habitación no disponible en esas fechas"
6. Si retorna TRUE → INSERT reserva con estado='pendiente'
7. Código de reserva se genera automáticamente por trigger
8. Retornar reserva creada con código

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo_reserva": "RES-20251005-000001",
    "huesped": {...},
    "habitacion": {...},
    "fecha_checkin": "2025-10-10",
    "fecha_checkout": "2025-10-15",
    "numero_noches": 5,
    "precio_total": 1250.00,
    "estado": "pendiente"
  }
}
```

---

#### PUT /api/reservas/:id
**Autenticación:** Requerida (admin/recepcionista)
**Body:** Campos editables
```json
{
  "fecha_checkin": "2025-10-11",
  "fecha_checkout": "2025-10-16",
  "notas": "Cliente solicita late checkout"
}
```

**Lógica CRÍTICA:**
- Validar que reserva no esté completada o cancelada
- Si cambian fechas o habitación → **LLAMAR `validar_solapamiento_reservas(id_reserva)`**
- Si hay solapamiento → Error 409
- Si OK → UPDATE

---

#### PATCH /api/reservas/:id/estado
**Autenticación:** Requerida (admin/recepcionista)
**Body:**
```json
{
  "estado": "confirmada"  // pendiente|confirmada|completada|cancelada
}
```

**Lógica:**
- Validar transiciones válidas:
  - pendiente → confirmada (check-in)
  - confirmada → completada (check-out)
  - pendiente/confirmada → cancelada
- UPDATE estado_id
- **Trigger automático cambiará estado de habitación**
- Si estado='cancelada' → actualizar `fecha_cancelacion`
- Registrar `checkin_por` o `checkout_por` según corresponda

---

#### DELETE /api/reservas/:id
**NO IMPLEMENTAR** - Las reservas no se eliminan, solo se cancelan

---

#### GET /api/reservas/disponibilidad
**Autenticación:** Opcional (útil para frontend público)
**Query params:**
- `fecha_checkin` (required)
- `fecha_checkout` (required)
- `tipo_habitacion_id` (optional)

**Lógica:**
- Buscar habitaciones que NO tengan reservas activas en ese rango
- Usar función `validar_solapamiento_reservas()` por cada habitación

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "disponibles": [
      {
        "id": 1,
        "numero": "101",
        "tipo": "Doble",
        "precio_por_noche": 250.00
      }
    ]
  }
}
```

---

### 🏠 Habitaciones (habitaciones.routes.js)

#### GET /api/habitaciones
**Autenticación:** Requerida (admin/recepcionista)
**Query params:** `estado`, `tipo_habitacion_id`, `activo`

#### POST /api/habitaciones
**Autenticación:** Requerida (SOLO admin)
**Body:**
```json
{
  "numero": "101",
  "tipo_habitacion_id": 2,
  "precio_por_noche": 250.00,
  "descripcion": "Habitación con vista al lago"
}
```
**IMPORTANTE:** NO generar QR automáticamente

#### PUT /api/habitaciones/:id
**Autenticación:** Requerida (SOLO admin)
**Campos editables:** `precio_por_noche`, `descripcion`

#### PATCH /api/habitaciones/:id/estado
**Autenticación:** Requerida (admin/recepcionista)
**Body:** `{"estado": "limpieza"}` (limpieza|mantenimiento|disponible)
**Validación:** NO permitir cambio a 'ocupada' manualmente (solo via trigger)

---

### 📱 Códigos QR (qr.routes.js) - MÓDULO CLAVE

#### GET /api/qr
**Autenticación:** Requerida (SOLO admin)
**Query params:** `estado` (sin_asignar|asignado|inactivo)
**Respuesta:** Lista de QR con info de habitación asignada (si aplica)

---

#### POST /api/qr/generar
**Autenticación:** Requerida (SOLO admin)
**Body:**
```json
{
  "cantidad": 10  // Generar 10 QR en stock
}
```

**Lógica:**
- Loop `cantidad` veces
- INSERT en `codigos_qr` con:
  - `codigo`: UUID generado automáticamente por PostgreSQL
  - `url_destino`: `https://casajosefa.com/habitacion/PENDIENTE`
  - `estado`: 'sin_asignar'
  - `creado_por`: ID del usuario actual
- Retornar array de QR generados

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "generados": 10,
    "codigos_qr": [
      {
        "id": 1,
        "codigo": "550e8400-e29b-41d4-a716-446655440000",
        "url_destino": "https://casajosefa.com/habitacion/PENDIENTE",
        "estado": "sin_asignar"
      }
    ]
  }
}
```

---

#### PATCH /api/qr/:id/asignar
**Autenticación:** Requerida (SOLO admin)
**Body:**
```json
{
  "habitacion_id": 1
}
```

**Lógica CRÍTICA:**
1. Verificar QR existe y está en estado 'sin_asignar' o 'inactivo'
2. Obtener `numero` de habitación
3. Verificar habitación NO tiene qr_asignado_id activo
4. UPDATE `codigos_qr`:
   - `habitacion_id` = nuevo ID
   - `url_destino` = `https://casajosefa.com/habitacion/{numero}`
   - `estado` = 'asignado'
   - `fecha_asignacion` = CURRENT_TIMESTAMP
5. UPDATE `habitaciones` SET `qr_asignado_id` = QR ID
6. Retornar QR actualizado

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "550e8400-...",
    "url_destino": "https://casajosefa.com/habitacion/101",
    "habitacion": {
      "id": 1,
      "numero": "101"
    },
    "estado": "asignado",
    "fecha_asignacion": "2025-10-05T10:30:00Z"
  }
}
```

---

#### PATCH /api/qr/:id/desasignar
**Autenticación:** Requerida (SOLO admin)

**Lógica:**
1. UPDATE `habitaciones` SET `qr_asignado_id` = NULL WHERE qr_asignado_id = :id
2. UPDATE `codigos_qr`:
   - `habitacion_id` = NULL
   - `url_destino` = `https://casajosefa.com/habitacion/PENDIENTE`
   - `estado` = 'sin_asignar'

---

#### GET /api/qr/:codigo/habitacion (PÚBLICO)
**Autenticación:** NO requerida
**Propósito:** Obtener info de habitación al escanear QR

**Lógica:**
1. Buscar QR por UUID `codigo`
2. Si no existe o está inactivo → Error 404
3. UPDATE `total_lecturas` += 1, `ultima_lectura` = NOW()
4. Retornar info de habitación

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "habitacion": {
      "id": 1,
      "numero": "101",
      "tipo": "Doble"
    },
    "mensaje_bienvenida": "¡Bienvenido a Hotel Casa Josefa!"
  }
}
```

---

### 🛎️ Solicitudes de Servicio (solicitudes.routes.js)

#### GET /api/solicitudes
**Autenticación:** Requerida (admin/recepcionista)
**Query params:** `estado` (pendiente|completada), `habitacion_id`

#### POST /api/solicitudes (PÚBLICO para plataforma QR)
**Autenticación:** NO requerida
**Body:**
```json
{
  "habitacion_id": 1,
  "servicio_id": 2,
  "origen": "plataforma_qr",
  "notas": "Preferiblemente antes de las 3pm"
}
```

**Lógica:**
- INSERT en `solicitudes_servicios`
- **Trigger automático creará notificación**
- **WebSocket enviará notificación a recepción en tiempo real**

#### PATCH /api/solicitudes/:id/completar
**Autenticación:** Requerida (admin/recepcionista)

**Lógica:**
- UPDATE `estado` = 'completada'
- Registrar `atendido_por` = usuario actual
- `fecha_atencion` = NOW()

---

### 🔔 Notificaciones (notificaciones.routes.js)

#### GET /api/notificaciones
**Autenticación:** Requerida (admin/recepcionista)
**Query params:**
- `leida` (true|false)
- `tipo` (solicitud_servicio|alerta|informacion)
- `limit` (default: 50)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id": 1,
        "tipo": "solicitud_servicio",
        "titulo": "Nueva solicitud de servicio",
        "mensaje": "Habitación 101 solicita: Servicio de Lavandería",
        "prioridad": "alta",
        "habitacion_numero": "101",
        "leida": false,
        "creado_en": "2025-10-05T10:30:00Z"
      }
    ],
    "no_leidas": 5
  }
}
```

#### PATCH /api/notificaciones/:id/leer
**Autenticación:** Requerida (admin/recepcionista)

**Lógica:**
- UPDATE `leida` = true
- `leida_por` = usuario actual
- `fecha_lectura` = NOW()

---

### 🌐 WebSocket - Notificaciones en Tiempo Real

#### Conexión: ws://localhost:3001

**Autenticación:**
```javascript
// Cliente envía token al conectar
ws.send(JSON.stringify({
  type: 'auth',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}));
```

**Servidor valida JWT y almacena conexión:**
```javascript
const clients = new Map(); // userId -> ws connection
```

**Cuando se crea solicitud_servicio (trigger inserta notificación):**
```javascript
// Backend escucha INSERT en notificaciones (polling cada 2 seg o pg-listen)
// Al detectar nueva notificación:
clients.forEach((ws, userId) => {
  if (tienePermisoRecepcion(userId)) {
    ws.send(JSON.stringify({
      type: 'nueva_notificacion',
      data: {
        id: 1,
        mensaje: "Habitación 101 solicita: Lavandería",
        prioridad: "alta"
      }
    }));
  }
});
```

**Implementación sugerida:**
- Usar biblioteca `ws`
- Polling cada 2 segundos a tabla `notificaciones` WHERE `leida=false` AND `creado_en > ultima_revision`
- Alternativa: Usar `pg-listen` para escuchar cambios en tiempo real

---

### 📊 Reportes (reportes.routes.js)

#### POST /api/reportes/ocupacion
**Autenticación:** Requerida (admin/recepcionista)
**Body:**
```json
{
  "fecha_inicio": "2025-10-01",
  "fecha_fin": "2025-10-07",
  "tipo_periodo": "semanal"
}
```

**Lógica:**
- Validar fechas
- LLAMAR función PostgreSQL `generar_reporte_ocupacion()`
- Retornar ID del reporte creado + métricas

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "reporte_id": 1,
    "fecha_inicio": "2025-10-01",
    "fecha_fin": "2025-10-07",
    "tipo_periodo": "semanal",
    "total_habitaciones": 20,
    "habitaciones_ocupadas": 15,
    "porcentaje_ocupacion": 75.00,
    "total_reservas": 18
  }
}
```

#### GET /api/reportes/ocupacion
**Autenticación:** Requerida (admin/recepcionista)
**Query params:** `tipo_periodo`, `fecha_desde`, `fecha_hasta`
**Respuesta:** Lista de reportes históricos

---

### 👥 Usuarios (usuarios.routes.js)

#### GET /api/usuarios
**Autenticación:** Requerida (SOLO admin)

#### POST /api/usuarios
**Autenticación:** Requerida (SOLO admin)
**Body:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "maria@casajosefa.com",
  "password": "Password123!",
  "rol_id": 2
}
```

**Lógica:**
- Hash password con bcrypt (cost factor 10)
- INSERT usuario

#### PUT /api/usuarios/:id
**Autenticación:** Requerida (SOLO admin)

#### PATCH /api/usuarios/:id/toggle-activo
**Autenticación:** Requerida (SOLO admin)
**Lógica:** Alternar campo `activo` (no eliminar usuario)

---

### 🌍 Plataforma Pública (plataforma.routes.js) - SIN AUTENTICACIÓN

#### GET /api/plataforma/contenido
**Query params:** `idioma` (es|en)
**Respuesta:** Contenido CMS filtrado por idioma

```json
{
  "success": true,
  "data": {
    "contenido": [
      {
        "seccion": "bienvenida",
        "titulo": "¡Bienvenido a Hotel Casa Josefa!",
        "contenido": "Nos complace recibirle...",
        "orden": 1
      }
    ]
  }
}
```

#### GET /api/plataforma/experiencias
**Query params:** `categoria`, `destacado` (true|false)
**Respuesta:** Experiencias turísticas activas

#### GET /api/plataforma/servicios
**Respuesta:** Servicios disponibles (activos)

```json
{
  "success": true,
  "data": {
    "servicios": [
      {
        "id": 1,
        "nombre": "Servicio de Lavandería",
        "descripcion": "Lavado, secado y planchado",
        "precio": 50.00,
        "tiene_costo": true,
        "horario": "08:00 - 18:00"
      }
    ]
  }
}
```

#### POST /api/plataforma/comentarios
**Body:**
```json
{
  "nombre_huesped": "Juan Pérez",
  "comentario": "Excelente servicio y atención",
  "calificacion": 5
}
```

**Lógica:**
- Validar calificación (1-5)
- INSERT con `activo=true`

#### GET /api/plataforma/comentarios
**Query params:** `limit` (default: 10)
**Respuesta:** Comentarios activos aprobados

---

### 🖼️ Galería (galeria.routes.js)

#### GET /api/galeria
**Autenticación:** NO requerida
**Query params:** `categoria`

#### POST /api/galeria
**Autenticación:** Requerida (SOLO admin)
**Body:** `multipart/form-data` con imagen

**Lógica:**
1. Validar archivo (tipo, tamaño max 5MB)
2. Subir a **Supabase Storage** bucket `galeria`
3. Obtener URL pública
4. INSERT en tabla `imagenes_galeria` con `url_imagen`

**Ejemplo con Supabase Storage:**
```javascript
const { data, error } = await supabase.storage
  .from('galeria')
  .upload(`habitaciones/${Date.now()}-${file.originalname}`, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '3600',
    upsert: false
  });

const url_imagen = supabase.storage.from('galeria').getPublicUrl(data.path).data.publicUrl;
```

#### DELETE /api/galeria/:id
**Autenticación:** Requerida (SOLO admin)

**Lógica:**
1. Obtener `url_imagen` de BD
2. Extraer path del archivo
3. Eliminar de Supabase Storage
4. DELETE registro de BD

---

## MIDDLEWARE DE AUTENTICACIÓN

### middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verificar JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar usuario existe y está activo
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1 AND u.activo = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Verificar rol admin
const esAdmin = (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Requiere rol de administrador'
    });
  }
  next();
};

// Verificar admin o recepcionista
const esPersonal = (req, res, next) => {
  if (!['administrador', 'recepcionista'].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }
  next();
};

module.exports = { verificarToken, esAdmin, esPersonal };
```

---

## VALIDACIONES CON JOI

### validators/reservas.validator.js

```javascript
const Joi = require('joi');

const crearReservaSchema = Joi.object({
  huesped: Joi.object({
    nombre: Joi.string().required(),
    apellido: Joi.string().allow('', null),
    dpi_pasaporte: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    telefono: Joi.string().allow('', null),
    pais: Joi.string().allow('', null)
  }),
  huesped_id: Joi.number().integer().positive(),
  habitacion_id: Joi.number().integer().positive().required(),
  fecha_checkin: Joi.date().iso().required(),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required(),
  numero_huespedes: Joi.number().integer().positive().default(1),
  canal_reserva: Joi.string().valid('booking', 'whatsapp', 'facebook', 'telefono', 'presencial').required(),
  notas: Joi.string().allow('', null)
}).xor('huesped', 'huesped_id'); // Uno u otro, no ambos

module.exports = { crearReservaSchema };
```

---

## MANEJO DE ERRORES

### middleware/errorHandler.js

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.details.map(d => d.message)
    });
  }

  // Error de PostgreSQL
  if (err.code) {
    // Violación de unique constraint
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'El registro ya existe'
      });
    }

    // Violación de FK
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida'
      });
    }

    // Violación de CHECK constraint
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Valor no permitido'
      });
    }
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
```

---

## RESPUESTAS ESTANDARIZADAS

### utils/response.js

```javascript
const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = { success, error };
```

---

## CONFIGURACIÓN DE BASE DE DATOS

### config/database.js

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
  process.exit(-1);
});

module.exports = { pool };
```

---

## SERVIDOR PRINCIPAL

### server.js

```javascript
require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');
const { iniciarWebSocketServer } = require('./src/websocket/notificaciones.ws');

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// Verificar conexión a BD
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a PostgreSQL:', res.rows[0].now);
});

// Iniciar servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor API escuchando en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV}`);
});

// Iniciar servidor WebSocket
iniciarWebSocketServer(WS_PORT);

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});
```

---

## CASOS DE USO CRÍTICOS

### 1. Flujo de creación de reserva con validación

```javascript
// controllers/reservas.controller.js
const crearReserva = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Crear o usar huésped existente
    let huesped_id;
    if (req.body.huesped_id) {
      huesped_id = req.body.huesped_id;
    } else {
      const { rows } = await client.query(
        `INSERT INTO huespedes (nombre, apellido, dpi_pasaporte, email, telefono, pais)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [req.body.huesped.nombre, req.body.huesped.apellido, ...]
      );
      huesped_id = rows[0].id;
    }

    // 2. Obtener precio de habitación
    const { rows: habitacion } = await client.query(
      'SELECT precio_por_noche FROM habitaciones WHERE id = $1 AND activo = true',
      [req.body.habitacion_id]
    );

    if (habitacion.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    // 3. VALIDAR SOLAPAMIENTO (CRÍTICO)
    const { rows: validacion } = await client.query(
      'SELECT validar_solapamiento_reservas($1, $2, $3, NULL) as disponible',
      [req.body.habitacion_id, req.body.fecha_checkin, req.body.fecha_checkout]
    );

    if (!validacion[0].disponible) {
      throw {
        statusCode: 409,
        message: 'La habitación no está disponible en las fechas seleccionadas'
      };
    }

    // 4. Crear reserva
    const { rows: reserva } = await client.query(
      `INSERT INTO reservas (
        huesped_id, habitacion_id, fecha_checkin, fecha_checkout,
        precio_por_noche, numero_huespedes, canal_reserva, estado_id, notas, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7,
        (SELECT id FROM estados_reserva WHERE nombre = 'pendiente'),
        $8, $9
      ) RETURNING *`,
      [huesped_id, req.body.habitacion_id, req.body.fecha_checkin,
       req.body.fecha_checkout, habitacion[0].precio_por_noche,
       req.body.numero_huespedes, req.body.canal_reserva,
       req.body.notas, req.user.id]
    );

    await client.query('COMMIT');

    return success(res, reserva[0], 'Reserva creada exitosamente', 201);

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
```

---

## SEGURIDAD

### Configuración en app.js

```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Helmet para headers de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', limiter);

// Rate limiting más estricto para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login'
});

app.use('/api/auth/login', loginLimiter);
```

---

## PRUEBAS RECOMENDADAS

### Usar Thunder Client / Postman

**Colección de pruebas:**
1. Login (obtener token)
2. Crear reserva válida
3. Crear reserva con solapamiento (debe fallar)
4. Cambiar estado de reserva (verificar trigger)
5. Generar QR
6. Asignar QR a habitación
7. Escanear QR (público)
8. Crear solicitud de servicio (verificar notificación WebSocket)
9. Subir imagen a galería

---

## ENTREGABLES

Implementa el backend completo con:

1. ✅ Estructura de carpetas profesional
2. ✅ Todos los endpoints documentados
3. ✅ Autenticación JWT funcional
4. ✅ Validación con Joi en todos los endpoints
5. ✅ Validación de solapamiento en reservas (CRÍTICO)
6. ✅ WebSocket para notificaciones en tiempo real
7. ✅ Integración con Supabase Storage para galería
8. ✅ Manejo de errores estandarizado
9. ✅ Middleware de autenticación y permisos
10. ✅ Rate limiting y seguridad con Helmet
11. ✅ Archivo `.env.example`
12. ✅ README con instrucciones de instalación

---

## PRIORIDADES DE IMPLEMENTACIÓN

### Fase 2A (Crítico - Implementar primero)
1. Configuración base (database, express, middleware)
2. Autenticación (login, refresh, me)
3. Reservas (CRUD + validación solapamiento)
4. Habitaciones (CRUD)

### Fase 2B (Importante)
5. Códigos QR (generar, asignar, escanear)
6. Solicitudes de servicio
7. Notificaciones (GET, marcar leída)

### Fase 2C (WebSocket)
8. WebSocket server para notificaciones tiempo real

### Fase 2D (Complementario)
9. Usuarios (CRUD)
10. Reportes (generar, listar)
11. Plataforma pública (contenido, servicios, comentarios)
12. Galería (Supabase Storage)

---

**¿Listo para empezar la implementación?**
