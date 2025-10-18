# Backend - Hotel Casa Josefa

API REST para Sistema de Gestión Hotelera

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y completar con tus credenciales de Supabase:

```bash
cp .env.example .env
```

Editar `.env` con tus datos reales:

```env
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
DB_HOST=db.PROJECT_REF.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase
DB_NAME=postgres
DB_SSL=true

# JWT (generar secrets seguros)
JWT_SECRET=tu_secret_key_minimo_32_caracteres
JWT_REFRESH_SECRET=otro_secret_diferente_minimo_32_caracteres

# Supabase (para Storage)
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
```

### 3. Verificar que la base de datos está instalada

Asegúrate de haber ejecutado el script `EJECUTAR_COMPLETO.sql` de la Fase 1 en Supabase.

### 4. Iniciar servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor iniciará en `http://localhost:3000`

---

## 📋 Endpoints Implementados (Fase 2A + 2B + 2C + 2D - COMPLETO)

### 🔐 Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login con email + password | No |
| POST | `/auth/refresh` | Renovar access token | Refresh token |
| GET | `/auth/me` | Obtener usuario actual | Sí |
| POST | `/auth/logout` | Cerrar sesión | Sí |

**Ejemplo login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@casajosefa.com",
    "password": "Admin123!"
  }'
```

### 🛏️ Reservas (`/api/reservas`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/reservas` | Listar con filtros | Admin/Recepcionista |
| GET | `/reservas/disponibilidad` | Habitaciones disponibles | No |
| GET | `/reservas/:id` | Detalles de reserva | Admin/Recepcionista |
| POST | `/reservas` | Crear reserva | Admin/Recepcionista |
| PUT | `/reservas/:id` | Actualizar reserva | Admin/Recepcionista |
| PATCH | `/reservas/:id/estado` | Cambiar estado | Admin/Recepcionista |

**Ejemplo crear reserva con huésped nuevo:**
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d '{
    "huesped": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@email.com",
      "telefono": "12345678"
    },
    "habitacion_id": 1,
    "fecha_checkin": "2025-11-01",
    "fecha_checkout": "2025-11-05",
    "numero_huespedes": 2,
    "canal_reserva": "booking",
    "notas": "Cliente VIP"
  }'
```

**Ejemplo crear reserva con huésped existente:**
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d '{
    "huesped_id": 5,
    "habitacion_id": 1,
    "fecha_checkin": "2025-11-01",
    "fecha_checkout": "2025-11-05",
    "numero_huespedes": 2,
    "canal_reserva": "whatsapp"
  }'
```

### 🏠 Habitaciones (`/api/habitaciones`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/habitaciones` | Listar con filtros | Admin/Recepcionista |
| GET | `/habitaciones/:id` | Detalles de habitación | Admin/Recepcionista |
| POST | `/habitaciones` | Crear habitación | SOLO Admin |
| PUT | `/habitaciones/:id` | Actualizar (precio) | SOLO Admin |
| PATCH | `/habitaciones/:id/estado` | Cambiar estado | Admin/Recepcionista |
| DELETE | `/habitaciones/:id` | Desactivar | SOLO Admin |

### 📱 Códigos QR (`/api/qr`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/qr` | Listar códigos QR | SOLO Admin |
| POST | `/qr/generar` | Generar QR en stock | SOLO Admin |
| PATCH | `/qr/:id/asignar` | Asignar QR a habitación | SOLO Admin |
| PATCH | `/qr/:id/desasignar` | Desasignar QR | SOLO Admin |
| GET | `/qr/:codigo/habitacion` | Escanear QR (público) | No |

**Ejemplo generar QR:**
```bash
curl -X POST http://localhost:3000/api/qr/generar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "cantidad": 10
  }'
```

**Ejemplo asignar QR a habitación:**
```bash
curl -X PATCH http://localhost:3000/api/qr/1/asignar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "habitacion_id": 1
  }'
```

**Ejemplo escanear QR (público):**
```bash
curl http://localhost:3000/api/qr/550e8400-e29b-41d4-a716-446655440000/habitacion
```

### 🛎️ Solicitudes de Servicio (`/api/solicitudes`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/solicitudes` | Listar solicitudes | Admin/Recepcionista |
| GET | `/solicitudes/:id` | Detalles de solicitud | Admin/Recepcionista |
| POST | `/solicitudes` | Crear solicitud (público) | No |
| PATCH | `/solicitudes/:id/completar` | Marcar como completada | Admin/Recepcionista |

**Ejemplo crear solicitud desde plataforma QR (público):**
```bash
curl -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "habitacion_id": 1,
    "servicio_id": 2,
    "origen": "plataforma_qr",
    "notas": "Preferiblemente antes de las 3pm"
  }'
```

**Ejemplo completar solicitud:**
```bash
curl -X PATCH http://localhost:3000/api/solicitudes/1/completar \
  -H "Authorization: Bearer TU_TOKEN"
```

### 🔔 Notificaciones (`/api/notificaciones`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/notificaciones` | Listar notificaciones | Admin/Recepcionista |
| GET | `/notificaciones/:id` | Detalles de notificación | Admin/Recepcionista |
| PATCH | `/notificaciones/:id/leer` | Marcar como leída | Admin/Recepcionista |
| PATCH | `/notificaciones/leer-todas` | Marcar todas como leídas | Admin/Recepcionista |

**Ejemplo listar notificaciones no leídas:**
```bash
curl http://localhost:3000/api/notificaciones?leida=false \
  -H "Authorization: Bearer TU_TOKEN"
```

**Ejemplo marcar notificación como leída:**
```bash
curl -X PATCH http://localhost:3000/api/notificaciones/1/leer \
  -H "Authorization: Bearer TU_TOKEN"
```

### 👥 Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/usuarios` | Listar usuarios | SOLO Admin |
| GET | `/usuarios/:id` | Detalles de usuario | SOLO Admin |
| POST | `/usuarios` | Crear usuario | SOLO Admin |
| PUT | `/usuarios/:id` | Actualizar usuario | SOLO Admin |
| PATCH | `/usuarios/:id/toggle-activo` | Activar/desactivar | SOLO Admin |

**Ejemplo crear usuario:**
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "nombre": "María",
    "apellido": "González",
    "email": "maria@casajosefa.com",
    "password": "Password123!",
    "rol_id": 2
  }'
```

### 📊 Reportes (`/api/reportes`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/reportes/ocupacion` | Generar reporte | Admin/Recepcionista |
| GET | `/reportes/ocupacion` | Listar reportes | Admin/Recepcionista |
| GET | `/reportes/ocupacion/:id` | Detalles de reporte | Admin/Recepcionista |

**Ejemplo generar reporte:**
```bash
curl -X POST http://localhost:3000/api/reportes/ocupacion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "fecha_inicio": "2025-10-01",
    "fecha_fin": "2025-10-07",
    "tipo_periodo": "semanal"
  }'
```

### 🌐 Plataforma Pública (`/api/plataforma`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/plataforma/contenido` | Obtener contenido CMS | No |
| GET | `/plataforma/experiencias` | Experiencias turísticas | No |
| GET | `/plataforma/servicios` | Servicios disponibles | No |
| POST | `/plataforma/comentarios` | Crear comentario | No |
| GET | `/plataforma/comentarios` | Listar comentarios | No |

**Ejemplo obtener contenido en inglés:**
```bash
curl "http://localhost:3000/api/plataforma/contenido?idioma=en"
```

**Ejemplo crear comentario:**
```bash
curl -X POST http://localhost:3000/api/plataforma/comentarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_huesped": "John Doe",
    "comentario": "Excelente experiencia, habitaciones limpias y personal amable.",
    "calificacion": 5
  }'
```

### 🖼️ Galería (`/api/galeria`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/galeria` | Listar imágenes | No |
| POST | `/galeria` | Subir imagen (multipart) | SOLO Admin |
| PUT | `/galeria/:id` | Actualizar metadata | SOLO Admin |
| DELETE | `/galeria/:id` | Eliminar imagen | SOLO Admin |
| PATCH | `/galeria/:id/toggle-activo` | Activar/desactivar | SOLO Admin |

**Ejemplo subir imagen (multipart/form-data):**
```bash
curl -X POST http://localhost:3000/api/galeria \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "imagen=@/ruta/a/imagen.jpg" \
  -F "titulo=Vista del lago" \
  -F "categoria=vistas" \
  -F "descripcion=Hermosa vista del Lago Atitlán" \
  -F "orden=1"
```

---

## 🔔 WebSocket - Notificaciones en Tiempo Real

### Conexión
```
ws://localhost:3001
```

### Autenticación
Al conectar, enviar mensaje con token:
```javascript
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Respuesta de autenticación exitosa:
```json
{
  "type": "auth_success",
  "message": "Autenticado como Admin Sistema (administrador)",
  "user": {
    "id": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "email": "admin@casajosefa.com",
    "rol": "administrador"
  }
}
```

### Notificaciones en tiempo real:
```json
{
  "type": "nueva_notificacion",
  "data": {
    "id": 15,
    "tipo": "solicitud_servicio",
    "titulo": "Nueva solicitud de servicio",
    "mensaje": "Habitación 101 solicita: Servicio de Lavandería",
    "prioridad": "alta",
    "habitacion_numero": "101",
    "creado_en": "2025-10-05T14:30:00Z"
  }
}
```

### Ping/Pong (mantener conexión activa):
```javascript
// Cliente envía:
{ "type": "ping" }

// Servidor responde:
{ "type": "pong" }
```

### Ejemplo JavaScript (cliente):
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Autenticar
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'tu_access_token_aqui'
  }));

  // Ping cada 30 segundos
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }));
  }, 30000);
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'nueva_notificacion') {
    console.log('Nueva notificación:', data.data);
    // Mostrar notificación en UI
  }
};
```

---

## 🔒 Autenticación JWT

### Obtener token

1. Hacer login para obtener `accessToken` y `refreshToken`
2. Incluir `accessToken` en header Authorization de todas las requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Duración de tokens

- **Access Token:** 7 días (configurable en `.env`)
- **Refresh Token:** 30 días (configurable en `.env`)

### Renovar token expirado

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer TU_REFRESH_TOKEN"
```

---

## 🧪 Testing con cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@casajosefa.com","password":"Admin123!"}'
```

Guardar el `accessToken` de la respuesta.

### 2. Crear habitación (solo admin)
```bash
curl -X POST http://localhost:3000/api/habitaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "numero": "101",
    "tipo_habitacion_id": 2,
    "precio_por_noche": 250.00,
    "descripcion": "Habitación doble con vista al lago"
  }'
```

### 3. Consultar disponibilidad
```bash
curl "http://localhost:3000/api/reservas/disponibilidad?fecha_checkin=2025-11-01&fecha_checkout=2025-11-05"
```

### 4. Crear reserva
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "huesped": {
      "nombre": "María",
      "apellido": "García"
    },
    "habitacion_id": 1,
    "fecha_checkin": "2025-11-01",
    "fecha_checkout": "2025-11-05",
    "canal_reserva": "presencial"
  }'
```

### 5. Cambiar estado a confirmada (check-in)
```bash
curl -X PATCH http://localhost:3000/api/reservas/1/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"estado": "confirmada"}'
```

Verificar que la habitación cambió automáticamente a estado "ocupada".

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/              # Configuraciones (DB, JWT, Supabase)
│   ├── controllers/         # Lógica de negocio
│   ├── middleware/          # Middleware (auth, validation, errors)
│   ├── routes/              # Definición de rutas
│   ├── validators/          # Esquemas Joi
│   ├── utils/               # Utilidades (logger, response)
│   └── app.js              # Configuración de Express
├── .env                     # Variables de entorno (NO commitear)
├── .env.example            # Plantilla de variables
├── .gitignore
├── package.json
├── server.js               # Punto de entrada
└── README.md
```

---

## 🚀 Despliegue en Render

### Configurar Variables de Entorno en Render

En el dashboard de Render, agregar las siguientes variables de entorno:

**Base de Datos:**
```
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.tkapgaullvnpzjkssthb
DB_PASSWORD=PPDPdhNo5ourm1ta
DB_SSL=true
DATABASE_URL=postgresql://postgres.tkapgaullvnpzjkssthb:PPDPdhNo5ourm1ta@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Supabase:**
```
SUPABASE_URL=https://tkapgaullvnpzjkssthb.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
```

**JWT:**
```
JWT_SECRET=sJv2Yp_bYy2bNiigviNfpbXo-LKK3uaWAYkYI7GSypY=
JWT_REFRESH_SECRET=RfW9p6nXUoL4t0iZqD8bVrKj2HsGmE3pA7YxTnC5
```

**CORS (IMPORTANTE):**
```
FRONTEND_URL=https://tu-app.vercel.app
```

Si tienes múltiples dominios (desarrollo + producción):
```
FRONTEND_URL=http://localhost:5173,https://tu-app.vercel.app,https://tu-dominio.com
```

**Servidor:**
```
NODE_ENV=production
PORT=3001
WS_PORT=3002
```

### Build Command (Render)
```
npm install
```

### Start Command (Render)
```
npm start
```

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de PostgreSQL | `db.abc123.supabase.co` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Password de PostgreSQL | `tu_password` |
| `DB_NAME` | Nombre de la base de datos | `postgres` |
| `DB_SSL` | Usar SSL | `true` |
| `JWT_SECRET` | Secret para access tokens | String largo aleatorio |
| `JWT_EXPIRES_IN` | Duración de access token | `7d` |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens | String diferente |
| `JWT_REFRESH_EXPIRES_IN` | Duración de refresh token | `30d` |
| `SUPABASE_URL` | URL de Supabase | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key de Supabase | Tu anon key |
| `SUPABASE_SERVICE_KEY` | Service key de Supabase | Tu service key |
| `WS_PORT` | Puerto del servidor WebSocket | `3001` |
| `CORS_ORIGIN` | Orígenes permitidos CORS | `http://localhost:5173,https://tudominio.com` |

---

## 🔍 Validaciones Implementadas

### Reservas

✅ Validación de solapamiento de fechas (función PostgreSQL)
✅ Verificar capacidad máxima de habitación
✅ No permitir editar reservas completadas/canceladas
✅ Transiciones de estado válidas
✅ Campos requeridos (Joi)

### Habitaciones

✅ Número de habitación único
✅ Solo admin puede crear/editar/desactivar
✅ No permitir desactivar con reservas activas
✅ Estado 'ocupada' solo se maneja automáticamente

### Autenticación

✅ Email válido
✅ Password mínimo 6 caracteres (login)
✅ Password seguro al crear usuario (8 chars, mayúscula, minúscula, número)
✅ Verificar usuario activo
✅ Rate limiting en login (5 intentos / 15 min)

---

## 🚨 Manejo de Errores

Todos los errores retornan formato estandarizado:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [] // Opcional, para errores de validación
}
```

### Códigos HTTP

- `200` - OK
- `201` - Creado
- `400` - Request inválido
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `409` - Conflicto (ej: solapamiento de fechas)
- `429` - Demasiadas peticiones (rate limit)
- `500` - Error del servidor

---

## 📝 Logs

El servidor loguea automáticamente:

- ✅ Operaciones exitosas (color verde)
- ℹ️ Información general (color azul)
- ⚠️ Advertencias (color amarillo)
- ❌ Errores (color rojo)
- 🐛 Debug (solo en development)

---

## 🔐 Seguridad Implementada

- ✅ **Helmet:** Headers de seguridad HTTP
- ✅ **CORS:** Orígenes permitidos configurables
- ✅ **Rate Limiting:** Protección contra brute force y spam
- ✅ **JWT:** Autenticación stateless
- ✅ **Bcrypt:** Hash seguro de passwords (cost factor 10)
- ✅ **Joi:** Validación y sanitización de inputs
- ✅ **Prepared Statements:** Protección contra SQL injection

---

## ✅ Módulos Completados

- [x] **Fase 2A:** Autenticación, Reservas, Habitaciones ✅
- [x] **Fase 2B:** Códigos QR, Solicitudes de Servicio, Notificaciones ✅
- [x] **Fase 2C:** WebSocket server para notificaciones en tiempo real ✅
- [x] **Fase 2D:** Usuarios (CRUD), Reportes, Plataforma Pública, Galería (Supabase Storage) ✅

**🎉 BACKEND COMPLETO - 100% IMPLEMENTADO**

---

## 🆘 Troubleshooting

### Error: "Cannot connect to PostgreSQL"

- Verifica credenciales en `.env`
- Verifica que Supabase está activo
- Verifica que `DB_SSL=true`

### Error: "Token expirado"

- Usa el endpoint `/api/auth/refresh` con tu refresh token

### Error: "La habitación no está disponible"

- Ya existe una reserva en esas fechas
- Usa `/api/reservas/disponibilidad` para consultar disponibilidad

### Error: "Acceso denegado"

- Verifica que el usuario tiene el rol correcto
- Login: cualquiera
- Reservas/Habitaciones: admin o recepcionista
- Crear/Editar habitaciones: SOLO admin

---

**✅ FASE 2A COMPLETADA**
**✅ FASE 2B COMPLETADA**
**✅ FASE 2C COMPLETADA**
**✅ FASE 2D COMPLETADA**

**🎉 BACKEND 100% FUNCIONAL**

Módulos implementados:
- ✅ Autenticación JWT (access + refresh tokens)
- ✅ Reservas con validación de solapamiento
- ✅ Gestión de Habitaciones
- ✅ Códigos QR (generar, asignar, escanear)
- ✅ Solicitudes de Servicio (público)
- ✅ Notificaciones (GET, marcar leída)
- ✅ WebSocket en tiempo real (puerto 3001)
- ✅ Usuarios (CRUD completo)
- ✅ Reportes de ocupación
- ✅ Plataforma Pública (contenido, experiencias, servicios, comentarios)
- ✅ Galería con Supabase Storage (upload de imágenes)

**Próximo paso:** Fase 3 - Frontend (React + Vite + Tailwind)
