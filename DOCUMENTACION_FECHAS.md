# 📅 Documentación Técnica: Manejo de Fechas

## Problema Identificado

El sistema presentaba un **desfase de 1 día** en las fechas de las reservas:
- **Usuario seleccionaba:** 21 de octubre
- **Sistema guardaba:** 20 de octubre ❌

---

## Causa Raíz

El problema ocurría en **múltiples capas** del stack:

### 1. **Frontend (Axios)**
Axios convierte automáticamente strings de fecha en objetos `Date`:
```javascript
// Input del usuario
"2025-10-21"

// Axios lo transforma a:
new Date("2025-10-21T00:00:00.000Z")  // UTC
```

### 2. **Backend (Express.json)**
Express parsea JSON y también convierte strings ISO en objetos `Date`:
```javascript
req.body.fecha_checkin  // Date object en lugar de string
```

### 3. **PostgreSQL (Timezone)**
PostgreSQL interpreta fechas con hora como UTC y las convierte a zona horaria local (Guatemala UTC-6):
```sql
-- Recibe: 2025-10-21T00:00:00.000Z (UTC)
-- Convierte a: 2025-10-20T18:00:00 (Guatemala)
-- Guarda: 2025-10-20  ❌
```

---

## Solución Implementada

### 🔧 **Capa 1: Frontend - Axios (`api.js`)**

**Archivo:** `frontend/src/shared/services/api.js`

```javascript
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },

  // Prevenir que Axios convierta strings de fechas en Date objects
  transformRequest: [
    (data) => {
      if (!data) return data
      return JSON.stringify(data)  // Serializar manualmente
    }
  ],

  // También en las respuestas
  transformResponse: [
    (data) => {
      if (!data) return data
      return JSON.parse(data)  // Parsear manualmente
    }
  ]
})
```

**Efecto:** Axios ya no convierte automáticamente fechas.

---

### 🔧 **Capa 2: Frontend - Service Layer**

**Archivo:** `frontend/src/shared/services/reservasService.js`

```javascript
createReserva: async (reservaData) => {
  // Forzar conversión a string por si acaso
  const sanitizedData = {
    ...reservaData,
    fecha_checkin: String(reservaData.fecha_checkin),
    fecha_checkout: String(reservaData.fecha_checkout)
  }
  const response = await api.post('/reservas', sanitizedData)
  return response.data.data
}
```

**Efecto:** Garantiza que siempre se envíen strings, no Date objects.

---

### 🔧 **Capa 3: Backend - Middleware Global**

**Archivo:** `backend/src/middleware/sanitizeDates.js`

```javascript
const sanitizeDates = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj) {
  // Si es Date object, convertir a YYYY-MM-DD
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0];
  }

  // Si es string con hora, limpiar
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
    return obj.split('T')[0];
  }

  // Recursivo para objetos y arrays
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}
```

**Uso en `app.js`:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeDates);  // DESPUÉS de express.json()
```

**Efecto:** Intercepta todas las peticiones y convierte Date objects a strings.

---

### 🔧 **Capa 4: Backend - Controller**

**Archivo:** `backend/src/controllers/reservas.controller.js`

```javascript
// Sanitizar fechas antes de insertar
let fechaCheckinFinal = req.body.fecha_checkin;
let fechaCheckoutFinal = req.body.fecha_checkout;

if (fechaCheckinFinal instanceof Date) {
  fechaCheckinFinal = fechaCheckinFinal.toISOString().split('T')[0];
}
if (typeof fechaCheckinFinal === 'string' && fechaCheckinFinal.includes('T')) {
  fechaCheckinFinal = fechaCheckinFinal.split('T')[0];
}

// Mismo proceso para checkout...

// Insertar con cast explícito a DATE
const reservaResult = await client.query(
  `INSERT INTO reservas (
    habitacion_id, fecha_checkin, fecha_checkout, ...
  ) VALUES (
    $1, $2::date, $3::date, ...
  ) RETURNING *`,
  [habitacion_id, fechaCheckinFinal, fechaCheckoutFinal, ...]
);
```

**Efecto:**
- Última línea de defensa
- Cast `::date` en SQL fuerza tipo DATE sin timezone

---

### 🔧 **Capa 5: Frontend - Utilidades Globales**

**Archivo:** `frontend/src/shared/utils/formatters.js`

```javascript
/**
 * Formatea fecha YYYY-MM-DD a DD/MM/YYYY sin conversión de timezone
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const fechaSolo = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString

  const [year, month, day] = fechaSolo.split('-')

  // NO usar new Date() - retorna string directamente
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

/**
 * Calcula noches sin conversión de timezone
 */
export const calcularNoches = (checkIn, checkOut) => {
  const [yearIn, monthIn, dayIn] = checkIn.split('-').map(Number)
  const [yearOut, monthOut, dayOut] = checkOut.split('-').map(Number)

  const dateIn = new Date(yearIn, monthIn - 1, dayIn)
  const dateOut = new Date(yearOut, monthOut - 1, dayOut)

  const noches = Math.ceil((dateOut - dateIn) / (1000 * 60 * 60 * 24))
  return noches > 0 ? noches : 0
}
```

**Efecto:** Todas las operaciones con fechas evitan conversión de timezone.

---

## Schema de Base de Datos

**Archivo:** `EJECUTAR_COMPLETO.sql`

```sql
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  habitacion_id INTEGER NOT NULL,
  fecha_checkin DATE NOT NULL,        -- Tipo DATE (sin hora)
  fecha_checkout DATE NOT NULL,       -- Tipo DATE (sin hora)
  CHECK (fecha_checkout > fecha_checkin),
  ...
);
```

**Importante:** Las columnas son tipo `DATE`, no `TIMESTAMP`, lo que previene problemas de timezone a nivel de base de datos.

---

## Flujo Completo (End-to-End)

### ✅ **Crear Reserva para 21 de octubre:**

```
1. Frontend Input:
   <input type="date" value="2025-10-21" />

2. Frontend formData:
   { fecha_checkin: "2025-10-21" }  // string ✅

3. Axios transformRequest:
   JSON.stringify({ fecha_checkin: "2025-10-21" })  // string ✅

4. Backend express.json():
   req.body = { fecha_checkin: "2025-10-21T00:00:00.000Z" }  // Date object ❌

5. Middleware sanitizeDates:
   req.body = { fecha_checkin: "2025-10-21" }  // string ✅

6. Controller sanitización:
   fechaCheckinFinal = "2025-10-21"  // string ✅

7. PostgreSQL INSERT:
   INSERT INTO reservas (fecha_checkin) VALUES ('2025-10-21'::date)

8. PostgreSQL Storage:
   fecha_checkin = 2025-10-21  // DATE sin hora ✅

9. Backend Response:
   { fecha_checkin: "2025-10-21" }  // string ✅

10. Frontend Display:
    formatDate("2025-10-21") → "21/10/2025"  ✅
```

---

## Reglas para Trabajar con Fechas

### ✅ **DO (Hacer)**

1. **Siempre usar el helper `formatDate()`** para mostrar fechas:
   ```javascript
   import { formatDate } from '@shared/utils/formatters'
   <p>{formatDate(reserva.fecha_checkin)}</p>
   ```

2. **Usar `calcularNoches()`** para operaciones con fechas:
   ```javascript
   import { calcularNoches } from '@shared/utils/formatters'
   const noches = calcularNoches(checkin, checkout)
   ```

3. **Input type="date"** devuelve siempre strings `YYYY-MM-DD`:
   ```javascript
   <Input type="date" value={formData.fecha_checkin} />
   // ✅ formData.fecha_checkin es un string
   ```

4. **En SQL, usar cast `::date`** cuando insertes fechas:
   ```sql
   INSERT INTO tabla (fecha) VALUES ($1::date)
   ```

### ❌ **DON'T (No hacer)**

1. **NO usar `new Date()` con strings de fecha:**
   ```javascript
   // ❌ MAL
   const fecha = new Date("2025-10-21")  // Convierte a UTC

   // ✅ BIEN
   const [year, month, day] = "2025-10-21".split('-').map(Number)
   const fecha = new Date(year, month - 1, day)  // Fecha local
   ```

2. **NO usar `.toLocaleDateString()` directamente:**
   ```javascript
   // ❌ MAL
   new Date(fechaString).toLocaleDateString()

   // ✅ BIEN
   formatDate(fechaString)
   ```

3. **NO hacer cálculos de fecha con operadores sin parseo correcto:**
   ```javascript
   // ❌ MAL
   const dias = (new Date(checkout) - new Date(checkin)) / 86400000

   // ✅ BIEN
   const dias = calcularNoches(checkin, checkout)
   ```

---

## Testing Manual

### Test 1: Crear Reserva
1. Seleccionar fecha: 21 de octubre
2. Crear reserva
3. **Verificar:** Tabla muestra "21/10/2025" ✅

### Test 2: Editar Reserva
1. Editar reserva existente
2. Cambiar fecha a 25 de octubre
3. **Verificar:** Tabla actualiza a "25/10/2025" ✅

### Test 3: Disponibilidad
1. Crear reserva del 15 al 17 de octubre
2. Intentar crear otra reserva del 16 al 18
3. **Verificar:** Sistema bloquea y muestra "No disponible" ✅

---

## Archivos Modificados

### Frontend
- ✅ `frontend/src/shared/services/api.js`
- ✅ `frontend/src/shared/services/reservasService.js`
- ✅ `frontend/src/shared/utils/formatters.js` (creado)
- ✅ `frontend/src/modules/gestion/pages/ReservasPage.jsx`
- ✅ `frontend/src/modules/gestion/pages/DashboardPage.jsx`

### Backend
- ✅ `backend/src/app.js`
- ✅ `backend/src/middleware/sanitizeDates.js` (creado)
- ✅ `backend/src/controllers/reservas.controller.js`

### Base de Datos
- ✅ Schema ya usa `DATE` type (correcto desde el inicio)

---

## Mejoras Futuras

1. **Agregar zona horaria del hotel** en configuración
2. **Soporte para check-in/out con hora específica** (si se requiere)
3. **Validación de fechas en el pasado** (prevenir reservas antiguas)
4. **Formateo internacional** (i18n) para diferentes locales

---

## Contacto Técnico

Para dudas sobre manejo de fechas:
- Revisar este documento primero
- Usar los helpers en `formatters.js`
- Nunca usar `new Date()` directamente con strings

**Última actualización:** 7 de octubre de 2025

---
---

# 📊 OPCIÓN B - Separación de Dashboards por Estado de Reserva

## Problema Actual

Todas las reservas (pendientes, confirmadas, completadas, canceladas) se muestran en una sola tabla, lo que:
- ❌ Dificulta encontrar reservas activas
- ❌ Satura la vista con información irrelevante
- ❌ Mezcla operaciones activas con historial

---

## Solución Propuesta

### **Reorganización de Vistas:**

```
┌─────────────────────────────────────────────┐
│  Dashboard: RESERVAS (activas)              │
│  Ruta: /gestion/reservas                    │
│                                             │
│  Estados mostrados:                         │
│  • Pendiente    (color naranja)             │
│  • Confirmada   (color verde)               │
│                                             │
│  Acciones disponibles:                      │
│  • Ver detalles                             │
│  • Editar                                   │
│  • Confirmar / Cancelar / Completar         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Dashboard: HISTORIAL DE RESERVAS           │
│  Ruta: /gestion/historial-reservas          │
│                                             │
│  Tab 1: Completadas (color azul)            │
│  Tab 2: Canceladas  (color rojo)            │
│                                             │
│  Acciones disponibles:                      │
│  • Ver detalles (solo lectura)              │
│  • Exportar PDF (futuro)                    │
└─────────────────────────────────────────────┘
```

---

## Implementación Técnica

### 📁 **Archivos a Crear**

#### 1. **Nueva Página: HistorialReservasPage.jsx**
**Ruta:** `frontend/src/modules/gestion/pages/HistorialReservasPage.jsx`

```javascript
import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import reservasService from '@shared/services/reservasService'
import Card from '@shared/components/Card'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Modal from '@shared/components/Modal'
import Loader from '@shared/components/Loader'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate, formatCurrency } from '@shared/utils/formatters'
import { toast } from 'react-hot-toast'

const HistorialReservasPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('completadas') // 'completadas' | 'canceladas'
  const [reservas, setReservas] = useState([])
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    cargarReservas()
  }, [activeTab])

  const cargarReservas = async () => {
    try {
      setLoading(true)
      const params = {
        estado: activeTab === 'completadas' ? 'completada' : 'cancelada'
      }
      const response = await reservasService.listar(params)
      setReservas(response.reservas || [])
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toast.error('Error al cargar el historial de reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalle = (reserva) => {
    setSelectedReserva(reserva)
    setShowDetailModal(true)
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (reserva) => `#${reserva.id}`
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (reserva) => reserva.codigo_reserva
    },
    {
      key: 'huesped',
      label: 'Huésped',
      render: (reserva) => (
        <div>
          <div className="font-medium">{reserva.huesped_nombre}</div>
          <div className="text-sm text-gray-500">{reserva.huesped_email}</div>
        </div>
      )
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (reserva) => `Hab. ${reserva.habitacion_numero || 'N/A'}`
    },
    {
      key: 'fechas',
      label: 'Fechas',
      render: (reserva) => (
        <div className="text-sm">
          <div>Check-in: {formatDate(reserva.fecha_checkin)}</div>
          <div>Check-out: {formatDate(reserva.fecha_checkout)}</div>
        </div>
      )
    },
    {
      key: 'precio',
      label: 'Total',
      render: (reserva) => formatCurrency(reserva.precio_total)
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (reserva) => (
        <Badge variant={reserva.estado_nombre === 'completada' ? 'info' : 'danger'}>
          {reserva.estado_nombre?.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (reserva) => (
        <button
          onClick={() => handleVerDetalle(reserva)}
          className="text-gestion-primary-600 hover:text-gestion-primary-700"
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
      )
    }
  ]

  if (loading && reservas.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Reservas</h1>
        <p className="text-gray-600 mt-1">
          Consulta reservas completadas y canceladas
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('completadas')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'completadas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <CheckCircle className="inline-block mr-2" size={18} />
            Completadas
          </button>
          <button
            onClick={() => setActiveTab('canceladas')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'canceladas'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <XCircle className="inline-block mr-2" size={18} />
            Canceladas
          </button>
        </nav>
      </div>

      {/* Tabla */}
      <Card module="gestion">
        <Table
          columns={columns}
          data={reservas}
          emptyMessage={`No hay reservas ${activeTab}`}
        />
      </Card>

      {/* Modal Detalles (solo lectura) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedReserva(null)
        }}
        title="Detalles de la Reserva"
        size="md"
      >
        {selectedReserva && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Código</label>
                <p className="text-gray-900">{selectedReserva.codigo_reserva}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge variant={selectedReserva.estado_nombre === 'completada' ? 'info' : 'danger'}>
                    {selectedReserva.estado_nombre?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Huésped</label>
                <p className="text-gray-900">{selectedReserva.huesped_nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedReserva.huesped_email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900">{selectedReserva.huesped_telefono || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Habitación</label>
                <p className="text-gray-900">Hab. {selectedReserva.habitacion_numero || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Check-in</label>
                <p className="text-gray-900">{formatDate(selectedReserva.fecha_checkin)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Check-out</label>
                <p className="text-gray-900">{formatDate(selectedReserva.fecha_checkout)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Noches</label>
                <p className="text-gray-900">{selectedReserva.numero_noches}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Precio Total</label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(selectedReserva.precio_total)}
                </p>
              </div>
            </div>

            {selectedReserva.notas && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="text-gray-900 mt-1">{selectedReserva.notas}</p>
              </div>
            )}

            {activeTab === 'canceladas' && selectedReserva.fecha_cancelacion && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-800">
                  <strong>Cancelada el:</strong> {formatDate(selectedReserva.fecha_cancelacion)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HistorialReservasPage
```

---

### 📝 **Archivos a Modificar**

#### 2. **ReservasPage.jsx - Filtrar solo activas**

**Cambio en línea ~90:**
```javascript
// ANTES
const [reservasRes, habitacionesRes] = await Promise.all([
  reservasService.listar(params),
  habitacionesService.listar()
])

// DESPUÉS - Solo mostrar pendientes y confirmadas
const [reservasRes, habitacionesRes] = await Promise.all([
  reservasService.listar({
    ...params,
    // Filtrar solo estados activos
    estado: params.estado || undefined // Si ya hay filtro, respetarlo
  }),
  habitacionesService.listar()
])
```

**Modificar `cargarDatos()` completo:**
```javascript
const cargarDatos = async () => {
  try {
    setLoading(true)
    // Construir params para filtros
    const params = {}

    // IMPORTANTE: Si no se especifica estado, solo mostrar activas
    if (filters.estado) {
      params.estado = filters.estado
    } else {
      // Por defecto, excluir completadas y canceladas
      params.estados_excluir = 'completada,cancelada'
    }

    if (filters.canal) params.canal = filters.canal
    if (filters.habitacion_id) params.habitacion_id = filters.habitacion_id
    if (filters.busqueda) params.busqueda = filters.busqueda

    const [reservasRes, habitacionesRes] = await Promise.all([
      reservasService.listar(params),
      habitacionesService.listar()
    ])

    // ... resto del código
  }
}
```

**Modificar opciones del filtro de estado:**
```javascript
const estados = [
  { value: '', label: 'Solo activas (Pendiente y Confirmada)' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  // Eliminar: completada y cancelada (ya no se muestran aquí)
]
```

---

#### 3. **Backend - Nuevo filtro en reservas.controller.js**

**Línea ~36 en `listarReservas()`:**
```javascript
const listarReservas = async (req, res, next) => {
  try {
    const {
      estado,
      estados_excluir,  // NUEVO parámetro
      canal,
      fecha_desde,
      fecha_hasta,
      habitacion_id,
      page,
      limit
    } = req.query;

    // ... código existente

    // Filtro de estado único
    if (estado) {
      queryText += ` AND er.nombre = $${paramCounter}`;
      params.push(estado);
      paramCounter++;
    }

    // NUEVO: Filtro para excluir múltiples estados
    if (estados_excluir) {
      const estadosArray = estados_excluir.split(',');
      const placeholders = estadosArray.map((_, idx) => `$${paramCounter + idx}`).join(',');
      queryText += ` AND er.nombre NOT IN (${placeholders})`;
      estadosArray.forEach(e => params.push(e.trim()));
      paramCounter += estadosArray.length;
    }

    // ... resto del código
  }
}
```

---

#### 4. **Validador - Agregar nuevo parámetro**

**Archivo:** `backend/src/validators/reservas.validator.js`

```javascript
const listarReservasQuerySchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'confirmada', 'completada', 'cancelada'),
  estados_excluir: Joi.string(),  // NUEVO - formato: "completada,cancelada"
  canal: Joi.string(),
  fecha_desde: Joi.date(),
  fecha_hasta: Joi.date(),
  habitacion_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  busqueda: Joi.string()
});
```

---

#### 5. **Router - Agregar nueva ruta**

**Archivo:** `frontend/src/routes/gestionRoutes.jsx`

```javascript
import HistorialReservasPage from '@modules/gestion/pages/HistorialReservasPage'

const gestionRoutes = [
  // ... rutas existentes
  {
    path: '/gestion/reservas',
    element: <ReservasPage />,
    requiredRole: ['admin', 'recepcionista']
  },
  {
    path: '/gestion/historial-reservas',  // NUEVA RUTA
    element: <HistorialReservasPage />,
    requiredRole: ['admin', 'recepcionista']
  },
  // ... más rutas
]
```

---

#### 6. **Menú - Agregar enlace**

**Archivo donde esté el menú lateral (ej: `Layout.jsx` o `Sidebar.jsx`)**

```javascript
const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/gestion/dashboard'
  },
  {
    label: 'Reservas Activas',  // Cambiar nombre
    icon: Calendar,
    path: '/gestion/reservas'
  },
  {
    label: 'Historial',  // NUEVO
    icon: Archive,  // Importar: import { Archive } from 'lucide-react'
    path: '/gestion/historial-reservas'
  },
  // ... resto del menú
]
```

---

## Flujo de Usuario

### **Escenario 1: Ver reservas activas**
```
1. Usuario entra a /gestion/reservas
2. Ve solo: Pendiente y Confirmada
3. Puede editar, confirmar, cancelar
4. Al cancelar → desaparece de esta vista
```

### **Escenario 2: Consultar historial**
```
1. Usuario entra a /gestion/historial-reservas
2. Ve 2 tabs: Completadas | Canceladas
3. Click en tab "Completadas"
   → Muestra todas las reservas completadas
4. Click en tab "Canceladas"
   → Muestra todas las reservas canceladas
5. Solo puede VER detalles (sin editar)
```

### **Escenario 3: Completar una reserva**
```
1. En /gestion/reservas
2. Reserva en estado "Confirmada"
3. Click en "Marcar como completada"
4. Reserva desaparece de la tabla
5. Ahora está en /gestion/historial-reservas → Tab Completadas
```

---

## Beneficios

✅ **Vista más limpia** - Solo reservas relevantes en dashboard principal
✅ **Mejor organización** - Historial separado por tipo
✅ **Previene errores** - No se puede editar reservas finalizadas
✅ **Búsqueda más rápida** - Menos datos en tabla principal
✅ **Mejor UX** - Flujo intuitivo para operaciones del día a día

---

## Checklist de Implementación

### Frontend
- [ ] Crear `HistorialReservasPage.jsx`
- [ ] Modificar filtro en `ReservasPage.jsx` para excluir completadas/canceladas
- [ ] Actualizar opciones de filtro de estados
- [ ] Agregar ruta en `gestionRoutes.jsx`
- [ ] Agregar enlace en menú lateral
- [ ] Importar ícono `Archive` de lucide-react

### Backend
- [ ] Agregar parámetro `estados_excluir` en `listarReservas()`
- [ ] Implementar lógica de exclusión múltiple
- [ ] Actualizar validador `listarReservasQuerySchema`
- [ ] Probar endpoint con `?estados_excluir=completada,cancelada`

### Testing
- [ ] Crear reserva → confirmar → completar → verificar en historial
- [ ] Crear reserva → cancelar → verificar en historial
- [ ] Verificar que reservas activas NO aparecen en historial
- [ ] Verificar que completadas/canceladas NO aparecen en reservas
- [ ] Probar filtros en ambas vistas
- [ ] Probar modal de detalles en historial

---

## Estimación de Tiempo

- **Frontend:** 2-3 horas
- **Backend:** 30 minutos
- **Testing:** 1 hora
- **Total:** ~4 horas

---

## Notas Importantes

⚠️ **NO se rompe funcionalidad existente:**
- Endpoint `/api/reservas` sigue funcionando igual
- Solo se agrega nuevo parámetro opcional `estados_excluir`
- Si no se envía, devuelve todas las reservas (retrocompatible)

⚠️ **Servicios reutilizables:**
- Se usa el mismo `reservasService.listar()`
- Solo cambian los parámetros de filtro

⚠️ **Componentes reutilizables:**
- Se usan los mismos componentes (Table, Card, Modal, Badge)
- No se crea nada nuevo, solo se reorganiza

---

**Fecha de planificación:** 7 de octubre de 2025
**Estado:** Pendiente de implementación
**Prioridad:** Media
**Implementar:** Mañana 8 de octubre de 2025

---
---

# 🔧 CORRECCIONES ADICIONALES - 8 de Octubre de 2025

## Problemas Identificados y Resueltos

Durante la sesión del 8 de octubre se identificaron y corrigieron **4 problemas críticos** relacionados con el manejo de fechas y timezone que no fueron detectados en la implementación inicial.

---

## 🐛 Problema 1: Dashboard de Reportes - Pantalla en Blanco

### Síntoma
Al acceder al dashboard de reportes (`/gestion/reportes`), la pantalla se quedaba completamente en blanco.

### Causa Raíz
En `ReportesPage.jsx` línea 248, se intentaba usar `.toFixed()` directamente sobre un campo que venía como **STRING** desde PostgreSQL:

```javascript
// ❌ ANTES (causaba error)
{reportes[0].porcentaje_ocupacion.toFixed(1)}

// PostgreSQL devuelve DECIMAL como string:
porcentaje_ocupacion: "85.50"  // string, no number
```

### Solución Aplicada
**Archivo:** `frontend/src/modules/gestion/pages/ReportesPage.jsx:248`

```javascript
// ✅ DESPUÉS (convierte a número primero)
{Number(reportes[0].porcentaje_ocupacion).toFixed(1)}
```

**Resultado:** Dashboard de reportes ahora carga correctamente.

---

## 🐛 Problema 2: Dashboard Principal - Check-ins/Check-outs Incorrectos

### Síntoma
El dashboard mostraba check-ins y check-outs del día **incorrecto**:
- A las 19:00 del día 7 (Guatemala, UTC-6)
- El dashboard mostraba reservas del día **8** en lugar del día **7**

### Causa Raíz
En `DashboardPage.jsx` línea 57, se usaba `.toISOString()` que convierte la fecha local a UTC:

```javascript
// ❌ ANTES
const hoy = new Date().toISOString().split('T')[0]

// Ejemplo: 19:00 del 7 de octubre en Guatemala
new Date()  // 2025-10-07 19:00 (Guatemala, UTC-6)
  .toISOString()  // "2025-10-08T01:00:00.000Z" (UTC, suma 6 horas)
  .split('T')[0]  // "2025-10-08" ❌ Día incorrecto!
```

### Solución Aplicada

**Paso 1: Crear función helper**
**Archivo:** `frontend/src/shared/utils/formatters.js`

```javascript
/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando hora LOCAL (Guatemala)
 *
 * IMPORTANTE: NO usar new Date().toISOString() porque convierte a UTC
 * y causa desfase de 1 día en Guatemala (UTC-6)
 */
export const getTodayLocalDate = () => {
  const ahora = new Date()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}
```

**Paso 2: Usar el helper en DashboardPage**
**Archivo:** `frontend/src/modules/gestion/pages/DashboardPage.jsx:59`

```javascript
// ✅ DESPUÉS
import { getTodayLocalDate } from '@shared/utils/formatters'

const hoy = getTodayLocalDate()  // "2025-10-07" ✅ Correcto!
```

**Resultado:** Dashboard muestra check-ins y check-outs del día correcto en hora de Guatemala.

---

## 🐛 Problema 3: Filtro de Disponibilidad - Fechas con Desfase UTC

### Síntoma
Al crear una reserva y seleccionar fechas (ej: 7-8 de octubre), el filtro de disponibilidad mostraba habitaciones **incorrectas**:
- Mostraba **4 habitaciones disponibles** cuando en realidad solo había **1 disponible**
- Esto porque buscaba disponibilidad para el día **6-7** en lugar de **7-8**

### Causa Raíz
El backend recibía fechas como **Date objects en query params** y no las estaba sanitizando correctamente:

```javascript
// Backend recibía:
fecha_checkin: 2025-10-07T00:00:00.000Z object  // Date object con UTC

// La función de sanitización buscaba strings con 'T':
if (typeof fecha_checkin === 'string' && fecha_checkin.includes('T'))
// Pero fecha_checkin era un object, no string! ❌
```

### Solución Aplicada

**Archivo:** `backend/src/controllers/reservas.controller.js:531-547`

```javascript
// ✅ Sanitizar Date objects PRIMERO, luego strings con hora
if (fecha_checkin instanceof Date) {
  fecha_checkin = fecha_checkin.toISOString().split('T')[0];
  log.info('   ⚠️ fecha_checkin era Date object, convertida a:', fecha_checkin);
} else if (typeof fecha_checkin === 'string' && fecha_checkin.includes('T')) {
  fecha_checkin = fecha_checkin.split('T')[0];
  log.info('   ⚠️ fecha_checkin tenía hora, limpiada a:', fecha_checkin);
}

if (fecha_checkout instanceof Date) {
  fecha_checkout = fecha_checkout.toISOString().split('T')[0];
  log.info('   ⚠️ fecha_checkout era Date object, convertida a:', fecha_checkout);
} else if (typeof fecha_checkout === 'string' && fecha_checkout.includes('T')) {
  fecha_checkout = fecha_checkout.split('T')[0];
  log.info('   ⚠️ fecha_checkout tenía hora, limpiada a:', fecha_checkout);
}
```

**Logs de Verificación:**

```
ANTES:
   Validando 5 habitaciones...
   Habitación 102: ✅ DISPONIBLE  (4 disponibles total) ❌

DESPUÉS:
   Validando 5 habitaciones...
   Habitación 102: ❌ OCUPADA
   Habitación 104: ❌ OCUPADA
   Habitación 201: ✅ DISPONIBLE  (1 disponible total) ✅
   Habitación 101: ❌ OCUPADA
   Habitación 103: ❌ OCUPADA
```

**Resultado:** Filtro de disponibilidad muestra solo las habitaciones realmente disponibles para las fechas seleccionadas.

---

## 🐛 Problema 4: Axios Convierte Fechas en Responses

### Síntoma
Aunque el backend devolvía fechas correctas (`"2025-10-07"`), el frontend las recibía convertidas a Date objects con hora UTC:

```javascript
// Backend envía:
{ fecha_checkin: "2025-10-07" }

// Frontend recibe:
{ fecha_checkin: "2025-10-07T00:00:00.000Z" }  // Axios lo convirtió!
```

### Causa Raíz (Investigación)
Axios tiene comportamiento por defecto de detectar strings ISO y convertirlos automáticamente. Los `transformRequest` y `transformResponse` configurados inicialmente no eran suficientes.

### Estado
**Investigado pero NO crítico** - No afecta la funcionalidad porque:
1. El backend sanitiza correctamente las fechas antes de usarlas
2. El frontend maneja strings con 'T' correctamente en los helpers (`formatDate`, etc.)
3. Las operaciones de base de datos usan el tipo `DATE` que ignora la hora

**Nota:** Si en el futuro se requiere eliminar completamente la conversión, considerar usar un reviver personalizado en `JSON.parse()`.

---

## 📊 Resumen de Archivos Modificados (Sesión 8 Oct 2025)

### Frontend
- ✅ `frontend/src/modules/gestion/pages/ReportesPage.jsx:248` - Fix conversión a Number()
- ✅ `frontend/src/modules/gestion/pages/DashboardPage.jsx:12,59` - Usar getTodayLocalDate()
- ✅ `frontend/src/shared/utils/formatters.js:150-156` - Nuevo helper getTodayLocalDate()
- ✅ `frontend/src/shared/services/reservasService.js:66-83` - Logs de debugging en verificarDisponibilidad
- ✅ `frontend/src/modules/gestion/pages/ReservasPage.jsx:157,170-171` - Logs de debugging

### Backend
- ✅ `backend/src/controllers/reservas.controller.js:201` - Fix mensaje de error usar tempCheckin/tempCheckout
- ✅ `backend/src/controllers/reservas.controller.js:531-551` - Sanitizar Date objects en query params
- ✅ `backend/src/controllers/reservas.controller.js:583-617` - Logs detallados de disponibilidad con reservas

---

## ✅ Verificación Final

### Test 1: Dashboard de Reportes
- [x] Generar reporte de ocupación
- [x] Ver listado de reportes sin error
- [x] Porcentajes se muestran correctamente con decimales

### Test 2: Dashboard Principal
- [x] Check-ins de hoy muestran fecha correcta (7 oct, no 8 oct)
- [x] Check-outs de hoy muestran fecha correcta

### Test 3: Crear Reserva
- [x] Seleccionar fechas 7-8 de octubre
- [x] Ver solo 1 habitación disponible (no 4)
- [x] Crear reserva con huésped nuevo
- [x] Reserva se guarda con fechas correctas (sin desfase)

### Test 4: Bloqueo de Habitaciones
- [x] Confirmar reserva → habitación pasa a "ocupada"
- [x] Completar reserva → habitación pasa a "disponible"
- [x] Filtro excluye habitaciones con reservas activas

---

## 🎓 Lecciones Aprendidas

### 1. Timezone en JavaScript
**Nunca usar `.toISOString()` para obtener solo la fecha:**
```javascript
// ❌ MAL
new Date().toISOString().split('T')[0]

// ✅ BIEN
const ahora = new Date()
const año = ahora.getFullYear()
const mes = String(ahora.getMonth() + 1).padStart(2, '0')
const dia = String(ahora.getDate()).padStart(2, '0')
return `${año}-${mes}-${dia}`
```

### 2. Query Params en Express
Express puede convertir query params que parecen fechas en Date objects. Siempre sanitizar:
```javascript
// Verificar si es Date object PRIMERO
if (fecha instanceof Date) {
  fecha = fecha.toISOString().split('T')[0]
} else if (typeof fecha === 'string' && fecha.includes('T')) {
  fecha = fecha.split('T')[0]
}
```

### 3. Tipos de PostgreSQL
PostgreSQL devuelve campos `DECIMAL` como **strings**, no como números:
```javascript
// Backend devuelve:
{ porcentaje: "85.50" }  // string

// Frontend debe convertir:
Number(porcentaje).toFixed(1)
```

### 4. Limpieza de Datos
Cuando hay inconsistencias inexplicables, considerar limpiar datos antiguos:
```sql
DELETE FROM reservas;
UPDATE habitaciones SET estado = 'disponible';
```

---

## 📝 Recomendaciones Futuras

1. **Agregar Tests E2E** para crear reserva → confirmar → completar
2. **Agregar validación visual** de timezone en desarrollo (mostrar hora del servidor vs hora local)
3. **Considerar zona horaria configurable** en variables de entorno
4. **Documentar helpers de fecha** en comentarios JSDoc para equipo

---

**Última actualización:** 8 de octubre de 2025 - 20:15 (Hora Guatemala)
**Estado:** ✅ Todos los problemas de fechas y timezone resueltos
**Próximos pasos:** Revisar otros dashboards del sistema
