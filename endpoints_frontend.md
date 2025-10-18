# 📙 Endpoints del Frontend

Sistema de gestión hotelera - Auditoría de peticiones HTTP desde el frontend

**Fecha**: 2025-10-06
**Base URL**: Configurada en `VITE_API_URL` (default: `http://localhost:3000/api`)

---

## 📁 Estructura de Servicios

Todos los servicios se encuentran en: `frontend/src/shared/services/`

**Configuración base**: `api.js`
- Instancia de Axios con interceptores
- Manejo automático de tokens (Authorization header)
- Refresh token automático en caso de 401

---

## 🔐 Autenticación (`authService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| POST | `/auth/login` | `login()` | 11 | Login con email y password |
| POST | `/auth/logout` | `logout()` | 29 | Cerrar sesión |
| POST | `/auth/refresh` | `refreshToken()` | 44 | Refrescar access token |
| GET | `/auth/me` | `me()` | 54 | Obtener usuario actual |

**Datos enviados en login**:
```javascript
{ email, password }
```

**Datos esperados de login**:
```javascript
{
  data: {
    user: { ... },
    accessToken: "...",
    refreshToken: "..."
  }
}
```

**Funciones locales** (no hacen peticiones HTTP):
- `getUser()` - Obtiene usuario de localStorage
- `getToken()` - Obtiene token de localStorage
- `isAuthenticated()` - Verifica si hay token

---

## 🏠 Habitaciones (`habitacionesService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/habitaciones` | `getHabitaciones(params)` | 11 | Obtener todas las habitaciones |
| GET | `/habitaciones/:id` | `getHabitacion(id)` | 19 | Obtener una habitación por ID |
| POST | `/habitaciones` | `createHabitacion(data)` | 27 | Crear nueva habitación |
| PUT | `/habitaciones/:id` | `updateHabitacion(id, data)` | 35 | Actualizar habitación |
| DELETE | `/habitaciones/:id` | `deleteHabitacion(id)` | 43 | Eliminar habitación |
| PATCH | `/habitaciones/:id/estado` | `cambiarEstado(id, estado)` | 51 | Cambiar estado de habitación |

**Alias disponibles**:
- `listar()` → `getHabitaciones()`
- `crear()` → `createHabitacion()`
- `actualizar()` → `updateHabitacion()`
- `desactivar()` → `deleteHabitacion()`

---

## 🛏️ Reservas (`reservasService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/reservas` | `getReservas(params)` | 11 | Obtener todas las reservas |
| GET | `/reservas/:id` | `getReserva(id)` | 19 | Obtener una reserva por ID |
| POST | `/reservas` | `createReserva(data)` | 27 | Crear nueva reserva |
| PUT | `/reservas/:id` | `updateReserva(id, data)` | 35 | Actualizar reserva |
| PATCH | `/reservas/:id/estado` | `cambiarEstado(id, estado, motivo)` | 43 | Cambiar estado de reserva |
| GET | `/reservas/disponibilidad` | `verificarDisponibilidad(...)` | 54 | Verificar disponibilidad de habitaciones |

**Datos enviados en `cambiarEstado`**:
```javascript
{
  estado,
  motivo_cancelacion
}
```

**Parámetros para `verificarDisponibilidad`**:
```javascript
{
  fecha_entrada,
  fecha_salida,
  tipo_habitacion  // opcional
}
```

**Alias disponibles**:
- `listar()` → `getReservas()`
- `crear()` → `createReserva()`
- `actualizar()` → `updateReserva()`
- `cambiar()` → `cambiarEstado()`

---

## 👥 Usuarios (`usuariosService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/usuarios` | `getUsuarios(params)` | 11 | Obtener todos los usuarios |
| GET | `/usuarios/:id` | `getUsuario(id)` | 19 | Obtener un usuario por ID |
| POST | `/usuarios` | `createUsuario(data)` | 27 | Crear nuevo usuario |
| PUT | `/usuarios/:id` | `updateUsuario(id, data)` | 35 | Actualizar usuario |
| PATCH | `/usuarios/:id/toggle-activo` | `toggleActivo(id)` | 43 | Activar/desactivar usuario |

**Alias disponibles**:
- `listar()` → `getUsuarios()`
- `crear()` → `createUsuario()`
- `actualizar()` → `updateUsuario()`
- `toggle()` → `toggleActivo()`

---

## 📱 Códigos QR (`qrService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/qr` | `getCodigosQR(params)` | 11 | Obtener todos los códigos QR |
| POST | `/qr/generar` | `generarCodigoQR()` | 19 | Generar nuevo código QR |
| PATCH | `/qr/:id/asignar` | `asignarQR(id, habitacion_id)` | 27 | Asignar QR a habitación |
| PATCH | `/qr/:id/desasignar` | `desasignarQR(id)` | 35 | Desasignar QR de habitación |
| GET | `/qr/:codigo/habitacion` | `getHabitacionPorCodigo(codigo)` | 43 | Obtener info de habitación por código QR |

**⚠️ INCONSISTENCIA DETECTADA**:
- **Línea 19**: `generarCodigoQR()` hace POST a `/qr/generar` sin parámetros
- **Backend espera**: `{ cantidad: number }` en el body

**Datos enviados en `asignarQR`**:
```javascript
{
  habitacion_id
}
```

**Alias disponibles**:
- `listar()` → `getCodigosQR()`
- `generar()` → `generarCodigoQR()`
- `asignar()` → `asignarQR()`
- `desasignar()` → `desasignarQR()`

---

## 🛎️ Solicitudes de Servicio (`solicitudesService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/solicitudes` | `getSolicitudes(params)` | 11 | Obtener todas las solicitudes |
| GET | `/solicitudes/:id` | `getSolicitud(id)` | 19 | Obtener una solicitud por ID |
| POST | `/solicitudes` | `createSolicitud(data)` | 27 | Crear nueva solicitud |
| PATCH | `/solicitudes/:id/completar` | `completarSolicitud(id, notas)` | 35 | Completar solicitud |

**Datos enviados en `completarSolicitud`**:
```javascript
{
  notas
}
```

**Alias disponibles**:
- `listar()` → `getSolicitudes()`
- `completar()` → `completarSolicitud()`

---

## 🔔 Notificaciones (`notificacionesService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/notificaciones` | `getNotificaciones(params)` | 11 | Obtener todas las notificaciones |
| GET | `/notificaciones/:id` | `getNotificacion(id)` | 19 | Obtener una notificación por ID |
| PATCH | `/notificaciones/:id/leer` | `marcarLeida(id)` | 27 | Marcar notificación como leída |
| PATCH | `/notificaciones/leer-todas` | `marcarTodasLeidas()` | 35 | Marcar todas como leídas |

---

## 📊 Reportes (`reportesService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| POST | `/reportes/ocupacion` | `generarReporteOcupacion(data)` | 11 | Generar reporte de ocupación |
| GET | `/reportes/ocupacion` | `getReportesOcupacion(params)` | 19 | Obtener todos los reportes |
| GET | `/reportes/ocupacion/:id` | `getReporteOcupacion(id)` | 27 | Obtener un reporte por ID |

**Alias disponibles**:
- `generar()` → `generarReporteOcupacion()`
- `listar()` → `getReportesOcupacion()`
- `obtener()` → `getReporteOcupacion()`

---

## 🌐 Plataforma Pública (`plataformaService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/plataforma/contenido` | `getContenido()` | 11 | Obtener contenido de plataforma |
| GET | `/plataforma/experiencias` | `getExperiencias(params)` | 19 | Obtener experiencias |
| GET | `/plataforma/servicios` | `getServicios()` | 27 | Obtener servicios |
| POST | `/plataforma/comentarios` | `createComentario(data)` | 35 | Crear comentario |
| GET | `/plataforma/comentarios` | `getComentarios(params)` | 43 | Obtener comentarios |

---

## 🖼️ Galería (`galeriaService.js`)

| Método HTTP | Endpoint | Función | Línea | Descripción |
|-------------|----------|---------|-------|-------------|
| GET | `/galeria` | `getImagenes(params)` | 11 | Obtener todas las imágenes |
| POST | `/galeria` | `uploadImagen(formData)` | 19 | Subir imagen (multipart/form-data) |
| PUT | `/galeria/:id` | `updateImagen(id, data)` | 31 | Actualizar imagen |
| DELETE | `/galeria/:id` | `deleteImagen(id)` | 39 | Eliminar imagen |
| PATCH | `/galeria/:id/toggle-activo` | `toggleActivo(id)` | 47 | Activar/desactivar imagen |

**Alias disponibles**:
- `listar()` → `getImagenes()`
- `subir()` → `uploadImagen()`
- `actualizar()` → `updateImagen()`
- `eliminar()` → `deleteImagen()`
- `toggle()` → `toggleActivo()`

---

## 📁 Resumen de Archivos

- **Servicios**: `frontend/src/shared/services/*.js`
- **API Config**: `frontend/src/shared/services/api.js`
- **Páginas**: `frontend/src/modules/gestion/pages/*.jsx`
- **Contextos**: `frontend/src/shared/context/*.jsx`

**Total de peticiones HTTP**: 46 peticiones
**Patrón**: Todos los servicios retornan `response.data.data` (desenvuelven la respuesta del backend)
