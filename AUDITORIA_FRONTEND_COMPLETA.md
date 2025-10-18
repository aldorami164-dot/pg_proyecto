# AUDITORIA COMPLETA Y EXHAUSTIVA DEL FRONTEND

**Fecha:** 2025-10-06
**Sistema:** Casa Josefa - Sistema de Gestión Hotelera
**Ubicación:** C:\Users\hpenv\Music\PG IMPLEMENTACION\frontend

---

## 1. RESUMEN EJECUTIVO

Esta auditoría documenta **TODAS** las llamadas HTTP del frontend, identificando:
- Servicios utilizados
- Métodos invocados
- Endpoints del backend
- Parámetros enviados
- Cómo se extraen los datos de las respuestas
- Inconsistencias encontradas

---

## 2. SERVICIOS ANALIZADOS

### 2.1 API Base (`api.js`)
**Ubicación:** `frontend/src/shared/services/api.js`

**Configuración:**
- Base URL: `http://localhost:3000/api` (desde `VITE_API_URL`)
- Interceptor de Request: Agrega token desde `localStorage.getItem('accessToken')`
- Interceptor de Response: Maneja refresh token en errores 401

**Estructura de respuesta del backend:**
```javascript
{
  success: boolean,
  message: string,
  data: { ... }
}
```

---

### 2.2 authService.js
**Ubicación:** `frontend/src/shared/services/authService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `login()` | POST `/auth/login` | `{ email, password }` | `response.data.data` → `{ user, accessToken, refreshToken }` | 11-22 |
| `logout()` | POST `/auth/logout` | ninguno | N/A | 27-38 |
| `refreshToken()` | POST `/auth/refresh` | ninguno | `response.data.data.accessToken` | 43-48 |
| `me()` | GET `/auth/me` | ninguno | `response.data.data` (usuario) | 53-59 |

---

### 2.3 galeriaService.js
**Ubicación:** `frontend/src/shared/services/galeriaService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getImagenes(params)` | GET `/galeria` | `params` (query string) | `response.data.data` | 10-13 |
| `uploadImagen(formData)` | POST `/galeria` | `formData` (multipart) | `response.data.data` | 18-25 |
| `updateImagen(id, data)` | PUT `/galeria/:id` | `imagenData` | `response.data.data` | 30-33 |
| `deleteImagen(id)` | DELETE `/galeria/:id` | ninguno | `response.data.data` | 38-41 |
| `toggleActivo(id)` | PATCH `/galeria/:id/toggle-activo` | ninguno | `response.data.data` | 46-49 |

**Alias:** `listar`, `subir`, `actualizar`, `eliminar`, `toggle` (líneas 52-56)

---

### 2.4 habitacionesService.js
**Ubicación:** `frontend/src/shared/services/habitacionesService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getHabitaciones(params)` | GET `/habitaciones` | `params` (query string) | `response.data.data` | 10-13 |
| `getHabitacion(id)` | GET `/habitaciones/:id` | ninguno | `response.data.data` | 18-21 |
| `createHabitacion(data)` | POST `/habitaciones` | `habitacionData` | `response.data.data` | 26-29 |
| `updateHabitacion(id, data)` | PUT `/habitaciones/:id` | `habitacionData` | `response.data.data` | 34-37 |
| `deleteHabitacion(id)` | DELETE `/habitaciones/:id` | ninguno | `response.data.data` | 42-45 |
| `cambiarEstado(id, estado)` | PATCH `/habitaciones/:id/estado` | `{ estado }` | `response.data.data` | 50-53 |

**Alias:** `listar`, `crear`, `actualizar`, `desactivar` (líneas 56-60)

---

### 2.5 notificacionesService.js
**Ubicación:** `frontend/src/shared/services/notificacionesService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getNotificaciones(params)` | GET `/notificaciones` | `params` (query string) | `response.data.data` | 10-13 |
| `getNotificacion(id)` | GET `/notificaciones/:id` | ninguno | `response.data.data` | 18-21 |
| `marcarLeida(id)` | PATCH `/notificaciones/:id/leer` | ninguno | `response.data.data` | 26-29 |
| `marcarTodasLeidas()` | PATCH `/notificaciones/leer-todas` | ninguno | `response.data.data` | 34-37 |

---

### 2.6 plataformaService.js
**Ubicación:** `frontend/src/shared/services/plataformaService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getContenido()` | GET `/plataforma/contenido` | ninguno | `response.data.data` | 10-13 |
| `getExperiencias(params)` | GET `/plataforma/experiencias` | `params` (query string) | `response.data.data` | 18-21 |
| `getServicios()` | GET `/plataforma/servicios` | ninguno | `response.data.data` | 26-29 |
| `createComentario(data)` | POST `/plataforma/comentarios` | `comentarioData` | `response.data.data` | 34-37 |
| `getComentarios(params)` | GET `/plataforma/comentarios` | `params` (query string) | `response.data.data` | 42-45 |

---

### 2.7 qrService.js
**Ubicación:** `frontend/src/shared/services/qrService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getCodigosQR(params)` | GET `/qr` | `params` (query string) | `response.data.data` | 10-13 |
| `generarCodigoQR()` | POST `/qr/generar` | ninguno | `response.data.data` | 18-21 |
| `asignarQR(id, habitacion_id)` | PATCH `/qr/:id/asignar` | `{ habitacion_id }` | `response.data.data` | 26-29 |
| `desasignarQR(id)` | PATCH `/qr/:id/desasignar` | ninguno | `response.data.data` | 34-37 |
| `getHabitacionPorCodigo(codigo)` | GET `/qr/:codigo/habitacion` | ninguno | `response.data.data` | 42-45 |

**Alias:** `listar`, `generar`, `asignar`, `desasignar` (líneas 48-52)

---

### 2.8 reportesService.js
**Ubicación:** `frontend/src/shared/services/reportesService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `generarReporteOcupacion(data)` | POST `/reportes/ocupacion` | `reporteData` | `response.data.data` | 10-13 |
| `getReportesOcupacion(params)` | GET `/reportes/ocupacion` | `params` (query string) | `response.data.data` | 18-21 |
| `getReporteOcupacion(id)` | GET `/reportes/ocupacion/:id` | ninguno | `response.data.data` | 26-29 |

**Alias:** `generar`, `listar`, `obtener` (líneas 32-35)

---

### 2.9 reservasService.js
**Ubicación:** `frontend/src/shared/services/reservasService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getReservas(params)` | GET `/reservas` | `params` (query string) | `response.data.data` | 10-13 |
| `getReserva(id)` | GET `/reservas/:id` | ninguno | `response.data.data` | 18-21 |
| `createReserva(data)` | POST `/reservas` | `reservaData` | `response.data.data` | 26-29 |
| `updateReserva(id, data)` | PUT `/reservas/:id` | `reservaData` | `response.data.data` | 34-37 |
| `cambiarEstado(id, estado, motivo)` | PATCH `/reservas/:id/estado` | `{ estado, motivo_cancelacion }` | `response.data.data` | 42-48 |
| `verificarDisponibilidad(fecha_entrada, fecha_salida, tipo)` | GET `/reservas/disponibilidad` | `params` (query string) | `response.data.data` | 53-58 |

**Alias:** `listar`, `crear`, `actualizar`, `cambiar` (líneas 61-65)

---

### 2.10 solicitudesService.js
**Ubicación:** `frontend/src/shared/services/solicitudesService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getSolicitudes(params)` | GET `/solicitudes` | `params` (query string) | `response.data.data` | 10-13 |
| `getSolicitud(id)` | GET `/solicitudes/:id` | ninguno | `response.data.data` | 18-21 |
| `createSolicitud(data)` | POST `/solicitudes` | `solicitudData` | `response.data.data` | 26-29 |
| `completarSolicitud(id, notas)` | PATCH `/solicitudes/:id/completar` | `{ notas }` | `response.data.data` | 34-37 |

**Alias:** `listar`, `completar` (líneas 40-42)

---

### 2.11 usuariosService.js
**Ubicación:** `frontend/src/shared/services/usuariosService.js`

| Método | Endpoint | Parámetros | Extracción de Datos | Línea |
|--------|----------|------------|---------------------|-------|
| `getUsuarios(params)` | GET `/usuarios` | `params` (query string) | `response.data.data` | 10-13 |
| `getUsuario(id)` | GET `/usuarios/:id` | ninguno | `response.data.data` | 18-21 |
| `createUsuario(data)` | POST `/usuarios` | `usuarioData` | `response.data.data` | 26-29 |
| `updateUsuario(id, data)` | PUT `/usuarios/:id` | `usuarioData` | `response.data.data` | 34-37 |
| `toggleActivo(id)` | PATCH `/usuarios/:id/toggle-activo` | ninguno | `response.data.data` | 42-45 |

**Alias:** `listar`, `crear`, `actualizar`, `toggle` (líneas 48-52)

---

## 3. PÁGINAS ANALIZADAS - LLAMADAS HTTP DETALLADAS

### 3.1 CodigosQRPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/CodigosQRPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarDatos()` | 47-50 | qrService | `listar(params)` | GET `/qr` | `{ estado }` | `qrRes.data?.codigos_qr` |
| `cargarDatos()` | 49 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` |
| `handleGenerarQr()` | 69 | qrService | `generar(cantidad)` | POST `/qr/generar` | `cantidad` | No se extrae (solo success) |
| `handleAsignarQr()` | 87 | qrService | `asignar(id, habitacion_id)` | PATCH `/qr/:id/asignar` | `{ habitacion_id }` | No se extrae (solo success) |
| `handleDesasignar()` | 105 | qrService | `desasignar(qrId)` | PATCH `/qr/:id/desasignar` | ninguno | No se extrae (solo success) |

**INCONSISTENCIA CRÍTICA #1:**
- **Línea 52:** `setCodigosQr(qrRes.data?.codigos_qr || [])`
- **Problema:** Intenta acceder a `qrRes.data.codigos_qr`, pero los servicios retornan directamente `response.data.data`
- **Debería ser:** `setCodigosQr(qrRes.codigos_qr || qrRes || [])`
- **Impacto:** Si el backend retorna `{ data: { codigos_qr: [...] } }`, esto funciona. Pero si retorna `{ data: [...] }`, falla.

**INCONSISTENCIA #2:**
- **Línea 53:** `setHabitaciones(habitacionesRes.data || [])`
- **Problema:** Similar al anterior
- **Debería ser:** `setHabitaciones(habitacionesRes || [])`

---

### 3.2 DashboardPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/DashboardPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarEstadisticas()` | 37 | reservasService | `listar({ estado: 'confirmada' })` | GET `/reservas?estado=confirmada` | `{ estado: 'confirmada' }` | `reservasRes.data` |
| `cargarEstadisticas()` | 38 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` |
| `cargarEstadisticas()` | 39 | solicitudesService | `listar({ estado: 'pendiente' })` | GET `/solicitudes?estado=pendiente` | `{ estado: 'pendiente' }` | `solicitudesRes.data` |
| `cargarEstadisticas()` | 58 | reservasService | `listar()` | GET `/reservas` | ninguno | `todasReservas.data` |

**EXTRACCIÓN DE DATOS:**
- **Línea 42-44:** `reservasRes.data`, `habitacionesRes.data`, `solicitudesRes.data`
- **CORRECTO:** Los servicios retornan `response.data.data`, y aquí accede a `.data`

**ACCESOS A CAMPOS DE OBJETOS:**
- **Línea 183:** `reserva.habitaciones?.numero` - CORRECTO (relación Prisma)
- **Línea 215:** `reserva.habitaciones?.numero` - CORRECTO

---

### 3.3 GaleriaPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/GaleriaPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarImagenes()` | 48 | galeriaService | `listar(params)` | GET `/galeria` | `{ activo }` | `response.data?.imagenes` |
| `handleUpload()` | 93 | galeriaService | `subir(formData)` | POST `/galeria` | `FormData` | No se extrae (solo success) |
| `handleUpdateInfo()` | 120 | galeriaService | `actualizar(id, editData)` | PUT `/galeria/:id` | `editData` | No se extrae (solo success) |
| `handleToggleActivo()` | 133 | galeriaService | `toggleActivo(id)` | PATCH `/galeria/:id/toggle-activo` | ninguno | No se extrae (solo success) |
| `handleDelete()` | 148 | galeriaService | `eliminar(id)` | DELETE `/galeria/:id` | ninguno | No se extrae (solo success) |

**INCONSISTENCIA CRÍTICA #3:**
- **Línea 49:** `setImagenes(response.data?.imagenes || [])`
- **Problema:** Accede a `response.data.imagenes`, pero el servicio retorna `response.data.data`
- **Debería ser:** `setImagenes(response.imagenes || response || [])`

**ACCESOS A CAMPOS DE OBJETOS:**
- **Línea 300:** `imagen.url_publica` - Campo esperado del backend
- **Línea 322:** `imagen.subida_por_nombre` - Campo esperado del backend
- Todos estos campos deben existir en el modelo de `galeria` del backend

---

### 3.4 HabitacionesPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/HabitacionesPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarHabitaciones()` | 73 | habitacionesService | `listar(params)` | GET `/habitaciones` | `{ estado, tipo_habitacion_id }` | `response.habitaciones` |
| `handleSubmit()` | 109 | habitacionesService | `actualizar(id, data)` | PUT `/habitaciones/:id` | `{ precio_por_noche, descripcion }` | `result` |
| `handleSubmit()` | 117 | habitacionesService | `crear(data)` | POST `/habitaciones` | `habitacionData` | No se extrae (solo success) |
| `handleCambiarEstado()` | 134 | habitacionesService | `cambiarEstado(id, estado)` | PATCH `/habitaciones/:id/estado` | `{ estado }` | No se extrae (solo success) |
| `handleDesactivar()` | 152 | habitacionesService | `desactivar(id)` | DELETE `/habitaciones/:id` | ninguno | No se extrae (solo success) |

**INCONSISTENCIA CRÍTICA #4:**
- **Línea 74:** `setHabitaciones(response.habitaciones || [])`
- **Problema:** Accede a `response.habitaciones`, pero el servicio retorna `response.data.data`
- **Debería ser:** `setHabitaciones(response || [])`

**ACCESOS A CAMPOS DE OBJETOS:**
- **Línea 275:** `habitacion.tipo_habitacion_nombre` - Campo esperado
- **Línea 289:** `habitacion.precio_por_noche` - Campo esperado
- **Línea 298:** `habitacion.tiene_qr_asignado` - Campo booleano esperado
- **Línea 440:** `h.tipo_habitacion` - Campo esperado
- **Línea 440:** `h.precio_noche` - INCONSISTENCIA: El servicio usa `precio_por_noche`, aquí usa `precio_noche`

**INCONSISTENCIA #5:**
- **Línea 106:** `precio: noches * parseFloat(habitacion.precio_noche)`
- **Línea 289:** `habitacion.precio_por_noche`
- **Problema:** Inconsistencia en el nombre del campo

---

### 3.5 LoginPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/LoginPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `handleSubmit()` | 42 | authService (via AuthContext) | `login(email, password)` | POST `/auth/login` | `{ email, password }` | Maneja el contexto |

**NOTA:** La autenticación se maneja a través del `AuthContext`, no directamente en la página.

---

### 3.6 ReportesPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/ReportesPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarReportes()` | 63 | reportesService | `listar(params)` | GET `/reportes/ocupacion` | `{ tipo_periodo, fecha_desde, fecha_hasta }` | `response.data?.reportes` |
| `handleGenerarReporte()` | 79 | reportesService | `generar(data)` | POST `/reportes/ocupacion` | `{ fecha_inicio, fecha_fin, tipo_periodo }` | `response.data` |
| `handleVerDetalle()` | 113 | reportesService | `obtener(id)` | GET `/reportes/ocupacion/:id` | ninguno | `response.data` |

**INCONSISTENCIA CRÍTICA #6:**
- **Línea 64:** `setReportes(response.data?.reportes || [])`
- **Problema:** Accede a `response.data.reportes`, pero el servicio retorna `response.data.data`
- **Debería ser:** `setReportes(response.reportes || response || [])`

**INCONSISTENCIA #7:**
- **Línea 91-93:** `response.data` - Accede directamente a `.data`
- **Línea 114:** `response.data` - Accede directamente a `.data`
- **Problema:** Los servicios retornan `response.data.data`, no `response.data`

---

### 3.7 ReservasPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/ReservasPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarDatos()` | 79 | reservasService | `listar(params)` | GET `/reservas` | `{ estado, canal, habitacion_id, busqueda }` | `reservasRes.data` |
| `cargarDatos()` | 80 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` |
| `handleSubmit()` | 127 | reservasService | `actualizar(id, data)` | PUT `/reservas/:id` | `reservaData` | No se extrae (solo success) |
| `handleSubmit()` | 130 | reservasService | `crear(data)` | POST `/reservas` | `reservaData` | No se extrae (solo success) |
| `handleCambiarEstado()` | 145 | reservasService | `cambiarEstado(id, estado)` | PATCH `/reservas/:id/estado` | `{ estado }` | No se extrae (solo success) |

**EXTRACCIÓN DE DATOS:**
- **Línea 83-84:** `reservasRes.data`, `habitacionesRes.data` - CORRECTO

**ACCESOS A CAMPOS DE OBJETOS:**
- **Línea 221:** `reserva.habitaciones?.numero` - CORRECTO (relación Prisma)
- **Línea 569:** `selectedReserva.habitaciones?.numero` - CORRECTO
- **Línea 600:** `selectedReserva.usuarios?.nombre` - CORRECTO (relación Prisma)

---

### 3.8 SolicitudesPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/SolicitudesPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarSolicitudes()` | 96 | solicitudesService | `listar(params)` | GET `/solicitudes` | `{ estado, tipo_servicio, habitacion_id }` | `response.data` |
| `cargarHabitaciones()` | 101 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `response.data` |
| `handleCompletarSolicitud()` | 107 | solicitudesService | `completar(id)` | PATCH `/solicitudes/:id/completar` | `{ notas }` | No se extrae (solo success) |

**EXTRACCIÓN DE DATOS:**
- **Línea 97:** `setSolicitudes(response.data || [])` - CORRECTO
- **Línea 102:** `setHabitaciones(response.data || [])` - CORRECTO

**ACCESOS A CAMPOS DE OBJETOS:**
- **Línea 150:** `solicitud.habitaciones?.numero` - CORRECTO (relación Prisma)
- **Línea 153:** `solicitud.habitaciones?.tipo_habitacion` - CORRECTO

---

### 3.9 UsuariosPage.jsx
**Ubicación:** `frontend/src/modules/gestion/pages/UsuariosPage.jsx`

| Función | Línea | Servicio | Método | Endpoint | Parámetros | Extracción de Datos |
|---------|-------|----------|--------|----------|------------|---------------------|
| `cargarUsuarios()` | 64 | usuariosService | `listar(params)` | GET `/usuarios` | `{ activo, rol_id }` | `response.data?.usuarios` |
| `handleSubmit()` | 89 | usuariosService | `actualizar(id, data)` | PUT `/usuarios/:id` | `usuarioData` | No se extrae (solo success) |
| `handleSubmit()` | 96 | usuariosService | `crear(data)` | POST `/usuarios` | `usuarioData` | No se extrae (solo success) |
| `handleToggleActivo()` | 117 | usuariosService | `toggleActivo(id)` | PATCH `/usuarios/:id/toggle-activo` | ninguno | No se extrae (solo success) |

**INCONSISTENCIA CRÍTICA #8:**
- **Línea 65:** `setUsuarios(response.data?.usuarios || [])`
- **Problema:** Accede a `response.data.usuarios`, pero el servicio retorna `response.data.data`
- **Debería ser:** `setUsuarios(response.usuarios || response || [])`

---

## 4. TABLA CONSOLIDADA DE TODAS LAS LLAMADAS HTTP

| # | Página | Línea | Servicio | Método | Endpoint | Parámetros | Extracción | Estado |
|---|--------|-------|----------|--------|----------|------------|------------|--------|
| 1 | CodigosQRPage | 47 | qrService | `listar()` | GET `/qr` | `{ estado }` | `qrRes.data?.codigos_qr` | INCONSISTENTE |
| 2 | CodigosQRPage | 49 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` | INCONSISTENTE |
| 3 | CodigosQRPage | 69 | qrService | `generar()` | POST `/qr/generar` | `cantidad` | N/A | OK |
| 4 | CodigosQRPage | 87 | qrService | `asignar()` | PATCH `/qr/:id/asignar` | `{ habitacion_id }` | N/A | OK |
| 5 | CodigosQRPage | 105 | qrService | `desasignar()` | PATCH `/qr/:id/desasignar` | ninguno | N/A | OK |
| 6 | DashboardPage | 37 | reservasService | `listar()` | GET `/reservas` | `{ estado }` | `reservasRes.data` | OK |
| 7 | DashboardPage | 38 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` | OK |
| 8 | DashboardPage | 39 | solicitudesService | `listar()` | GET `/solicitudes` | `{ estado }` | `solicitudesRes.data` | OK |
| 9 | DashboardPage | 58 | reservasService | `listar()` | GET `/reservas` | ninguno | `todasReservas.data` | OK |
| 10 | GaleriaPage | 48 | galeriaService | `listar()` | GET `/galeria` | `{ activo }` | `response.data?.imagenes` | INCONSISTENTE |
| 11 | GaleriaPage | 93 | galeriaService | `subir()` | POST `/galeria` | `FormData` | N/A | OK |
| 12 | GaleriaPage | 120 | galeriaService | `actualizar()` | PUT `/galeria/:id` | `editData` | N/A | OK |
| 13 | GaleriaPage | 133 | galeriaService | `toggleActivo()` | PATCH `/galeria/:id/toggle-activo` | ninguno | N/A | OK |
| 14 | GaleriaPage | 148 | galeriaService | `eliminar()` | DELETE `/galeria/:id` | ninguno | N/A | OK |
| 15 | HabitacionesPage | 73 | habitacionesService | `listar()` | GET `/habitaciones` | `{ estado, tipo_habitacion_id }` | `response.habitaciones` | INCONSISTENTE |
| 16 | HabitacionesPage | 109 | habitacionesService | `actualizar()` | PUT `/habitaciones/:id` | `{ precio_por_noche, descripcion }` | `result` | OK |
| 17 | HabitacionesPage | 117 | habitacionesService | `crear()` | POST `/habitaciones` | `habitacionData` | N/A | OK |
| 18 | HabitacionesPage | 134 | habitacionesService | `cambiarEstado()` | PATCH `/habitaciones/:id/estado` | `{ estado }` | N/A | OK |
| 19 | HabitacionesPage | 152 | habitacionesService | `desactivar()` | DELETE `/habitaciones/:id` | ninguno | N/A | OK |
| 20 | LoginPage | 42 | authService | `login()` | POST `/auth/login` | `{ email, password }` | via Context | OK |
| 21 | ReportesPage | 63 | reportesService | `listar()` | GET `/reportes/ocupacion` | `{ tipo_periodo, fecha_desde, fecha_hasta }` | `response.data?.reportes` | INCONSISTENTE |
| 22 | ReportesPage | 79 | reportesService | `generar()` | POST `/reportes/ocupacion` | `{ fecha_inicio, fecha_fin, tipo_periodo }` | `response.data` | INCONSISTENTE |
| 23 | ReportesPage | 113 | reportesService | `obtener()` | GET `/reportes/ocupacion/:id` | ninguno | `response.data` | INCONSISTENTE |
| 24 | ReservasPage | 79 | reservasService | `listar()` | GET `/reservas` | `{ estado, canal, habitacion_id, busqueda }` | `reservasRes.data` | OK |
| 25 | ReservasPage | 80 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `habitacionesRes.data` | OK |
| 26 | ReservasPage | 127 | reservasService | `actualizar()` | PUT `/reservas/:id` | `reservaData` | N/A | OK |
| 27 | ReservasPage | 130 | reservasService | `crear()` | POST `/reservas` | `reservaData` | N/A | OK |
| 28 | ReservasPage | 145 | reservasService | `cambiarEstado()` | PATCH `/reservas/:id/estado` | `{ estado }` | N/A | OK |
| 29 | SolicitudesPage | 96 | solicitudesService | `listar()` | GET `/solicitudes` | `{ estado, tipo_servicio, habitacion_id }` | `response.data` | OK |
| 30 | SolicitudesPage | 101 | habitacionesService | `listar()` | GET `/habitaciones` | ninguno | `response.data` | OK |
| 31 | SolicitudesPage | 107 | solicitudesService | `completar()` | PATCH `/solicitudes/:id/completar` | `{ notas }` | N/A | OK |
| 32 | UsuariosPage | 64 | usuariosService | `listar()` | GET `/usuarios` | `{ activo, rol_id }` | `response.data?.usuarios` | INCONSISTENTE |
| 33 | UsuariosPage | 89 | usuariosService | `actualizar()` | PUT `/usuarios/:id` | `usuarioData` | N/A | OK |
| 34 | UsuariosPage | 96 | usuariosService | `crear()` | POST `/usuarios` | `usuarioData` | N/A | OK |
| 35 | UsuariosPage | 117 | usuariosService | `toggleActivo()` | PATCH `/usuarios/:id/toggle-activo` | ninguno | N/A | OK |

**Total de llamadas HTTP:** 35

---

## 5. INCONSISTENCIAS ENCONTRADAS (CRÍTICAS)

### 5.1 Inconsistencias en Extracción de Datos

#### PROBLEMA PRINCIPAL: Estructura de respuesta ambigua

Los servicios retornan: `response.data.data`
Pero las páginas esperan diferentes estructuras:

| Página | Extracción Usada | Debería Ser | Archivo | Línea |
|--------|------------------|-------------|---------|-------|
| CodigosQRPage | `qrRes.data?.codigos_qr` | `qrRes` | CodigosQRPage.jsx | 52 |
| CodigosQRPage | `habitacionesRes.data` | `habitacionesRes` | CodigosQRPage.jsx | 53 |
| GaleriaPage | `response.data?.imagenes` | `response` | GaleriaPage.jsx | 49 |
| HabitacionesPage | `response.habitaciones` | `response` | HabitacionesPage.jsx | 74 |
| ReportesPage | `response.data?.reportes` | `response` | ReportesPage.jsx | 64 |
| ReportesPage | `response.data` | `response` | ReportesPage.jsx | 91 |
| UsuariosPage | `response.data?.usuarios` | `response` | UsuariosPage.jsx | 65 |

### 5.2 Inconsistencias en Nombres de Campos

#### Habitaciones - Precio
- **Servicio:** usa `precio_por_noche` (habitacionesService.js)
- **Página:** usa `precio_noche` (HabitacionesPage.jsx:440, ReservasPage.jsx:440)
- **Modelo esperado:** debería unificarse a `precio_por_noche`

#### Habitaciones - Tipo
- **Algunas partes:** `tipo_habitacion` (string)
- **Otras partes:** `tipo_habitacion_id` (número)
- **Algunas partes:** `tipo_habitacion_nombre` (string con JOIN)

### 5.3 Inconsistencias en Anidamiento

Algunas páginas esperan arrays dentro de objetos:
```javascript
{ data: { codigos_qr: [...] } }  // CodigosQRPage espera esto
{ data: { imagenes: [...] } }     // GaleriaPage espera esto
{ data: { reportes: [...] } }     // ReportesPage espera esto
{ data: { usuarios: [...] } }     // UsuariosPage espera esto
```

Pero los servicios retornan:
```javascript
response.data.data  // Que podría ser directamente el array
```

---

## 6. CAMPOS ESPERADOS EN RESPUESTAS DEL BACKEND

### 6.1 Códigos QR
```javascript
{
  id: number,
  codigo: string,
  estado: 'sin_asignar' | 'asignado' | 'inactivo',
  habitacion_id: number | null,
  habitacion_numero: string | null,
  url_destino: string,
  total_lecturas: number,
  ultima_lectura: Date | null,
  creado_en: Date,
  creado_por_nombre: string
}
```

### 6.2 Habitaciones
```javascript
{
  id: number,
  numero: string,
  tipo_habitacion_id: number,
  tipo_habitacion_nombre: string,  // JOIN con tabla tipos_habitacion
  precio_por_noche: number,  // INCONSISTENCIA: A veces "precio_noche"
  descripcion: string,
  capacidad_maxima: number,
  estado: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento',
  tiene_qr_asignado: boolean
}
```

### 6.3 Galería
```javascript
{
  id: number,
  titulo: string,
  descripcion: string,
  url_publica: string,
  activo: boolean,
  subida_en: Date,
  subida_por_nombre: string
}
```

### 6.4 Reportes
```javascript
{
  id: number,
  fecha_inicio: Date,
  fecha_fin: Date,
  tipo_periodo: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual',
  porcentaje_ocupacion: number,
  habitaciones_ocupadas: number,
  total_habitaciones: number,
  total_reservas: number,
  generado_en: Date,
  generado_por_nombre: string
}
```

### 6.5 Reservas
```javascript
{
  id: number,
  huesped_nombre: string,
  huesped_email: string,
  huesped_telefono: string,
  habitacion_id: number,
  habitaciones: {  // Relación Prisma
    numero: string
  },
  fecha_checkin: Date,
  fecha_checkout: Date,
  numero_huespedes: number,
  canal: string,
  precio_total: number,
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada',
  notas: string,
  usuarios: {  // Relación Prisma
    nombre: string
  }
}
```

### 6.6 Solicitudes
```javascript
{
  id: number,
  habitacion_id: number,
  habitaciones: {  // Relación Prisma
    numero: string,
    tipo_habitacion: string
  },
  tipo_servicio: string,
  descripcion: string,
  estado: 'pendiente' | 'en_proceso' | 'completada',
  fecha_solicitud: Date,
  fecha_completada: Date | null
}
```

### 6.7 Usuarios
```javascript
{
  id: number,
  nombre: string,
  apellido: string,
  email: string,
  rol: 'administrador' | 'recepcionista',
  rol_id: number,
  activo: boolean,
  ultimo_acceso: Date | null,
  creado_en: Date
}
```

---

## 7. RECOMENDACIONES PARA CORREGIR

### 7.1 Estandarizar Estructura de Respuestas

**Opción 1: Backend retorna directamente el array/objeto**
```javascript
// Backend
res.json({ success: true, data: [array de datos] })

// Frontend (servicios)
return response.data.data  // Ya lo hace

// Frontend (páginas)
const data = await servicio.listar()
setItems(data || [])  // SIN .data ni .data.items
```

**Opción 2: Backend envuelve en objeto con clave**
```javascript
// Backend
res.json({ success: true, data: { items: [array], total: 10 } })

// Frontend (servicios)
return response.data.data  // Ya lo hace

// Frontend (páginas)
const result = await servicio.listar()
setItems(result.items || [])  // CON clave específica
```

### 7.2 Correcciones Específicas por Página

#### CodigosQRPage.jsx (línea 52-53)
```javascript
// ANTES
setCodigosQr(qrRes.data?.codigos_qr || [])
setHabitaciones(habitacionesRes.data || [])

// DESPUÉS (Opción 1)
setCodigosQr(qrRes || [])
setHabitaciones(habitacionesRes || [])

// DESPUÉS (Opción 2 - si backend envuelve)
setCodigosQr(qrRes.codigos_qr || [])
setHabitaciones(habitacionesRes.habitaciones || [])
```

#### GaleriaPage.jsx (línea 49)
```javascript
// ANTES
setImagenes(response.data?.imagenes || [])

// DESPUÉS
setImagenes(response || [])
// O si backend envuelve:
setImagenes(response.imagenes || [])
```

#### HabitacionesPage.jsx (línea 74)
```javascript
// ANTES
setHabitaciones(response.habitaciones || [])

// DESPUÉS
setHabitaciones(response || [])
```

#### HabitacionesPage.jsx (línea 106, 440) - Unificar nombre de campo
```javascript
// ANTES
const precio = noches * parseFloat(habitacion.precio_noche)
label: `Hab. ${h.numero} - ${h.tipo_habitacion} - Q${h.precio_noche}/noche`

// DESPUÉS
const precio = noches * parseFloat(habitacion.precio_por_noche)
label: `Hab. ${h.numero} - ${h.tipo_habitacion} - Q${h.precio_por_noche}/noche`
```

#### ReportesPage.jsx (línea 64, 91, 114)
```javascript
// ANTES
setReportes(response.data?.reportes || [])
setSelectedReporte(response.data)

// DESPUÉS
setReportes(response || [])
setSelectedReporte(response)
```

#### UsuariosPage.jsx (línea 65)
```javascript
// ANTES
setUsuarios(response.data?.usuarios || [])

// DESPUÉS
setUsuarios(response || [])
```

### 7.3 Verificar Backend

**Revisar que cada endpoint retorne:**
```javascript
res.json({
  success: true,
  message: 'Operación exitosa',
  data: [datos aquí]  // Array o objeto, sin anidamiento adicional
})
```

---

## 8. PATRÓN CORRECTO A SEGUIR

### Ejemplos CORRECTOS encontrados:

#### DashboardPage.jsx (líneas 42-44)
```javascript
const reservas = reservasRes.data || []
const habitaciones = habitacionesRes.data || []
const solicitudes = solicitudesRes.data || []
```

#### ReservasPage.jsx (líneas 83-84)
```javascript
setReservas(reservasRes.data || [])
setHabitaciones(habitacionesRes.data || [])
```

#### SolicitudesPage.jsx (líneas 97, 102)
```javascript
setSolicitudes(response.data || [])
setHabitaciones(response.data || [])
```

**PATRÓN:**
```javascript
const response = await service.method()
setState(response || [])  // SIMPLE, directo
```

---

## 9. RESUMEN DE HALLAZGOS

### 9.1 Estadísticas
- **Total de páginas analizadas:** 9
- **Total de servicios analizados:** 11
- **Total de llamadas HTTP:** 35
- **Llamadas con extracción correcta:** 20 (57%)
- **Llamadas con inconsistencias:** 15 (43%)

### 9.2 Inconsistencias Críticas
1. **Anidamiento ambiguo** en extracción de datos (15 casos)
2. **Nombres de campos inconsistentes** (`precio_noche` vs `precio_por_noche`)
3. **Expectativas de estructura diferentes** entre páginas

### 9.3 Impacto
- **Alto:** Si el backend no retorna la estructura esperada, los componentes mostrarán arrays vacíos
- **Medio:** Confusión en el código sobre la verdadera estructura de datos
- **Bajo:** Funcionalidad degradada pero sin crashes

---

## 10. PLAN DE ACCIÓN RECOMENDADO

1. **Auditar el backend** para confirmar la estructura EXACTA de cada respuesta
2. **Decidir un patrón único:** ¿Envolver en objeto con clave o retornar directo?
3. **Actualizar TODOS los servicios** para seguir el patrón elegido
4. **Actualizar TODAS las páginas** para extraer datos consistentemente
5. **Unificar nombres de campos** (especialmente `precio_por_noche`)
6. **Documentar la estructura** de cada endpoint en un archivo central
7. **Agregar TypeScript** (opcional) para prevenir estos errores

---

## 11. CONCLUSIÓN

El frontend tiene una arquitectura bien organizada con servicios centralizados, pero sufre de **inconsistencias en la extracción de datos** debido a expectativas diferentes sobre la estructura de respuestas del backend.

**El problema principal NO es el código de los servicios (que está bien), sino cómo las páginas interpretan los datos retornados.**

Se recomienda:
1. Estandarizar la estructura de respuesta del backend
2. Actualizar todas las páginas para usar el mismo patrón
3. Unificar nombres de campos
4. Documentar contratos de API

**Prioridad:** ALTA - Estas inconsistencias pueden causar que los datos no se muestren correctamente en la UI.

---

**Fin del Reporte**
