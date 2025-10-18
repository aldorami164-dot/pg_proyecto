# 🏔️ SISTEMA COMPLETO DE PLATAFORMA TURÍSTICA

## 📋 ÍNDICE
1. [Concepto y Diferencias](#concepto-y-diferencias)
2. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
3. [Estructura Backend](#estructura-backend)
4. [Estructura Frontend](#estructura-frontend)
5. [Plan de Implementación Paso a Paso](#plan-de-implementación-paso-a-paso)
6. [Flujo de Usuario Final](#flujo-de-usuario-final)

---

## 🎯 CONCEPTO Y DIFERENCIAS

### **DOS SISTEMAS COMPLEMENTARIOS:**

#### **1️⃣ EXPERIENCIAS TURÍSTICAS** (`experiencias_turisticas`)
**Concepto:** Actividades guiadas, tours, excursiones que requieren reservación

**Características:**
- ✅ Requieren guía o reservación
- ✅ **SIN PRECIO** (los precios varían según temporada, grupo, etc.)
- ✅ Mensaje: "Consulta en recepción para precios y disponibilidad"
- ✅ Capacidad limitada de personas
- ✅ Duración específica
- ✅ Se reservan en recepción

**Ejemplos:**
- 🚣 Kayak en el Lago Atitlán (2 horas, guía incluido, consultar precio)
- 🏔️ Ascenso al Volcán San Pedro (6 horas, guía necesario, consultar precio)
- 🎨 Tour de Artesanías Mayas (3 horas, con guía local, consultar precio)
- 🛶 Paseo en Lancha por pueblos del lago (4 horas, consultar precio)

**Categorías:**
- `aventura` - Trekking, kayak, deportes extremos
- `cultura` - Tours culturales, talleres artesanales
- `naturaleza` - Observación de aves, tours ecológicos
- `gastronomia` - Tours gastronómicos, clases de cocina

---

#### **2️⃣ LUGARES TURÍSTICOS** (`lugares_turisticos`)
**Concepto:** Lugares de interés para visitar por tu cuenta, gratis o entrada económica

**Características:**
- ✅ Visita libre (sin necesidad de guía)
- ✅ Gratis o entrada económica (precio fijo cuando aplica)
- ✅ Horarios flexibles
- ✅ No requieren reservación
- ✅ Información para orientar al turista

**Ejemplos:**
- 🏛️ Parque Central (Gratis, abierto 24/7)
- ⛪ Iglesia Parroquial (Gratis, horario de misas)
- 🌊 Mirador del Lago (Gratis, abierto todo el día)
- 🛒 Mercado Municipal (Gratis entrada, compras opcionales)
- 🙏 Cofradía de Maximón (Q10 entrada, horario 8am-5pm)

**Categorías:**
- `cultura` - Iglesias, museos, sitios históricos
- `naturaleza` - Miradores, playas, senderos
- `gastronomia` - Mercados, comedores típicos
- `aventura` - Senderos libres, áreas recreativas

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### **TABLAS PRINCIPALES:**

```
1. imagenes_galeria (YA EXISTE)
   └─ Almacena todas las imágenes del sistema

2. experiencias_turisticas (YA EXISTE)
   └─ Tours y actividades con guía
   └─ CAMPO precio → NO SE USA (los precios varían)

3. experiencias_imagenes (CREAR NUEVA)
   └─ Relación M:N entre experiencias e imágenes

4. lugares_turisticos (YA CREADA ✅)
   └─ Lugares de visita libre
   └─ CAMPO precio_entrada → SÍ SE USA (precios fijos: Q10, Q20, Gratis)

5. lugares_imagenes (YA CREADA ✅)
   └─ Relación M:N entre lugares e imágenes
```

### **DIAGRAMA DE RELACIONES:**

```
┌─────────────────────┐
│ imagenes_galeria    │
│ ├─ id               │
│ ├─ titulo           │
│ ├─ url_imagen       │
│ ├─ descripcion      │
│ └─ activo           │
└─────────────────────┘
         ▲
         │
         ├──────────────────────────────────────┐
         │                                      │
         │                                      │
┌────────┴─────────────┐              ┌────────┴─────────────┐
│ experiencias_imagenes│              │ lugares_imagenes     │
│ ├─ id                │              │ ├─ id                │
│ ├─ experiencia_id    │              │ ├─ lugar_id          │
│ ├─ imagen_id         │              │ ├─ imagen_id         │
│ ├─ orden             │              │ ├─ orden             │
│ └─ es_principal      │              │ └─ es_principal      │
└────────┬─────────────┘              └────────┬─────────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│experiencias_turisticas│              │lugares_turisticos    │
│ ├─ id                │              │ ├─ id                │
│ ├─ nombre            │              │ ├─ nombre            │
│ ├─ descripcion       │              │ ├─ descripcion       │
│ ├─ categoria         │              │ ├─ categoria         │
│ ├─ ubicacion         │              │ ├─ ubicacion         │
│ ├─ duracion          │              │ ├─ url_maps          │
│ ├─ capacidad         │              │ ├─ horario           │
│ ├─ precio (NO USAR)  │              │ ├─ precio_entrada ✅  │
│ └─ destacado         │              │ └─ orden             │
└──────────────────────┘              └──────────────────────┘
```

---

## 🔧 ESTRUCTURA BACKEND

### **ARCHIVOS A CREAR/MODIFICAR:**

```
backend/src/
│
├── controllers/
│   ├── experiencias.controller.js     (CREAR NUEVO) ← Panel Admin
│   ├── lugaresTuristicos.controller.js (CREAR NUEVO) ← Panel Admin
│   └── plataforma.controller.js       (MODIFICAR) ← Endpoint público
│
├── routes/
│   ├── experiencias.routes.js         (CREAR NUEVO)
│   ├── lugaresTuristicos.routes.js    (CREAR NUEVO)
│   └── plataforma.routes.js           (MODIFICAR)
│
└── validators/
    ├── experiencias.validator.js      (CREAR NUEVO)
    └── lugaresTuristicos.validator.js (CREAR NUEVO)
```

### **ENDPOINTS A IMPLEMENTAR:**

#### **A) PANEL ADMIN - EXPERIENCIAS** (requiere auth admin)
```
GET    /api/experiencias                    - Listar experiencias (admin)
POST   /api/experiencias                    - Crear experiencia (admin)
GET    /api/experiencias/:id                - Detalle experiencia (admin)
PUT    /api/experiencias/:id                - Actualizar experiencia (admin)
DELETE /api/experiencias/:id                - Desactivar experiencia (admin)

POST   /api/experiencias/:id/imagenes                      - Vincular imagen
DELETE /api/experiencias/:id/imagenes/:imagen_id           - Desvincular imagen
PATCH  /api/experiencias/:id/imagenes/:imagen_id/principal - Marcar principal
GET    /api/experiencias/:id/imagenes                      - Listar imágenes
```

**NOTA:** El campo `precio` existe en BD pero NO se devuelve al frontend. El frontend siempre mostrará "Consulta en recepción".

---

#### **B) PANEL ADMIN - LUGARES TURÍSTICOS** (requiere auth admin)
```
GET    /api/lugares-turisticos              - Listar lugares (admin)
POST   /api/lugares-turisticos              - Crear lugar (admin)
GET    /api/lugares-turisticos/:id          - Detalle lugar (admin)
PUT    /api/lugares-turisticos/:id          - Actualizar lugar (admin)
DELETE /api/lugares-turisticos/:id          - Desactivar lugar (admin)

POST   /api/lugares-turisticos/:id/imagenes                      - Vincular imagen
DELETE /api/lugares-turisticos/:id/imagenes/:imagen_id           - Desvincular imagen
PATCH  /api/lugares-turisticos/:id/imagenes/:imagen_id/principal - Marcar principal
GET    /api/lugares-turisticos/:id/imagenes                      - Listar imágenes
```

**NOTA:** El campo `precio_entrada` SÍ se usa. Valores comunes: 0 (gratis), 10, 20, 50.

---

#### **C) PLATAFORMA PÚBLICA** (sin auth, público)
```
GET /api/plataforma/experiencias         - Lista experiencias activas (YA EXISTE, MODIFICAR)
                                          - NO devuelve campo precio

GET /api/plataforma/lugares-turisticos   - Lista lugares activos (CREAR NUEVO)
                                          - SÍ devuelve precio_entrada
```

---

## 💻 ESTRUCTURA FRONTEND

### **MÓDULO GESTIÓN (Admin Dashboard):**

```
frontend/src/modules/gestion/pages/
│
├── HabitacionesPage.jsx              (YA EXISTE ✅)
│   └─ Gestión de habitaciones con imágenes
│
├── GaleriaPage.jsx                   (YA EXISTE ✅)
│   └─ Subir imágenes y vincular a habitaciones/experiencias/lugares
│
├── ExperienciasGestionPage.jsx       (CREAR NUEVO)
│   ├─ Lista de experiencias (cards con imagen principal)
│   ├─ CRUD: Crear, Editar, Desactivar
│   ├─ Formulario SIN campo precio (se omite)
│   ├─ Botón "Gestionar Imágenes"
│   └─ Modal vincular/desvincular imágenes
│
└── LugaresTuristicosPage.jsx         (CREAR NUEVO)
    ├─ Lista de lugares (cards con imagen principal)
    ├─ CRUD: Crear, Editar, Desactivar
    ├─ Formulario CON campo precio_entrada
    ├─ Botón "Gestionar Imágenes"
    └─ Modal vincular/desvincular imágenes
```

### **MÓDULO PLATAFORMA (Público):**

```
frontend/src/modules/plataforma/pages/
│
├── ExperienciasPage.jsx              (YA EXISTE, MODIFICAR)
│   ├─ Lista de experiencias con múltiples imágenes
│   └─ Mostrar: "Consulta en recepción para precios"
│
├── ExperienciaDetallePage.jsx        (YA EXISTE, MODIFICAR)
│   ├─ Detalle con galería de imágenes
│   └─ Card: "¿Interesado? Consulta en recepción para precios y disponibilidad"
│
├── LugaresPage.jsx                   (CREAR NUEVO)
│   ├─ Lista de lugares para visitar
│   └─ Mostrar precio: "Gratis" o "Q10 entrada"
│
└── LugarDetallePage.jsx              (CREAR NUEVO)
    ├─ Detalle del lugar con galería
    └─ Mostrar precio si tiene: "Entrada: Q10" o "Entrada gratuita"
```

### **SERVICIOS:**

```
frontend/src/shared/services/
│
├── habitacionesService.js            (YA EXISTE ✅)
├── galeriaService.js                 (YA EXISTE ✅)
├── experienciasService.js            (CREAR NUEVO) ← Admin (sin campo precio)
├── lugaresTuristicosService.js       (CREAR NUEVO) ← Admin (con campo precio_entrada)
└── plataformaService.js              (MODIFICAR) ← Público
```

---

## 📝 PLAN DE IMPLEMENTACIÓN PASO A PASO

### **FASE 1: Base de Datos** ✅ (COMPLETADA)

- [x] Tabla `lugares_turisticos` creada
- [x] Tabla `lugares_imagenes` creada
- [x] Triggers y funciones instalados
- [x] 8 lugares de ejemplo insertados

**Falta:**
- [ ] Crear tabla `experiencias_imagenes` (para vincular imágenes a experiencias)

---

### **FASE 2: Backend - Experiencias** (CREAR)

**2.1. Migración SQL:**
```sql
-- Crear experiencias_imagenes (mismo patrón que lugares_imagenes)
```

**2.2. Crear archivos:**
- [ ] `experiencias.controller.js` - CRUD + gestión de imágenes
- [ ] `experiencias.routes.js` - Rutas protegidas con auth admin
- [ ] `experiencias.validator.js` - Validaciones Joi (SIN validación de precio)

**2.3. Actualizar `plataforma.controller.js`:**
- [ ] Modificar `obtenerExperiencias()` para:
  - Incluir `imagen_principal` de galería
  - NO devolver campo `precio`
  - Incluir `total_imagenes`

---

### **FASE 3: Backend - Lugares Turísticos** (CREAR)

**3.1. Crear archivos:**
- [ ] `lugaresTuristicos.controller.js` - CRUD + gestión de imágenes
- [ ] `lugaresTuristicos.routes.js` - Rutas protegidas con auth admin
- [ ] `lugaresTuristicos.validator.js` - Validaciones Joi (CON validación de precio_entrada)

**3.2. Agregar a `plataforma.controller.js`:**
- [ ] `obtenerLugaresTuristicos()` - Endpoint público
  - Incluir `imagen_principal`
  - Incluir `precio_entrada`
  - Incluir `total_imagenes`

---

### **FASE 4: Frontend - Servicios** (CREAR)

- [ ] `experienciasService.js` - Métodos CRUD + imágenes (sin precio)
- [ ] `lugaresTuristicosService.js` - Métodos CRUD + imágenes (con precio_entrada)
- [ ] Actualizar `plataformaService.js`:
  - Mantener `getExperiencias()` existente
  - Agregar `getLugaresTuristicos()` nuevo

---

### **FASE 5: Frontend - Panel Admin Experiencias** (CREAR)

- [ ] `ExperienciasGestionPage.jsx`
  - Lista de experiencias en cards
  - Modal crear/editar (SIN campo precio)
  - Modal gestionar imágenes
  - Botón vincular imágenes desde GaleriaPage

**Campos del formulario:**
- Nombre ✅
- Categoría ✅
- Descripción ✅
- Ubicación ✅
- Duración ✅
- Capacidad ✅
- ~~Precio~~ ❌ (NO incluir)
- Destacado ✅

---

### **FASE 6: Frontend - Panel Admin Lugares** (CREAR)

- [ ] `LugaresTuristicosPage.jsx`
  - Lista de lugares en cards
  - Modal crear/editar (CON campo precio_entrada)
  - Modal gestionar imágenes
  - Botón vincular imágenes desde GaleriaPage

**Campos del formulario:**
- Nombre ✅
- Categoría ✅
- Descripción ✅
- Ubicación ✅
- URL Maps ✅
- Teléfono ✅
- Horario ✅
- Precio Entrada ✅ (con opción "Gratis" = 0)
- Orden ✅

---

### **FASE 7: Frontend - Actualizar GaleriaPage** (MODIFICAR)

- [ ] Agregar botón "Vincular a Experiencia"
- [ ] Agregar botón "Vincular a Lugar Turístico"
- [ ] Mantener botón "Vincular a Habitación"

**Resultado:**
```jsx
<Button onClick={() => vincularA('habitacion')}>Vincular a Habitación</Button>
<Button onClick={() => vincularA('experiencia')}>Vincular a Experiencia</Button>
<Button onClick={() => vincularA('lugar')}>Vincular a Lugar Turístico</Button>
```

---

### **FASE 8: Frontend - Plataforma Pública** (MODIFICAR/CREAR)

**8.1. Modificar páginas existentes:**
- [ ] `ExperienciasPage.jsx`
  - Usar `imagen_principal` de galería (no `imagen_url`)
  - NO mostrar precio
  - Mostrar: "Consulta en recepción"

- [ ] `ExperienciaDetallePage.jsx`
  - Mostrar galería completa de imágenes
  - Eliminar sección de precio
  - Card informativo: "¿Interesado en esta experiencia? Consulta en recepción para más información sobre precios, disponibilidad y reservaciones."

**8.2. Crear páginas nuevas:**
- [ ] `LugaresPage.jsx`
  - Lista de lugares turísticos
  - Mostrar precio: "Gratis" o "Q10 entrada"
  - Card con imagen principal

- [ ] `LugarDetallePage.jsx`
  - Detalle del lugar con galería
  - Mostrar precio si aplica
  - Información de horarios, ubicación, etc.

**8.3. Actualizar navegación:**
- [ ] Agregar link "Lugares para Visitar" en menú público

---

## 🎨 FLUJO DE USUARIO FINAL

### **USUARIO ADMIN:**

```
1. Dashboard Gestión
   │
   ├─ Habitaciones ✅
   │  └─ Gestionar imágenes de habitaciones
   │
   ├─ Galería ✅
   │  └─ Subir imágenes generales
   │
   ├─ Experiencias (NUEVO)
   │  ├─ Crear "Tour Volcán San Pedro"
   │  │  ├─ Nombre: "Ascenso Volcán San Pedro"
   │  │  ├─ Categoría: Aventura
   │  │  ├─ Precio: (NO SE PIDE) ❌
   │  │  ├─ Duración: 6 horas
   │  │  └─ Capacidad: 12 personas
   │  │
   │  └─ Gestionar Imágenes
   │     └─ Vincular 5 fotos del volcán
   │
   └─ Lugares Turísticos (NUEVO)
      ├─ Crear "Parque Central"
      │  ├─ Nombre: "Parque Central"
      │  ├─ Categoría: Cultura
      │  ├─ Precio entrada: 0 (Gratis) ✅
      │  ├─ Horario: 24/7
      │  └─ URL Maps: [link]
      │
      └─ Gestionar Imágenes
         └─ Vincular 3 fotos del parque
```

---

### **USUARIO TURISTA (Plataforma Pública):**

```
1. Página Principal
   │
   ├─ Sección "Experiencias" (Tours con guía)
   │  │
   │  ├─ Card: Volcán San Pedro
   │  │  ├─ [Imagen principal de galería]
   │  │  ├─ ❌ Sin precio mostrado
   │  │  ├─ 💬 "Consulta en recepción"
   │  │  ├─ 6 horas
   │  │  └─ Click → Detalle con galería (5 fotos)
   │  │     └─ Card: "¿Interesado? Consulta en recepción
   │  │        para información de precios y disponibilidad"
   │  │
   │  ├─ Card: Tour Kayak
   │  └─ Card: Tour Cultural
   │
   └─ Sección "Lugares para Visitar" (Gratis/entrada económica)
      │
      ├─ Card: Parque Central
      │  ├─ [Imagen principal de galería]
      │  ├─ ✅ "Entrada gratuita"
      │  ├─ Abierto 24/7
      │  └─ Click → Detalle con galería (3 fotos)
      │
      ├─ Card: Iglesia Parroquial (Gratis)
      ├─ Card: Cofradía de Maximón (Q10 entrada)
      └─ Card: Mercado Municipal (Gratis)
```

---

## 📊 RESUMEN VISUAL

### **COMPARACIÓN FINAL:**

| Aspecto | Experiencias | Lugares |
|---------|--------------|---------|
| **Concepto** | Tours con guía | Visita libre |
| **Mostrar Precio** | ❌ NO (variable) | ✅ SÍ (fijo) |
| **Mensaje Precio** | "Consulta en recepción" | "Gratis" o "Q10" |
| **Reservación** | Sí (recepción) | No necesaria |
| **Capacidad** | 8-15 personas | Ilimitado |
| **Duración** | 2-6 horas | Flexible |
| **Ejemplo** | Kayak en el lago | Parque Central |
| **Tabla BD** | `experiencias_turisticas` | `lugares_turisticos` |
| **Campo Precio BD** | `precio` (NO USAR) | `precio_entrada` (USAR) |
| **Panel Admin** | `ExperienciasGestionPage` | `LugaresTuristicosPage` |
| **Vista Pública** | `ExperienciasPage` | `LugaresPage` |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Base de Datos:**
- [x] `lugares_turisticos` y `lugares_imagenes` creadas
- [ ] `experiencias_imagenes` crear

### **Backend:**
- [ ] Controller experiencias (CRUD + imágenes, SIN campo precio)
- [ ] Routes experiencias (auth admin)
- [ ] Validator experiencias (SIN validar precio)
- [ ] Controller lugares (CRUD + imágenes, CON precio_entrada)
- [ ] Routes lugares (auth admin)
- [ ] Validator lugares (CON validar precio_entrada)
- [ ] Actualizar plataforma.controller:
  - `obtenerExperiencias()` → NO devolver precio, incluir imagen_principal
  - `obtenerLugaresTuristicos()` → SÍ devolver precio_entrada, incluir imagen_principal

### **Frontend Admin:**
- [ ] Service experiencias
- [ ] Service lugares
- [ ] ExperienciasGestionPage (formulario SIN precio)
- [ ] LugaresTuristicosPage (formulario CON precio_entrada)
- [ ] Actualizar GaleriaPage (3 botones vincular)

### **Frontend Público:**
- [ ] Actualizar ExperienciasPage:
  - Usar imagen_principal
  - NO mostrar precio
  - Mostrar "Consulta en recepción"
- [ ] Actualizar ExperienciaDetallePage:
  - Galería de imágenes
  - Card informativo sin precio
- [ ] Crear LugaresPage (con precio mostrado)
- [ ] Crear LugarDetallePage (con galería y precio)
- [ ] Actualizar navegación/menú

---

## 🚀 COMANDO PARA IMPLEMENTAR

Una vez que confirmes que este plan es correcto, solo dirás:

**"Implementa según PLATAFORMA_TURISTICA.md"**

Y yo ejecutaré todo el plan paso a paso, documentando cada cambio.

---

## 📝 NOTAS IMPORTANTES

### **PRECIOS:**
- **Experiencias:** Los precios de guías varían según temporada, tamaño de grupo, temporada alta/baja, etc. Por eso NO se muestran y se invita al turista a consultar en recepción.
- **Lugares:** Los precios de entrada son fijos y públicos (Q10 Cofradía, Gratis Parque), por eso SÍ se muestran.

### **MENSAJES AL TURISTA:**
- **Experiencias:** "¿Interesado en esta experiencia? Consulta en recepción para más información sobre precios, disponibilidad y reservaciones."
- **Lugares:** "Entrada gratuita" o "Entrada: Q10" (precio claro y directo)

---

**¿Este plan actualizado es correcto?** 🎯
