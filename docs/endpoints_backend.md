# 📘 Endpoints del Backend

Sistema de gestión hotelera - Auditoría de endpoints del backend

**Fecha**: 2025-10-06
**Base URL**: `http://localhost:3000/api`

---

## 🔐 Autenticación (`/api/auth`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| POST | `/auth/login` | `authController.login` | Público | `loginLimiter`, `validate(loginSchema)` | Login con email + password |
| POST | `/auth/refresh` | `authController.refresh` | Público | - | Renovar access token usando refresh token |
| GET | `/auth/me` | `authController.me` | Privado | `verificarToken` | Obtener información del usuario autenticado |
| POST | `/auth/logout` | `authController.logout` | Privado | `verificarToken` | Cerrar sesión |

**Campos devueltos por `/auth/login`**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Campos devueltos por `/auth/me`**:
```json
{
  "success": true,
  "data": {
    "usuario": { ... }
  }
}
```

---

## 🏠 Habitaciones (`/api/habitaciones`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/habitaciones` | `habitacionesController.listarHabitaciones` | Privado | `verificarToken`, `esPersonal`, `validateQuery` | Listar habitaciones con filtros |
| GET | `/habitaciones/:id` | `habitacionesController.obtenerHabitacion` | Privado | `verificarToken`, `esPersonal` | Obtener detalles de una habitación |
| POST | `/habitaciones` | `habitacionesController.crearHabitacion` | Privado (Admin) | `verificarToken`, `esAdmin`, `createLimiter`, `validate` | Crear nueva habitación |
| PUT | `/habitaciones/:id` | `habitacionesController.actualizarHabitacion` | Privado (Admin) | `verificarToken`, `esAdmin`, `validate` | Actualizar habitación |
| PATCH | `/habitaciones/:id/estado` | `habitacionesController.cambiarEstado` | Privado | `verificarToken`, `esPersonal`, `validate` | Cambiar estado de habitación |
| DELETE | `/habitaciones/:id` | `habitacionesController.desactivarHabitacion` | Privado (Admin) | `verificarToken`, `esAdmin` | Desactivar habitación (soft delete) |

---

## 🛏️ Reservas (`/api/reservas`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/reservas` | `reservasController.listarReservas` | Privado | `verificarToken`, `esPersonal`, `validateQuery` | Listar reservas con filtros |
| GET | `/reservas/disponibilidad` | `reservasController.consultarDisponibilidad` | Público | `validateQuery` | Consultar habitaciones disponibles |
| GET | `/reservas/:id` | `reservasController.obtenerReserva` | Privado | `verificarToken`, `esPersonal` | Obtener detalles de una reserva |
| POST | `/reservas` | `reservasController.crearReserva` | Privado | `verificarToken`, `esPersonal`, `createLimiter`, `validate` | Crear nueva reserva |
| PUT | `/reservas/:id` | `reservasController.actualizarReserva` | Privado | `verificarToken`, `esPersonal`, `validate` | Actualizar reserva existente |
| PATCH | `/reservas/:id/estado` | `reservasController.cambiarEstado` | Privado | `verificarToken`, `esPersonal`, `validate` | Cambiar estado de reserva |

---

## 👥 Usuarios (`/api/usuarios`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/usuarios` | `usuariosController.listarUsuarios` | Privado (Admin) | `verificarToken`, `esAdmin`, `validateQuery` | Listar usuarios con filtros |
| GET | `/usuarios/:id` | `usuariosController.obtenerUsuario` | Privado (Admin) | `verificarToken`, `esAdmin` | Obtener detalles de un usuario |
| POST | `/usuarios` | `usuariosController.crearUsuario` | Privado (Admin) | `verificarToken`, `esAdmin`, `createLimiter`, `validate` | Crear nuevo usuario |
| PUT | `/usuarios/:id` | `usuariosController.actualizarUsuario` | Privado (Admin) | `verificarToken`, `esAdmin`, `validate` | Actualizar usuario |
| PATCH | `/usuarios/:id/toggle-activo` | `usuariosController.toggleActivo` | Privado (Admin) | `verificarToken`, `esAdmin` | Activar/desactivar usuario |

---

## 📱 Códigos QR (`/api/qr`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/qr` | `qrController.listarQr` | Privado (Admin) | `verificarToken`, `esAdmin`, `validateQuery` | Listar códigos QR con filtros |
| POST | `/qr/generar` | `qrController.generarQr` | Privado (Admin) | `verificarToken`, `esAdmin`, `createLimiter`, `validate` | Generar múltiples códigos QR |
| PATCH | `/qr/:id/asignar` | `qrController.asignarQr` | Privado (Admin) | `verificarToken`, `esAdmin`, `validate` | Asignar código QR a habitación |
| PATCH | `/qr/:id/desasignar` | `qrController.desasignarQr` | Privado (Admin) | `verificarToken`, `esAdmin` | Desasignar código QR |
| GET | `/qr/:codigo/habitacion` | `qrController.escanearQr` | Público | - | Obtener info de habitación al escanear QR |

**Campos devueltos por `/qr` (listarQr)**:
```json
{
  "success": true,
  "data": {
    "codigos_qr": [
      {
        "id": 1,
        "codigo": "uuid",
        "url_destino": "...",
        "estado": "...",
        "habitacion_id": 1,
        "habitacion_numero": "101",
        "total_lecturas": 5,
        "ultima_lectura": "...",
        "fecha_asignacion": "...",
        "creado_en": "...",
        "creado_por_nombre": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

**Campos esperados por `/qr/generar` (body)**:
```json
{
  "cantidad": 10
}
```

**Campos devueltos por `/qr/generar`**:
```json
{
  "success": true,
  "data": {
    "generados": 10,
    "codigos_qr": [...]
  }
}
```

---

## 🛎️ Solicitudes de Servicio (`/api/solicitudes`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/solicitudes` | `solicitudesController.listarSolicitudes` | Privado | `verificarToken`, `esPersonal`, `validateQuery` | Listar solicitudes con filtros |
| GET | `/solicitudes/:id` | `solicitudesController.obtenerSolicitud` | Privado | `verificarToken`, `esPersonal` | Obtener detalles de una solicitud |
| POST | `/solicitudes` | `solicitudesController.crearSolicitud` | Público | `createLimiter`, `validate` | Crear solicitud desde plataforma QR |
| PATCH | `/solicitudes/:id/completar` | `solicitudesController.completarSolicitud` | Privado | `verificarToken`, `esPersonal` | Marcar solicitud como completada |

---

## 🔔 Notificaciones (`/api/notificaciones`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/notificaciones` | `notificacionesController.listarNotificaciones` | Privado | `verificarToken`, `esPersonal`, `validateQuery` | Listar notificaciones |
| GET | `/notificaciones/:id` | `notificacionesController.obtenerNotificacion` | Privado | `verificarToken`, `esPersonal` | Obtener detalles de notificación |
| PATCH | `/notificaciones/:id/leer` | `notificacionesController.marcarComoLeida` | Privado | `verificarToken`, `esPersonal` | Marcar notificación como leída |
| PATCH | `/notificaciones/leer-todas` | `notificacionesController.marcarTodasComoLeidas` | Privado | `verificarToken`, `esPersonal` | Marcar todas como leídas |

---

## 📊 Reportes (`/api/reportes`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| POST | `/reportes/ocupacion` | `reportesController.generarReporte` | Privado | `verificarToken`, `esPersonal`, `validate` | Generar reporte de ocupación |
| GET | `/reportes/ocupacion` | `reportesController.listarReportes` | Privado | `verificarToken`, `esPersonal`, `validateQuery` | Listar reportes históricos |
| GET | `/reportes/ocupacion/:id` | `reportesController.obtenerReporte` | Privado | `verificarToken`, `esPersonal` | Obtener detalles de un reporte |

---

## 🌐 Plataforma Pública (`/api/plataforma`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/plataforma/contenido` | `plataformaController.obtenerContenido` | Público | `validateQuery` | Obtener contenido CMS por idioma |
| GET | `/plataforma/experiencias` | `plataformaController.obtenerExperiencias` | Público | `validateQuery` | Obtener experiencias turísticas |
| GET | `/plataforma/servicios` | `plataformaController.obtenerServicios` | Público | - | Obtener servicios disponibles |
| POST | `/plataforma/comentarios` | `plataformaController.crearComentario` | Público | `createLimiter`, `validate` | Crear comentario de huésped |
| GET | `/plataforma/comentarios` | `plataformaController.listarComentarios` | Público | `validateQuery` | Obtener comentarios activos |

---

## 🖼️ Galería (`/api/galeria`)

| Método | Ruta | Controlador | Acceso | Middleware | Descripción |
|--------|------|-------------|--------|------------|-------------|
| GET | `/galeria` | `galeriaController.listarImagenes` | Público | `validateQuery` | Listar imágenes de galería |
| POST | `/galeria` | `galeriaController.subirImagen` | Privado (Admin) | `verificarToken`, `esAdmin`, `upload.single('imagen')` | Subir imagen a Supabase |
| PUT | `/galeria/:id` | `galeriaController.actualizarImagen` | Privado (Admin) | `verificarToken`, `esAdmin`, `validate` | Actualizar info de imagen |
| DELETE | `/galeria/:id` | `galeriaController.eliminarImagen` | Privado (Admin) | `verificarToken`, `esAdmin` | Eliminar imagen |
| PATCH | `/galeria/:id/toggle-activo` | `galeriaController.toggleActivo` | Privado (Admin) | `verificarToken`, `esAdmin` | Activar/desactivar imagen |

---

## 📁 Resumen de Archivos

- **Rutas**: `backend/src/routes/*.routes.js`
- **Controladores**: `backend/src/controllers/*.controller.js`
- **Server**: `backend/server.js`

**Total de endpoints**: 54 endpoints
