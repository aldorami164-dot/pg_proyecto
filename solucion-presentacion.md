# 🎯 ESTRATEGIA PARA PRESENTACIÓN DE 10 MINUTOS

## 🚨 PROBLEMA IDENTIFICADO

**Contexto:** Presentación de 10 minutos demostrando todo el proyecto
**Issue:** Supabase Free Tier tiene límites de peticiones/segundo
**Riesgo:** Rate limiting durante la demo → Mala impresión

---

## ✅ SOLUCIÓN ÓPTIMA: PAUSAS TÉCNICAS ESTRATÉGICAS

### **🎯 CONCEPTO CLAVE**

**En lugar de:** Click → Click → Click → Click (muchas peticiones rápidas)
**HACER:** Acción → **MOSTRAR CÓDIGO/BD** → Acción → **MOSTRAR API** → Acción

**Ventajas:**
- ✅ Reduces peticiones (das tiempo entre llamadas)
- ✅ Demuestras conocimiento técnico profundo
- ✅ Impresionas mostrando backend + frontend + BD
- ✅ Controlas el ritmo de la presentación
- ✅ Evitas rate limiting de Supabase

---

## 🎬 GUION COMPLETO CON PAUSAS TÉCNICAS (10 MIN)

### **📌 ESTRUCTURA GENERAL**

```
┌─────────────────────────────────────────────────────────────┐
│ MINUTOS │ ACCIÓN                │ PAUSA TÉCNICA             │
├─────────────────────────────────────────────────────────────┤
│ 0-1     │ Login + Intro         │ Arquitectura general      │
│ 1-5     │ Crear 1 Reserva       │ Backend + BD + Network    │ ⭐ DEEP DIVE
│ 5-7     │ QR + Galería          │ Supabase Storage          │
│ 7-9     │ Solicitudes + WebSocket│ Código WebSocket         │
│ 9-10    │ Reportes + Cierre     │ Diagrama arquitectura     │
└─────────────────────────────────────────────────────────────┘

TOTAL PETICIONES: ~7-8 en 10 minutos → ✅ SEGURO
```

---

## 📋 MINUTO A MINUTO DETALLADO

### **🔹 MINUTO 0-1: INTRODUCCIÓN + LOGIN**

#### **Acciones:**
```
1. Mostrar landing page pública (ya cargada)
2. "Sistema de gestión hotelera full-stack"
3. Login como Admin (credenciales pre-escritas)
   Email: admin@hotel.com
   Password: ********
   [ENTER]
4. Dashboard aparece
```

#### **PAUSA TÉCNICA (30 segundos):**
Mientras carga el dashboard, mostrar diagrama:

```
┌──────────────┐  Axios/JWT   ┌──────────────┐   pg Pool   ┌──────────────┐
│   FRONTEND   │────────────→ │   BACKEND    │───────────→ │  POSTGRESQL  │
│   (Vercel)   │←──────────── │  (Railway)   │←─────────── │  (Supabase)  │
│              │  JSON        │              │   Rows      │              │
│ React 18     │              │ Node.js 20   │             │ 15 tablas    │
│ Vite 4.x     │              │ Express 4.x  │             │ Relaciones FK│
│ TailwindCSS  │              │ JWT + bcrypt │             │ Índices      │
│ Context API  │              │ WebSocket    │             │              │
└──────────────┘              └──────────────┘             └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   STORAGE    │
                              │  (Supabase)  │
                              │  Imágenes    │
                              └──────────────┘
```

**EXPLICAR:** "Arquitectura cliente-servidor. Frontend en Vercel, backend en Railway, base de datos PostgreSQL y storage en Supabase."

**PETICIONES:** 1 (POST /auth/login)

---

### **🔹 MINUTOS 1-5: MÓDULO RESERVAS (DEEP DIVE) ⭐**

Este es el segmento más importante - demostrar profundidad técnica.

#### **FLUJO DETALLADO:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ACCIÓN EN PANTALLA              │ EXPLICACIÓN TÉCNICA (PAUSAS)      │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Navegar a ReservasPage      │ "Gestión completa de reservas     │
│    (Sidebar → Reservas)         │  con validación de disponibilidad"│
│                                 │ [10 segundos]                     │
│                                 │                                   │
│ 2. Mostrar tabla de reservas    │ "Esta tabla hace JOIN de          │
│    (datos del seed)             │  reservas + huespedes +           │
│                                 │  habitaciones + estados"          │
│                                 │ [10 segundos]                     │
│                                 │                                   │
├─────────────────────────────────┴───────────────────────────────────┤
│ 🔴 PAUSA 1: MOSTRAR CÓDIGO BACKEND (40 segundos)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 3. [ALT+TAB] → VS Code          │ Archivo: habitaciones.routes.js  │
│    Mostrar endpoint             │ Línea: ~45                        │
│                                 │                                   │
│    ```javascript                                                    │
│    // GET /habitaciones/disponibles                                │
│    router.get('/disponibles', async (req, res) => {                │
│      const { fecha_checkin, fecha_checkout } = req.query           │
│                                                                      │
│      const query = `                                                │
│        SELECT h.*, t.nombre as tipo_nombre                          │
│        FROM habitaciones h                                          │
│        LEFT JOIN tipos_habitacion t ON h.tipo_id = t.id            │
│        WHERE h.activo = true                                        │
│          AND h.id NOT IN (                                          │
│            SELECT r.habitacion_id                                   │
│            FROM reservas r                                          │
│            WHERE r.estado_id IN (1, 2)                              │
│              AND (                                                  │
│                r.fecha_checkin < $2                                 │
│                AND r.fecha_checkout > $1                            │
│              )                                                      │
│          )                                                          │
│      `                                                              │
│      const result = await pool.query(query, [checkin, checkout])   │
│    })                                                               │
│    ```                                                              │
│                                                                      │
│    EXPLICAR: "Este endpoint valida disponibilidad. Usa LEFT JOIN   │
│    con subconsulta para excluir habitaciones con reservas activas  │
│    que se solapen. La condición (checkin < checkout_otra AND       │
│    checkout > checkin_otra) detecta cualquier conflicto de fechas."│
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 4. [ALT+TAB] → Volver navegador │ "Ahora voy a crear una reserva"  │
│    Click "Nueva Reserva"        │ [Modal se abre]                  │
│                                 │ [10 segundos]                     │
│                                 │                                   │
│ 5. Seleccionar fechas:          │ "Al cambiar fechas, el frontend  │
│    Check-in: Hoy                │  llama automáticamente al        │
│    Check-out: +3 días           │  endpoint de disponibilidad"     │
│                                 │ [15 segundos]                     │
│                                 │                                   │
├─────────────────────────────────┴───────────────────────────────────┤
│ 🔴 PAUSA 2: MOSTRAR NETWORK TAB (30 segundos)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 6. [F12] → Network tab          │ Buscar: "disponibles"            │
│    Filtrar por XHR              │                                   │
│                                                                      │
│    REQUEST:                                                         │
│    GET /api/habitaciones/disponibles?fecha_checkin=2024-01-15&...  │
│                                                                      │
│    RESPONSE:                                                        │
│    {                                                                │
│      "habitaciones": [                                              │
│        {                                                            │
│          "id": 1,                                                   │
│          "numero": 101,                                             │
│          "tipo_nombre": "Suite",                                    │
│          "precio_por_noche": 150                                    │
│        },                                                           │
│        ...                                                          │
│      ]                                                              │
│    }                                                                │
│                                                                      │
│    EXPLICAR: "Aquí vemos la petición GET con los parámetros de     │
│    fecha. La API devuelve solo habitaciones SIN conflictos en ese  │
│    rango. El frontend las renderiza en el dropdown."               │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 7. Completar formulario:        │ "Sistema calcula automáticamente │
│    - Seleccionar habitación     │  el precio: 3 noches × Q150 =    │
│    - Huésped: María González    │  Q450"                           │
│    - Número huéspedes: 2        │ [20 segundos]                     │
│    - Canal: WhatsApp            │                                   │
│    - [Precio se calcula auto]   │                                   │
│                                 │                                   │
│ 8. Click "Confirmar Reserva"    │ "Ahora hace POST /reservas"      │
│    [Loading...]                 │ [10 segundos]                     │
│    ✅ Toast: "Reserva creada"   │                                   │
│                                 │                                   │
├─────────────────────────────────┴───────────────────────────────────┤
│ 🔴 PAUSA 3: MOSTRAR BASE DE DATOS (50 segundos)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 9. [ALT+TAB] → Supabase         │ Database → Table Editor          │
│    Dashboard (ya abierto)       │ Tabla: reservas                  │
│                                                                      │
│    [Ordenar por id DESC]        │                                   │
│                                                                      │
│    ID │ Código    │ Huésped   │ Hab │ Check-in   │ Estado          │
│    ──────────────────────────────────────────────────────────────  │
│    15 │ RES-2024…│ María G.  │ 101 │ 2024-01-15 │ pendiente  ← NEW│
│    14 │ RES-2024…│ Juan P.   │ 102 │ 2024-01-10 │ confirmada      │
│    ...                                                              │
│                                                                      │
│    EXPLICAR: "Aquí vemos el registro que se insertó hace un        │
│    segundo. Estado inicial 'pendiente'. También se guardó el       │
│    código único generado, precio total, y timestamp automático."   │
│                                                                      │
│    [Click en el registro]       │ Ver detalle completo:            │
│    → Ver JSON completo          │ - huesped_id: 1 (FK)             │
│                                 │ - habitacion_id: 1 (FK)          │
│                                 │ - numero_noches: 3               │
│                                 │ - precio_total: 450              │
│                                 │ - estado_id: 1 (pendiente)       │
│                                 │ - creado_por: 1 (usuario admin)  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 10. [ALT+TAB] → Volver frontend │ "La tabla se actualiza           │
│     Ver nueva reserva en tabla  │  automáticamente con la nueva    │
│                                 │  reserva"                         │
│                                 │ [10 segundos]                     │
└─────────────────────────────────────────────────────────────────────┘

TIEMPO TOTAL: ~4 minutos
PETICIONES: 2 (GET disponibles + POST reserva)
IMPACTO TÉCNICO: ⭐⭐⭐⭐⭐ (mostraste TODO el stack)
```

**PETICIONES TOTALES HASTA AQUÍ:** 3 (login + 2 de reservas)

---

### **🔹 MINUTOS 5-7: QR + GALERÍA (DEMOSTRACIÓN RÁPIDA)**

#### **A. Códigos QR (1.5 minutos)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Sidebar → Códigos QR         │ "Sistema de QR para       │
│    Tabla con QRs generados      │  habitaciones"            │
│                                 │                           │
│ 2. Click "Ver QR" en uno        │ Modal con QR visual       │
│    [Modal abre]                 │ (qrcode.react)            │
│                                 │                           │
├─────────────────────────────────┴───────────────────────────┤
│ 🔴 PAUSA: EXPLICAR TECNOLOGÍA (20 segundos)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ EXPLICAR: "Los QR se generan con librería qrcode.react.    │
│ Cada uno tiene un código UUID único. La URL destino apunta │
│ al frontend con ese código: /habitacion/qr/{codigo}        │
│                                                              │
│ Al escanear:                                                │
│ 1. GET /qr/{codigo}/track → Registra lectura               │
│ 2. Incrementa contador en BD                               │
│ 3. Redirect al huésped a la página de su habitación"       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 3. Cerrar modal                 │ [5 segundos]              │
└─────────────────────────────────────────────────────────────┘

PETICIONES: 1 (GET /qr)
```

#### **B. Galería de Imágenes (1.5 minutos)**

```
┌─────────────────────────────────────────────────────────────┐
│ 4. Sidebar → Galería            │ "Gestión de imágenes con  │
│    Grid de imágenes (ya subidas)│  Supabase Storage"        │
│                                 │                           │
│ 5. Click en una imagen          │ Modal vista previa abre   │
│    [Modal abre]                 │                           │
│                                 │                           │
├─────────────────────────────────┴───────────────────────────┤
│ 🔴 PAUSA: MOSTRAR SUPABASE STORAGE (30 segundos)            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 6. [ALT+TAB] → Supabase         │ Storage → hotel-images    │
│    Dashboard                    │                           │
│                                                              │
│    Bucket: hotel-images         │ Lista de archivos:        │
│    ├── 1704567890-suite-1.jpg   │ - 2.3 MB                 │
│    ├── 1704567901-lobby.jpg     │ - 1.8 MB                 │
│    ├── 1704567912-piscina.jpg   │ - 3.1 MB                 │
│    └── ...                      │                           │
│                                                              │
│    [Click en archivo]           │ Ver URL pública:          │
│    → Ver metadata               │ https://xxx.supabase.co/  │
│                                 │ storage/v1/object/public/ │
│                                 │ hotel-images/...          │
│                                                              │
│    EXPLICAR: "Las imágenes se almacenan aquí. Cuando haces │
│    upload desde el frontend:                                │
│    1. FormData se envía a POST /galeria/subir              │
│    2. Backend usa multer para procesar el archivo          │
│    3. Se sube a Supabase Storage con SDK                   │
│    4. Se obtiene la URL pública                            │
│    5. Se guarda solo la URL en PostgreSQL (tabla galeria)  │
│                                                              │
│    Ventaja: No guardamos imágenes en la BD, solo la URL.   │
│    Supabase maneja CDN, compresión y caché automático."    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 7. [ALT+TAB] → Volver frontend  │ Cerrar modal              │
└─────────────────────────────────────────────────────────────┘

PETICIONES: 1 (GET /galeria)
```

**PETICIONES TOTALES HASTA AQUÍ:** 5

---

### **🔹 MINUTOS 7-9: SOLICITUDES + WEBSOCKET (TIEMPO REAL) ⭐**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Sidebar → Solicitudes        │ "Notificaciones en tiempo │
│    Ver indicador WebSocket      │  real con WebSocket"      │
│    🟢 Conectado                 │                           │
│                                 │                           │
│ 2. Tabla "Pendientes"           │ Ver solicitud del seed:   │
│    - Hab. 101: Limpieza Extra   │ Estado: Pendiente         │
│                                 │                           │
├─────────────────────────────────┴───────────────────────────┤
│ 🔴 PAUSA: MOSTRAR CÓDIGO WEBSOCKET (40 segundos)            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 3. [ALT+TAB] → VS Code          │ Archivo: server.js        │
│                                                              │
│    ```javascript                                            │
│    // Servidor WebSocket                                    │
│    const WebSocket = require('ws')                          │
│    const wss = new WebSocket.Server({ port: 3001 })        │
│                                                              │
│    // Broadcast a todos los clientes                        │
│    const broadcast = (tipo, data) => {                      │
│      wss.clients.forEach(client => {                        │
│        if (client.readyState === WebSocket.OPEN) {          │
│          client.send(JSON.stringify({ tipo, data }))        │
│        }                                                     │
│      })                                                      │
│    }                                                         │
│                                                              │
│    // Cuando se crea una solicitud                          │
│    router.post('/solicitudes', async (req, res) => {        │
│      const solicitud = await crearSolicitud(req.body)       │
│                                                              │
│      // Notificar en tiempo real                            │
│      broadcast('nueva_solicitud', solicitud)                │
│                                                              │
│      res.json({ solicitud })                                │
│    })                                                        │
│    ```                                                       │
│                                                              │
│    EXPLICAR: "WebSocket mantiene una conexión full-duplex  │
│    entre servidor y todos los clientes. Cuando se crea una │
│    solicitud, el servidor hace broadcast a TODOS los        │
│    usuarios conectados simultáneamente. No necesitan hacer  │
│    refresh ni polling."                                     │
│                                                              │
│    [Scroll hacia abajo]         │ Mostrar frontend:         │
│                                                              │
│    ```javascript                                            │
│    // WebSocketContext.jsx (frontend)                       │
│    const ws = new WebSocket('wss://backend.railway.app')    │
│                                                              │
│    ws.onmessage = (event) => {                              │
│      const { tipo, data } = JSON.parse(event.data)          │
│                                                              │
│      if (tipo === 'nueva_solicitud') {                      │
│        toast.success(`Nueva solicitud de Hab. ${data.hab}`) │
│        actualizarLista()  // Recargar automáticamente       │
│      }                                                       │
│    }                                                         │
│    ```                                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 4. [ALT+TAB] → Volver navegador │ "Ahora voy a completar    │
│    Click "Completar" en         │  esta solicitud"          │
│    solicitud pendiente          │                           │
│                                 │                           │
│ 5. [Solicitud desaparece]       │ Se mueve a tabla          │
│    ✅ Toast: "Completada"       │ "Completadas"             │
│                                 │                           │
│    OPCIONAL (si hay tiempo):    │ "Si hubiera otro usuario  │
│    "En producción, otros        │  viendo esta página, le   │
│    usuarios verían esto en      │  aparecería la            │
│    tiempo real sin recargar"    │  actualización            │
│                                 │  instantáneamente"        │
└─────────────────────────────────────────────────────────────┘

PETICIONES: 2 (GET /solicitudes + PATCH /solicitudes/:id/completar)
```

**PETICIONES TOTALES HASTA AQUÍ:** 7

---

### **🔹 MINUTOS 9-10: REPORTES + CIERRE**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Sidebar → Reportes           │ "Reportes de ocupación con│
│    Tabla con reportes históricos│  gráficas interactivas"   │
│    (del seed)                   │                           │
│                                 │                           │
│ 2. Click "Ver" en un reporte    │ Modal con gráficas abre   │
│    [Modal abre]                 │                           │
│                                 │                           │
│    - Gráfica de Pastel          │ "Recharts para            │
│      (Ocupación promedio 75%)   │  visualización"           │
│    - Gráfica de Línea           │                           │
│      (Ocupación día por día)    │ "Cálculo con              │
│    - Barra de progreso          │  generate_series de       │
│    - Cards con métricas         │  PostgreSQL"              │
│                                 │                           │
│ 3. [15 segundos viendo gráficas]│                           │
│                                 │                           │
│ 4. Cerrar modal                 │                           │
│                                 │                           │
├─────────────────────────────────┴───────────────────────────┤
│ 🔴 CIERRE: RESUMEN TÉCNICO (30 segundos)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ RECAPITULAR:                                                │
│                                                              │
│ "Proyecto completo full-stack:                              │
│                                                              │
│ ✅ Backend: 15 endpoints REST con Node.js + Express         │
│ ✅ Base de datos: PostgreSQL con 15 tablas relacionadas     │
│ ✅ Frontend: React 18 con 24 páginas funcionales            │
│ ✅ Autenticación: JWT stateless                             │
│ ✅ Tiempo real: WebSocket para notificaciones               │
│ ✅ Storage: Supabase para imágenes                          │
│ ✅ Visualización: Gráficas interactivas con Recharts        │
│ ✅ Deployment: Vercel + Railway + Supabase en producción    │
│                                                              │
│ Todo con validaciones, manejo de errores, y diseño          │
│ responsive con TailwindCSS."                                │
│                                                              │
│ [OPCIONAL] Mostrar diagrama final en pantalla               │
└─────────────────────────────────────────────────────────────┘

PETICIONES: 1 (GET /reportes/:id)
```

**PETICIONES TOTALES:** ~8 en 10 minutos ✅

---

## 🛠️ PREPARACIÓN PRE-PRESENTACIÓN

### **1 DÍA ANTES:**

#### **A. Ejecutar Script de Seed**

Crear archivo `backend/scripts/seed-presentacion.js`:

```javascript
const pool = require('../src/config/db')

const seedParaPresentacion = async () => {
  console.log('🌱 Iniciando seed para presentación...')

  try {
    // 1. Habitaciones (si no existen)
    console.log('📝 Verificando habitaciones...')
    const habitaciones = await pool.query('SELECT COUNT(*) FROM habitaciones')
    if (habitaciones.rows[0].count < 5) {
      await pool.query(`
        INSERT INTO habitaciones (numero, tipo_id, precio_por_noche, capacidad, estado, activo)
        VALUES
          (101, 1, 150, 2, 'disponible', true),
          (102, 2, 200, 4, 'disponible', true),
          (103, 3, 350, 6, 'disponible', true),
          (201, 1, 150, 2, 'disponible', true),
          (202, 2, 200, 4, 'ocupada', true)
        ON CONFLICT (numero) DO NOTHING
      `)
      console.log('✅ Habitaciones creadas')
    }

    // 2. Huéspedes de ejemplo
    console.log('📝 Creando huéspedes...')
    await pool.query(`
      INSERT INTO huespedes (nombre, apellido, email, telefono, dpi_pasaporte, pais)
      VALUES
        ('María', 'González', 'maria@ejemplo.com', '55512345', '1234567890101', 'Guatemala'),
        ('Juan', 'Pérez', 'juan@ejemplo.com', '55556789', '9876543210101', 'Guatemala'),
        ('Ana', 'Martínez', 'ana@ejemplo.com', '55590123', '1122334455667', 'Guatemala')
      ON CONFLICT (email) DO NOTHING
    `)

    // 3. Reservas de demostración
    console.log('📝 Creando reservas...')
    const hoy = new Date().toISOString().split('T')[0]
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    const proxSemana = new Date()
    proxSemana.setDate(proxSemana.getDate() + 7)

    await pool.query(`
      INSERT INTO reservas (huesped_id, habitacion_id, fecha_checkin, fecha_checkout, numero_huespedes, numero_noches, precio_por_noche, precio_total, estado_id, canal_reserva, creado_por)
      SELECT 1, 2, $1, $2, 2, 6, 200, 1200, 1, 'whatsapp', 1
      WHERE NOT EXISTS (
        SELECT 1 FROM reservas WHERE habitacion_id = 2 AND fecha_checkin = $1
      )
    `, [manana.toISOString().split('T')[0], proxSemana.toISOString().split('T')[0]])

    // 4. Códigos QR
    console.log('📝 Creando códigos QR...')
    await pool.query(`
      INSERT INTO codigos_qr (codigo, url_destino, habitacion_id, estado, creado_por)
      VALUES
        ('QR-DEMO-101', 'https://tu-frontend.vercel.app/habitacion/1/qr/QR-DEMO-101', 1, 'asignado', 1),
        ('QR-DEMO-102', 'https://tu-frontend.vercel.app/habitacion/2/qr/QR-DEMO-102', 2, 'asignado', 1),
        ('QR-DEMO-103', 'https://tu-frontend.vercel.app/habitacion/qr/QR-DEMO-103', NULL, 'sin_asignar', 1)
      ON CONFLICT (codigo) DO NOTHING
    `)

    // 5. Solicitud pendiente para demo
    console.log('📝 Creando solicitud pendiente...')
    await pool.query(`
      INSERT INTO solicitudes_servicio (habitacion_id, servicio_id, estado, notas)
      SELECT 1, 1, 'pendiente', 'Solicitud de demostración'
      WHERE NOT EXISTS (
        SELECT 1 FROM solicitudes_servicio WHERE habitacion_id = 1 AND estado = 'pendiente'
      )
    `)

    // 6. Reporte histórico
    console.log('📝 Creando reporte...')
    await pool.query(`
      INSERT INTO reportes_ocupacion (fecha_inicio, fecha_fin, tipo_periodo, porcentaje_ocupacion, habitaciones_ocupadas, total_habitaciones, total_reservas, generado_por, datos_json)
      VALUES ('2024-01-01', '2024-01-31', 'mensual', 75.5, 3, 4, 25, 1, '{"ocupacion_por_dia": []}')
      ON CONFLICT DO NOTHING
    `)

    console.log('✅ Seed completado exitosamente')
    console.log('📊 Base de datos lista para presentación')

  } catch (error) {
    console.error('❌ Error en seed:', error)
  } finally {
    await pool.end()
  }
}

seedParaPresentacion()
```

**Ejecutar:**
```bash
node backend/scripts/seed-presentacion.js
```

#### **B. Verificar Datos**

```bash
# Conectar a Supabase y verificar:
- 5 habitaciones mínimo
- 3 huéspedes
- 1-2 reservas
- 3 códigos QR
- 1 solicitud pendiente
- 1 reporte
- 5-10 imágenes en Storage
```

---

### **30 MINUTOS ANTES:**

```bash
✅ Abrir 4 tabs del navegador:
   Tab 1: https://tu-frontend.vercel.app/login (hacer login)
   Tab 2: https://tu-frontend.vercel.app/gestion/reservas (F12 abierto)
   Tab 3: https://xxx.supabase.co/project/xxx/editor (tabla reservas)
   Tab 4: https://xxx.supabase.co/project/xxx/storage/buckets (hotel-images)

✅ Abrir VS Code con archivos preparados:
   Pestaña 1: backend/src/routes/habitaciones.routes.js (línea 45)
   Pestaña 2: backend/src/routes/galeria.routes.js (línea 20)
   Pestaña 3: backend/src/server.js (línea WebSocket)
   Pestaña 4: frontend/src/shared/context/WebSocketContext.jsx

✅ Tener diagrama de arquitectura listo (PowerPoint/Excalidraw/Imagen)

✅ Cronómetro visible

✅ Verificar internet estable

✅ Probar proyector/pantalla compartida
```

---

## ⏱️ TIMING FINAL

```
SECCIÓN                  TIEMPO    PETICIONES  PAUSAS TÉCNICAS
──────────────────────────────────────────────────────────────
Login + Intro            1 min     1           Diagrama (30s)
Reservas (DEEP DIVE)     4 min     2           3 pausas (2 min)
QR + Galería             2 min     2           2 pausas (50s)
Solicitudes + WebSocket  2 min     2           1 pausa (40s)
Reportes + Cierre        1 min     1           Resumen (30s)
──────────────────────────────────────────────────────────────
TOTAL                    10 min    8           ~4 min pausas
```

**Ratio:** 6 min acción + 4 min explicación técnica = ⭐ PERFECTO

---

## 💡 FRASES CLAVE PARA IMPRESIONAR

Mientras muestras código/BD:

1. **"La arquitectura sigue el patrón MVC con separación clara de responsabilidades"**

2. **"Implementé autenticación stateless con JWT para permitir escalabilidad horizontal"**

3. **"Las relaciones de base de datos usan Foreign Keys con ON DELETE CASCADE para mantener integridad referencial"**

4. **"El query de disponibilidad evita race conditions al validar en el momento exacto de la petición"**

5. **"WebSocket mantiene una conexión full-duplex bidireccional para notificaciones push en tiempo real sin polling"**

6. **"Supabase Storage actúa como CDN con compresión automática de imágenes y caché distribuido"**

7. **"El frontend usa Context API para state management global evitando prop drilling"**

8. **"Axios interceptors agregan el token JWT automáticamente en cada request y manejan renovación de sesión"**

9. **"Generate_series de PostgreSQL permite calcular ocupación día por día sin loops en el backend"**

10. **"La validación se hace en ambos lados: frontend para UX y backend para seguridad"**

---

## 🆘 PLAN B (SI ALGO FALLA)

### **Si internet falla:**
```bash
✅ Tener video de 3-4 minutos grabado (backup)
✅ Screenshots organizados en carpeta
✅ Presentación PowerPoint con capturas
```

### **Si Supabase está lento:**
```bash
✅ Mencionar: "En producción real se usaría cache con Redis"
✅ Mostrar más código mientras "carga"
✅ Tener datos locales de respaldo
```

### **Si el navegador crashea:**
```bash
✅ Tener segunda pestaña idéntica lista
✅ Session storage mantiene login
✅ Continuar desde donde quedaste
```

---

## ✅ CHECKLIST PRE-DEMO

```bash
□ Script de seed ejecutado (datos listos)
□ 4 tabs navegador abiertas (login hecho en Tab 1)
□ VS Code con 4 archivos clave abiertos
□ Supabase Dashboard con 2 tabs (BD + Storage)
□ F12 Network tab limpio y listo
□ Diagrama de arquitectura visible
□ Cronómetro configurado (10 min)
□ Proyector/compartir pantalla probado
□ Internet estable verificado
□ Agua cerca
□ Respirar profundo 😊
```

---

## 🎯 RESULTADO ESPERADO

**Con esta estrategia logras:**

✅ Solo **8 peticiones** en 10 minutos → Rate limiting ✅ EVITADO
✅ Demostrar **conocimiento profundo** de todo el stack
✅ Impresionar con **código real** y explicaciones técnicas
✅ Controlar el **ritmo** de la presentación
✅ Mostrar **profesionalismo** y preparación

**El ingeniero pensará:** "Este estudiante no solo sabe hacer click, entiende cómo funciona TODO el sistema por dentro."

---

**¡Mucha suerte con tu presentación! 🚀**
