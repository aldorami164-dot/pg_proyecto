# 🧪 PRUEBAS - GESTIÓN COMPLETA DE IMÁGENES EN HABITACIONES

## ✅ NUEVA FUNCIONALIDAD IMPLEMENTADA

### Modal "Gestionar Imágenes" en HabitacionesPage

Ahora puedes:
- ✅ Ver todas las imágenes vinculadas a una habitación
- ✅ Marcar cualquier imagen como principal
- ✅ Desvincular imágenes de la habitación
- ✅ Ver cuál es la imagen principal actual (badge ⭐ PRINCIPAL)

---

## 🚀 CÓMO PROBAR LA NUEVA FUNCIONALIDAD

### TEST 1: Abrir Modal de Gestión de Imágenes

1. Ve a **Habitaciones** (http://localhost:5173/gestion/habitaciones)
2. Localiza cualquier habitación que tenga imágenes vinculadas
3. Click en botón **"Imágenes"** (gris, con icono de imagen)

**Resultado Esperado:**
- ✅ Se abre modal grande con título "Gestionar Imágenes - Habitación XXX"
- ✅ Banner azul con info de la habitación
- ✅ Lista de todas las imágenes vinculadas
- ✅ Cada imagen muestra:
  - Preview de la imagen (thumbnail)
  - Título y descripción
  - Badge "⭐ PRINCIPAL" si es la principal
  - Badge "INACTIVA" si la imagen está desactivada
  - Orden y fecha de vinculación
  - Botón "Marcar como Principal" (si no es principal)
  - Botón "Desvincular" (rojo)

---

### TEST 2: Cambiar Imagen Principal

**Escenario:** Tienes habitación 101 con 2 imágenes vinculadas:
- Imagen A (actualmente principal)
- Imagen B (no principal)

**Pasos:**
1. En **Habitaciones**, click botón **"Imágenes"** de habitación 101
2. Localiza **Imagen B** (la que NO es principal)
3. Click en **"Marcar como Principal"**

**Resultado Esperado:**
- ✅ Toast: "Imagen marcada como principal"
- ✅ La **Imagen B** ahora tiene badge "⭐ PRINCIPAL"
- ✅ La **Imagen A** ya NO tiene el badge
- ✅ El botón de Imagen A cambió a "Marcar como Principal"
- ✅ El botón de Imagen B está deshabilitado ("Es la Principal")
- ✅ Si cierras el modal y miras la card de la habitación, se muestra la nueva imagen principal

**Verificación en BD:**
```sql
SELECT * FROM habitaciones_imagenes WHERE habitacion_id = 1;
```
Solo UNA fila debe tener `es_principal = true`

---

### TEST 3: Desvincular Imagen NO Principal

**Escenario:** Habitación 101 tiene 3 imágenes (A es principal, B y C no)

**Pasos:**
1. Modal "Gestionar Imágenes" de habitación 101
2. Localiza **Imagen C** (no principal)
3. Click en botón **"Desvincular"** (rojo)
4. Confirma en el diálogo

**Resultado Esperado:**
- ✅ Toast: "Imagen desvinculada exitosamente"
- ✅ La **Imagen C desaparece** de la lista del modal
- ✅ La card de la habitación **sigue mostrando la imagen principal** (A)
- ✅ La imagen C sigue existiendo en **Galería** (no se eliminó, solo se desvinculó)

---

### TEST 4: Desvincular Imagen Principal (Casos Extremos)

**Escenario 1: Habitación con 2+ imágenes**

**Pasos:**
1. Habitación 101 tiene 2 imágenes: A (principal) y B (no principal)
2. Modal "Gestionar Imágenes"
3. Click **"Desvincular"** en la Imagen A (la principal)
4. Confirma

**Resultado Esperado:**
- ✅ Toast: "Imagen desvinculada exitosamente"
- ✅ Solo queda la Imagen B en el modal
- ✅ La card de la habitación ahora muestra:
  - **Opción 1:** La Imagen B (si quedó como principal automáticamente)
  - **Opción 2:** Gradiente (si ninguna es principal)

**¿Qué debería pasar?**
Según nuestro backend, al desvincular la principal, la habitación queda SIN imagen principal. La consulta de `listarHabitaciones` usa:
```sql
ORDER BY hi.es_principal DESC, hi.orden ASC
```

Por lo tanto, debería mostrar la **primera imagen disponible** aunque no sea principal.

---

**Escenario 2: Habitación con 1 sola imagen**

**Pasos:**
1. Habitación 102 tiene solo 1 imagen (principal)
2. Modal "Gestionar Imágenes"
3. Click **"Desvincular"**
4. Confirma

**Resultado Esperado:**
- ✅ Toast: "Imagen desvinculada exitosamente"
- ✅ El modal ahora muestra: "No hay imágenes vinculadas"
- ✅ Mensaje: "Ve a Galería y usa el botón 'Vincular' para agregar imágenes"
- ✅ La card de la habitación vuelve al **gradiente placeholder**

---

### TEST 5: Verificar que la Imagen NO se Elimina de Galería

**Pasos:**
1. Desvincula una imagen de habitación 101
2. Ve a **Galería**

**Resultado Esperado:**
- ✅ La imagen **sigue apareciendo** en la galería
- ✅ Botón "Vincular" sigue disponible
- ✅ Puedes volver a vincularla a la misma habitación o a otra

---

### TEST 6: Cambiar Principal Múltiples Veces

**Pasos:**
1. Habitación 101 con 3 imágenes: A, B, C
2. Marca A como principal
3. Marca B como principal
4. Marca C como principal
5. Vuelve a marcar A como principal

**Resultado Esperado:**
- ✅ Cada vez, solo UNA imagen tiene el badge "⭐ PRINCIPAL"
- ✅ Los toasts se muestran correctamente
- ✅ La card de la habitación se actualiza cada vez

**Verificación en BD:**
```sql
SELECT habitacion_id, COUNT(*) as principales
FROM habitaciones_imagenes
WHERE es_principal = true
GROUP BY habitacion_id;
```
Cada habitación debe tener **COUNT = 1** máximo.

---

### TEST 7: Desvincular Todas las Imágenes

**Pasos:**
1. Habitación 101 con 3 imágenes
2. Desvincula una por una hasta que no quede ninguna

**Resultado Esperado:**
- ✅ Después de cada desvinculación, el modal se actualiza
- ✅ Al desvincular la última, aparece el mensaje "No hay imágenes vinculadas"
- ✅ La card de la habitación muestra el gradiente
- ✅ Todas las imágenes siguen en la galería

---

### TEST 8: Imagen Inactiva Vinculada

**Escenario:** Una imagen está vinculada a una habitación, luego la desactivas en Galería

**Pasos:**
1. Habitación 101 tiene Imagen A vinculada (principal)
2. Ve a **Galería**
3. Desactiva la Imagen A (botón Power)
4. Vuelve a **Habitaciones**

**Resultado Esperado:**
- ✅ La card de habitación 101 **NO muestra la imagen** (vuelve al gradiente)
- ✅ Click en "Gestionar Imágenes" → La imagen aparece con badge "INACTIVA"
- ✅ Puedes desvincularla
- ✅ Si reactivas la imagen en Galería, vuelve a aparecer en la habitación

---

### TEST 9: Vincular y Desvincular en Secuencia

**Flujo completo:**
1. Galería → Vincular Imagen X a Habitación 101 (principal)
2. Habitaciones → Ver que aparece la imagen
3. Habitaciones → "Gestionar Imágenes" → Desvincular
4. Galería → Vincular la MISMA imagen de nuevo
5. Habitaciones → Ver que vuelve a aparecer

**Resultado Esperado:**
- ✅ Todo funciona sin errores
- ✅ No hay imágenes duplicadas
- ✅ El contador de vinculaciones es correcto

---

## 🎯 CHECKLIST DE FUNCIONALIDADES

### Modal "Gestionar Imágenes"
- [ ] Se abre al hacer click en botón "Imágenes"
- [ ] Muestra loader mientras carga
- [ ] Lista todas las imágenes vinculadas
- [ ] Muestra mensaje si no hay imágenes
- [ ] Badge "⭐ PRINCIPAL" en la imagen correcta
- [ ] Badge "INACTIVA" si la imagen está desactivada
- [ ] Preview de cada imagen (thumbnail)

### Botón "Marcar como Principal"
- [ ] Aparece solo en imágenes NO principales
- [ ] Al hacer click, marca como principal correctamente
- [ ] Automáticamente desmarca la anterior principal
- [ ] Toast de confirmación
- [ ] Actualiza la vista del modal
- [ ] Actualiza la card de la habitación

### Botón "Desvincular"
- [ ] Aparece en todas las imágenes
- [ ] Muestra confirmación antes de ejecutar
- [ ] Desvincula correctamente
- [ ] Toast de confirmación
- [ ] Actualiza la vista del modal
- [ ] No elimina la imagen de la galería
- [ ] Si era la única imagen, muestra mensaje "No hay imágenes"

### Integración General
- [ ] La card muestra la imagen principal correcta
- [ ] Si no hay imágenes, muestra gradiente
- [ ] Si hay imágenes pero ninguna principal, muestra la primera
- [ ] Imágenes inactivas no se muestran en la card
- [ ] Cambios se reflejan inmediatamente

---

## 📊 CONSULTAS SQL ÚTILES

### Ver todas las vinculaciones de una habitación
```sql
SELECT
  hi.id,
  h.numero as habitacion,
  ig.titulo as imagen,
  hi.es_principal,
  ig.activo as imagen_activa,
  hi.creado_en
FROM habitaciones_imagenes hi
INNER JOIN habitaciones h ON hi.habitacion_id = h.id
INNER JOIN imagenes_galeria ig ON hi.imagen_id = ig.id
WHERE h.id = 1
ORDER BY hi.es_principal DESC, hi.orden ASC;
```

### Contar principales por habitación (debe ser 0 o 1)
```sql
SELECT
  h.numero,
  COUNT(CASE WHEN hi.es_principal = true THEN 1 END) as total_principales
FROM habitaciones h
LEFT JOIN habitaciones_imagenes hi ON h.id = hi.habitacion_id
GROUP BY h.numero
ORDER BY h.numero;
```

### Ver habitaciones sin imágenes
```sql
SELECT
  h.numero,
  h.tipo_habitacion_id,
  COUNT(hi.id) as total_imagenes
FROM habitaciones h
LEFT JOIN habitaciones_imagenes hi ON h.id = hi.habitacion_id
GROUP BY h.id, h.numero, h.tipo_habitacion_id
HAVING COUNT(hi.id) = 0;
```

---

## ⚠️ POSIBLES ERRORES Y SOLUCIONES

### Error 1: "Cannot read property 'imagenes' of undefined"
**Causa:** El endpoint `getImagenesHabitacion` no devuelve la estructura correcta
**Solución:** Verifica que el backend devuelve `{ imagenes: [...] }`

### Error 2: Al desvincular, la imagen no desaparece del modal
**Causa:** No se está recargando la lista después de desvincular
**Solución:** Verifica que `handleDesvincular` llama a `getImagenesHabitacion` después del DELETE

### Error 3: Múltiples imágenes marcadas como principales
**Causa:** El trigger de BD no está funcionando
**Solución:** Ejecuta de nuevo el script de migración o verifica el trigger manualmente

### Error 4: La card no se actualiza después de cambiar principal
**Causa:** No se está recargando la lista de habitaciones
**Solución:** Verifica que `handleMarcarPrincipal` llama a `cargarHabitaciones()`

---

## 🎉 RESUMEN DE LA IMPLEMENTACIÓN

### Archivos Modificados:
1. `frontend/src/modules/gestion/pages/HabitacionesPage.jsx`

### Cambios Realizados:
- ✅ Agregado estado `showImagenesModal`, `imagenesHabitacion`, `loadingImagenes`
- ✅ Función `abrirModalImagenes()` - Carga imágenes de una habitación
- ✅ Función `handleMarcarPrincipal()` - Cambia imagen principal
- ✅ Función `handleDesvincular()` - Desvincula imagen
- ✅ Botón "Imágenes" en cada card de habitación
- ✅ Modal completo con lista de imágenes, previews y acciones
- ✅ UI/UX similar a Booking/Airbnb

### Endpoints Utilizados:
- `GET /api/habitaciones/:id/imagenes` - Listar imágenes
- `PATCH /api/habitaciones/:id/imagenes/:imagen_id/principal` - Marcar principal
- `DELETE /api/habitaciones/:id/imagenes/:imagen_id` - Desvincular

---

## 🚀 FLUJO COMPLETO DE PRUEBA

### Escenario Realista:
1. **Galería** → Subir 3 imágenes (Fachada, Habitación, Baño)
2. **Galería** → Vincular "Fachada" a Habitación 101 (principal)
3. **Galería** → Vincular "Habitación" a Habitación 101 (no principal)
4. **Galería** → Vincular "Baño" a Habitación 101 (no principal)
5. **Habitaciones** → Ver que la card muestra "Fachada"
6. **Habitaciones** → Click "Imágenes" → Ver 3 imágenes, "Fachada" marcada como principal
7. **Habitaciones** → Marcar "Habitación" como principal
8. **Habitaciones** → Ver que ahora la card muestra "Habitación"
9. **Habitaciones** → Desvincular "Baño"
10. **Habitaciones** → Ver que solo quedan 2 imágenes
11. **Habitaciones** → Desvincular "Fachada"
12. **Habitaciones** → Ver que solo queda "Habitación" (principal)
13. **Habitaciones** → Desvincular "Habitación"
14. **Habitaciones** → Ver mensaje "No hay imágenes vinculadas"
15. **Habitaciones** → Card vuelve al gradiente

**Si todos estos pasos funcionan: ✅ SISTEMA 100% FUNCIONAL**

---

## 📝 NOTAS IMPORTANTES

1. **Desvincular NO elimina la imagen de Supabase Storage**
   - Solo elimina el registro de `habitaciones_imagenes`
   - La imagen sigue en `imagenes_galeria` y en el bucket de Supabase

2. **Trigger automático garantiza integridad**
   - Solo puede haber 1 imagen principal por habitación
   - Se ejecuta ANTES de INSERT/UPDATE

3. **Consulta optimizada en listado**
   - LEFT JOIN LATERAL obtiene solo la imagen principal
   - Si no hay principal, devuelve la primera por orden

4. **Imágenes inactivas se ocultan automáticamente**
   - El WHERE filtra `ig.activo = true`
   - Pero siguen vinculadas en la tabla de relación

---

**¡Prueba todo el flujo y confirma que funciona!** 🎯
