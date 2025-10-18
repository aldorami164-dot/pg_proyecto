# AUDITORÍA COMPLETA DEL BACKEND - HOTEL CASA JOSEFA

## Tabla de Contenidos
- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Endpoints por Módulo](#endpoints-por-módulo)
- [Autenticación (AUTH)](#1-autenticación-auth)
- [Galería](#2-galería)
- [Habitaciones](#3-habitaciones)
- [Notificaciones](#4-notificaciones)
- [Plataforma Pública](#5-plataforma-pública)
- [Códigos QR](#6-códigos-qr)
- [Reportes](#7-reportes)
- [Reservas](#8-reservas)
- [Solicitudes de Servicio](#9-solicitudes-de-servicio)
- [Usuarios](#10-usuarios)

---

## Resumen Ejecutivo

### Estadísticas Generales
- **Total de Endpoints**: 46
- **Endpoints Públicos**: 8
- **Endpoints Privados**: 38
- **Módulos**: 10

### Distribución por Método HTTP
- **GET**: 19 endpoints
- **POST**: 9 endpoints
- **PUT**: 4 endpoints
- **PATCH**: 12 endpoints
- **DELETE**: 2 endpoints

---

## Endpoints por Módulo

### Tabla Resumen Completa

| # | Método | Ruta | Acceso | Descripción |
|---|--------|------|--------|-------------|
| **AUTH** | | | | |
| 1 | POST | /api/auth/login | Public | Login con email + password |
| 2 | POST | /api/auth/refresh | Public | Renovar access token |
| 3 | GET | /api/auth/me | Private | Obtener usuario autenticado |
| 4 | POST | /api/auth/logout | Private | Cerrar sesión |
| **GALERÍA** | | | | |
| 5 | GET | /api/galeria | Public | Listar imágenes |
| 6 | POST | /api/galeria | Admin | Subir imagen |
| 7 | PUT | /api/galeria/:id | Admin | Actualizar info de imagen |
| 8 | DELETE | /api/galeria/:id | Admin | Eliminar imagen |
| 9 | PATCH | /api/galeria/:id/toggle-activo | Admin | Activar/desactivar imagen |
| **HABITACIONES** | | | | |
| 10 | GET | /api/habitaciones | Personal | Listar habitaciones |
| 11 | GET | /api/habitaciones/:id | Personal | Obtener habitación |
| 12 | POST | /api/habitaciones | Admin | Crear habitación |
| 13 | PUT | /api/habitaciones/:id | Admin | Actualizar habitación |
| 14 | PATCH | /api/habitaciones/:id/estado | Personal | Cambiar estado |
| 15 | DELETE | /api/habitaciones/:id | Admin | Desactivar habitación |
| **NOTIFICACIONES** | | | | |
| 16 | GET | /api/notificaciones | Personal | Listar notificaciones |
| 17 | GET | /api/notificaciones/:id | Personal | Obtener notificación |
| 18 | PATCH | /api/notificaciones/:id/leer | Personal | Marcar como leída |
| 19 | PATCH | /api/notificaciones/leer-todas | Personal | Marcar todas como leídas |
| **PLATAFORMA** | | | | |
| 20 | GET | /api/plataforma/contenido | Public | Obtener contenido CMS |
| 21 | GET | /api/plataforma/experiencias | Public | Obtener experiencias |
| 22 | GET | /api/plataforma/servicios | Public | Obtener servicios |
| 23 | POST | /api/plataforma/comentarios | Public | Crear comentario |
| 24 | GET | /api/plataforma/comentarios | Public | Listar comentarios |
| **QR** | | | | |
| 25 | GET | /api/qr | Admin | Listar códigos QR |
| 26 | POST | /api/qr/generar | Admin | Generar QR en stock |
| 27 | PATCH | /api/qr/:id/asignar | Admin | Asignar QR a habitación |
| 28 | PATCH | /api/qr/:id/desasignar | Admin | Desasignar QR |
| 29 | GET | /api/qr/:codigo/habitacion | Public | Escanear QR |
| **REPORTES** | | | | |
| 30 | POST | /api/reportes/ocupacion | Personal | Generar reporte |
| 31 | GET | /api/reportes/ocupacion | Personal | Listar reportes |
| 32 | GET | /api/reportes/ocupacion/:id | Personal | Obtener reporte |
| **RESERVAS** | | | | |
| 33 | GET | /api/reservas | Personal | Listar reservas |
| 34 | GET | /api/reservas/disponibilidad | Public | Consultar disponibilidad |
| 35 | GET | /api/reservas/:id | Personal | Obtener reserva |
| 36 | POST | /api/reservas | Personal | Crear reserva |
| 37 | PUT | /api/reservas/:id | Personal | Actualizar reserva |
| 38 | PATCH | /api/reservas/:id/estado | Personal | Cambiar estado reserva |
| **SOLICITUDES** | | | | |
| 39 | GET | /api/solicitudes | Personal | Listar solicitudes |
| 40 | GET | /api/solicitudes/:id | Personal | Obtener solicitud |
| 41 | POST | /api/solicitudes | Public | Crear solicitud |
| 42 | PATCH | /api/solicitudes/:id/completar | Personal | Completar solicitud |
| **USUARIOS** | | | | |
| 43 | GET | /api/usuarios | Admin | Listar usuarios |
| 44 | GET | /api/usuarios/:id | Admin | Obtener usuario |
| 45 | POST | /api/usuarios | Admin | Crear usuario |
| 46 | PUT | /api/usuarios/:id | Admin | Actualizar usuario |
| 47 | PATCH | /api/usuarios/:id/toggle-activo | Admin | Activar/desactivar usuario |

---

## 1. AUTENTICACIÓN (AUTH)

### 1.1. POST /api/auth/login
**Acceso**: Public (con rate limiting)

#### Request Body:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "integer",
      "nombre": "string",
      "apellido": "string",
      "email": "string",
      "rol": "string (nombre del rol)"
    },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

#### Campos SELECT:
- `usuarios`: id, nombre, apellido, email, password_hash, activo
- `roles`: nombre (as rol)

#### Errores Posibles:
- 401: Credenciales inválidas
- 403: Usuario inactivo

---

### 1.2. POST /api/auth/refresh
**Acceso**: Public (requiere refresh token)

#### Headers:
```
Authorization: Bearer {refreshToken}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "accessToken": "string (JWT)"
  }
}
```

#### Campos SELECT:
- `usuarios`: id, email, activo
- `roles`: nombre (as rol)

#### Errores Posibles:
- 401: Refresh token no proporcionado/inválido/expirado
- 401: Usuario no válido

---

### 1.3. GET /api/auth/me
**Acceso**: Private

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "activo": "boolean",
    "ultimo_acceso": "timestamp",
    "rol": "string (nombre del rol)"
  }
}
```

#### Campos SELECT:
- `usuarios`: id, nombre, apellido, email, activo, ultimo_acceso
- `roles`: nombre (as rol)

---

### 1.4. POST /api/auth/logout
**Acceso**: Private

#### Response Success (200):
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "data": null
}
```

---

## 2. GALERÍA

### 2.1. GET /api/galeria
**Acceso**: Public

#### Query Parameters:
```
?categoria=string (opcional: hotel_exterior, habitaciones, servicios, etc.)
?activo=boolean (opcional)
?page=integer (default: 1)
?limit=integer (default: 20)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "imagenes": [
      {
        "id": "integer",
        "titulo": "string",
        "descripcion": "string",
        "url_imagen": "string (URL Supabase)",
        "categoria": "string",
        "orden": "integer",
        "activo": "boolean",
        "creado_en": "timestamp"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT:
- `imagenes_galeria`: id, titulo, descripcion, url_imagen, categoria, orden, activo, creado_en

---

### 2.2. POST /api/galeria
**Acceso**: Private (SOLO admin)

#### Request:
- **Content-Type**: multipart/form-data
- **Campo imagen**: File (JPEG, PNG, WEBP, max 5MB)
- **Campos adicionales**:
  - titulo: string (opcional)
  - descripcion: string (opcional)
  - categoria: string (default: 'hotel_exterior')
  - orden: integer (default: 0)

#### Response Success (201):
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "id": "integer",
    "titulo": "string",
    "descripcion": "string",
    "url_imagen": "string (URL pública Supabase)",
    "categoria": "string",
    "orden": "integer",
    "activo": "boolean",
    "creado_en": "timestamp"
  }
}
```

#### Campos INSERT:
- `imagenes_galeria`: titulo, descripcion, url_imagen, categoria, orden, subido_por, activo

#### Errores Posibles:
- 400: Formato no permitido o tamaño excedido
- 500: Error al subir a Supabase Storage

---

### 2.3. PUT /api/galeria/:id
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "titulo": "string (opcional)",
  "descripcion": "string (opcional)",
  "categoria": "string (opcional)",
  "orden": "integer (opcional)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Imagen actualizada exitosamente",
  "data": {
    "id": "integer",
    "titulo": "string",
    "descripcion": "string",
    "url_imagen": "string",
    "categoria": "string",
    "orden": "integer",
    "activo": "boolean",
    "creado_en": "timestamp",
    "subido_por": "integer"
  }
}
```

#### Campos UPDATE:
- `imagenes_galeria`: titulo, descripcion, categoria, orden (según campos enviados)

---

### 2.4. DELETE /api/galeria/:id
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente",
  "data": {
    "id": "integer"
  }
}
```

#### Acciones:
1. Elimina archivo de Supabase Storage
2. Elimina registro de BD

---

### 2.5. PATCH /api/galeria/:id/toggle-activo
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Imagen activada/desactivada exitosamente",
  "data": {
    "id": "integer",
    "titulo": "string",
    "descripcion": "string",
    "url_imagen": "string",
    "categoria": "string",
    "orden": "integer",
    "activo": "boolean",
    "creado_en": "timestamp",
    "subido_por": "integer"
  }
}
```

---

## 3. HABITACIONES

### 3.1. GET /api/habitaciones
**Acceso**: Private (admin/recepcionista)

#### Query Parameters:
```
?estado=string (opcional: disponible, ocupada, limpieza, mantenimiento)
?tipo_habitacion_id=integer (opcional)
?activo=boolean (opcional)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "habitaciones": [
      {
        "id": "integer",
        "numero": "string",
        "tipo_habitacion_id": "integer",
        "precio_por_noche": "decimal",
        "estado": "string",
        "descripcion": "string",
        "qr_asignado_id": "integer (nullable)",
        "activo": "boolean",
        "creado_en": "timestamp",
        "tipo_habitacion_nombre": "string (JOIN)",
        "capacidad_maxima": "integer (JOIN)",
        "tiene_qr_asignado": "boolean (CASE)"
      }
    ],
    "total": "integer"
  }
}
```

#### Campos SELECT (con JOINs):
- `habitaciones (h)`: * (todos los campos)
- `tipos_habitacion (th)`: nombre (as tipo_habitacion_nombre), capacidad_maxima
- **Calculado**: tiene_qr_asignado (CASE WHEN qr_asignado_id IS NOT NULL)

---

### 3.2. GET /api/habitaciones/:id
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "numero": "string",
    "tipo_habitacion_id": "integer",
    "precio_por_noche": "decimal",
    "estado": "string",
    "descripcion": "string",
    "qr_asignado_id": "integer",
    "activo": "boolean",
    "creado_en": "timestamp",
    "tipo_habitacion_nombre": "string (JOIN)",
    "capacidad_maxima": "integer (JOIN)",
    "tipo_descripcion": "string (JOIN)",
    "qr_codigo": "string (LEFT JOIN)",
    "qr_url": "string (LEFT JOIN)"
  }
}
```

#### Campos SELECT (con JOINs):
- `habitaciones (h)`: * (todos)
- `tipos_habitacion (th)`: nombre (as tipo_habitacion_nombre), capacidad_maxima, descripcion (as tipo_descripcion)
- `codigos_qr (qr)`: codigo (as qr_codigo), url_destino (as qr_url)

---

### 3.3. POST /api/habitaciones
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "numero": "string (required)",
  "tipo_habitacion_id": "integer (required)",
  "precio_por_noche": "decimal (required)",
  "descripcion": "string (opcional)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Habitación creada exitosamente. El QR debe asignarse manualmente desde el panel de QR",
  "data": {
    "id": "integer",
    "numero": "string",
    "tipo_habitacion_id": "integer",
    "precio_por_noche": "decimal",
    "estado": "string (default: disponible)",
    "descripcion": "string",
    "qr_asignado_id": null,
    "activo": "boolean (default: true)",
    "creado_en": "timestamp"
  }
}
```

#### Campos INSERT:
- `habitaciones`: numero, tipo_habitacion_id, precio_por_noche, descripcion

#### Errores Posibles:
- 409: Ya existe habitación con ese número
- 404: Tipo de habitación no encontrado

---

### 3.4. PUT /api/habitaciones/:id
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "precio_por_noche": "decimal (opcional)",
  "descripcion": "string (opcional)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Habitación actualizada exitosamente",
  "data": {
    "id": "integer",
    "numero": "string",
    "tipo_habitacion_id": "integer",
    "precio_por_noche": "decimal",
    "estado": "string",
    "descripcion": "string",
    "qr_asignado_id": "integer",
    "activo": "boolean",
    "creado_en": "timestamp"
  }
}
```

#### Campos UPDATE:
- `habitaciones`: precio_por_noche, descripcion (según campos enviados)

---

### 3.5. PATCH /api/habitaciones/:id/estado
**Acceso**: Private (admin/recepcionista)

#### Request Body:
```json
{
  "estado": "string (required: disponible, limpieza, mantenimiento)"
}
```

**NOTA**: El estado 'ocupada' NO se puede establecer manualmente, se maneja automáticamente por triggers al hacer check-in.

#### Response Success (200):
```json
{
  "success": true,
  "message": "Estado cambiado a {estado} exitosamente",
  "data": {
    "id": "integer",
    "numero": "string",
    "tipo_habitacion_id": "integer",
    "precio_por_noche": "decimal",
    "estado": "string",
    "descripcion": "string",
    "qr_asignado_id": "integer",
    "activo": "boolean",
    "creado_en": "timestamp"
  }
}
```

#### Campos UPDATE:
- `habitaciones`: estado

#### Errores Posibles:
- 400: Intento de establecer estado 'ocupada' manualmente

---

### 3.6. DELETE /api/habitaciones/:id
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Habitación desactivada exitosamente",
  "data": {
    "id": "integer",
    "numero": "string",
    "tipo_habitacion_id": "integer",
    "precio_por_noche": "decimal",
    "estado": "string",
    "descripcion": "string",
    "qr_asignado_id": "integer",
    "activo": false,
    "creado_en": "timestamp"
  }
}
```

#### Campos UPDATE (soft delete):
- `habitaciones`: activo = false

#### Validaciones:
- No se puede desactivar si tiene reservas activas (pendientes o confirmadas)

---

## 4. NOTIFICACIONES

### 4.1. GET /api/notificaciones
**Acceso**: Private (admin/recepcionista)

#### Query Parameters:
```
?leida=boolean (opcional)
?tipo=string (opcional: solicitud_servicio, alerta_sistema, etc.)
?limit=integer (default: 50)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id": "integer",
        "tipo": "string",
        "titulo": "string",
        "mensaje": "string",
        "prioridad": "string",
        "habitacion_numero": "string",
        "leida": "boolean",
        "creado_en": "timestamp",
        "leida_por": "integer (nullable)",
        "leida_por_nombre": "string (JOIN, nullable)",
        "fecha_lectura": "timestamp (nullable)"
      }
    ],
    "no_leidas": "integer (count)"
  }
}
```

#### Campos SELECT (con JOINs):
- `notificaciones (n)`: id, tipo, titulo, mensaje, prioridad, habitacion_numero, leida, creado_en, leida_por, fecha_lectura
- `usuarios (u)`: nombre || ' ' || apellido (as leida_por_nombre)

#### Ordenamiento:
1. No leídas primero
2. Prioridad alta primero
3. Más recientes primero

---

### 4.2. GET /api/notificaciones/:id
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "tipo": "string",
    "titulo": "string",
    "mensaje": "string",
    "prioridad": "string",
    "habitacion_numero": "string",
    "leida": "boolean",
    "creado_en": "timestamp",
    "leida_por": "integer",
    "leida_por_nombre": "string (JOIN)",
    "fecha_lectura": "timestamp"
  }
}
```

#### Campos SELECT (con JOINs):
- `notificaciones (n)`: id, tipo, titulo, mensaje, prioridad, habitacion_numero, leida, creado_en, leida_por, fecha_lectura
- `usuarios (u)`: nombre || ' ' || apellido (as leida_por_nombre)

---

### 4.3. PATCH /api/notificaciones/:id/leer
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": {
    "id": "integer",
    "tipo": "string",
    "titulo": "string",
    "mensaje": "string",
    "leida": true,
    "leida_por": "integer",
    "fecha_lectura": "timestamp"
  }
}
```

#### Campos UPDATE:
- `notificaciones`: leida = true, leida_por = req.user.id, fecha_lectura = CURRENT_TIMESTAMP

#### Errores Posibles:
- 400: La notificación ya fue leída

---

### 4.4. PATCH /api/notificaciones/leer-todas
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "message": "{cantidad} notificación(es) marcada(s) como leída(s)",
  "data": {
    "notificaciones_actualizadas": "integer"
  }
}
```

#### Campos UPDATE:
- `notificaciones`: leida = true, leida_por = req.user.id, fecha_lectura = CURRENT_TIMESTAMP
- **WHERE**: leida = false

---

## 5. PLATAFORMA PÚBLICA

### 5.1. GET /api/plataforma/contenido
**Acceso**: Public

#### Query Parameters:
```
?idioma=string (default: 'es', opciones: 'es', 'en')
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "contenido": [
      {
        "id": "integer",
        "seccion": "string",
        "titulo": "string (según idioma)",
        "contenido": "string (según idioma)",
        "orden": "integer"
      }
    ],
    "idioma": "string"
  }
}
```

#### Campos SELECT (dinámicos según idioma):
- `contenido_plataforma`: id, seccion, titulo_es/titulo_en (as titulo), contenido_es/contenido_en (as contenido), orden
- **WHERE**: activo = true
- **ORDER BY**: orden ASC

---

### 5.2. GET /api/plataforma/experiencias
**Acceso**: Public

#### Query Parameters:
```
?categoria=string (opcional)
?destacado=boolean (opcional)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "experiencias": [
      {
        "id": "integer",
        "nombre": "string",
        "categoria": "string",
        "descripcion": "string",
        "ubicacion": "string",
        "imagen_url": "string",
        "destacado": "boolean",
        "orden": "integer"
      }
    ]
  }
}
```

#### Campos SELECT:
- `experiencias_turisticas`: id, nombre, categoria, descripcion, ubicacion, imagen_url, destacado, orden
- **WHERE**: activo = true
- **ORDER BY**: destacadas primero, luego por orden

---

### 5.3. GET /api/plataforma/servicios
**Acceso**: Public

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "servicios": [
      {
        "id": "integer",
        "nombre": "string",
        "descripcion": "string",
        "categoria": "string",
        "precio": "decimal (nullable)",
        "tiene_costo": "boolean",
        "horario": "string (formateado: HH:MM - HH:MM)"
      }
    ]
  }
}
```

#### Campos SELECT:
- `servicios`: id, nombre, descripcion, categoria, precio, tiene_costo, horario_inicio, horario_fin
- **WHERE**: activo = true
- **ORDER BY**: tiene_costo DESC, nombre ASC

#### Transformación en Response:
- `horario`: Combinación de horario_inicio y horario_fin formateado
- horario_inicio y horario_fin se excluyen del response final

---

### 5.4. POST /api/plataforma/comentarios
**Acceso**: Public (con rate limiting)

#### Request Body:
```json
{
  "nombre_huesped": "string (required)",
  "comentario": "string (required)",
  "calificacion": "integer (required, 1-5)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Comentario creado exitosamente. Será visible una vez aprobado.",
  "data": {
    "id": "integer",
    "nombre_huesped": "string",
    "comentario": "string",
    "calificacion": "integer",
    "creado_en": "timestamp"
  }
}
```

#### Campos INSERT:
- `comentarios_huespedes`: nombre_huesped, comentario, calificacion, activo = true

---

### 5.5. GET /api/plataforma/comentarios
**Acceso**: Public

#### Query Parameters:
```
?limit=integer (default: 10)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "comentarios": [
      {
        "id": "integer",
        "nombre_huesped": "string",
        "comentario": "string",
        "calificacion": "integer",
        "creado_en": "timestamp"
      }
    ],
    "total": "integer",
    "promedio_calificacion": "decimal (3,2)"
  }
}
```

#### Campos SELECT:
- `comentarios_huespedes`: id, nombre_huesped, comentario, calificacion, creado_en
- **WHERE**: activo = true
- **ORDER BY**: creado_en DESC
- **Calculado**: AVG(calificacion) para promedio

---

## 6. CÓDIGOS QR

### 6.1. GET /api/qr
**Acceso**: Private (SOLO admin)

#### Query Parameters:
```
?estado=string (opcional: sin_asignar, asignado, inactivo)
?page=integer (default: 1)
?limit=integer (default: 50)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "codigos_qr": [
      {
        "id": "integer",
        "codigo": "string (UUID)",
        "url_destino": "string",
        "estado": "string",
        "habitacion_id": "integer (nullable)",
        "habitacion_numero": "string (JOIN, nullable)",
        "total_lecturas": "integer",
        "ultima_lectura": "timestamp (nullable)",
        "fecha_asignacion": "timestamp (nullable)",
        "creado_en": "timestamp",
        "creado_por_nombre": "string (JOIN)"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT (con JOINs):
- `codigos_qr (cq)`: id, codigo, url_destino, estado, habitacion_id, total_lecturas, ultima_lectura, fecha_asignacion, creado_en
- `habitaciones (h)`: numero (as habitacion_numero)
- `usuarios (u)`: nombre || ' ' || apellido (as creado_por_nombre)

---

### 6.2. POST /api/qr/generar
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "cantidad": "integer (required, 1-100)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "{cantidad} código(s) QR generado(s) exitosamente",
  "data": {
    "generados": "integer",
    "codigos_qr": [
      {
        "id": "integer",
        "codigo": "string (UUID generado automáticamente)",
        "url_destino": "string (https://casajosefa.com/habitacion/PENDIENTE)",
        "estado": "string (sin_asignar)",
        "creado_en": "timestamp"
      }
    ]
  }
}
```

#### Campos INSERT:
- `codigos_qr`: url_destino, estado = 'sin_asignar', creado_por = req.user.id
- **Nota**: El campo `codigo` se genera automáticamente por trigger (UUID)

---

### 6.3. PATCH /api/qr/:id/asignar
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "habitacion_id": "integer (required)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Código QR asignado exitosamente",
  "data": {
    "id": "integer",
    "codigo": "string (UUID)",
    "url_destino": "string (actualizado con número de habitación)",
    "habitacion_id": "integer",
    "estado": "string (asignado)",
    "fecha_asignacion": "timestamp",
    "habitacion": {
      "id": "integer",
      "numero": "string"
    }
  }
}
```

#### Campos UPDATE (Transacción):
1. **codigos_qr**: habitacion_id, url_destino = `https://casajosefa.com/habitacion/{numero}`, estado = 'asignado', fecha_asignacion = CURRENT_TIMESTAMP
2. **habitaciones**: qr_asignado_id = {qr_id}

#### Validaciones:
- QR debe estar disponible (no asignado)
- Habitación debe existir y estar activa
- Habitación no debe tener QR asignado previamente

#### Errores Posibles:
- 400: QR ya asignado o habitación ya tiene QR

---

### 6.4. PATCH /api/qr/:id/desasignar
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Código QR desasignado exitosamente",
  "data": {
    "id": "integer",
    "codigo": "string (UUID)",
    "url_destino": "string (https://casajosefa.com/habitacion/PENDIENTE)",
    "estado": "string (sin_asignar)"
  }
}
```

#### Campos UPDATE (Transacción):
1. **habitaciones**: qr_asignado_id = NULL
2. **codigos_qr**: habitacion_id = NULL, url_destino = 'https://casajosefa.com/habitacion/PENDIENTE', estado = 'sin_asignar', fecha_asignacion = NULL

---

### 6.5. GET /api/qr/:codigo/habitacion
**Acceso**: Public (Escaneo de QR)

#### Params:
- `codigo`: UUID del código QR

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "habitacion": {
      "id": "integer",
      "numero": "string",
      "tipo": "string (JOIN)",
      "tipo_descripcion": "string (JOIN)",
      "capacidad_maxima": "integer (JOIN)",
      "descripcion": "string"
    },
    "mensaje_bienvenida": "string"
  }
}
```

#### Campos SELECT (con JOINs):
- `habitaciones (h)`: id, numero, descripcion
- `tipos_habitacion (th)`: nombre (as tipo), descripcion (as tipo_descripcion), capacidad_maxima
- **WHERE**: codigo = $1 AND h.activo = true

#### Acciones Adicionales:
- **UPDATE codigos_qr**: total_lecturas = total_lecturas + 1, ultima_lectura = CURRENT_TIMESTAMP

#### Errores Posibles:
- 404: QR no encontrado
- 403: QR desactivado
- 400: QR no asignado a habitación
- 404: Habitación no encontrada o inactiva

---

## 7. REPORTES

### 7.1. POST /api/reportes/ocupacion
**Acceso**: Private (admin/recepcionista)

#### Request Body:
```json
{
  "fecha_inicio": "date (required, YYYY-MM-DD)",
  "fecha_fin": "date (required, YYYY-MM-DD)",
  "tipo_periodo": "string (required: diario, semanal, mensual)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": {
    "id": "integer",
    "fecha_inicio": "date",
    "fecha_fin": "date",
    "tipo_periodo": "string",
    "total_habitaciones": "integer",
    "habitaciones_ocupadas": "integer",
    "porcentaje_ocupacion": "decimal",
    "total_reservas": "integer",
    "generado_en": "timestamp",
    "generado_por_nombre": "string (JOIN)"
  }
}
```

#### Función PostgreSQL:
- **Llamada**: `SELECT generar_reporte_ocupacion($1, $2, $3, $4)`
- **Parámetros**: fecha_inicio, fecha_fin, tipo_periodo, generado_por

#### Campos SELECT (JOIN):
- `reportes_ocupacion (r)`: id, fecha_inicio, fecha_fin, tipo_periodo, total_habitaciones, habitaciones_ocupadas, porcentaje_ocupacion, total_reservas, generado_en
- `usuarios (u)`: nombre || ' ' || apellido (as generado_por_nombre)

---

### 7.2. GET /api/reportes/ocupacion
**Acceso**: Private (admin/recepcionista)

#### Query Parameters:
```
?tipo_periodo=string (opcional: diario, semanal, mensual)
?fecha_desde=date (opcional)
?fecha_hasta=date (opcional)
?page=integer (default: 1)
?limit=integer (default: 20)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "reportes": [
      {
        "id": "integer",
        "fecha_inicio": "date",
        "fecha_fin": "date",
        "tipo_periodo": "string",
        "total_habitaciones": "integer",
        "habitaciones_ocupadas": "integer",
        "porcentaje_ocupacion": "decimal",
        "total_reservas": "integer",
        "generado_en": "timestamp",
        "generado_por_nombre": "string (JOIN)"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT (con JOINs):
- `reportes_ocupacion (r)`: id, fecha_inicio, fecha_fin, tipo_periodo, total_habitaciones, habitaciones_ocupadas, porcentaje_ocupacion, total_reservas, generado_en
- `usuarios (u)`: nombre || ' ' || apellido (as generado_por_nombre)
- **ORDER BY**: generado_en DESC

---

### 7.3. GET /api/reportes/ocupacion/:id
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "fecha_inicio": "date",
    "fecha_fin": "date",
    "tipo_periodo": "string",
    "total_habitaciones": "integer",
    "habitaciones_ocupadas": "integer",
    "porcentaje_ocupacion": "decimal",
    "total_reservas": "integer",
    "generado_en": "timestamp",
    "generado_por_nombre": "string (JOIN)",
    "generado_por_email": "string (JOIN)"
  }
}
```

#### Campos SELECT (con JOINs):
- `reportes_ocupacion (r)`: id, fecha_inicio, fecha_fin, tipo_periodo, total_habitaciones, habitaciones_ocupadas, porcentaje_ocupacion, total_reservas, generado_en
- `usuarios (u)`: nombre || ' ' || apellido (as generado_por_nombre), email (as generado_por_email)

---

## 8. RESERVAS

### 8.1. GET /api/reservas
**Acceso**: Private (admin/recepcionista)

#### Query Parameters:
```
?estado=string (opcional: pendiente, confirmada, completada, cancelada)
?canal=string (opcional: web, telefono, correo, presencial)
?fecha_desde=date (opcional)
?fecha_hasta=date (opcional)
?habitacion_id=integer (opcional)
?page=integer (required)
?limit=integer (required)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "reservas": [
      {
        "id": "integer",
        "codigo_reserva": "string",
        "huesped_id": "integer",
        "habitacion_id": "integer",
        "fecha_checkin": "date",
        "fecha_checkout": "date",
        "precio_por_noche": "decimal",
        "numero_huespedes": "integer",
        "canal_reserva": "string",
        "estado_id": "integer",
        "notas": "string (nullable)",
        "creado_por": "integer",
        "creado_en": "timestamp",
        "huesped_nombre": "string (JOIN)",
        "huesped_apellido": "string (JOIN)",
        "huesped_email": "string (JOIN)",
        "habitacion_numero": "string (JOIN)",
        "tipo_habitacion": "string (JOIN)",
        "estado_nombre": "string (JOIN)",
        "estado_color": "string (JOIN)"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT (con JOINs):
- `reservas (r)`: * (todos los campos)
- `huespedes (h)`: nombre (as huesped_nombre), apellido (as huesped_apellido), email (as huesped_email)
- `habitaciones (hab)`: numero (as habitacion_numero)
- `tipos_habitacion (th)`: nombre (as tipo_habitacion)
- `estados_reserva (er)`: nombre (as estado_nombre), color_hex (as estado_color)
- **ORDER BY**: creado_en DESC

---

### 8.2. GET /api/reservas/disponibilidad
**Acceso**: Public

#### Query Parameters:
```
?fecha_checkin=date (required)
?fecha_checkout=date (required)
?tipo_habitacion_id=integer (opcional)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "fecha_checkin": "date",
    "fecha_checkout": "date",
    "disponibles": [
      {
        "id": "integer",
        "numero": "string",
        "precio_por_noche": "decimal",
        "descripcion": "string",
        "tipo": "string (JOIN)",
        "capacidad_maxima": "integer (JOIN)"
      }
    ],
    "total": "integer"
  }
}
```

#### Campos SELECT (con JOINs):
- `habitaciones (h)`: id, numero, precio_por_noche, descripcion
- `tipos_habitacion (th)`: nombre (as tipo), capacidad_maxima
- **WHERE**: h.activo = true

#### Validación:
- **Función**: `validar_solapamiento_reservas(habitacion_id, fecha_checkin, fecha_checkout, NULL)` debe retornar `true`

---

### 8.3. GET /api/reservas/:id
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "codigo_reserva": "string",
    "huesped_id": "integer",
    "habitacion_id": "integer",
    "fecha_checkin": "date",
    "fecha_checkout": "date",
    "precio_por_noche": "decimal",
    "numero_huespedes": "integer",
    "canal_reserva": "string",
    "estado_id": "integer",
    "notas": "string",
    "creado_por": "integer",
    "creado_en": "timestamp",
    "checkin_por": "integer (nullable)",
    "checkout_por": "integer (nullable)",
    "fecha_cancelacion": "timestamp (nullable)",
    "huesped": {
      "id": "integer",
      "nombre": "string",
      "apellido": "string",
      "email": "string",
      "telefono": "string",
      "dpi_pasaporte": "string",
      "pais": "string"
    },
    "habitacion": {
      "id": "integer",
      "numero": "string",
      "tipo": "string",
      "precio_por_noche": "decimal"
    },
    "estado": {
      "nombre": "string",
      "color": "string"
    }
  }
}
```

#### Campos SELECT (con JOINs JSON):
- `reservas (r)`: * (todos)
- `huespedes (h)`: json_build_object con id, nombre, apellido, email, telefono, dpi_pasaporte, pais
- `habitaciones (hab)`: json_build_object con id, numero
- `tipos_habitacion (th)`: nombre (incluido en habitacion JSON)
- `estados_reserva (er)`: json_build_object con nombre, color_hex

---

### 8.4. POST /api/reservas
**Acceso**: Private (admin/recepcionista)

#### Request Body (Huésped Nuevo):
```json
{
  "huesped": {
    "nombre": "string (required)",
    "apellido": "string (opcional)",
    "dpi_pasaporte": "string (opcional)",
    "email": "string (opcional)",
    "telefono": "string (opcional)",
    "pais": "string (opcional)",
    "direccion": "string (opcional)",
    "fecha_nacimiento": "date (opcional)"
  },
  "habitacion_id": "integer (required)",
  "fecha_checkin": "date (required)",
  "fecha_checkout": "date (required)",
  "numero_huespedes": "integer (required)",
  "canal_reserva": "string (required)",
  "notas": "string (opcional)"
}
```

#### Request Body (Huésped Existente):
```json
{
  "huesped_id": "integer (required)",
  "habitacion_id": "integer (required)",
  "fecha_checkin": "date (required)",
  "fecha_checkout": "date (required)",
  "numero_huespedes": "integer (required)",
  "canal_reserva": "string (required)",
  "notas": "string (opcional)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id": "integer",
    "codigo_reserva": "string (generado automáticamente)",
    "huesped_id": "integer",
    "habitacion_id": "integer",
    "fecha_checkin": "date",
    "fecha_checkout": "date",
    "precio_por_noche": "decimal (obtenido de habitación)",
    "numero_huespedes": "integer",
    "canal_reserva": "string",
    "estado_id": "integer (pendiente)",
    "notas": "string",
    "creado_por": "integer",
    "creado_en": "timestamp",
    "huesped_nombre": "string (JOIN)",
    "huesped_apellido": "string (JOIN)",
    "habitacion_numero": "string (JOIN)",
    "tipo_habitacion": "string (JOIN)",
    "estado_nombre": "string (JOIN)"
  }
}
```

#### Lógica de Creación (Transacción):
1. **Si huesped_id**: Validar que existe
2. **Si huesped (objeto)**: Crear nuevo huésped en tabla `huespedes`
3. Obtener precio de habitación desde `habitaciones` JOIN `tipos_habitacion`
4. Validar capacidad máxima
5. **Validar solapamiento**: `validar_solapamiento_reservas(habitacion_id, fecha_checkin, fecha_checkout, NULL)`
6. **INSERT reservas**: con estado_id = (SELECT id FROM estados_reserva WHERE nombre = 'pendiente')
7. Retornar datos completos con JOINs

#### Errores Posibles:
- 404: Huésped/habitación no encontrado
- 400: Habitación inactiva o excede capacidad
- 409: Habitación no disponible en fechas solicitadas

---

### 8.5. PUT /api/reservas/:id
**Acceso**: Private (admin/recepcionista)

#### Request Body:
```json
{
  "fecha_checkin": "date (opcional)",
  "fecha_checkout": "date (opcional)",
  "numero_huespedes": "integer (opcional)",
  "notas": "string (opcional)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Reserva actualizada exitosamente",
  "data": {
    "id": "integer",
    "codigo_reserva": "string",
    "huesped_id": "integer",
    "habitacion_id": "integer",
    "fecha_checkin": "date",
    "fecha_checkout": "date",
    "precio_por_noche": "decimal",
    "numero_huespedes": "integer",
    "canal_reserva": "string",
    "estado_id": "integer",
    "notas": "string",
    "creado_por": "integer",
    "creado_en": "timestamp"
  }
}
```

#### Validaciones:
- Reserva NO debe estar completada o cancelada
- Si cambian fechas: validar solapamiento con `validar_solapamiento_reservas(habitacion_id, fecha_checkin, fecha_checkout, reserva_id)`

#### Campos UPDATE (dinámicos):
- `reservas`: fecha_checkin, fecha_checkout, numero_huespedes, notas (según campos enviados)

---

### 8.6. PATCH /api/reservas/:id/estado
**Acceso**: Private (admin/recepcionista)

#### Request Body:
```json
{
  "estado": "string (required: pendiente, confirmada, completada, cancelada)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Reserva {estado} exitosamente",
  "data": {
    "id": "integer",
    "codigo_reserva": "string",
    "huesped_id": "integer",
    "habitacion_id": "integer",
    "fecha_checkin": "date",
    "fecha_checkout": "date",
    "precio_por_noche": "decimal",
    "numero_huespedes": "integer",
    "canal_reserva": "string",
    "estado_id": "integer",
    "notas": "string",
    "creado_por": "integer",
    "creado_en": "timestamp",
    "checkin_por": "integer (si se confirmó)",
    "checkout_por": "integer (si se completó)",
    "fecha_cancelacion": "timestamp (si se canceló)"
  }
}
```

#### Transiciones Válidas:
- **pendiente** → confirmada, cancelada
- **confirmada** → completada, cancelada
- **completada** → (ninguna)
- **cancelada** → (ninguna)

#### Campos UPDATE (según estado):
1. **Siempre**: estado_id = (SELECT id FROM estados_reserva WHERE nombre = $1)
2. **Si confirmada**: checkin_por = req.user.id
3. **Si completada**: checkout_por = req.user.id
4. **Si cancelada**: fecha_cancelacion = CURRENT_TIMESTAMP

#### Trigger Automático:
- Al cambiar a 'confirmada': habitación se marca como 'ocupada'
- Al cambiar a 'completada': habitación vuelve a 'disponible'

---

## 9. SOLICITUDES DE SERVICIO

### 9.1. GET /api/solicitudes
**Acceso**: Private (admin/recepcionista)

#### Query Parameters:
```
?estado=string (opcional: pendiente, completada)
?habitacion_id=integer (opcional)
?page=integer (default: 1)
?limit=integer (default: 20)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "solicitudes": [
      {
        "id": "integer",
        "habitacion_id": "integer",
        "habitacion_numero": "string (JOIN)",
        "servicio_id": "integer",
        "servicio_nombre": "string (JOIN)",
        "servicio_categoria": "string (JOIN)",
        "servicio_precio": "decimal (JOIN)",
        "tiene_costo": "boolean (JOIN)",
        "origen": "string",
        "estado": "string",
        "notas": "string",
        "creado_en": "timestamp",
        "atendido_por": "integer (nullable)",
        "atendido_por_nombre": "string (JOIN, nullable)",
        "fecha_atencion": "timestamp (nullable)"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT (con JOINs):
- `solicitudes_servicios (ss)`: id, habitacion_id, servicio_id, origen, estado, notas, creado_en, atendido_por, fecha_atencion
- `habitaciones (h)`: numero (as habitacion_numero)
- `servicios (s)`: nombre (as servicio_nombre), categoria (as servicio_categoria), precio (as servicio_precio), tiene_costo
- `usuarios (u)`: nombre || ' ' || apellido (as atendido_por_nombre)

#### Ordenamiento:
1. Pendientes primero (CASE)
2. Más recientes primero (creado_en DESC)

---

### 9.2. GET /api/solicitudes/:id
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "habitacion_id": "integer",
    "habitacion_numero": "string (JOIN)",
    "servicio_id": "integer",
    "servicio_nombre": "string (JOIN)",
    "servicio_descripcion": "string (JOIN)",
    "servicio_categoria": "string (JOIN)",
    "servicio_precio": "decimal (JOIN)",
    "tiene_costo": "boolean (JOIN)",
    "origen": "string",
    "estado": "string",
    "notas": "string",
    "creado_en": "timestamp",
    "atendido_por": "integer",
    "atendido_por_nombre": "string (JOIN)",
    "fecha_atencion": "timestamp"
  }
}
```

#### Campos SELECT (con JOINs):
- `solicitudes_servicios (ss)`: id, habitacion_id, servicio_id, origen, estado, notas, creado_en, atendido_por, fecha_atencion
- `habitaciones (h)`: numero (as habitacion_numero)
- `servicios (s)`: nombre, descripcion, categoria, precio, tiene_costo (todos con prefijo servicio_)
- `usuarios (u)`: nombre || ' ' || apellido (as atendido_por_nombre)

---

### 9.3. POST /api/solicitudes
**Acceso**: Public (con rate limiting)

#### Request Body:
```json
{
  "habitacion_id": "integer (required)",
  "servicio_id": "integer (required)",
  "origen": "string (default: 'plataforma_qr')",
  "notas": "string (opcional)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Solicitud de servicio creada exitosamente",
  "data": {
    "id": "integer",
    "habitacion_id": "integer",
    "servicio_id": "integer",
    "origen": "string",
    "estado": "string (pendiente)",
    "notas": "string",
    "creado_en": "timestamp",
    "habitacion_numero": "string",
    "servicio_nombre": "string"
  }
}
```

#### Validaciones:
1. Habitación existe y está activa
2. Servicio existe y está activo

#### Campos INSERT:
- `solicitudes_servicios`: habitacion_id, servicio_id, origen, notas, estado = 'pendiente'

#### Trigger Automático:
- Se crea notificación automáticamente para personal

---

### 9.4. PATCH /api/solicitudes/:id/completar
**Acceso**: Private (admin/recepcionista)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Solicitud marcada como completada",
  "data": {
    "id": "integer",
    "habitacion_id": "integer",
    "servicio_id": "integer",
    "estado": "string (completada)",
    "atendido_por": "integer",
    "fecha_atencion": "timestamp"
  }
}
```

#### Validaciones:
- Solicitud NO debe estar ya completada

#### Campos UPDATE:
- `solicitudes_servicios`: estado = 'completada', atendido_por = req.user.id, fecha_atencion = CURRENT_TIMESTAMP

---

## 10. USUARIOS

### 10.1. GET /api/usuarios
**Acceso**: Private (SOLO admin)

#### Query Parameters:
```
?activo=boolean (opcional)
?rol_id=integer (opcional)
?page=integer (default: 1)
?limit=integer (default: 20)
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "integer",
        "nombre": "string",
        "apellido": "string",
        "email": "string",
        "rol_id": "integer",
        "rol": "string (JOIN)",
        "activo": "boolean",
        "ultimo_acceso": "timestamp",
        "creado_en": "timestamp"
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
}
```

#### Campos SELECT (con JOINs):
- `usuarios (u)`: id, nombre, apellido, email, rol_id, activo, ultimo_acceso, creado_en
- `roles (r)`: nombre (as rol)
- **ORDER BY**: creado_en DESC

---

### 10.2. GET /api/usuarios/:id
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "rol_id": "integer",
    "rol": "string (JOIN)",
    "activo": "boolean",
    "ultimo_acceso": "timestamp",
    "creado_en": "timestamp"
  }
}
```

#### Campos SELECT (con JOINs):
- `usuarios (u)`: id, nombre, apellido, email, rol_id, activo, ultimo_acceso, creado_en
- `roles (r)`: nombre (as rol)

---

### 10.3. POST /api/usuarios
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "nombre": "string (required)",
  "apellido": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 8 caracteres)",
  "rol_id": "integer (required)"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "integer",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "rol_id": "integer",
    "rol": "string",
    "activo": "boolean (true)",
    "creado_en": "timestamp"
  }
}
```

#### Validaciones:
1. Email no debe existir
2. Rol debe existir

#### Campos INSERT:
- `usuarios`: nombre, apellido, email, password (hash bcrypt con 10 rounds), rol_id, activo = true

#### Errores Posibles:
- 409: Email ya registrado
- 404: Rol no encontrado

---

### 10.4. PUT /api/usuarios/:id
**Acceso**: Private (SOLO admin)

#### Request Body:
```json
{
  "nombre": "string (opcional)",
  "apellido": "string (opcional)",
  "email": "string (opcional)",
  "rol_id": "integer (opcional)",
  "password": "string (opcional)"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "integer",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "rol_id": "integer",
    "rol": "string",
    "activo": "boolean"
  }
}
```

#### Validaciones:
1. Usuario debe existir
2. Si email cambia: no debe estar en uso por otro usuario
3. Si rol_id cambia: rol debe existir
4. Si password cambia: se hashea con bcrypt

#### Campos UPDATE (dinámicos):
- `usuarios`: nombre, apellido, email, rol_id, password (según campos enviados)

#### Errores Posibles:
- 404: Usuario/rol no encontrado
- 409: Email en uso

---

### 10.5. PATCH /api/usuarios/:id/toggle-activo
**Acceso**: Private (SOLO admin)

#### Response Success (200):
```json
{
  "success": true,
  "message": "Usuario activado/desactivado exitosamente",
  "data": {
    "id": "integer",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "activo": "boolean"
  }
}
```

#### Validaciones:
- Usuario NO puede desactivarse a sí mismo

#### Campos UPDATE:
- `usuarios`: activo = !activo (toggle)

#### Errores Posibles:
- 400: Intento de desactivarse a sí mismo

---

## HALLAZGOS Y RECOMENDACIONES

### Hallazgos Importantes

#### 1. Campos con Nombres Inconsistentes en JOINs
- **habitaciones.numero** → Devuelto como `habitacion_numero` en algunos endpoints
- **tipos_habitacion.nombre** → Devuelto como `tipo_habitacion_nombre` o `tipo`
- **usuarios.nombre + apellido** → Concatenado como `leida_por_nombre`, `generado_por_nombre`, etc.

#### 2. Endpoints Públicos (Sin Autenticación)
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/galeria
- GET /api/plataforma/* (todos)
- GET /api/qr/:codigo/habitacion
- GET /api/reservas/disponibilidad
- POST /api/solicitudes

#### 3. Triggers Automáticos
- **Generación UUID**: Campo `codigo` en `codigos_qr`
- **Generación código reserva**: Campo `codigo_reserva` en `reservas`
- **Notificaciones**: Al crear solicitud de servicio
- **Estado habitación**: Al cambiar estado de reserva (confirmada → ocupada, completada → disponible)

#### 4. Funciones PostgreSQL
- `validar_solapamiento_reservas(habitacion_id, fecha_checkin, fecha_checkout, reserva_id_excluir)`
- `generar_reporte_ocupacion(fecha_inicio, fecha_fin, tipo_periodo, generado_por)`

### Recomendaciones

1. **Estandarizar nombres de campos en JOINs**
   - Usar siempre el mismo patrón: `tabla_campo` (ej: `habitacion_numero`, `tipo_nombre`)

2. **Documentación de rate limiting**
   - Especificar límites exactos para endpoints públicos

3. **Validación de archivos en Galería**
   - Tipos permitidos: JPEG, PNG, WEBP
   - Tamaño máximo: 5MB
   - Almacenamiento: Supabase Storage bucket 'galeria'

4. **Transacciones críticas**
   - Asignar/desasignar QR usa transacciones
   - Crear reserva usa transacciones
   - Eliminar imagen usa transacciones
   - Desactivar habitación usa transacciones

---

## CONCLUSIONES

### Resumen de Cobertura
- ✅ Todos los 46 endpoints documentados
- ✅ Request/Response structures completas
- ✅ Campos SELECT especificados (incluyendo JOINs)
- ✅ Validaciones y errores documentados
- ✅ Triggers y funciones PostgreSQL identificados

### Endpoints Más Complejos
1. **POST /api/reservas**: Lógica de creación de huésped + validación de solapamiento
2. **PATCH /api/qr/:id/asignar**: Transacción bidireccional QR ↔ Habitación
3. **POST /api/galeria**: Upload a Supabase + registro en BD
4. **GET /api/reservas/:id**: Respuesta con JSON anidados (huésped, habitación, estado)

### Casos Edge Documentados
- No se puede establecer habitación como 'ocupada' manualmente
- Admin no puede desactivarse a sí mismo
- Reservas completadas/canceladas no se pueden editar
- Habitaciones con reservas activas no se pueden desactivar
- QR solo se puede asignar si está disponible y habitación no tiene QR

---

**Fecha de Auditoría**: 2025-10-06
**Versión Backend**: Actual
**Total de Archivos Analizados**: 20 (10 controladores + 10 rutas)
