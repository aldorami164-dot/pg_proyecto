# Explicación: Sistema de Reservas Múltiples (Sin Romper Nada)

**Fecha:** 28 de Octubre, 2025

---

## 🎯 OBJETIVO

Permitir que un huésped reserve **múltiples habitaciones** en una sola transacción, manteniendo **100% de compatibilidad** con el sistema actual.

---

## 📊 ESTRUCTURA ACTUAL (Antes)

### Cómo funciona AHORA:

```
Tabla: reservas
┌────┬──────────────┬──────────┬──────────────┬────────┬────────┐
│ id │ codigo_reserva│huesped_id│habitacion_id │checkin │checkout│
├────┼──────────────┼──────────┼──────────────┼────────┼────────┤
│ 1  │ RES-2025-001 │    5     │     101      │25-oct  │27-oct  │ ← Reserva individual
│ 2  │ RES-2025-002 │    5     │     102      │25-oct  │27-oct  │ ← Otra reserva del mismo huésped
└────┴──────────────┴──────────┴──────────────┴────────┴────────┘

Problema:
❌ No hay conexión entre estas 2 reservas
❌ Códigos diferentes (RES-001, RES-002)
❌ Si cancela una, debe cancelar manualmente la otra
❌ El sistema no sabe que son del mismo grupo familiar
```

---

## 🆕 ESTRUCTURA NUEVA (Después)

### Cómo funcionará CON GRUPOS:

```
NUEVA Tabla: grupos_reservas (opcional, complementa)
┌────┬───────────────┬──────────────────┬───────────┬────────┬────────┐
│ id │ codigo_grupo  │huesped_principal │num_habita │checkin │checkout│
├────┼───────────────┼──────────────────┼───────────┼────────┼────────┤
│ 1  │ GRP-2025-001  │        5         │     3     │25-oct  │27-oct  │ ← Grupo: 3 habitaciones
└────┴───────────────┴──────────────────┴───────────┴────────┴────────┘

Tabla: reservas (SE AGREGA SOLO UNA COLUMNA)
┌────┬──────────────┬──────────┬──────────────┬────────┬────────┬────────────────┐
│ id │ codigo_reserva│huesped_id│habitacion_id │checkin │checkout│grupo_reserva_id│ ← NUEVA COLUMNA
├────┼──────────────┼──────────┼──────────────┼────────┼────────┼────────────────┤
│ 1  │ RES-2025-001 │    5     │     101      │25-oct  │27-oct  │      1         │ ← Parte del grupo 1
│ 2  │ RES-2025-002 │    5     │     102      │25-oct  │27-oct  │      1         │ ← Parte del grupo 1
│ 3  │ RES-2025-003 │    5     │     103      │25-oct  │27-oct  │      1         │ ← Parte del grupo 1
│ 4  │ RES-2025-004 │    8     │     201      │26-oct  │28-oct  │     NULL       │ ← Reserva individual (sin grupo)
└────┴──────────────┴──────────┴──────────────┴────────┴────────┴────────────────┘

Ventajas:
✅ Reservas 1, 2, 3 están agrupadas (mismo grupo_reserva_id = 1)
✅ Cada habitación sigue teniendo su propia reserva individual
✅ Reserva 4 es individual (grupo_reserva_id = NULL) → COMPATIBILIDAD TOTAL
✅ Todo el código actual sigue funcionando igual
```

---

## 🔄 COMPATIBILIDAD HACIA ATRÁS

### ¿Por qué NO se rompe nada?

#### 1. **Columna NULL por defecto**
```sql
ALTER TABLE reservas
ADD COLUMN grupo_reserva_id INTEGER REFERENCES grupos_reservas(id) ON DELETE SET NULL;

-- Esta columna puede ser NULL → las reservas individuales no necesitan grupo
```

#### 2. **Reservas existentes NO se afectan**
```
Todas las reservas actuales: grupo_reserva_id = NULL
Significado: Son reservas individuales (como antes)
Comportamiento: Idéntico al actual
```

#### 3. **Código backend actual sigue funcionando**
```javascript
// Código ACTUAL (no necesita cambios):
const reservas = await query('SELECT * FROM reservas WHERE huesped_id = $1', [5]);

// Resultado:
[
  { id: 1, codigo_reserva: 'RES-001', habitacion_id: 101, grupo_reserva_id: 1 },
  { id: 2, codigo_reserva: 'RES-002', habitacion_id: 102, grupo_reserva_id: 1 },
  { id: 4, codigo_reserva: 'RES-004', habitacion_id: 201, grupo_reserva_id: null }
]

// El código actual simplemente IGNORA la nueva columna grupo_reserva_id
// ✅ TODO FUNCIONA IGUAL
```

#### 4. **Frontend actual sigue funcionando**
```javascript
// Formulario actual de nueva reserva:
// - Selecciona 1 habitación
// - Crea 1 reserva
// - grupo_reserva_id queda NULL automáticamente

// ✅ Sin cambios necesarios en el flujo actual
```

---

## 🎨 CÓMO SE VERÁ EL NUEVO FLUJO

### Opción 1: Crear Reserva Individual (Como antes)

```
Frontend:
┌────────────────────────────────────────┐
│  Nueva Reserva                         │
│                                        │
│  Huésped: Juan Pérez                   │
│  Check-in: 25-oct-2025                 │
│  Check-out: 27-oct-2025                │
│                                        │
│  Habitación: [Hab 101 - Doble ▼]      │
│                                        │
│  [Guardar Reserva]                     │
└────────────────────────────────────────┘

Backend:
1. Crea 1 reserva con grupo_reserva_id = NULL
2. Código actual funciona EXACTAMENTE igual

Resultado:
✅ Reserva individual creada
✅ Sin cambios en la lógica actual
```

### Opción 2: Crear Reserva Múltiple (NUEVO)

```
Frontend:
┌────────────────────────────────────────┐
│  Nueva Reserva (Múltiple)              │
│                                        │
│  Huésped: María González               │
│  Check-in: 25-oct-2025                 │
│  Check-out: 27-oct-2025                │
│                                        │
│  ☑ Reservar múltiples habitaciones     │ ← NUEVO checkbox
│                                        │
│  Habitaciones seleccionadas:           │
│  ✓ Hab 101 - Doble (Q350/noche)        │
│  ✓ Hab 102 - Triple (Q450/noche)       │
│  ✓ Hab 103 - Familiar (Q600/noche)     │
│                                        │
│  Total: Q1,400 x 2 noches = Q2,800     │
│                                        │
│  [Guardar Grupo de Reservas]           │
└────────────────────────────────────────┘

Backend (NUEVO):
1. Crear grupo_reserva: GRP-2025-001
2. Crear 3 reservas individuales:
   - RES-2025-001 (Hab 101) grupo_id = 1
   - RES-2025-002 (Hab 102) grupo_id = 1
   - RES-2025-003 (Hab 103) grupo_id = 1
3. Validar disponibilidad de CADA habitación

Resultado:
✅ 3 reservas individuales creadas
✅ Todas referenciadas al mismo grupo
✅ Un código de grupo para todas
```

---

## 📋 VENTAJAS DE ESTA ESTRATEGIA

### ✅ Compatibilidad Total

| Aspecto | Reservas Individuales | Reservas Múltiples |
|---------|----------------------|-------------------|
| **Crear** | ✅ Funciona igual | ✅ Nueva opción |
| **Listar** | ✅ Funciona igual | ✅ Muestra agrupadas |
| **Editar** | ✅ Funciona igual | ✅ Editar por habitación |
| **Cancelar** | ✅ Funciona igual | ✅ Cancelar grupo completo |
| **Check-in/out** | ✅ Funciona igual | ✅ Por habitación individual |
| **Reportes** | ✅ Funciona igual | ✅ Puede agrupar si quiere |

### ✅ Flexibilidad

```
Escenario 1: Familia reserva 3 habitaciones
→ Crear 1 grupo con 3 reservas

Escenario 2: Un turista solo necesita 1 habitación
→ Crear 1 reserva individual (NULL en grupo_reserva_id)

Escenario 3: Grupo de 10 personas en 5 habitaciones
→ Crear 1 grupo con 5 reservas

Escenario 4: Huésped quiere cancelar solo 1 de las 3 habitaciones
→ Cancelar esa reserva individual, mantener el grupo
```

### ✅ Sin Pérdida de Funcionalidad

**Todas estas operaciones actuales siguen funcionando:**
- ✅ Validación de disponibilidad (por habitación)
- ✅ Triggers de cambio de estado (por reserva)
- ✅ Check-in individual (por habitación)
- ✅ Check-out individual (por habitación)
- ✅ Notificaciones (por reserva)
- ✅ Reportes de ocupación
- ✅ Calendario de reservas

---

## 🔍 EJEMPLO COMPLETO: Antes vs Después

### ANTES (Sistema Actual)

```
Caso: Familia necesita 2 habitaciones para 25-27 octubre

Paso 1: Crear primera reserva
POST /api/reservas
{
  "huesped_id": 5,
  "habitacion_id": 101,
  "fecha_checkin": "2025-10-25",
  "fecha_checkout": "2025-10-27"
}
→ Resultado: RES-2025-001

Paso 2: Crear segunda reserva (MANUALMENTE)
POST /api/reservas
{
  "huesped_id": 5,
  "habitacion_id": 102,
  "fecha_checkin": "2025-10-25",
  "fecha_checkout": "2025-10-27"
}
→ Resultado: RES-2025-002

Problemas:
❌ 2 pasos separados
❌ 2 códigos diferentes
❌ No están relacionadas
❌ Si cancela, debe hacerlo 2 veces
```

### DESPUÉS (Con Grupos)

```
Caso: Familia necesita 2 habitaciones para 25-27 octubre

Paso 1: Crear grupo de reservas
POST /api/reservas/grupo
{
  "huesped_id": 5,
  "habitaciones_ids": [101, 102],
  "fecha_checkin": "2025-10-25",
  "fecha_checkout": "2025-10-27",
  "canal_reserva": "presencial"
}

Backend automáticamente:
1. Crea grupo: GRP-2025-001
2. Crea reserva 1: RES-2025-001 (Hab 101, grupo_id=1)
3. Crea reserva 2: RES-2025-002 (Hab 102, grupo_id=1)
4. Valida disponibilidad de ambas
5. Si UNA falla → rollback de todo

→ Resultado:
{
  "codigo_grupo": "GRP-2025-001",
  "reservas": [
    { "id": 1, "codigo": "RES-2025-001", "habitacion": 101 },
    { "id": 2, "codigo": "RES-2025-002", "habitacion": 102 }
  ]
}

Ventajas:
✅ 1 solo paso
✅ 1 código de grupo
✅ Están relacionadas
✅ Cancelar grupo → cancela ambas
```

---

## 🛠️ CAMBIOS NECESARIOS (Resumen)

### Base de Datos (SQL)
```sql
-- 1. Crear tabla de grupos (NUEVA)
CREATE TABLE grupos_reservas (...);

-- 2. Agregar columna a reservas (OPCIONAL, NULL permitido)
ALTER TABLE reservas ADD COLUMN grupo_reserva_id INTEGER;
```

### Backend (API)
```javascript
// Endpoint NUEVO (opcional):
POST /api/reservas/grupo
- Crea grupo + múltiples reservas en transacción

// Endpoints ACTUALES (sin cambios):
POST /api/reservas          ✅ Funciona igual
GET /api/reservas           ✅ Funciona igual
PUT /api/reservas/:id       ✅ Funciona igual
DELETE /api/reservas/:id    ✅ Funciona igual
```

### Frontend
```javascript
// Componente NUEVO:
<SelectorMultipleHabitaciones />
- Checkbox para activar modo múltiple
- Lista de habitaciones disponibles
- Selección múltiple

// Componentes ACTUALES (opcionales):
<FormularioReserva />
- Agregar opción "Reservar múltiples" (checkbox)
- Si está desactivado → funciona como antes
```

---

## ✅ GARANTÍAS

### 1. **Zero Downtime**
- Base de datos se puede migrar sin detener el servicio
- Columna NULL no afecta datos existentes

### 2. **Zero Breaking Changes**
- Todo el código actual funciona sin modificaciones
- Reservas individuales siguen creándose como antes

### 3. **Rollback Seguro**
Si algo falla:
```sql
-- Revertir cambios:
ALTER TABLE reservas DROP COLUMN grupo_reserva_id;
DROP TABLE grupos_reservas;

-- Sistema vuelve al estado anterior 100%
```

### 4. **Implementación Gradual**
```
Fase 1: Solo migración de BD
→ Sistema funciona igual, preparado para grupos

Fase 2: Backend con endpoint /grupo
→ Aún compatible con frontend actual

Fase 3: Frontend con selector múltiple
→ Usuario puede elegir: individual o múltiple
```

---

## 📊 TABLA COMPARATIVA

| Característica | Sistema Actual | Con Grupos | ¿Se Rompe Algo? |
|----------------|---------------|-----------|-----------------|
| Crear reserva individual | ✅ | ✅ | ❌ NO |
| Crear reserva múltiple | ❌ (manual) | ✅ (automático) | ❌ NO |
| Listar reservas | ✅ | ✅ | ❌ NO |
| Editar reserva | ✅ | ✅ | ❌ NO |
| Cancelar reserva | ✅ | ✅ + cancelar grupo | ❌ NO |
| Check-in/out | ✅ | ✅ | ❌ NO |
| Validación fechas | ✅ | ✅ | ❌ NO |
| Triggers BD | ✅ | ✅ | ❌ NO |
| Reportes | ✅ | ✅ + agrupados | ❌ NO |

---

## 🎯 CONCLUSIÓN

**La clave del diseño:**
1. Cada habitación = 1 reserva individual (como antes)
2. Grupo = Opcional, solo para relacionarlas
3. Sin grupo (NULL) = Reserva individual tradicional

**Esto garantiza:**
- ✅ **100% compatible** con sistema actual
- ✅ **Sin cambios** en código existente (opcional)
- ✅ **Gradual** implementación
- ✅ **Reversible** si es necesario

---

**¿Tiene sentido esta estrategia? ¿Quieres que comience la implementación?**
