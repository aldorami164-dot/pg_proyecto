# Análisis de Problemas del Sistema de Reservas

**Fecha:** 28 de Octubre, 2025
**Análisis realizado por:** Claude Code

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1. Estados de Habitación NO Bloquean Reservas ⚠️

**Problema:**
Cuando una habitación está en estado `limpieza` o `mantenimiento`, el sistema **NO bloquea** nuevas reservas. Solo se validan conflictos de fechas en reservas existentes, no el estado de la habitación.

**Comportamiento Actual:**
```javascript
// Sistema solo verifica:
✅ habitacion.activo = true (habitación no desactivada)
✅ No hay conflictos de fechas con otras reservas
❌ NO verifica estado de habitación (limpieza, mantenimiento)

// Resultado:
Habitación 101 en "mantenimiento" → ✅ PUEDE SER RESERVADA si no hay conflictos de fecha
```

**Ubicación del Problema:**
- `backend/src/controllers/reservas.controller.js` → `consultarDisponibilidad()` (líneas 518-629)
- `backend/src/controllers/reservas.controller.js` → `crearReserva()` (líneas 156-203)

**Por qué sucede:**
La lógica de disponibilidad usa solo la función SQL `validar_solapamiento_reservas()` que verifica conflictos de fechas, no estados de habitación.

---

### 2. Estado "Pendiente" en Reservas 🤔

**Situación Actual:**
El sistema tiene 4 estados de reserva:

| Estado | Descripción | Color | Cuándo se usa |
|--------|-------------|-------|---------------|
| **pendiente** | Reserva registrada en el sistema, sin check-in realizado | Naranja (#FFA500) | Al crear la reserva |
| **confirmada** | Check-in realizado a las 12:00 PM, huésped en habitación | Verde (#00FF00) | Al hacer check-in |
| **completada** | Check-out realizado a las 11:00 AM, reserva finalizada | Azul (#0000FF) | Al hacer check-out |
| **cancelada** | Reserva cancelada por el huésped | Rojo (#FF0000) | Al cancelar |

**Flujo Normal:**
```
1. Crear reserva → Estado: "pendiente"
   ↓
2. Día del check-in → Cambiar a "confirmada" (trigger pone habitación en "ocupada")
   ↓
3. Día del check-out → Cambiar a "completada" (trigger pone habitación en "disponible")
```

**¿Para qué sirve "pendiente"?**
- Indica que la reserva está **confirmada en calendario** pero el huésped **no ha llegado** aún
- Permite ver reservas futuras sin confundirlas con check-ins ya realizados
- La habitación permanece "disponible" hasta el check-in real

**Ejemplo:**
```
Hoy: 20 de octubre
Reserva creada para: 25-27 de octubre
Estado: "pendiente"
Habitación 101: "disponible" (porque el huésped no ha llegado)

Día 25 de octubre a las 12:00 PM:
Recepcionista hace check-in → Estado: "confirmada"
Habitación 101: "ocupada" (trigger automático)
```

---

### 3. No Hay Soporte para Reservas Múltiples ❌

**Problema:**
Un huésped **NO puede reservar múltiples habitaciones** en una sola transacción.

**Estructura Actual de la Tabla:**
```sql
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    huesped_id INTEGER NOT NULL,           -- Un solo huésped
    habitacion_id INTEGER NOT NULL,        -- Una sola habitación ❌
    fecha_checkin DATE NOT NULL,
    fecha_checkout DATE NOT NULL,
    numero_huespedes INTEGER DEFAULT 1,    -- Solo indica cuántas personas
    ...
);
```

**Limitación:**
- `habitacion_id` es un campo único (INTEGER NOT NULL)
- Una reserva solo puede tener UNA habitación
- Si un huésped quiere 2 habitaciones → debe crear 2 reservas separadas

**Caso de Uso Actual:**
```
Familia necesita 2 habitaciones:
- Reserva #1234: Habitación 101 (Doble) - 25 al 27 de octubre
- Reserva #1235: Habitación 102 (Triple) - 25 al 27 de octubre

Problemas:
❌ 2 códigos de reserva diferentes
❌ No hay relación entre las reservas
❌ Si cancela una, tiene que cancelar manualmente la otra
❌ El sistema no sabe que pertenecen al mismo grupo
```

---

## 💡 SOLUCIONES PROPUESTAS

### Solución 1: Bloquear Reservas por Estado de Habitación

**Opción A - Simple (Recomendado para Hotel Pequeño):**

Modificar la validación de disponibilidad para excluir habitaciones en `limpieza` o `mantenimiento`:

```javascript
// En: backend/src/controllers/reservas.controller.js
// Función: consultarDisponibilidad()

// AGREGAR después de validar activo=true:
if (habitacion.estado !== 'disponible' && habitacion.estado !== 'ocupada') {
  // Excluir habitaciones en limpieza o mantenimiento
  continue; // Saltar esta habitación
}
```

**Archivos a modificar:**
1. `backend/src/controllers/reservas.controller.js` → `consultarDisponibilidad()` (línea ~570)
2. `backend/src/controllers/reservas.controller.js` → `crearReserva()` (línea ~175)

**Resultado:**
- Habitación en "limpieza" → ❌ NO aparece en disponibilidad
- Habitación en "mantenimiento" → ❌ NO se puede reservar
- Solo habitaciones "disponible" → ✅ Reservables

**Opción B - Avanzado (Para Hotel Grande):**

Crear un sistema de "bloqueos de habitación" con fechas específicas:

```sql
CREATE TABLE bloqueos_habitacion (
    id SERIAL PRIMARY KEY,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo VARCHAR(50) CHECK (motivo IN ('limpieza', 'mantenimiento', 'renovacion')),
    notas TEXT,
    creado_por INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Esto permite bloquear habitaciones por períodos específicos sin afectar su estado general.

---

### Solución 2: Simplificar Estados de Reserva

**Propuesta:** Eliminar estado "pendiente" y crear directo en "confirmada"

**Pros:**
- Menos pasos para el recepcionista
- Simplifica el flujo de trabajo
- Habitación se marca como "ocupada" inmediatamente

**Contras:**
- ❌ **No recomendado** porque:
  - Perderías visibilidad de reservas futuras vs. check-ins actuales
  - La habitación quedaría "ocupada" días antes del check-in real
  - No podrías distinguir entre "reservado para mañana" vs "huésped está en la habitación ahora"

**Recomendación:** **MANTENER el estado "pendiente"** por las siguientes razones:

1. **Gestión de Operaciones:**
   - Saber qué habitaciones tienen huéspedes ahora vs. reservas futuras
   - Planificar limpieza y preparación de habitaciones

2. **Reportes:**
   - Diferenciar ocupación actual vs. reservas futuras
   - Calcular tasa de ocupación real vs. proyectada

3. **Flujo de Trabajo:**
   ```
   Día 20: Crear reserva para día 25 → "pendiente" (habitación "disponible")
   Día 25 a las 12 PM: Check-in → "confirmada" (habitación "ocupada")
   Día 27 a las 11 AM: Check-out → "completada" (habitación "disponible")
   ```

**Mejora Sugerida:** Agregar transición automática de "pendiente" a "confirmada" en el día del check-in con un botón rápido en el frontend.

---

### Solución 3: Implementar Reservas Múltiples

**Opción A - Tabla Intermedia (Recomendado):**

Crear una estructura que permita agrupar múltiples habitaciones en una reserva:

```sql
-- Nueva tabla: Agrupa reservas relacionadas
CREATE TABLE grupos_reservas (
    id SERIAL PRIMARY KEY,
    codigo_grupo VARCHAR(20) UNIQUE NOT NULL,  -- Ej: "GR-2025-001"
    huesped_principal_id INTEGER NOT NULL REFERENCES huespedes(id),
    fecha_checkin DATE NOT NULL,
    fecha_checkout DATE NOT NULL,
    numero_habitaciones INTEGER NOT NULL,
    precio_total_grupo DECIMAL(10, 2),
    canal_reserva VARCHAR(20),
    notas TEXT,
    creado_por INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla actual se modifica para referenciar al grupo
ALTER TABLE reservas
ADD COLUMN grupo_reserva_id INTEGER REFERENCES grupos_reservas(id) ON DELETE SET NULL;

-- Index para buscar reservas de un grupo
CREATE INDEX idx_reservas_grupo ON reservas(grupo_reserva_id);
```

**Flujo de Trabajo:**
```javascript
// Crear reserva múltiple:
1. Crear grupo_reserva: codigo_grupo = "GR-2025-001"
2. Crear reserva individual para cada habitación:
   - Reserva #1234: Habitación 101, grupo_id = 1
   - Reserva #1235: Habitación 102, grupo_id = 1
   - Reserva #1236: Habitación 103, grupo_id = 1

// Ventajas:
✅ Cada habitación tiene su propia reserva individual (mantiene lógica actual)
✅ Pueden tener diferentes precios por habitación
✅ Agrupadas bajo un código de grupo común
✅ Al cancelar el grupo, se cancelan todas las reservas asociadas
✅ Reportes pueden agrupar por grupo_reserva_id
```

**Opción B - Tabla de Detalles (Alternativa):**

```sql
-- Tabla principal de reserva (sin habitacion_id)
ALTER TABLE reservas
DROP COLUMN habitacion_id,
ADD COLUMN numero_habitaciones INTEGER DEFAULT 1;

-- Nueva tabla de detalles
CREATE TABLE reservas_habitaciones (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    habitacion_id INTEGER NOT NULL REFERENCES habitaciones(id),
    precio_por_noche DECIMAL(10, 2) NOT NULL,
    precio_subtotal DECIMAL(10, 2),
    UNIQUE(reserva_id, habitacion_id)
);
```

**Comparación:**

| Aspecto | Opción A (Grupos) | Opción B (Detalles) |
|---------|-------------------|---------------------|
| Complejidad | Baja | Alta |
| Cambios en BD | Mínimos | Muchos |
| Compatibilidad | Mantiene estructura actual | Rompe estructura actual |
| Flexibilidad | Alta | Muy alta |
| **Recomendación** | ✅ **MEJOR** | ⚠️ Requiere refactorización completa |

---

## 🚀 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Bloqueo de Habitaciones (Prioridad ALTA)
**Tiempo estimado:** 2 horas

1. Modificar `consultarDisponibilidad()` para filtrar por estado
2. Modificar `crearReserva()` para validar estado antes de crear
3. Actualizar tests y documentación
4. Probar en desarrollo

**Archivos a modificar:**
- `backend/src/controllers/reservas.controller.js`
- `backend/src/validators/reservas.validator.js` (opcional)

---

### Fase 2: Mantener Estado "Pendiente" (Prioridad MEDIA)
**Tiempo estimado:** 1 hora

1. Agregar botón de "Check-in Rápido" en frontend para pasar de "pendiente" a "confirmada"
2. Mejorar visualización de estados en el calendario
3. Agregar filtros por estado en listado de reservas

**Archivos a modificar:**
- `frontend/src/modules/gestion/pages/ReservasPage.jsx`
- `frontend/src/modules/gestion/components/CalendarioReservas.jsx`

---

### Fase 3: Reservas Múltiples (Prioridad BAJA)
**Tiempo estimado:** 8-12 horas

1. Crear migración de base de datos para tabla `grupos_reservas`
2. Actualizar controladores de reservas para soportar grupos
3. Modificar frontend para permitir selección múltiple de habitaciones
4. Actualizar lógica de cancelación para grupos
5. Ajustar reportes para considerar grupos

**Archivos a crear/modificar:**
- `docs/database/MIGRACION_grupos_reservas.sql` (nuevo)
- `backend/src/controllers/reservas.controller.js`
- `frontend/src/modules/gestion/pages/NuevaReservaPage.jsx`
- `frontend/src/modules/gestion/components/SelectorHabitaciones.jsx` (nuevo)

---

## 📝 RESUMEN EJECUTIVO

| Problema | Impacto | Solución Recomendada | Prioridad |
|----------|---------|----------------------|-----------|
| Estados de habitación no bloquean reservas | ALTO | Validar estado en disponibilidad | **ALTA** |
| Estado "pendiente" confuso | BAJO | Mantener + mejorar UX | MEDIA |
| No hay reservas múltiples | MEDIO | Implementar grupos de reservas | BAJA |

**Recomendación Final:**
1. Implementar **Fase 1** inmediatamente (bloqueo por estado)
2. Implementar **Fase 2** en próxima iteración (mejorar UX de estados)
3. Evaluar si **Fase 3** es necesaria según volumen de reservas grupales

---

**Documentación generada el:** 28 de Octubre, 2025
**Próxima revisión:** Después de implementar Fase 1
