# SISTEMA DE GESTIÓN HOTELERA - HOTEL CASA JOSEFA
## FASE 1: DISEÑO E IMPLEMENTACIÓN DE BASE DE DATOS POSTGRESQL

### CONTEXTO DEL PROYECTO
Sistema de gestión hotelera con dos módulos independientes:

1. **Módulo Gestión Habitacional (Interno):** Centralización MANUAL de reservas de múltiples canales (Booking, WhatsApp, Facebook) para evitar sobreventa
2. **Módulo Plataforma QR (Público):** Información del hotel y de lugares turisticos local y servicios accesible vía QR

**IMPORTANTE:** Las reservas YA fueron hechas externamente. Este sistema solo las centraliza manualmente.

### STACK TECNOLÓGICO
- PostgreSQL (vía Supabase)
- Backend: Node.js + Express (Fase 2)
- Frontend: React + Vite + Tailwind (Fase 3)

---

## TABLAS Y REGLAS DE NEGOCIO

### 1. TABLA: roles
**Propósito:** Control de acceso al sistema

**Reglas de negocio:**
- Solo 2 roles: 'administrador' y 'recepcionista'
- Administrador: Control total del sistema
- Recepcionista: Crear/editar reservas, cambiar estados | NO crear habitaciones, NO modificar precios, NO generar QR
- Roles predefinidos, no se pueden crear nuevos

---

### 2. TABLA: usuarios
**Propósito:** Autenticación del personal

**Reglas de negocio:**
- Login con email + contraseña
- Email único en el sistema
- Debe tener rol asignado (FK a roles)
- Campo activo/inactivo para deshabilitar usuarios sin eliminarlos
- Solo admin puede crear/editar usuarios
- Registrar último acceso al sistema
- Password almacenado como hash (bcrypt en backend)

---

### 3. TABLA: tipos_habitacion
**Propósito:** Clasificación de habitaciones

**Reglas de negocio:**
- Tipos predefinidos: Individual, Doble, Triple, Familiar
- Capacidad máxima define cuántos huéspedes soporta
- Tipos activos/inactivos
- No se pueden eliminar si tienen habitaciones asociadas

---

### 4. TABLA: habitaciones
**Propósito:** Registro de habitaciones del hotel

**Reglas de negocio:**
- Número de habitación único
- Precio fijo al crear (solo admin puede modificar)
- **NO generar QR automáticamente** al crear
- Estados automáticos: Check-in 12pm → 'ocupada' | Check-out 11am → 'disponible'
- Estados manuales: 'limpieza', 'mantenimiento' (cambiados por recepción/admin)
- Solo admin puede crear/editar habitaciones
- Campo qr_asignado_id puede ser NULL (habitación sin QR todavía)
- Una habitación solo puede tener UN QR activo
- No se pueden eliminar habitaciones con reservas activas

---

### 5. TABLA: codigos_qr
**Propósito:** Gestión independiente de códigos QR (TABLA CLAVE DEL SISTEMA)

**Reglas de negocio:**
- **NO se crean automáticamente** al crear habitación
- Admin genera QR manualmente desde panel dedicado "Generador QR"
- Puede haber QR sin asignar (estado='sin_asignar') como stock
- URL formato: `https://casajosefa.com/habitacion/{numero}`
- Al asignar a habitación: cambiar estado='asignado', registrar fecha_asignacion
- Un QR solo puede estar asignado a UNA habitación
- Admin puede reasignar QR a otra habitación
- Admin puede desactivar QR (estado='inactivo')
- Registrar total de lecturas (escaneos) y última lectura
- Función del QR: Enlazar a plataforma + identificar número de habitación para solicitudes

---

### 6. TABLA: huespedes
**Propósito:** Registro de clientes

**Reglas de negocio:**
- Solo nombre es obligatorio
- **NO detectar duplicados automáticamente**
- Permitir múltiples registros con mismo email/teléfono sin vincular
- Resto de campos opcionales
- Registrar reserva rápida: solo nombre + apellido + fechas + habitación
- Registrar reserva completa: todos los campos disponibles

---

### 7. TABLA: estados_reserva
**Propósito:** Ciclo de vida de reservas

**Reglas de negocio:**
- 4 estados predefinidos: pendiente, confirmada, completada, cancelada
- Pendiente: Reserva registrada, sin check-in
- Confirmada: Check-in realizado (12:00 PM)
- Completada: Check-out realizado (11:00 AM)
- Cancelada: Reserva cancelada
- Cada estado tiene color asociado para UI
- No se pueden crear nuevos estados

---

### 8. TABLA: reservas
**Propósito:** Centralización manual de todas las reservas

**Reglas de negocio:**
- **Validación CRÍTICA:** Antes de crear/editar, llamar función `validar_solapamiento_reservas()`
- Rechazar si fechas se solapan con otra reserva activa (no cancelada)
- Precio total = precio_habitacion × número_de_noches
- Cálculo automático de noches: fecha_checkout - fecha_checkin
- Canales permitidos: booking, whatsapp, facebook, telefono, presencial
- Modificación de fechas/habitación solo si nuevas fechas disponibles
- Al cambiar estado a 'confirmada' → trigger cambia habitación a 'ocupada'
- Al cambiar estado a 'completada' o 'cancelada' → trigger cambia habitación a 'disponible'
- Código reserva único generado automáticamente
- Registrar usuario que creó reserva, hizo check-in y check-out
- No se pueden eliminar reservas, solo cancelar

---

### 9. TABLA: servicios
**Propósito:** Catálogo de servicios del hotel

**Reglas de negocio:**
- 4 servicios predefinidos
- **De pago:** Lavandería (Q50.00), Sauna (Q100.00) → tiene_costo=true
- **Gratuitos:** Limpieza extra, Uso de cocina → tiene_costo=false
- Cada servicio tiene categoría única: lavanderia, sauna, limpieza, cocina
- Horarios opcionales (inicio/fin)
- Sistema solo indica costo, cobro es manual (no integración de pago)
- Servicios activos/inactivos

---

### 10. TABLA: solicitudes_servicios
**Propósito:** Gestión de pedidos desde plataforma QR

**Reglas de negocio:**
- Huésped escanea QR de habitación
- URL contiene número de habitación: `/habitacion/{numero}`
- Frontend detecta número, backend busca habitacion_id
- Al insertar solicitud → trigger automático crea notificación
- Estados: 'pendiente' → 'completada'
- Recepción marca como completada cuando atiende
- Registrar usuario que atendió y fecha
- Campo origen: 'plataforma_qr' o 'recepcion' (si se crea manualmente)
- Notificación muestra: "Habitación {numero} solicita {servicio}"

---

### 11. TABLA: notificaciones
**Propósito:** Sistema de notificaciones en tiempo real

**Reglas de negocio:**
- Creadas automáticamente por trigger al insertar solicitud_servicios
- Tipos: solicitud_servicio, alerta, informacion
- Prioridad alta si servicio tiene_costo=true
- Prioridad normal si servicio gratuito
- Estados: leida=false (nueva) | leida=true (vista por recepción)
- Registrar quién leyó y cuándo
- Persistir en BD para historial
- Backend enviará via WebSocket/SSE en tiempo real (Fase 2)
- Incluir número de habitación en mensaje

---

### 12. TABLA: reportes_ocupacion
**Propósito:** Almacenamiento de reportes generados

**Reglas de negocio:**
- Períodos: 'semanal' o 'mensual'
- Generados manualmente por admin/recepción desde panel
- Función `generar_reporte_ocupacion()` calcula métricas y guarda
- Métricas: Total habitaciones, habitaciones ocupadas, porcentaje, total reservas
- Excluir reservas canceladas del cálculo
- Contar habitaciones únicas ocupadas en el período
- Registrar quién generó el reporte y cuándo
- Reportes históricos, no se eliminan

---

### 13. TABLA: contenido_plataforma
**Propósito:** CMS para contenido editable de plataforma QR

**Reglas de negocio:**
- Solo admin puede crear/editar/eliminar contenido
- Contenido bilingüe: campos separados para español (_es) e inglés (_en)
- Secciones predefinidas: bienvenida, normas_hotel, horarios, wifi, contacto_emergencia
- Campo orden para controlar secuencia de aparición
- Activo/inactivo para mostrar/ocultar secciones
- Registrar quién editó y cuándo (actualizado_por, actualizado_en)
- Trigger actualiza timestamp automáticamente
- Contenido inicial en español e inglés insertado por defecto

---

### 14. TABLA: experiencias_turisticas
**Propósito:** Información turística de Santiago Atitlán

**Reglas de negocio:**
- Admin gestiona experiencias (crear/editar/eliminar)
- Categorías: atracciones, actividades, gastronomia, cultura
- Campo destacado para mostrar en home de plataforma QR
- Activo/inactivo para publicar/ocultar
- Imagen opcional (URL)
- Ubicación y descripción en texto libre
- Experiencias iniciales predefinidas: Tour Lago, Ceremonia Maya, Taller Textiles

---

### 15. TABLA: imagenes_galeria (OPCIONAL)
**Propósito:** Galería de fotos del hotel

**Reglas de negocio:**
- Admin sube/elimina imágenes
- Categorías: hotel_exterior, habitaciones, servicios, restaurante, piscina, vistas
- Campo orden para controlar secuencia
- Activo/inactivo
- Registrar quién subió y cuándo
- Solo almacenar URL (archivo guardado en servicio externo)

---

## FUNCIONES REQUERIDAS

### validar_solapamiento_reservas(habitacion_id, fecha_checkin, fecha_checkout, reserva_id)
**Propósito:** Validar que no haya conflicto de fechas

**Reglas de negocio:**
- Retorna TRUE si fechas disponibles, FALSE si ocupadas
- Excluir reservas canceladas de validación
- Si reserva_id es NULL → validar para nueva reserva
- Si reserva_id tiene valor → validar para editar reserva existente (excluir esa reserva)
- Lógica de solapamiento: detectar cualquier intersección de rangos de fechas

---

### generar_reporte_ocupacion(fecha_inicio, fecha_fin, tipo_periodo, usuario_id)
**Propósito:** Calcular y guardar reporte de ocupación

**Reglas de negocio:**
- Contar total habitaciones activas
- Contar habitaciones únicas ocupadas en período (excluir canceladas)
- Contar total de reservas en período (excluir canceladas)
- Calcular porcentaje: (ocupadas / total) × 100
- Insertar registro en reportes_ocupacion
- Retornar ID del reporte creado

---

## TRIGGERS REQUERIDOS

### Trigger: actualizar_estado_habitacion
**Tabla afectada:** reservas
**Evento:** AFTER UPDATE OF estado_id

**Reglas de negocio:**
- Si estado cambia a 'confirmada' → UPDATE habitaciones SET estado='ocupada'
- Si estado cambia a 'completada' → UPDATE habitaciones SET estado='disponible'
- Si estado cambia a 'cancelada' → UPDATE habitaciones SET estado='disponible'
- Solo ejecutar si estado realmente cambió (OLD.estado_id != NEW.estado_id)

---

### Trigger: notificar_solicitud_servicio
**Tabla afectada:** solicitudes_servicios
**Evento:** AFTER INSERT

**Reglas de negocio:**
- Obtener número de habitación desde habitacion_id
- Obtener nombre de servicio desde servicio_id
- Obtener si servicio tiene_costo
- Crear notificación con:
  - tipo='solicitud_servicio'
  - titulo='Nueva solicitud de servicio'
  - mensaje='Habitación {numero} solicita: {servicio}'
  - prioridad='alta' si tiene_costo=true, 'normal' si false
  - habitacion_numero={numero}

---

### Trigger: actualizar_timestamp
**Tablas afectadas:** Todas con campo actualizado_en
**Evento:** BEFORE UPDATE

**Reglas de negocio:**
- Actualizar campo actualizado_en = CURRENT_TIMESTAMP
- Ejecutar antes de guardar cambios

---

## DATOS INICIALES A INSERTAR

**roles:**
- administrador, recepcionista

**estados_reserva:**
- pendiente (#FFA500), confirmada (#00FF00), completada (#0000FF), cancelada (#FF0000)

**tipos_habitacion:**
- Individual (capacidad 1), Doble (2), Triple (3), Familiar (6)

**servicios:**
- Lavandería (Q50, categoria='lavanderia', tiene_costo=true)
- Sauna (Q100, categoria='sauna', tiene_costo=true)
- Limpieza Extra (Q0, categoria='limpieza', tiene_costo=false)
- Uso de Cocina (Q0, categoria='cocina', tiene_costo=false)

**contenido_plataforma:**
- bienvenida (ES/EN)
- normas_hotel (ES/EN) - incluir check-in 12pm, check-out 11am
- horarios (ES/EN) - recepción 24h, desayuno, sauna, cocina
- wifi (ES/EN) - red y contraseña
- contacto_emergencia (ES/EN) - teléfonos importantes

**experiencias_turisticas:**
- Tour en Lancha por el Lago Atitlán
- Ceremonia Maya Tradicional
- Taller de Textiles Tradicionales

---

## VALIDACIONES CRÍTICAS A IMPLEMENTAR

1. **Al crear/editar reserva:** Llamar `validar_solapamiento_reservas()` → si FALSE, rechazar
2. **Al generar QR:** Verificar habitación no tenga qr_asignado_id activo
3. **Al asignar QR:** Actualizar codigos_qr.habitacion_id + habitaciones.qr_asignado_id
4. **Constraints CHECK:** Fechas, precios ≥ 0, estados solo valores permitidos
5. **Foreign Keys:** ON DELETE RESTRICT (excepto notificaciones CASCADE)
6. **Índices:** Crear en campos de búsqueda frecuente y FK

---

## ENTREGABLES

Implementa el esquema completo de base de datos con:
1. CREATE TABLE de las 15 tablas en orden correcto de dependencias
2. Funciones: validar_solapamiento_reservas, generar_reporte_ocupacion
3. Triggers: actualizar_estado_habitacion, notificar_solicitud_servicio, actualizar_timestamp
4. Índices en todos los campos clave
5. Datos iniciales (INSERT INTO)
6. Script SQL ejecutable completo