# PRUEBAS DE ENDPOINTS - SISTEMA DE IMÁGENES DE HABITACIONES

## ✅ CAMBIOS REALIZADOS

### 1. Archivos Modificados

#### `backend/src/controllers/habitaciones.controller.js`
- ✅ **Actualizado** `listarHabitaciones()` - Ahora incluye imagen principal mediante LEFT JOIN LATERAL
- ✅ **Actualizado** `obtenerHabitacion()` - Ahora incluye array de todas las imágenes
- ✅ **Nuevo** `vincularImagenHabitacion()` - POST para vincular imagen a habitación
- ✅ **Nuevo** `desvincularImagenHabitacion()` - DELETE para desvincular imagen
- ✅ **Nuevo** `establecerImagenPrincipal()` - PATCH para marcar imagen principal
- ✅ **Nuevo** `obtenerImagenesHabitacion()` - GET para obtener todas las imágenes

#### `backend/src/routes/habitaciones.routes.js`
- ✅ Agregadas 4 nuevas rutas para gestión de imágenes
- ✅ Todas las rutas protegidas con autenticación y rol admin

#### `backend/src/validators/habitaciones.validator.js`
- ✅ Agregado `vincularImagenHabitacionSchema` con validación Joi

---

## 🧪 PRUEBAS A REALIZAR

### PRERREQUISITOS
1. Tener el backend corriendo (`npm run dev` en la carpeta backend)
2. Tener un usuario admin autenticado (token JWT)
3. Tener al menos una imagen en la tabla `imagenes_galeria`
4. Tener al menos una habitación en la tabla `habitaciones`

### HERRAMIENTA RECOMENDADA
- **Postman** o **Thunder Client** (extensión de VS Code)

---

## 📋 CASOS DE PRUEBA

### CASO 1: Listar Habitaciones (Verificar que incluye imagen principal)

**Endpoint:** `GET http://localhost:5000/api/habitaciones`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "habitaciones": [
      {
        "id": 1,
        "numero": "101",
        "tipo_habitacion_id": 1,
        "precio_por_noche": 150.00,
        "estado": "disponible",
        "activo": true,
        "tipo_habitacion_nombre": "Individual",
        "capacidad_maxima": 1,
        "tiene_qr_asignado": false,
        "imagen_id": null,
        "imagen_titulo": null,
        "imagen_url": null,
        "imagen_descripcion": null
      }
    ],
    "total": 1
  }
}
```

**Nota:** Los campos `imagen_*` estarán en `null` hasta que vincules una imagen.

---

### CASO 2: Vincular Imagen a Habitación

**Endpoint:** `POST http://localhost:5000/api/habitaciones/{habitacion_id}/imagenes`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
Content-Type: application/json
```

**Body:**
```json
{
  "imagen_id": 1,
  "orden": 0,
  "es_principal": true
}
```

**Parámetros:**
- `imagen_id` (requerido): ID de una imagen existente en `imagenes_galeria`
- `orden` (opcional): Orden de visualización (default: 0)
- `es_principal` (opcional): Si es la imagen principal (default: false)

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Imagen vinculada exitosamente",
  "data": {
    "id": 1,
    "habitacion_id": 1,
    "imagen_id": 1,
    "orden": 0,
    "es_principal": true,
    "creado_en": "2025-01-15T10:30:00.000Z"
  }
}
```

**Posibles Errores:**
- **404:** Habitación no encontrada
- **404:** Imagen no encontrada o inactiva
- **409:** Esta imagen ya está vinculada a la habitación

---

### CASO 3: Obtener Imágenes de una Habitación

**Endpoint:** `GET http://localhost:5000/api/habitaciones/{habitacion_id}/imagenes`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "habitacion_id": 1,
    "habitacion_numero": "101",
    "imagenes": [
      {
        "relacion_id": 1,
        "orden": 0,
        "es_principal": true,
        "creado_en": "2025-01-15T10:30:00.000Z",
        "imagen_id": 1,
        "titulo": "Habitación Individual Vista Mar",
        "url_imagen": "https://tudominio.supabase.co/storage/v1/object/public/galeria/imagen1.jpg",
        "descripcion": "Vista panorámica al mar",
        "activo": true
      }
    ],
    "total": 1
  }
}
```

---

### CASO 4: Obtener Detalle de Habitación (Incluye Imágenes)

**Endpoint:** `GET http://localhost:5000/api/habitaciones/{habitacion_id}`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "101",
    "tipo_habitacion_id": 1,
    "precio_por_noche": 150.00,
    "estado": "disponible",
    "activo": true,
    "tipo_habitacion_nombre": "Individual",
    "capacidad_maxima": 1,
    "tipo_descripcion": "Habitación para una persona",
    "qr_codigo": null,
    "qr_url": null,
    "imagenes": [
      {
        "relacion_id": 1,
        "orden": 0,
        "es_principal": true,
        "imagen_id": 1,
        "titulo": "Habitación Individual Vista Mar",
        "url_imagen": "https://tudominio.supabase.co/storage/v1/object/public/galeria/imagen1.jpg",
        "descripcion": "Vista panorámica al mar",
        "activo": true
      }
    ]
  }
}
```

---

### CASO 5: Establecer Imagen Principal

**Endpoint:** `PATCH http://localhost:5000/api/habitaciones/{habitacion_id}/imagenes/{imagen_id}/principal`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Imagen principal establecida exitosamente",
  "data": {
    "id": 2,
    "habitacion_id": 1,
    "imagen_id": 2,
    "orden": 1,
    "es_principal": true,
    "creado_en": "2025-01-15T10:35:00.000Z"
  }
}
```

**Nota:** El trigger automáticamente desmarca las demás imágenes de esta habitación como principal.

---

### CASO 6: Desvincular Imagen de Habitación

**Endpoint:** `DELETE http://localhost:5000/api/habitaciones/{habitacion_id}/imagenes/{imagen_id}`

**Headers:**
```
Authorization: Bearer {TU_TOKEN_JWT}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Imagen desvinculada exitosamente",
  "data": null
}
```

**Posibles Errores:**
- **404:** Esta imagen no está vinculada a la habitación

---

## 🔍 VERIFICACIONES EN BASE DE DATOS

Después de cada prueba, puedes verificar en Supabase SQL Editor:

```sql
-- Ver todas las relaciones habitación-imagen
SELECT
  hi.id,
  h.numero as habitacion,
  ig.titulo as imagen,
  hi.orden,
  hi.es_principal,
  hi.creado_en
FROM habitaciones_imagenes hi
INNER JOIN habitaciones h ON hi.habitacion_id = h.id
INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
ORDER BY h.numero, hi.es_principal DESC, hi.orden ASC;

-- Verificar que solo hay UNA imagen principal por habitación
SELECT
  habitacion_id,
  COUNT(*) as total_principales
FROM habitaciones_imagenes
WHERE es_principal = true
GROUP BY habitacion_id
HAVING COUNT(*) > 1;
-- Esta consulta NO debe devolver filas (debe estar vacía)

-- Ver imagen principal de una habitación específica
SELECT * FROM obtener_imagen_principal_habitacion(1);
```

---

## 📊 FLUJO DE PRUEBA COMPLETO

1. **Vincular primera imagen** como principal a habitación 101
2. **Listar habitaciones** → Verificar que aparece la imagen principal
3. **Vincular segunda imagen** sin marcar como principal
4. **Obtener imágenes de habitación 101** → Verificar orden (principal primero)
5. **Cambiar imagen principal** → Marcar la segunda como principal
6. **Verificar** que la primera ya NO es principal (automático por trigger)
7. **Listar habitaciones** → Verificar que ahora aparece la nueva imagen principal
8. **Desvincular imágenes**
9. **Listar habitaciones** → Verificar que `imagen_*` vuelve a `null`

---

## ⚠️ VALIDACIONES IMPORTANTES

### El sistema debe validar:
- ✅ No vincular la misma imagen dos veces a la misma habitación (constraint UNIQUE)
- ✅ Solo una imagen principal por habitación (trigger automático)
- ✅ Solo admin puede vincular/desvincular imágenes
- ✅ Personal puede ver las imágenes
- ✅ No vincular imágenes inactivas

---

## 🎯 SIGUIENTE PASO

Una vez que todos los endpoints funcionen correctamente, pasaremos a:
1. Crear servicio frontend para consumir estos endpoints
2. Actualizar HabitacionesPage para mostrar imágenes reales
3. Crear modal para seleccionar imágenes de galería

---

## 📝 NOTAS

- Todos los endpoints requieren autenticación JWT
- Solo usuarios con rol `admin` pueden modificar imágenes
- Las imágenes se ordenan por: `es_principal DESC, orden ASC, creado_en ASC`
- La eliminación es CASCADE: si eliminas una imagen de galería, se eliminan automáticamente sus vínculos
- El trigger `validar_imagen_principal_habitacion` garantiza integridad de datos
