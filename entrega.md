# 📦 DIVISIÓN DEL PROYECTO - SISTEMA DE GESTIÓN HOTELERA

**Proyecto:** Sistema completo de gestión hotelera con módulo administrativo y plataforma para huéspedes
**Arquitectura:** Full Stack - Cliente/Servidor con API REST
**División:** 2 Entregas (50% - 50%)

---

## 🟦 **PRIMERA ENTREGA (50%) - FUNDAMENTOS Y GESTIÓN BÁSICA**

### **📌 Resumen General**
En esta primera mitad se implementó la **infraestructura completa del proyecto**: backend con API REST, base de datos PostgreSQL, sistema de autenticación, y el módulo de gestión básico que permite administrar habitaciones, reservas, usuarios y huéspedes.

---

### **🔧 BACKEND IMPLEMENTADO**

#### **1. Configuración Base**
```
Tecnologías: Node.js v20, Express.js, PostgreSQL
Estructura: MVC (Models, Routes, Controllers)
Seguridad: bcrypt (hash passwords), JWT (autenticación), CORS
Variables de entorno: .env con credenciales de BD
```

**Archivos clave:**
- `backend/src/server.js` → Servidor Express principal
- `backend/src/config/db.js` → Conexión a PostgreSQL (pool)
- `backend/src/middleware/auth.js` → Verificación de JWT

#### **2. Base de Datos PostgreSQL (Supabase)**

**Tablas implementadas (8):**

| Tabla | Descripción | Campos clave |
|-------|-------------|--------------|
| `usuarios` | Staff del hotel (admin/recepcionista) | id, nombre, email, password_hash, rol_id, activo |
| `habitaciones` | Inventario de habitaciones | id, numero, tipo_id, precio_por_noche, estado |
| `tipos_habitacion` | Categorías (Suite, Doble, etc.) | id, nombre, capacidad, descripcion |
| `huespedes` | Clientes del hotel | id, nombre, apellido, email, telefono, dpi_pasaporte |
| `reservas` | Reservaciones | id, huesped_id, habitacion_id, fecha_checkin, fecha_checkout, estado_id, precio_total |
| `estados_reserva` | Estados posibles | id, nombre (pendiente, confirmada, completada, cancelada) |
| `canales_reserva` | Origen de la reserva | booking, whatsapp, presencial, telefono |
| `sesiones` | Control de sesiones activas | id, usuario_id, token, fecha_expiracion |

**Relaciones importantes:**
```sql
reservas.huesped_id → huespedes.id (FK)
reservas.habitacion_id → habitaciones.id (FK)
reservas.estado_id → estados_reserva.id (FK)
habitaciones.tipo_id → tipos_habitacion.id (FK)
```

**Índices creados:**
- `idx_reservas_fechas` → Búsqueda por rango de fechas
- `idx_habitaciones_estado` → Filtrar por disponibilidad
- `idx_usuarios_email` → Login rápido

#### **3. Endpoints de la API (8 principales)**

##### **🔐 `/auth` - Autenticación**
```javascript
POST /auth/login
Body: { email, password }
Response: { token, usuario: { id, nombre, rol } }
Lógica: bcrypt.compare() → JWT.sign()
```

##### **🛏️ `/habitaciones` - Gestión de Habitaciones**
```javascript
GET    /habitaciones              → Listar todas (con filtros)
GET    /habitaciones/:id          → Detalle de una habitación
POST   /habitaciones              → Crear nueva (solo admin)
PUT    /habitaciones/:id          → Actualizar
DELETE /habitaciones/:id          → Eliminar (soft delete)
GET    /habitaciones/disponibles  → Búsqueda por fechas
  Query: fecha_checkin, fecha_checkout, capacidad
  Lógica: LEFT JOIN con reservas WHERE NOT EXISTS conflicto
```

##### **📅 `/reservas` - Gestión de Reservas**
```javascript
GET    /reservas                  → Listar (con filtros estado, canal, fechas)
POST   /reservas                  → Crear nueva
  Body: { huesped_id, habitacion_id, fecha_checkin, fecha_checkout,
          numero_huespedes, canal_reserva, notas }
  Validación:
    - Fechas válidas (checkout > checkin)
    - Habitación disponible (query a BD)
    - Cálculo automático de precio_total
PATCH  /reservas/:id/estado       → Cambiar estado (pendiente→confirmada)
PUT    /reservas/:id              → Modificar reserva
DELETE /reservas/:id              → Cancelar reserva
```

##### **👥 `/huespedes` - Gestión de Huéspedes**
```javascript
GET    /huespedes                 → Listar con filtros (activos, check-in, históricos)
  Query: tipo (activos, checkin, historicos)
  Join: LEFT JOIN reservas para calcular total_reservas
GET    /huespedes/:id             → Perfil completo + historial de reservas
POST   /huespedes                 → Crear nuevo huésped
PUT    /huespedes/:id             → Actualizar datos
DELETE /huespedes/:id             → Eliminar (solo si no tiene reservas activas)
```

##### **👤 `/usuarios` - Administración de Staff**
```javascript
GET    /usuarios                  → Listar staff (solo admin)
POST   /usuarios                  → Crear usuario (admin/recepcionista)
  Body: { nombre, apellido, email, password, rol_id }
  Seguridad: bcrypt.hash(password, 10)
PUT    /usuarios/:id              → Actualizar info
PATCH  /usuarios/:id/toggle       → Activar/desactivar
```

##### **✨ `/experiencias` - Tours y Actividades**
```javascript
GET    /experiencias              → Listar experiencias activas
POST   /experiencias              → Crear experiencia
  Body: { nombre, descripcion, duracion, precio, categoria, activo }
PUT    /experiencias/:id          → Actualizar
DELETE /experiencias/:id          → Eliminar
```

##### **📍 `/lugares` - Lugares Turísticos**
```javascript
GET    /lugares                   → Listar lugares
POST   /lugares                   → Crear lugar
  Body: { nombre, descripcion, distancia_km, categoria, activo }
PUT    /lugares/:id               → Actualizar
```

##### **🛎️ `/servicios` - Servicios del Hotel**
```javascript
GET    /servicios                 → Listar servicios
POST   /servicios                 → Crear servicio
  Body: { nombre, descripcion, precio, categoria, tiene_costo, activo }
  Categorías: limpieza, mantenimiento, spa, lavanderia, restaurante
PUT    /servicios/:id             → Actualizar
```

#### **4. Middleware y Seguridad**
```javascript
// auth.middleware.js
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No autorizado' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' })
    req.usuario = decoded
    next()
  })
}

// Uso en rutas protegidas:
router.post('/habitaciones', verificarToken, verificarAdmin, crearHabitacion)
```

---

### **💻 FRONTEND IMPLEMENTADO**

#### **1. Configuración Base**
```
Framework: React 18 con Vite
Routing: React Router DOM v6
Estilos: TailwindCSS + CSS personalizado
State: Context API (AuthContext)
HTTP: Axios con interceptores
```

**Estructura de carpetas:**
```
frontend/src/
├── modules/
│   └── gestion/           ← Módulo administrativo
│       ├── pages/         → 8 páginas implementadas
│       ├── components/    → Componentes específicos
│       └── layouts/       → Layout con sidebar
├── shared/
│   ├── components/        → Componentes reutilizables
│   ├── services/          → APIs (axios)
│   ├── context/           → AuthContext
│   └── utils/             → Helpers (formatters, validators)
└── App.jsx
```

#### **2. Sistema de Autenticación**

**AuthContext** (`src/shared/context/AuthContext.jsx`):
```javascript
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.usuario))
    setUser(response.usuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Rutas protegidas:**
```javascript
// App.jsx
<Route path="/gestion/*" element={
  <ProtectedRoute>
    <GestionLayout />
  </ProtectedRoute>
} />
```

#### **3. Módulo Gestión - Páginas Implementadas (8)**

##### **1. DashboardPage** - Panel Principal
- **Ruta:** `/gestion/dashboard`
- **Funcionalidad:**
  - Estadísticas en tiempo real (cards con números)
  - Gráficas de ocupación (placeholder)
  - Accesos rápidos a secciones
- **APIs usadas:** `GET /dashboard/estadisticas`

##### **2. HabitacionesPage** - Gestión de Habitaciones
- **Ruta:** `/gestion/habitaciones`
- **Funcionalidad:**
  - Tabla con listado de habitaciones
  - Filtros por tipo y estado
  - CRUD completo (Crear, Editar, Eliminar)
  - Modal de formulario
- **Componentes:** `Table`, `Modal`, `Card`, `Button`, `Select`
- **APIs:** `GET/POST/PUT/DELETE /habitaciones`

##### **3. ReservasPage** - Gestión de Reservas
- **Ruta:** `/gestion/reservas`
- **Funcionalidad:**
  - Tabla responsive con estado visual
  - Filtros por estado, canal, fechas
  - Creación de reserva con validación
  - Búsqueda de disponibilidad en tiempo real
  - Cambio de estados (Pendiente → Confirmada)
- **Validaciones frontend:**
  - Fecha checkout > checkin
  - Verificar disponibilidad antes de crear
- **APIs:** `GET/POST/PATCH /reservas`, `GET /habitaciones/disponibles`

##### **4. UsuariosPage** - Administración de Staff
- **Ruta:** `/gestion/usuarios`
- **Funcionalidad:**
  - Solo visible para rol "administrador"
  - Crear usuarios (admin/recepcionista)
  - Activar/desactivar usuarios
  - Ver último acceso
- **Seguridad:** Verificación de rol en frontend + backend
- **APIs:** `GET/POST/PUT/PATCH /usuarios`

##### **5. HuespedesPage** - Gestión de Clientes
- **Ruta:** `/gestion/huespedes`
- **Funcionalidad:**
  - Tabs: Activos | En Hotel | Históricos
  - Búsqueda por nombre, email, teléfono
  - Ver historial completo de reservas
  - Editar datos del huésped
- **APIs:** `GET /huespedes?tipo=activos`, `GET /huespedes/:id`

##### **6. ExperienciasPage**
- CRUD de experiencias turísticas
- Categorización (tours, actividades, etc.)

##### **7. LugaresPage**
- CRUD de lugares turísticos cercanos
- Distancia en km desde el hotel

##### **8. ServiciosPage**
- CRUD de servicios del hotel
- Diferenciación: gratuitos vs. de pago

#### **4. Componentes Reutilizables**

##### **Card** (`src/shared/components/Card.jsx`)
```javascript
const Card = ({ children, title, module = 'gestion', className }) => {
  const borderColor = module === 'gestion'
    ? 'border-gestion-primary-200'
    : 'border-plataforma-primary-200'

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${borderColor} p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}
```

##### **Table** (`src/shared/components/Table.jsx`)
- Props: `columns` (array), `data` (array), `module`
- Renderiza tabla con `overflow-x-auto`
- Función `render` para celdas personalizadas

##### **Modal** (`src/shared/components/Modal.jsx`)
- Overlay con backdrop
- Sizes: `sm`, `md`, `lg`, `xl`
- Cierre con ESC o click fuera

##### **Button** (`src/shared/components/Button.jsx`)
- Variants: `primary`, `secondary`, `success`, `danger`, `warning`
- Sizes: `sm`, `md`, `lg`
- Colores adaptativos según módulo

##### **Input/Select/Textarea**
- Estilos consistentes con TailwindCSS
- Manejo de errores inline
- Props: `label`, `name`, `value`, `onChange`, `module`

#### **5. Servicios API (Axios)**

**Configuración base** (`src/shared/services/api.js`):
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: agregar token a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Ejemplo de servicio** (`reservasService.js`):
```javascript
import api from './api'

const reservasService = {
  listar: async (params) => {
    const response = await api.get('/reservas', { params })
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/reservas', data)
    return response.data
  },

  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/reservas/${id}/estado`, { estado })
    return response.data
  }
}

export default reservasService
```

---

### **🔗 CONEXIÓN BACKEND ↔ FRONTEND**

#### **Flujo de Autenticación**
```
1. Usuario ingresa email/password en LoginPage
2. Frontend: authService.login(email, password)
3. Axios: POST /api/auth/login
4. Backend: Verifica credenciales → bcrypt.compare()
5. Backend: Genera JWT → jwt.sign({ id, rol }, SECRET, { expiresIn: '24h' })
6. Backend: Response { token, usuario: { id, nombre, rol } }
7. Frontend: Guarda en localStorage
8. Frontend: Actualiza AuthContext
9. Frontend: Redirect a /gestion/dashboard
```

#### **Flujo de Petición Protegida**
```
1. Usuario crea reserva en ReservasPage
2. Frontend: reservasService.crear(formData)
3. Axios interceptor: Agrega header Authorization: Bearer {token}
4. Backend: Middleware verificarToken() → Decodifica JWT
5. Backend: req.usuario = { id, rol }
6. Backend: Controlador crea reserva en BD
7. Backend: Response { reserva }
8. Frontend: Actualiza lista + toast.success()
```

---

### **📊 CASOS DE USO IMPLEMENTADOS**

1. **Administrador crea una habitación:**
   - Login → DashboardPage → HabitacionesPage
   - Click "Nueva Habitación"
   - Formulario: número, tipo, precio, estado
   - POST /habitaciones → Tabla actualizada

2. **Recepcionista crea una reserva:**
   - ReservasPage → "Nueva Reserva"
   - Selecciona fechas → GET /habitaciones/disponibles
   - Selecciona habitación disponible
   - Ingresa datos del huésped
   - Sistema calcula precio automático
   - POST /reservas → Validación en backend

3. **Administrador ve estadísticas:**
   - DashboardPage carga datos
   - GET /dashboard/estadisticas
   - Cards muestran: total habitaciones, reservas activas, ocupación

---

### **🎨 DISEÑO Y UX**

- **TailwindCSS:** Utility-first para responsive
- **Color Palette Gestión:**
  ```
  Primary: Blue (#3B82F6)
  Secondary: Cyan (#06B6D4)
  Success: Green (#10B981)
  Danger: Red (#EF4444)
  Warning: Yellow (#F59E0B)
  ```
- **Iconos:** Lucide React (moderno, ligero)
- **Responsive:**
  - Mobile: 1 columna
  - Tablet: 2 columnas (md:)
  - Desktop: 3-4 columnas (lg:, xl:)

---

## 🟩 **SEGUNDA ENTREGA (50%) - FUNCIONALIDADES AVANZADAS Y PLATAFORMA PÚBLICA**

### **📌 Resumen General**
En esta segunda mitad se implementaron **funcionalidades avanzadas** como códigos QR, galería de imágenes con Supabase Storage, notificaciones en tiempo real con WebSocket, reportes con gráficas, y un **módulo público completo** para que los huéspedes puedan explorar el hotel y hacer reservaciones online.

---

### **🔧 BACKEND AVANZADO**

#### **1. Nuevos Endpoints (7)**

##### **📷 `/galeria` - Gestión de Imágenes (Supabase Storage)**
```javascript
POST   /galeria/subir
  Body: FormData con archivo
  Proceso:
    1. Validar archivo (tipo, tamaño < 5MB)
    2. Generar nombre único: `${Date.now()}-${filename}`
    3. Subir a Supabase Storage bucket 'hotel-images'
    4. Obtener URL pública
    5. Guardar en BD: { titulo, url_imagen, categoria, activo }
  Response: { imagen }

GET    /galeria
  Query: activo, categoria
  Response: { imagenes: [] }

PUT    /galeria/:id
  Body: { titulo, descripcion }
  (NO permite cambiar la imagen, solo metadata)

DELETE /galeria/:id
  Proceso:
    1. Eliminar archivo de Supabase Storage
    2. DELETE registro de BD

POST   /habitaciones/:id/imagenes/vincular
  Body: { imagen_id, es_principal, orden }
  Lógica: Tabla intermedia habitaciones_imagenes
  Si es_principal=true → Desmarca otras imágenes principales
```

**Supabase Storage configuración:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const subirImagen = async (file) => {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('hotel-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('hotel-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

##### **🔲 `/qr` - Generación de Códigos QR**
```javascript
POST   /qr/generar
  Body: { cantidad: 10 }
  Proceso:
    1. Generar N códigos UUID únicos
    2. URL destino: `${FRONTEND_URL}/habitacion/qr/{codigo}`
    3. INSERT masivo en tabla codigos_qr
    4. Estado inicial: 'sin_asignar'
  Response: { codigos_qr: [] }

POST   /qr/:id/asignar
  Body: { habitacion_id }
  Validación:
    - QR no asignado previamente
    - Habitación no tiene QR asignado
  UPDATE: estado='asignado', habitacion_id, url_destino actualizada

PATCH  /qr/:id/desasignar
  UPDATE: estado='sin_asignar', habitacion_id=NULL

GET    /qr/:codigo/track
  Registra lectura del QR (fecha, IP)
  Incrementa contador total_lecturas
  UPDATE ultima_lectura
```

##### **🛎️ `/solicitudes` - Servicios en Tiempo Real**
```javascript
GET    /solicitudes
  Query: estado, habitacion_id
  Response: { solicitudes: [] }

POST   /solicitudes
  Body: { habitacion_id, servicio_id, notas }
  Proceso:
    1. INSERT en solicitudes_servicio
    2. JOIN para obtener datos del servicio
    3. WebSocket: Emitir evento 'nueva_solicitud' a todos los clientes
  Response: { solicitud }

PATCH  /solicitudes/:id/completar
  UPDATE: estado='completada', fecha_atencion=NOW()
  WebSocket: Notificar actualización

DELETE /solicitudes/:id
  Eliminar solicitud (solo si completada)
```

##### **📊 `/reportes` - Reportes de Ocupación**
```javascript
POST   /reportes/generar
  Body: { fecha_inicio, fecha_fin, tipo_periodo: 'semanal'|'mensual' }
  Proceso:
    1. Calcular días del período
    2. Query complejo:
       - Total habitaciones disponibles
       - Reservas en el período (GROUP BY fecha)
       - Calcular ocupación diaria
       - Promedio de ocupación
    3. Guardar reporte en BD
  Response: {
    reporte: {
      porcentaje_ocupacion,
      habitaciones_ocupadas,
      total_reservas,
      ocupacion_por_dia: []
    }
  }

GET    /reportes
  Listar reportes históricos

GET    /reportes/:id
  Detalle completo con datos para gráficas

DELETE /reportes/:id
  Eliminar reporte
```

**Query SQL para cálculo de ocupación:**
```sql
WITH ocupacion_diaria AS (
  SELECT
    DATE(fecha) AS dia,
    COUNT(DISTINCT habitacion_id) AS habitaciones_ocupadas
  FROM generate_series($1::date, $2::date, '1 day') AS fecha
  LEFT JOIN reservas r ON fecha BETWEEN r.fecha_checkin AND r.fecha_checkout
    AND r.estado_id IN (SELECT id FROM estados_reserva WHERE nombre IN ('confirmada', 'completada'))
  GROUP BY dia
)
SELECT
  dia,
  habitaciones_ocupadas,
  (SELECT COUNT(*) FROM habitaciones WHERE activo=true) AS total_habitaciones,
  ROUND(habitaciones_ocupadas::numeric /
    (SELECT COUNT(*) FROM habitaciones WHERE activo=true) * 100, 2) AS porcentaje
FROM ocupacion_diaria
ORDER BY dia;
```

##### **🔔 `/notificaciones` - WebSocket Real-Time**
```javascript
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3001 })

// Broadcast a todos los clientes conectados
const broadcast = (tipo, data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ tipo, data }))
    }
  })
}

// Cuando se crea una solicitud:
router.post('/solicitudes', async (req, res) => {
  const solicitud = await crearSolicitud(req.body)

  // Notificar en tiempo real
  broadcast('nueva_solicitud', {
    id: solicitud.id,
    habitacion: solicitud.habitacion_numero,
    servicio: solicitud.servicio_nombre
  })

  res.json({ solicitud })
})
```

**Cliente WebSocket (frontend):**
```javascript
// WebSocketContext.jsx
const ws = new WebSocket('ws://localhost:3001')

ws.onmessage = (event) => {
  const { tipo, data } = JSON.parse(event.data)

  if (tipo === 'nueva_solicitud') {
    toast.success(`Nueva solicitud de Hab. ${data.habitacion}`)
    actualizarLista()
  }
}
```

##### **📈 `/dashboard` - Estadísticas Agregadas**
```javascript
GET    /dashboard/estadisticas
  Response: {
    total_habitaciones,
    habitaciones_disponibles,
    habitaciones_ocupadas,
    reservas_activas,
    reservas_hoy,
    check_ins_hoy,
    check_outs_hoy,
    ocupacion_actual: 85.5,
    ingresos_mes_actual,
    huespedes_activos
  }

  Query optimizada con múltiples CTEs:
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM habitaciones WHERE activo=true) as total_hab,
      (SELECT COUNT(*) FROM reservas WHERE estado='confirmada' AND CURRENT_DATE BETWEEN fecha_checkin AND fecha_checkout) as ocupadas,
      ...
  )
```

##### **🌐 `/plataforma` - API Pública para Huéspedes**
```javascript
GET    /plataforma/habitaciones
  Sin autenticación requerida
  Response: Habitaciones con imágenes, precios, disponibilidad

GET    /plataforma/habitaciones/:id
  Detalle completo + galería de imágenes

POST   /plataforma/reservar
  Body: { huesped_datos, habitacion_id, fechas, ... }
  Validación: Disponibilidad + crear huésped si no existe
  Response: { reserva, codigo_confirmacion }

GET    /plataforma/experiencias
  Tours disponibles con imágenes

GET    /plataforma/lugares
  Lugares turísticos cercanos

GET    /plataforma/servicios
  Servicios del hotel categorizados
```

#### **2. Tablas Adicionales (7)**

| Tabla | Descripción | Campos clave |
|-------|-------------|--------------|
| `codigos_qr` | QR generados | id, codigo (UUID), url_destino, habitacion_id, estado, total_lecturas |
| `galeria` | Imágenes en Supabase | id, titulo, url_imagen, categoria, activo, creado_en |
| `habitaciones_imagenes` | Relación N:N | habitacion_id, imagen_id, es_principal, orden |
| `experiencias_imagenes` | Relación N:N | experiencia_id, imagen_id, es_principal |
| `solicitudes_servicio` | Requests de huéspedes | id, habitacion_id, servicio_id, estado, notas, fecha_atencion |
| `reportes_ocupacion` | Reportes guardados | id, fecha_inicio, fecha_fin, tipo_periodo, porcentaje_ocupacion, datos_json |
| `lecturas_qr` | Tracking de escaneos | id, codigo_qr_id, fecha_lectura, ip_address |

---

### **💻 FRONTEND AVANZADO**

#### **1. Módulo Gestión - Páginas Adicionales (7)**

##### **🔲 CodigosQRPage**
- **Funcionalidad:**
  - Generar múltiples QR en lote (1-50)
  - Vista previa del QR con qrcode.react
  - Asignar QR a habitación
  - Desasignar QR
  - Descargar QR como PNG
  - Estadísticas: sin asignar, asignados, inactivos
- **Componentes especiales:** `QRCodeSVG` de `qrcode.react`
- **Tecnología:**
  ```javascript
  import { QRCodeSVG } from 'qrcode.react'

  <QRCodeSVG
    value={qr.url_destino}
    size={256}
    level="H"
    includeMargin={true}
  />
  ```

##### **📷 GaleriaPage**
- **Funcionalidad:**
  - Upload de imágenes (drag & drop o selección)
  - Categorías: habitaciones, hotel_exterior, piscina, vistas
  - Filtros avanzados: categoría, estado, vinculación, búsqueda
  - Vincular imagen a habitación/experiencia/lugar
  - Marcar como imagen principal
  - Editar título y descripción
  - Activar/desactivar imágenes
- **Upload con FormData:**
  ```javascript
  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('imagen', file)
    formData.append('titulo', titulo)
    formData.append('categoria', categoria)

    await galeriaService.subir(formData)
  }
  ```

##### **🛎️ SolicitudesPage**
- **Funcionalidad:**
  - Indicador de conexión WebSocket en tiempo real
  - Dos tablas: Pendientes | Completadas
  - Filtros por estado y habitación
  - Botón "Completar" para marcar solicitud atendida
  - Eliminar solicitudes completadas
  - Notificaciones toast al recibir nueva solicitud
- **WebSocket integrado:**
  ```javascript
  const { connected } = useWebSocket()

  useEffect(() => {
    if (connected) {
      window.addEventListener('message', (event) => {
        const { type, data } = JSON.parse(event.data)
        if (type === 'nueva_solicitud') {
          cargarSolicitudes()
          toast.success('Nueva solicitud de servicio', { icon: '🔔' })
        }
      })
    }
  }, [connected])
  ```

##### **📊 ReportesPage**
- **Funcionalidad:**
  - Generar reporte por período (semanal/mensual)
  - Tabla de reportes históricos
  - Modal de detalle con gráficas interactivas:
    - Gráfica de pastel (ocupación promedio)
    - Gráfica de línea (ocupación día por día)
    - Barra de progreso visual
    - Métricas destacadas en cards
  - Análisis e interpretación automática
  - Eliminar reportes antiguos
- **Gráficas con Recharts:**
  ```javascript
  import { PieChart, Pie, LineChart, Line, Tooltip, Legend } from 'recharts'

  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={ocupacionDiaria}>
      <XAxis dataKey="fecha" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="habitaciones" stroke="#0ea5e9" />
    </LineChart>
  </ResponsiveContainer>
  ```

##### **📜 HistorialReservasPage**
- **Funcionalidad:**
  - Tabs: Completadas | Canceladas
  - Filtro por rango de fechas (últimos 7, 30, 90 días, todos)
  - Paginación (15 por página)
  - Ver detalle completo de reserva histórica
  - Eliminar reservas antiguas (limpieza de BD)
  - Estadísticas: total, ingresos, noches
- **Tabla con 8 columnas:**
  - ID, Código, Huésped, Habitación, Fechas, Total, Estado, Acciones

##### **📅 CalendarioDisponibilidadPage**
- **Funcionalidad:**
  - Vista mensual tipo calendario
  - Navegación entre meses
  - Código de colores por estado:
    - Verde: Disponible
    - Rojo: Ocupado (check-in)
    - Azul: Completado (check-out)
  - Filtro por habitación específica
  - Click en celda para ver detalles
  - Componente personalizado `CalendarioMensual`
- **Estructura:**
  ```
  CalendarioDisponibilidadPage.jsx
  ├── FiltroHabitaciones.jsx
  ├── CalendarioMensual.jsx
  │   └── CeldaDia.jsx (muestra estado por día)
  └── LeyendaEstados.jsx
  ```

##### **Páginas ya funcionales mejoradas:**
- **HuespedesPage:** Tabs mejorados (Activos, En Hotel, Históricos)
- **ReservasPage:** Tabla responsive compacta estilo Booking.com

#### **2. Módulo Plataforma - Completo (9 páginas)**

##### **Estructura del Módulo Plataforma**
```
frontend/src/modules/plataforma/
├── pages/
│   ├── HomePage.jsx              → Landing principal
│   ├── HabitacionesPage.jsx      → Catálogo público
│   ├── HabitacionDetallePage.jsx → Detalle con galería
│   ├── ReservacionPage.jsx       → Formulario de reserva
│   ├── ExperienciasPage.jsx      → Tours y actividades
│   ├── LugaresPage.jsx           → Lugares turísticos
│   ├── ServiciosPage.jsx         → Servicios del hotel
│   ├── ContactoPage.jsx          → Formulario de contacto
│   └── PerfilHuespedPage.jsx     → Perfil del huésped
└── layouts/
    └── PlataformaLayout.jsx      → Header + Footer
```

##### **1. HomePage - Landing Principal**
- Hero section con imagen de fondo
- Sección "Sobre Nosotros"
- Preview de habitaciones (3 destacadas)
- Llamados a la acción (CTAs)
- Footer con redes sociales

##### **2. HabitacionesPage - Catálogo Público**
- Grid responsive de habitaciones
- Filtros: tipo, precio, capacidad
- Cada card muestra:
  - Imagen principal
  - Tipo de habitación
  - Capacidad
  - Precio por noche
  - Botón "Ver Detalles"
- API: `GET /plataforma/habitaciones`

##### **3. HabitacionDetallePage**
- Galería de imágenes (slider)
- Descripción completa
- Amenidades (lista con íconos)
- Precio destacado
- Formulario de consulta de disponibilidad
- Botón "Reservar Ahora" → Redirect a ReservacionPage

##### **4. ReservacionPage - Formulario de Reserva Online**
- **Paso 1:** Selección de fechas
  - Validación: checkout > checkin
  - Búsqueda de habitaciones disponibles
- **Paso 2:** Selección de habitación
  - Cards con habitaciones disponibles
  - Precio calculado automático
- **Paso 3:** Datos del huésped
  - Formulario completo
  - Validación de email
- **Paso 4:** Confirmación
  - Resumen de la reserva
  - Total a pagar
  - Botón "Confirmar Reserva"
- **API:** `POST /plataforma/reservar`
- **Respuesta:** Código de confirmación + email automático

##### **5. ExperienciasPage - Tours**
- Grid de experiencias turísticas
- Categorías: aventura, cultura, relax
- Cada card: imagen, duración, precio
- Modal de detalle con descripción completa

##### **6. LugaresPage - Lugares Turísticos**
- Listado de lugares cercanos
- Distancia desde el hotel
- Mapa embebido (Google Maps)
- Categorías: naturaleza, históricos, gastronómicos

##### **7. ServiciosPage - Servicios del Hotel**
- Tabs por categoría:
  - Incluidos (gratis)
  - De pago
- Cards con descripción y precio
- Botón "Solicitar Servicio" (solo para huéspedes con sesión)

##### **8. ContactoPage**
- Formulario de contacto
- Información del hotel (dirección, teléfono, email)
- Mapa de ubicación
- Horarios de atención

##### **9. PerfilHuespedPage**
- Mis reservas activas
- Historial de estadías
- Editar perfil
- Solicitar servicios

#### **3. Componentes Avanzados**

##### **WebSocketContext**
```javascript
import { createContext, useContext, useEffect, useState } from 'react'

const WebSocketContext = createContext()

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL)

    ws.onopen = () => {
      console.log('WebSocket conectado')
      setConnected(true)
    }

    ws.onclose = () => {
      console.log('WebSocket desconectado')
      setConnected(false)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      window.dispatchEvent(new CustomEvent('ws-message', { detail: message }))
    }

    setSocket(ws)

    return () => ws.close()
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, connected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)
```

##### **ImageGallery** (para habitaciones)
```javascript
const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="relative">
      <img
        src={images[currentIndex].url}
        alt="Habitación"
        className="w-full h-96 object-cover rounded-lg"
      />

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4">
        {images.map((img, index) => (
          <img
            key={img.id}
            src={img.url}
            onClick={() => setCurrentIndex(index)}
            className={`w-20 h-20 object-cover cursor-pointer rounded ${
              index === currentIndex ? 'ring-2 ring-blue-500' : ''
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

---

### **🚀 DEPLOYMENT**

#### **Frontend → Vercel**
```javascript
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "https://tu-backend-railway.up.railway.app/api",
    "VITE_WS_URL": "wss://tu-backend-railway.up.railway.app"
  }
}
```

**Comandos:**
```bash
npm run build
vercel --prod
```

**URL:** `https://tu-proyecto.vercel.app`

#### **Backend → Railway**
```javascript
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/src/server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

**Variables de entorno en Railway:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=tu_secreto_seguro
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
NODE_ENV=production
PORT=3000
```

**URL:** `https://tu-backend.up.railway.app`

#### **Base de Datos → Supabase**
- PostgreSQL 15
- Connection Pooler habilitado (modo Transaction)
- Backups automáticos
- Storage configurado para imágenes públicas

---

## 🎯 **PUNTOS CLAVE PARA RESPONDER AL INGENIERO**

### **1. Base de Datos - Estructura Completa**

#### **Tablas Principales (15 total):**
```
usuarios (8 campos)
├── id, nombre, apellido, email, password_hash
├── rol_id (FK → roles.id)
└── activo, ultimo_acceso, creado_en

habitaciones (10 campos)
├── id, numero, tipo_id, precio_por_noche
├── capacidad, estado (disponible/ocupada/mantenimiento)
└── descripcion, amenidades, activo, creado_en

reservas (12 campos)
├── id, codigo_reserva (generado)
├── huesped_id (FK), habitacion_id (FK)
├── fecha_checkin, fecha_checkout, numero_noches
├── numero_huespedes, precio_por_noche, precio_total
├── estado_id (FK), canal_reserva
└── notas, creado_por, creado_en

huespedes (12 campos)
├── id, nombre, apellido, email, telefono
├── dpi_pasaporte, pais, direccion
├── fecha_nacimiento, notas
└── creado_en, actualizado_en

codigos_qr (9 campos)
├── id, codigo (UUID), url_destino
├── habitacion_id (FK nullable)
├── estado (sin_asignar/asignado/inactivo)
├── total_lecturas, ultima_lectura
└── creado_por, creado_en

galeria (8 campos)
├── id, titulo, descripcion, url_imagen
├── categoria (habitaciones/hotel_exterior/piscina/vistas)
├── activo, creado_por, creado_en

solicitudes_servicio (8 campos)
├── id, habitacion_id (FK), servicio_id (FK)
├── estado (pendiente/completada), notas
├── fecha_solicitud, fecha_atencion
└── creado_en

reportes_ocupacion (10 campos)
├── id, fecha_inicio, fecha_fin
├── tipo_periodo (semanal/mensual)
├── total_habitaciones, habitaciones_ocupadas
├── porcentaje_ocupacion, total_reservas
├── datos_json (ocupacion_por_dia array)
└── generado_por, creado_en
```

#### **Relaciones Críticas:**
```sql
-- Reserva pertenece a huésped y habitación
ALTER TABLE reservas
  ADD CONSTRAINT fk_reservas_huesped
  FOREIGN KEY (huesped_id) REFERENCES huespedes(id);

ALTER TABLE reservas
  ADD CONSTRAINT fk_reservas_habitacion
  FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id);

-- QR puede estar asignado a una habitación
ALTER TABLE codigos_qr
  ADD CONSTRAINT fk_qr_habitacion
  FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
  ON DELETE SET NULL;

-- Imagen puede estar vinculada a múltiples habitaciones (N:N)
CREATE TABLE habitaciones_imagenes (
  id SERIAL PRIMARY KEY,
  habitacion_id INTEGER REFERENCES habitaciones(id) ON DELETE CASCADE,
  imagen_id INTEGER REFERENCES galeria(id) ON DELETE CASCADE,
  es_principal BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  UNIQUE(habitacion_id, imagen_id)
);
```

#### **Índices para Optimización:**
```sql
CREATE INDEX idx_reservas_fechas ON reservas(fecha_checkin, fecha_checkout);
CREATE INDEX idx_reservas_estado ON reservas(estado_id);
CREATE INDEX idx_habitaciones_tipo ON habitaciones(tipo_id);
CREATE INDEX idx_galeria_categoria ON galeria(categoria);
CREATE INDEX idx_solicitudes_estado ON solicitudes_servicio(estado);
CREATE INDEX idx_qr_codigo ON codigos_qr(codigo);
```

#### **Triggers Implementados:**
```sql
-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habitaciones_timestamp
  BEFORE UPDATE ON habitaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
```

---

### **2. Endpoints - Documentación Completa**

#### **Autenticación:**
```
POST   /api/auth/login
       Body: { email, password }
       Response: { token, usuario: { id, nombre, rol } }
       Lógica: bcrypt.compare → JWT.sign(payload, SECRET, { expiresIn: '24h' })

POST   /api/auth/logout
       Headers: Authorization: Bearer {token}
       Lógica: Eliminar sesión de BD
```

#### **Habitaciones:**
```
GET    /api/habitaciones
       Query: tipo_id, estado, activo, precio_min, precio_max
       Response: { habitaciones: [] }

GET    /api/habitaciones/:id
       Response: { habitacion: {...}, imagenes: [] }

POST   /api/habitaciones
       Headers: Authorization (rol: admin)
       Body: { numero, tipo_id, precio_por_noche, capacidad, ... }
       Validación: Número único por hotel

GET    /api/habitaciones/disponibles
       Query: fecha_checkin, fecha_checkout, capacidad
       SQL: LEFT JOIN con reservas WHERE NOT EXISTS conflicto
       Conflicto: (checkin < r.checkout AND checkout > r.checkin)
```

#### **Reservas:**
```
GET    /api/reservas
       Query: estado, canal, habitacion_id, fecha_desde, fecha_hasta
       Join: huespedes, habitaciones, estados_reserva
       Response: { reservas: [], pagination }

POST   /api/reservas
       Body: {
         huesped_id?, huesped_datos?,
         habitacion_id,
         fecha_checkin, fecha_checkout,
         numero_huespedes, canal_reserva, notas
       }
       Validaciones:
         1. Fechas válidas (checkout > checkin)
         2. Habitación existe y activa
         3. Habitación disponible (query disponibilidad)
         4. Capacidad suficiente
       Proceso:
         - Si huesped_id: Usar existente
         - Si huesped_datos: Crear nuevo huésped
         - Calcular numero_noches y precio_total
         - Generar codigo_reserva único
         - INSERT con estado_id='pendiente'

PATCH  /api/reservas/:id/estado
       Body: { estado: 'confirmada' }
       Validación: Transiciones válidas
       Estados: pendiente → confirmada → completada
                pendiente → cancelada

PUT    /api/reservas/:id
       Validación: No modificar si estado='completada'
       Recalcular precio si cambian fechas

DELETE /api/reservas/:id
       Soft delete: UPDATE estado='cancelada'
```

#### **QR Codes:**
```
POST   /api/qr/generar
       Body: { cantidad: 10 }
       Proceso:
         1. Array.from({ length: cantidad })
         2. uuid.v4() para cada código
         3. URL: ${FRONTEND_URL}/habitacion/qr/${codigo}
         4. INSERT masivo: { codigo, url_destino, estado: 'sin_asignar' }
       Response: { codigos_qr: [] }

POST   /api/qr/:id/asignar
       Body: { habitacion_id }
       Validaciones:
         - QR.estado === 'sin_asignar'
         - Habitación.qr_asignado === false
       UPDATE: estado='asignado', habitacion_id
       URL actualizada: /habitacion/${habitacion_id}/qr/${codigo}

GET    /api/qr/:codigo/track
       Headers: IP del cliente
       INSERT en lecturas_qr
       UPDATE codigos_qr: total_lecturas++, ultima_lectura=NOW()
       Response: { url_destino }
```

#### **Galería:**
```
POST   /api/galeria/subir
       Content-Type: multipart/form-data
       Body: FormData { imagen: File, titulo, descripcion, categoria }
       Proceso:
         1. Multer middleware: req.file
         2. Validar: tipo (image/*), tamaño < 5MB
         3. Supabase Storage upload
         4. Obtener URL pública
         5. INSERT en galeria
       Response: { imagen: { id, url_imagen, ... } }

POST   /api/habitaciones/:id/imagenes/vincular
       Body: { imagen_id, es_principal: true, orden: 0 }
       Proceso:
         1. Si es_principal: UPDATE otras imagenes SET es_principal=false
         2. INSERT habitaciones_imagenes
       Response: { vinculo }
```

#### **Solicitudes (WebSocket):**
```
POST   /api/solicitudes
       Body: { habitacion_id, servicio_id, notas }
       Proceso:
         1. INSERT solicitud (estado='pendiente')
         2. JOIN para obtener datos completos
         3. WebSocket broadcast:
            wss.clients.forEach(client => {
              client.send(JSON.stringify({
                tipo: 'nueva_solicitud',
                data: solicitud
              }))
            })
       Response: { solicitud }

PATCH  /api/solicitudes/:id/completar
       UPDATE: estado='completada', fecha_atencion=NOW()
       WebSocket broadcast: 'solicitud_completada'
```

#### **Reportes:**
```
POST   /api/reportes/generar
       Body: { fecha_inicio, fecha_fin, tipo_periodo }
       Proceso:
         1. Calcular días_periodo
         2. Query ocupacion_por_dia:
            - generate_series(fecha_inicio, fecha_fin, '1 day')
            - LEFT JOIN reservas en rango
            - COUNT habitaciones ocupadas por día
         3. Calcular promedios
         4. INSERT reporte con datos_json
       Response: { reporte: {
         porcentaje_ocupacion,
         ocupacion_por_dia: [{fecha, habitaciones}]
       }}
```

---

### **3. Conexión Backend ↔ Frontend**

#### **Configuración Axios:**
```javascript
// src/shared/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: Agregar JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Response interceptor: Manejo de errores
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

#### **Ejemplo de Servicio:**
```javascript
// reservasService.js
import api from './api'

const reservasService = {
  listar: (params) => api.get('/reservas', { params }),

  obtener: (id) => api.get(`/reservas/${id}`),

  crear: (data) => api.post('/reservas', data),

  actualizar: (id, data) => api.put(`/reservas/${id}`, data),

  cambiarEstado: (id, estado) =>
    api.patch(`/reservas/${id}/estado`, { estado }),

  eliminar: (id) => api.delete(`/reservas/${id}`)
}

export default reservasService
```

#### **Uso en Componente:**
```javascript
// ReservasPage.jsx
import reservasService from '@shared/services/reservasService'
import { toast } from 'react-hot-toast'

const ReservasPage = () => {
  const [reservas, setReservas] = useState([])

  const cargarReservas = async () => {
    try {
      const data = await reservasService.listar({
        estado: 'pendiente'
      })
      setReservas(data.reservas)
    } catch (error) {
      toast.error('Error al cargar reservas')
    }
  }

  const crearReserva = async (formData) => {
    try {
      const reserva = await reservasService.crear(formData)
      toast.success('Reserva creada exitosamente')
      cargarReservas()
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error'
      toast.error(mensaje)
    }
  }
}
```

---

### **4. Tecnologías y Herramientas**

#### **Backend:**
```
Runtime:       Node.js v20.x
Framework:     Express.js 4.18
Base de datos: PostgreSQL 15 (Supabase)
ORM:           pg (driver nativo, queries SQL directos)
Autenticación: bcrypt 5.1 + jsonwebtoken 9.0
Upload:        multer + @supabase/supabase-js
WebSocket:     ws 8.x
Validación:    express-validator
CORS:          cors
```

#### **Frontend:**
```
Framework:     React 18.2
Build:         Vite 4.x
Routing:       React Router DOM 6.x
Estilos:       TailwindCSS 3.3
HTTP:          Axios 1.4
State:         Context API + useState/useEffect
Forms:         Controlled components
Iconos:        Lucide React
QR:            qrcode.react 3.x
Gráficas:      Recharts 2.x
Notificaciones: react-hot-toast 2.x
```

#### **Deployment:**
```
Frontend:  Vercel (CDN global, SSL automático)
Backend:   Railway (Nixpacks, auto-deploy desde Git)
Base Datos: Supabase PostgreSQL (Connection Pooler)
Storage:   Supabase Storage (imágenes públicas)
```

---

### **5. Flujos Completos de Negocio**

#### **Flujo 1: Crear Reserva desde Plataforma Pública**
```
1. Huésped visita /habitaciones
   Frontend: GET /plataforma/habitaciones

2. Selecciona habitación → Click "Reservar"
   Redirect: /reservacion?habitacion_id=X

3. Ingresa fechas (checkin, checkout)
   Frontend: GET /habitaciones/disponibles?fecha_checkin&fecha_checkout
   Backend: Query complejo con LEFT JOIN
   Frontend: Muestra habitaciones disponibles

4. Selecciona habitación disponible
   Frontend: Guarda en estado local
   Calcula precio: noches * precio_por_noche

5. Llena formulario de datos personales
   Campos: nombre, apellido, email, telefono, dpi

6. Click "Confirmar Reserva"
   Frontend: POST /plataforma/reservar
   Body: { huesped_datos, habitacion_id, fechas, ... }

7. Backend:
   - BEGIN TRANSACTION
   - Verificar disponibilidad nuevamente (race condition)
   - Si huesped existe (por email): Usar id
   - Si no: INSERT INTO huespedes
   - INSERT INTO reservas (estado='pendiente')
   - COMMIT

8. Response: { reserva, codigo_confirmacion }
   Frontend: Página de éxito con código

9. Email automático (futuro): Confirmación al huésped
```

#### **Flujo 2: Solicitud de Servicio en Tiempo Real**
```
1. Huésped escanea QR en habitación
   GET /qr/{codigo}/track
   Backend: Registra lectura + incrementa contador
   Redirect: /habitacion/{id}/servicios

2. Selecciona servicio (ej: "Limpieza Extra")
   Frontend: Muestra lista de servicios

3. Click "Solicitar"
   Frontend: POST /solicitudes
   Body: { habitacion_id, servicio_id, notas }

4. Backend:
   - INSERT solicitud
   - WebSocket: Broadcast a todos los clientes conectados
     wss.clients.forEach(client => {
       client.send(JSON.stringify({
         tipo: 'nueva_solicitud',
         data: { habitacion, servicio, notas }
       }))
     })

5. Frontend (Módulo Gestión - SolicitudesPage):
   - WebSocket onmessage listener
   - Recibe evento 'nueva_solicitud'
   - Actualiza lista automáticamente
   - Toast notification: "Nueva solicitud de Hab. 101"

6. Recepcionista ve solicitud en tiempo real
   - Click "Completar"
   - PATCH /solicitudes/:id/completar
   - WebSocket: Notificar actualización

7. Huésped ve estado actualizado (si tiene sesión)
```

#### **Flujo 3: Generar Reporte de Ocupación**
```
1. Admin en ReportesPage
   Click "Generar Reporte"

2. Formulario:
   - Fecha inicio: 2024-01-01
   - Fecha fin: 2024-01-31
   - Tipo: Mensual

3. Frontend: POST /reportes/generar

4. Backend:
   - Calcular días_periodo: 31
   - Query ocupacion_por_dia:
     SELECT
       fecha::date AS dia,
       COUNT(DISTINCT r.habitacion_id) AS habitaciones_ocupadas
     FROM generate_series('2024-01-01', '2024-01-31', '1 day') AS fecha
     LEFT JOIN reservas r ON fecha BETWEEN r.fecha_checkin AND r.fecha_checkout
       AND r.estado_id IN (SELECT id FROM estados_reserva WHERE nombre IN ('confirmada', 'completada'))
     GROUP BY dia
     ORDER BY dia

   - Calcular promedio:
     porcentaje_ocupacion = AVG(habitaciones_ocupadas) / total_habitaciones * 100

   - INSERT reporte con datos_json

5. Response: { reporte: { ... ocupacion_por_dia: [] } }

6. Frontend:
   - Modal con gráficas
   - PieChart (ocupación promedio)
   - LineChart (ocupación día por día)
   - Barra de progreso
   - Interpretación automática
```

---

## 📊 **RESUMEN DE ENTREGAS**

### **Primera Entrega = Infraestructura + Gestión Básica**
- ✅ Backend API funcional (8 endpoints)
- ✅ Base de datos (8 tablas)
- ✅ Autenticación JWT
- ✅ CRUD de habitaciones, reservas, usuarios, huéspedes
- ✅ Frontend módulo gestión (8 páginas básicas)
- ✅ Componentes reutilizables

### **Segunda Entrega = Avanzado + Plataforma Pública**
- ✅ 7 endpoints adicionales (QR, Galería, Reportes, WebSocket)
- ✅ 7 tablas adicionales
- ✅ Supabase Storage (imágenes)
- ✅ WebSocket (notificaciones real-time)
- ✅ Gráficas interactivas (Recharts)
- ✅ 7 páginas avanzadas módulo gestión
- ✅ Módulo plataforma completo (9 páginas)
- ✅ Deployment en producción (Vercel + Railway)

---

**Total implementado:** Sistema completo full-stack con 15 endpoints, 15 tablas, 24 páginas funcionales, autenticación, tiempo real, almacenamiento de imágenes, reportes con gráficas, y plataforma pública para reservaciones online.
