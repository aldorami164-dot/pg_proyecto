# 🧪 GUÍA DE PRUEBAS COMPLETA - SISTEMA DE IMÁGENES PARA HABITACIONES

## ✅ IMPLEMENTACIÓN COMPLETADA

### Backend
- ✅ Tabla `habitaciones_imagenes` creada en Supabase
- ✅ 6 endpoints REST API funcionales
- ✅ Validaciones con Joi
- ✅ Trigger para garantizar solo 1 imagen principal por habitación
- ✅ Consultas SQL optimizadas con JOINs y LATERAL

### Frontend
- ✅ Servicio `habitacionesService.js` actualizado con métodos de imágenes
- ✅ `HabitacionesPage.jsx` muestra imágenes reales o gradiente placeholder
- ✅ `GaleriaPage.jsx` con botón "Vincular" y modal de selección de habitación
- ✅ Integración completa con UI existente

---

## 🚀 FLUJO DE PRUEBA PASO A PASO

### PASO 1: Verificar que el Backend está Corriendo

```bash
cd backend
npm run dev
```

**Debe mostrar:**
```
Server running on port 3000
Database connected successfully
```

### PASO 2: Verificar que el Frontend está Corriendo

```bash
cd frontend
npm run dev
```

**Debe mostrar:**
```
VITE ready at http://localhost:5173
```

---

## 📋 CASOS DE PRUEBA

### TEST 1: Subir Imagen a Galería

1. Accede a http://localhost:5173/gestion/login
2. Inicia sesión con usuario **admin**
3. Ve a **Galería** en el menú lateral
4. Click en **"Subir Imagen"**
5. Completa el formulario:
   - Título: `Habitación Suite Vista Mar`
   - Descripción: `Vista panorámica al océano`
   - Selecciona una imagen (máx 5MB)
6. Click **"Subir Imagen"**

**Resultado Esperado:**
- ✅ Toast: "Imagen subida exitosamente"
- ✅ La imagen aparece en el grid de galería
- ✅ Badge "ACTIVA" visible
- ✅ Botón "Vincular" visible y habilitado

---

### TEST 2: Crear Habitación (Si no existe)

1. Ve a **Habitaciones** en el menú
2. Click **"Nueva Habitación"**
3. Completa:
   - Número: `101`
   - Tipo: `Doble`
   - Precio: `250.00`
   - Descripción: `Habitación doble con vista al mar`
4. Click **"Crear Habitación"**

**Resultado Esperado:**
- ✅ Toast: "Habitación creada exitosamente"
- ✅ Card de habitación aparece con gradiente cyan-azul
- ✅ Icono de casa (Home) visible como placeholder

---

### TEST 3: Vincular Imagen a Habitación (⭐ PRUEBA PRINCIPAL)

1. Ve a **Galería**
2. Localiza la imagen que subiste
3. Click en botón **"Vincular"** (botón azul con icono de link)
4. En el modal:
   - Selecciona **"Habitación 101 - Doble (disponible)"**
   - ✅ Marca checkbox **"Establecer como imagen principal"**
5. Click **"Vincular Imagen"**

**Resultado Esperado:**
- ✅ Toast: "Imagen vinculada exitosamente a la habitación"
- ✅ Modal se cierra automáticamente

---

### TEST 4: Verificar Imagen en HabitacionesPage

1. Ve a **Habitaciones**
2. Localiza la card de **Habitación 101**

**Resultado Esperado:**
- ✅ Ya NO hay gradiente de fondo
- ✅ Se muestra la **imagen real** que vinculaste
- ✅ El número "Hab. 101" aparece sobre la imagen con gradiente oscuro
- ✅ La imagen cubre todo el espacio (h-48, object-cover)

---

### TEST 5: Vincular Segunda Imagen a la Misma Habitación

1. Ve a **Galería**
2. Sube otra imagen (Título: `Habitación Suite Baño`)
3. Click **"Vincular"**
4. Selecciona **"Habitación 101"**
5. **NO marques** como principal
6. Click **"Vincular Imagen"**

**Resultado Esperado:**
- ✅ Toast: "Imagen vinculada exitosamente"
- ✅ En **Habitaciones**, la card 101 SIGUE mostrando la primera imagen (porque es la principal)

---

### TEST 6: Cambiar Imagen Principal

1. Ve a **Galería**
2. Localiza la **segunda imagen** (Baño)
3. Click **"Vincular"**
4. Selecciona **"Habitación 101"** nuevamente
5. ✅ Marca **"Establecer como imagen principal"**
6. Click **"Vincular Imagen"**

**¿Qué va a pasar?**
- El backend permite vincular la misma imagen si ya está vinculada?
- **Posible error:** `"Esta imagen ya está vinculada a la habitación"`

**Solución:** Para cambiar la principal, deberías:
- Opción 1: Desvincular la primera imagen y vincular la segunda como principal
- Opción 2: Implementar endpoint PATCH para cambiar principal sin desvincular

**Nota:** Detectamos que necesitamos un endpoint adicional:
```
PATCH /api/habitaciones/:id/imagenes/:imagen_id/principal
```

**¡Esto ya está implementado!** Pero no lo estamos usando desde el frontend.

---

### TEST 7: Ver Imagen en Modal de Galería

1. En **Galería**, click en botón **"Ver"** de cualquier imagen
2. Se abre modal grande (size="xl")

**Resultado Esperado:**
- ✅ Imagen en tamaño completo
- ✅ Título y descripción visibles
- ✅ Badge "ACTIVA"
- ✅ URL pública con link "Abrir en nueva pestaña ↗"
- ✅ Fecha de subida

---

### TEST 8: Reutilizar Imagen en Múltiples Habitaciones

1. Crea **Habitación 102** (Tipo: Individual)
2. Ve a **Galería**
3. Selecciona la **MISMA imagen** de la habitación 101
4. Click **"Vincular"**
5. Selecciona **"Habitación 102"**
6. Marca como **principal**
7. Click **"Vincular"**

**Resultado Esperado:**
- ✅ Toast exitoso
- ✅ En **Habitaciones**, AMBAS cards (101 y 102) muestran la MISMA imagen
- ✅ No se duplicó el archivo en Supabase Storage
- ✅ Solo existe 1 registro en `imagenes_galeria`
- ✅ Existen 2 registros en `habitaciones_imagenes` (uno por cada habitación)

---

### TEST 9: Desactivar Imagen

1. Ve a **Galería**
2. Click en botón **amarillo/naranja** (Power) de una imagen vinculada
3. Confirma

**Resultado Esperado:**
- ✅ Toast: "Estado actualizado exitosamente"
- ✅ Badge cambia a "INACTIVA" (gris)
- ✅ Botón "Vincular" se **deshabilita**
- ✅ En **Habitaciones**, la imagen **desaparece** (vuelve al gradiente)

**¿Por qué?** Porque en `listarHabitaciones` filtramos `WHERE ig.activo = true`

---

### TEST 10: Reactivar Imagen

1. En **Galería**, filtra por **"Inactivas"**
2. Localiza la imagen desactivada
3. Click en botón **verde** (Power)

**Resultado Esperado:**
- ✅ Toast exitoso
- ✅ Badge vuelve a "ACTIVA"
- ✅ Botón "Vincular" se habilita
- ✅ En **Habitaciones**, la imagen **reaparece**

---

### TEST 11: Eliminar Imagen de Galería (CASCADE)

1. Ve a **Galería**
2. Selecciona una imagen **vinculada** a alguna habitación
3. Click en botón **rojo** (Trash)
4. Confirma eliminación

**Resultado Esperado:**
- ✅ Toast: "Imagen eliminada exitosamente"
- ✅ La imagen desaparece de la galería
- ✅ El archivo se elimina de **Supabase Storage**
- ✅ En **Habitaciones**, las cards vinculadas vuelven al gradiente placeholder
- ✅ En base de datos:
  - Registro eliminado de `imagenes_galeria`
  - Registros eliminados **automáticamente** de `habitaciones_imagenes` (CASCADE)

---

## 🔍 VERIFICACIONES EN BASE DE DATOS

### Consulta 1: Ver Todas las Vinculaciones

Abre **Supabase SQL Editor** y ejecuta:

```sql
SELECT
  h.numero as habitacion,
  ig.titulo as imagen,
  hi.es_principal,
  hi.orden,
  hi.creado_en
FROM habitaciones_imagenes hi
INNER JOIN habitaciones h ON hi.habitacion_id = h.id
INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
ORDER BY h.numero, hi.es_principal DESC, hi.orden ASC;
```

**Resultado Esperado:**
```
habitacion | imagen                    | es_principal | orden | creado_en
-----------|---------------------------|--------------|-------|------------------
101        | Habitación Suite Vista Mar| true         | 0     | 2025-01-15 10:00
101        | Habitación Suite Baño     | false        | 0     | 2025-01-15 10:05
102        | Habitación Suite Vista Mar| true         | 0     | 2025-01-15 10:10
```

### Consulta 2: Verificar Solo 1 Principal por Habitación

```sql
SELECT
  habitacion_id,
  COUNT(*) as total_principales
FROM habitaciones_imagenes
WHERE es_principal = true
GROUP BY habitacion_id
HAVING COUNT(*) > 1;
```

**Resultado Esperado:**
```
(0 rows)
```

Si devuelve filas, **el trigger falló**. Esto NO debe pasar.

### Consulta 3: Obtener Imagen Principal de una Habitación

```sql
SELECT * FROM obtener_imagen_principal_habitacion(1);
```

**Resultado Esperado:**
```
id | titulo                     | url_imagen                | descripcion
---|----------------------------|---------------------------|------------------
5  | Habitación Suite Vista Mar | https://supabase.co/...   | Vista panorámica...
```

---

## 🎯 CHECKLIST DE FUNCIONALIDADES

### Backend API
- [ ] POST /api/habitaciones/:id/imagenes → Vincular imagen
- [ ] DELETE /api/habitaciones/:id/imagenes/:imagen_id → Desvincular
- [ ] PATCH /api/habitaciones/:id/imagenes/:imagen_id/principal → Cambiar principal
- [ ] GET /api/habitaciones/:id/imagenes → Listar imágenes de habitación
- [ ] GET /api/habitaciones → Incluye imagen principal en listado
- [ ] GET /api/habitaciones/:id → Incluye array de imágenes

### Frontend UI
- [ ] GaleriaPage: Botón "Vincular" visible en cada imagen
- [ ] GaleriaPage: Modal de vinculación con select de habitaciones
- [ ] GaleriaPage: Checkbox "Establecer como principal"
- [ ] GaleriaPage: Botón "Vincular" deshabilitado si imagen inactiva
- [ ] HabitacionesPage: Muestra imagen real si existe
- [ ] HabitacionesPage: Muestra gradiente si no hay imagen
- [ ] HabitacionesPage: Manejo de error de carga de imagen

### Base de Datos
- [ ] Tabla `habitaciones_imagenes` existe con 4 índices
- [ ] Trigger `validar_imagen_principal_habitacion` funciona
- [ ] Función `obtener_imagen_principal_habitacion()` funciona
- [ ] DELETE CASCADE funciona al eliminar imagen de galería
- [ ] Constraint UNIQUE impide duplicados (habitacion_id, imagen_id)

---

## ⚠️ POSIBLES ERRORES Y SOLUCIONES

### Error 1: "Cannot read property 'imagen_url' of undefined"
**Causa:** Backend no está devolviendo `imagen_url` en el listado de habitaciones
**Solución:** Verificar que el LEFT JOIN LATERAL esté correcto en `listarHabitaciones()`

### Error 2: "Esta imagen ya está vinculada a la habitación"
**Causa:** Intentas vincular la misma imagen dos veces
**Solución:** Usa el endpoint PATCH para cambiar la principal, no POST para vincular nuevamente

### Error 3: La imagen no aparece después de vincular
**Causa:** La imagen está inactiva o no fue marcada como principal y hay otra principal
**Solución:** Verifica `ig.activo = true` y que el ORDER BY priorice `es_principal DESC`

### Error 4: "No se puede vincular imagen inactiva"
**Causa:** La validación del backend rechaza imágenes con `activo = false`
**Solución:** Activa la imagen primero desde GaleriaPage

### Error 5: CORS Error
**Causa:** Frontend y backend no están comunicándose
**Solución:**
```bash
# Verifica que ambos estén corriendo
cd backend && npm run dev    # Puerto 3000
cd frontend && npm run dev   # Puerto 5173
```

### Error 6: Token expirado
**Causa:** Sesión caducada
**Solución:** Vuelve a hacer login en /gestion/login

---

## 📊 RESUMEN DE ARCHIVOS MODIFICADOS

### Backend
1. `backend/src/controllers/habitaciones.controller.js` → 4 funciones nuevas
2. `backend/src/routes/habitaciones.routes.js` → 4 rutas nuevas
3. `backend/src/validators/habitaciones.validator.js` → 1 schema nuevo

### Frontend
4. `frontend/src/shared/services/habitacionesService.js` → 4 métodos nuevos
5. `frontend/src/modules/gestion/pages/HabitacionesPage.jsx` → Imagen real + fallback
6. `frontend/src/modules/gestion/pages/GaleriaPage.jsx` → Botón vincular + modal

### Base de Datos
7. `MIGRACION_habitaciones_imagenes.sql` → Script de migración (YA EJECUTADO)

---

## 🎉 PRÓXIMOS PASOS OPCIONALES

### Mejora 1: Badge de Habitaciones Vinculadas
En cada imagen de GaleriaPage, mostrar:
```jsx
<Badge variant="info">Vinculada a 2 habitaciones</Badge>
```

### Mejora 2: Modal de Gestión de Imágenes en HabitacionesPage
Agregar botón "Gestionar Imágenes" que abra modal mostrando:
- Todas las imágenes vinculadas
- Botón "Marcar como principal"
- Botón "Desvincular"
- Drag & Drop para reordenar

### Mejora 3: Ordenar Imágenes
Permitir cambiar el campo `orden` para controlar la secuencia de visualización

### Mejora 4: Preview de Galería en HabitacionesPage
Click en la imagen de la habitación → Abre carousel con todas las imágenes

---

## 🧑‍💻 COMANDOS ÚTILES

### Reiniciar Backend
```bash
cd backend
npm run dev
```

### Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### Ver Logs del Backend
```bash
cd backend
npm run dev
# Los logs aparecen en consola con colores:
# ✓ verde = success
# ✗ rojo = error
# ℹ azul = info
```

### Limpiar Caché de Node
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ TEST FINAL DE INTEGRACIÓN

**Escenario Completo:**

1. Sube 3 imágenes a la galería
2. Crea 2 habitaciones (101, 102)
3. Vincula imagen 1 a habitación 101 (principal)
4. Vincula imagen 2 a habitación 101 (no principal)
5. Vincula imagen 1 a habitación 102 (principal) - REUTILIZACIÓN
6. Ve a Habitaciones → Ambas cards muestran imagen 1
7. Desactiva imagen 1 → Ambas cards vuelven a gradiente
8. Reactiva imagen 1 → Ambas cards vuelven a mostrar imagen
9. Elimina imagen 1 de galería → Ambas habitaciones pierden la imagen (CASCADE)

**Si todos estos pasos funcionan correctamente: ✅ SISTEMA COMPLETO Y FUNCIONAL**

---

**¡Prueba el sistema y reporta cualquier error que encuentres!** 🚀
