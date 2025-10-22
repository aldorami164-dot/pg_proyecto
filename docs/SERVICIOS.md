# 📋 Gestión de Servicios - Hotel Casa Josefa

## 📌 Estado Actual

### Estructura de Datos

**Tabla en Base de Datos: `servicios`**
```sql
Campos:
- id (PK)
- nombre (VARCHAR) - Ej: "Sauna", "Cocina Compartida"
- descripcion (TEXT) - Descripción general del servicio
- categoria (VARCHAR) - Ej: "sauna", "cocina", "limpieza", "lavanderia", "piscina"
- precio (DECIMAL)
- tiene_costo (BOOLEAN)
- horario_inicio (TIME)
- horario_fin (TIME)
- activo (BOOLEAN)
- creado_en (TIMESTAMP)
- actualizado_en (TIMESTAMP)
```

### Flujo Actual

1. **Backend:** `GET /api/plataforma/servicios`
   - Ubicación: `backend/src/controllers/plataforma.controller.js` líneas 116-146
   - Retorna servicios activos desde la base de datos

2. **Frontend - Página Pública:** `frontend/src/modules/plataforma/pages/ServiciosPage.jsx`
   - Líneas 48-103: **Instrucciones HARDCODEADAS** por categoría
   - Líneas 35-45: **Iconos HARDCODEADOS** por categoría

3. **Componente:** `frontend/src/shared/components/ServiceCard.jsx`
   - Muestra la información del servicio
   - Recibe instrucciones como props desde ServiciosPage

---

## ⚠️ PROBLEMA ACTUAL

### Instrucciones Hardcodeadas

Las instrucciones detalladas (bullets) están **hardcodeadas** en el código frontend:

**Archivo:** `frontend/src/modules/plataforma/pages/ServiciosPage.jsx`

```javascript
const getDetallesServicio = (categoria) => {
  const detalles = {
    lavanderia: {
      instrucciones: [
        'Deja tu ropa en la bolsa de lavandería',
        'Tiempo de entrega: 24 horas',
        'Servicio incluye lavado, secado y planchado',
        'Disponible de lunes a domingo'
      ],
      solicitable: true
    },
    sauna: {
      instrucciones: [
        'Horario: 9:00 AM - 9:00 PM',
        'Duración máxima: 30 minutos por sesión',
        'Traer toalla y ropa cómoda',
        'Hidrátate bien antes y después',
        'Reserva con anticipación en recepción'
      ],
      solicitable: true
    },
    cocina: {
      instrucciones: [
        'Horario: 6:00 AM - 10:00 PM',
        'Limpia después de usar',
        'Respeta el espacio de otros huéspedes',
        'Utensilios y ollas disponibles',
        'Solicita acceso indicando tu horario preferido'
      ],
      solicitable: true
    },
    limpieza: {
      instrucciones: [
        'Servicio diario de 8:00 AM - 2:00 PM',
        'Incluye cambio de sábanas y toallas',
        'Limpieza extra disponible bajo solicitud',
        'Indica el horario que prefieras en el mensaje',
        'Respetamos el cartel "No Molestar"'
      ],
      solicitable: true
    },
    piscina: {
      instrucciones: [
        'Horario: Lunes a Domingo 8:00 AM - 7:00 PM',
        'Llevar ropa de baño adecuada',
        'Ducha obligatoria antes de ingresar',
        'Si usa cremas o aceites, bañarse primero',
        'No está permitido correr alrededor de la piscina',
        'Niños menores de 12 años con supervisión de adulto',
        'Toallas disponibles en recepción'
      ],
      solicitable: false  // No solicitable, acceso libre
    }
  }
  return detalles[categoria] || { instrucciones: [], solicitable: false }
}
```

### Iconos Hardcodeados

**Archivo:** `frontend/src/modules/plataforma/pages/ServiciosPage.jsx`

```javascript
const getIconForService = (categoria) => {
  const iconMap = {
    lavanderia: Shirt,
    sauna: Waves,
    cocina: UtensilsCrossed,
    limpieza: Sparkles,
    piscina: Droplets
  }
  return iconMap[categoria] || CheckCircle
}
```

---

## 🛠️ CÓMO EDITAR ACTUALMENTE (Manual)

### Cambiar Instrucciones

1. Abrir: `frontend/src/modules/plataforma/pages/ServiciosPage.jsx`
2. Ubicar función `getDetallesServicio` (línea 48)
3. Modificar el array de instrucciones de la categoría deseada
4. Guardar archivo
5. Rebuild del frontend: `npm run build`
6. Reiniciar servidor

### Cambiar Nombre/Descripción/Precio

1. Conectar a la base de datos PostgreSQL
2. Ejecutar SQL:
   ```sql
   UPDATE servicios
   SET nombre = 'Nuevo Nombre',
       descripcion = 'Nueva descripción',
       precio = 50.00
   WHERE id = 1;
   ```
3. Los cambios se reflejan inmediatamente (sin rebuild)

### Agregar Nuevo Servicio

1. **Base de datos:**
   ```sql
   INSERT INTO servicios (
     nombre,
     descripcion,
     categoria,
     precio,
     tiene_costo,
     horario_inicio,
     horario_fin,
     activo
   ) VALUES (
     'Masajes Terapéuticos',
     'Masajes profesionales para relajación',
     'masajes',
     100.00,
     true,
     '09:00',
     '18:00',
     true
   );
   ```

2. **Frontend - Agregar instrucciones:**
   Editar `ServiciosPage.jsx`:
   ```javascript
   const getDetallesServicio = (categoria) => {
     const detalles = {
       // ... servicios existentes
       masajes: {
         instrucciones: [
           'Horario: 9:00 AM - 6:00 PM',
           'Duración: 60 minutos',
           'Reserva con anticipación'
         ],
         solicitable: true
       }
     }
   }
   ```

3. **Frontend - Agregar icono:**
   ```javascript
   import { Shirt, Waves, UtensilsCrossed, Sparkles, Droplets, Heart } from 'lucide-react'

   const getIconForService = (categoria) => {
     const iconMap = {
       // ... iconos existentes
       masajes: Heart
     }
   }
   ```

---

## 🚀 SOLUCIÓN FUTURA RECOMENDADA

### Panel Admin de Servicios

Implementar un módulo completo de gestión de servicios en el panel de administración.

#### Estructura Propuesta

**Nueva Tabla:** `servicios_instrucciones`
```sql
CREATE TABLE servicios_instrucciones (
  id SERIAL PRIMARY KEY,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  texto_instruccion TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servicios_instrucciones_servicio
ON servicios_instrucciones(servicio_id);
```

**Nueva Tabla:** `servicios_iconos`
```sql
CREATE TABLE servicios_iconos (
  id SERIAL PRIMARY KEY,
  categoria VARCHAR(50) UNIQUE NOT NULL,
  icono_nombre VARCHAR(50) NOT NULL, -- Nombre del icono de lucide-react
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO servicios_iconos (categoria, icono_nombre) VALUES
  ('lavanderia', 'Shirt'),
  ('sauna', 'Waves'),
  ('cocina', 'UtensilsCrossed'),
  ('limpieza', 'Sparkles'),
  ('piscina', 'Droplets');
```

#### Funcionalidades del Panel Admin

**Listado de Servicios**
- Tabla con todos los servicios
- Filtros por: activo, tiene_costo, categoría
- Acciones: Editar, Activar/Desactivar, Ver Instrucciones

**Crear/Editar Servicio**
- Formulario con campos:
  - Nombre
  - Descripción
  - Categoría (dropdown)
  - Precio
  - ¿Tiene costo? (checkbox)
  - Horario inicio/fin
  - ¿Es solicitable? (checkbox)
  - Icono (selector visual)

**Gestión de Instrucciones**
- Lista de instrucciones por servicio
- Agregar nueva instrucción
- Editar instrucción existente
- Eliminar instrucción
- Ordenar instrucciones (drag and drop)
- Activar/desactivar instrucciones

#### Archivos a Crear/Modificar

**Backend:**
```
backend/src/
├── controllers/
│   └── servicios.controller.js (NUEVO)
├── routes/
│   └── servicios.routes.js (NUEVO)
├── validators/
│   └── servicios.validator.js (NUEVO)
```

**Frontend:**
```
frontend/src/modules/gestion/
├── pages/
│   └── ServiciosGestionPage.jsx (NUEVO)
├── components/
│   ├── ServicioForm.jsx (NUEVO)
│   ├── InstruccionesManager.jsx (NUEVO)
│   └── IconSelector.jsx (NUEVO)
```

#### Endpoints Necesarios

```javascript
// Servicios
GET    /api/servicios              // Listar todos
GET    /api/servicios/:id          // Obtener uno
POST   /api/servicios              // Crear
PUT    /api/servicios/:id          // Actualizar
DELETE /api/servicios/:id          // Eliminar
PATCH  /api/servicios/:id/toggle   // Activar/Desactivar

// Instrucciones
GET    /api/servicios/:id/instrucciones          // Listar
POST   /api/servicios/:id/instrucciones          // Crear
PUT    /api/servicios/:id/instrucciones/:instId  // Actualizar
DELETE /api/servicios/:id/instrucciones/:instId  // Eliminar
PATCH  /api/servicios/:id/instrucciones/reordenar // Cambiar orden
```

#### Migración de Datos

Script para migrar instrucciones hardcodeadas a la base de datos:

```sql
-- Insertar instrucciones de lavandería
INSERT INTO servicios_instrucciones (servicio_id, texto_instruccion, orden)
SELECT
  s.id,
  unnest(ARRAY[
    'Deja tu ropa en la bolsa de lavandería',
    'Tiempo de entrega: 24 horas',
    'Servicio incluye lavado, secado y planchado',
    'Disponible de lunes a domingo'
  ]),
  generate_series(1, 4)
FROM servicios s
WHERE s.categoria = 'lavanderia';

-- Repetir para cada categoría...
```

---

## 📝 Ventajas de la Solución Futura

✅ **No requiere acceso al código**
✅ **No requiere rebuild**
✅ **Cambios inmediatos**
✅ **Interface visual amigable**
✅ **Gestión completa desde el panel admin**
✅ **Histórico de cambios**
✅ **Multiidioma (preparado para futuro)**

---

## 🎯 Tiempo de Implementación Estimado

- **Backend endpoints:** ~2 horas
- **Frontend panel admin:** ~3 horas
- **Migración de datos:** ~30 minutos
- **Testing:** ~1 hora

**Total: ~6-7 horas**

---

## 📞 Contacto

Para implementar esta solución futura, contactar al equipo de desarrollo.

---

**Última actualización:** 2025-10-20
**Versión del documento:** 1.0
