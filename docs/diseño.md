# 🎨 REDISEÑO MÓDULO GESTIÓN HOTELERA - RUTA DE TRABAJO

**Objetivo**: Transformar el diseño actual a un estilo corporativo minimalista con tonalidades grises, manteniendo todas las funcionalidades intactas.

**Regla de oro**: ❌ NO ROMPER FUNCIONALIDADES - ✅ SOLO CAMBIAR DISEÑO VISUAL

---

## 📋 PRINCIPIOS DE DISEÑO

### **Paleta de Colores Nueva**
- **Grises dominantes**: slate-50 a slate-900
- **Acentos sutiles**:
  - Azul corporativo para acciones principales (slate-700, slate-600)
  - Estados con grises + ligero color:
    - ✅ Éxito: Verde suave (emerald-600) - solo para confirmaciones
    - ⚠️ Advertencia: Amarillo/Ámbar suave (amber-600) - solo para pendientes
    - ❌ Error/Peligro: Rojo suave (rose-600) - solo para eliminaciones
    - ℹ️ Info: Azul gris (slate-600) - para información neutra

### **Iconografía**
- Tamaño estándar de iconos de acción: `size={20}` (antes eran 18px)
- Iconos de header/cards: `size={24}`
- Colores: Escala de grises con hover en color sutil

### **Tipografía**
- Headers: Más espaciado, font-semibold o font-bold
- Body: text-gray-700 para lectura
- Labels: text-gray-600

### **Sistema de Notificaciones (Toast)**
**Problema actual**: Los mensajes muestran "localhost dice: Error" o son muy genéricos

**Nueva estrategia**:
- ✅ **Éxito**: Mensajes específicos y claros
  - Ejemplo: "✓ Reserva #123 creada exitosamente"
  - Color: Verde suave con ícono de check

- ❌ **Error**: Mensajes descriptivos que ayuden al usuario
  - Ejemplo: "✗ Error al crear reserva: El campo 'Email' es requerido"
  - Color: Rojo suave con ícono de alerta
  - Mostrar detalles del error del backend

- ⚠️ **Advertencia**: Para acciones que requieren confirmación
  - Ejemplo: "⚠ Esta acción no se puede deshacer"
  - Color: Amarillo/ámbar con ícono de advertencia

- ℹ️ **Información**: Para feedback neutro
  - Ejemplo: "ℹ Buscando habitaciones disponibles..."
  - Color: Azul gris con ícono de info

**Ubicación**: Toast en esquina superior derecha (ya implementado con react-hot-toast)

**Duración**:
- Éxito: 3 segundos
- Error: 5 segundos (más tiempo para leer)
- Advertencia: 4 segundos
- Info: 2 segundos

---

## 🗺️ FASES DE IMPLEMENTACIÓN

### ✅ **FASE 0: PREPARACIÓN**
- [x] Análisis del código actual
- [x] Definición de ruta de trabajo
- [x] Creación de archivo diseño.md
- [ ] **INICIO DE FASE 1**

---

### **FASE 1: DASHBOARD PRINCIPAL** (`DashboardPage.jsx`)

**Archivos a modificar**:
- `frontend/src/modules/gestion/pages/DashboardPage.jsx`

#### Tareas específicas:

#### ✅ 1.1 Header de Bienvenida
- [x] Eliminar gradiente azul brillante (`from-gestion-primary-600 to-gestion-primary-700`)
- [x] Cambiar a fondo gris claro con borde sutil (`bg-white border border-gray-200`)
- [x] Texto en gris oscuro en lugar de blanco (`text-gray-900`)
- [x] Indicador de conexión más sutil
- [x] **Validar**: El nombre del usuario y estado de conexión siguen visibles ✅

#### ✅ 1.2 Cards de Estadísticas (Grid de 4)
- [x] Cambiar colores de fondo de iconos de brillantes a sutiles:
  - Reservas: `bg-blue-100` → `bg-slate-100`, icono `text-slate-600`
  - Disponibles: `bg-green-100` → `bg-emerald-50`, icono `text-emerald-600`
  - Solicitudes: `bg-yellow-100` → `bg-amber-50`, icono `text-amber-600`
  - Ocupación: `bg-purple-100` → `bg-slate-100`, icono `text-slate-600`
- [x] Sombras más sutiles: `shadow-soft` en lugar de `shadow-medium`
- [x] Aumentar tamaño de iconos: `size={24}` → `size={28}`
- [x] **Validar**: Los números y labels siguen correctos, hover sigue funcionando ✅

#### ✅ 1.3 Check-ins y Check-outs de Hoy
- [x] Cambiar fondo de items:
  - Check-in: `bg-green-50 border-green-200` → `bg-emerald-50 border-emerald-200`
  - Check-out: `bg-blue-50 border-blue-200` → `bg-slate-100 border-slate-300`
- [x] Ajustar badges para usar nuevos colores sutiles
- [x] **Validar**: Los check-ins/outs siguen mostrando datos correctos ✅

#### ✅ 1.4 Estado de Habitaciones (Grid de 3)
- [x] Cambiar fondos:
  - Disponibles: `bg-green-50` → `bg-slate-50`
  - Ocupadas: `bg-red-50` → `bg-slate-100`
  - Ocupación: `bg-purple-50` → `bg-slate-50`
- [x] Iconos más grandes: `size={32}` → `size={36}` con `strokeWidth={2}`
- [x] Colores de texto más sutiles (grises con ligero tinte)
- [x] **Validar**: Los números de habitaciones siguen correctos ✅

#### ✅ 1.5 Información del Sistema
- [x] Mantener estructura pero mejorar espaciado
- [x] Badges más sutiles en colores
- [x] Bordes y fondos más sutiles
- [x] **Validar**: Info de usuario y sistema siguen visibles ✅

**Criterios de aceptación FASE 1**:
- ✅ Dashboard se ve limpio y profesional
- ✅ Todas las estadísticas siguen actualizándose
- ✅ WebSocket sigue funcionando
- ✅ Check-ins/outs se muestran correctamente
- ✅ No hay errores en consola

**FASE 1 COMPLETADA** ✅ - 2025-01-14

---

### **FASE 2: RESERVAS** (`ReservasPage.jsx`)

**Archivos a modificar**:
- `frontend/src/modules/gestion/pages/ReservasPage.jsx`

#### Tareas específicas:

#### ✅ 2.1 Header de Página
- [ ] Título y descripción con mejor espaciado
- [ ] Botón "Nueva Reserva" con estilo más sutil
- [ ] **Validar**: Botón abre el modal correctamente

#### ✅ 2.2 Sección de Filtros
- [ ] Card de filtros con borde sutil
- [ ] Inputs y selects con estilos consistentes
- [ ] **Validar**: Todos los filtros funcionan (estado, canal, habitación, búsqueda)

#### ✅ 2.3 Tabla de Reservas
- [ ] Badges de estado con colores grises sutiles:
  - Pendiente: amber-100 con texto amber-700
  - Confirmada: emerald-100 con texto emerald-700
  - Completada: slate-100 con texto slate-700
  - Cancelada: rose-100 con texto rose-700
- [ ] **Validar**: Datos de reservas se muestran correctamente

#### ✅ 2.4 Iconos de Acciones
- [ ] Aumentar tamaño: `size={18}` → `size={20}`
- [ ] Colores más sutiles:
  - Ver (Eye): `text-slate-600 hover:text-slate-800`
  - Editar (Edit): `text-slate-600 hover:text-slate-800`
  - Confirmar (CheckCircle): `text-emerald-600 hover:text-emerald-700`
  - Cancelar (XCircle): `text-rose-600 hover:text-rose-700`
  - Completar: `text-slate-600 hover:text-slate-800`
- [ ] **Validar**: Todos los botones ejecutan sus acciones correctamente

#### ✅ 2.5 Modal de Crear/Editar
- [ ] Mantener funcionalidad pero mejorar espaciado
- [ ] Pasos con colores más sutiles
- [ ] Alertas con colores grises + ligero tinte
- [ ] **Validar**: Crear y editar reservas funciona correctamente

#### ✅ 2.6 Modal de Detalles
- [ ] Mejorar legibilidad con espaciado
- [ ] Badges con nuevos colores
- [ ] **Validar**: Todos los datos se muestran correctamente

**Criterios de aceptación FASE 2**:
- ✅ Reservas se listan correctamente
- ✅ Filtros funcionan
- ✅ Crear nueva reserva funciona
- ✅ Editar reserva funciona
- ✅ Cambiar estados funciona
- ✅ Ver detalles funciona
- ✅ No hay errores en consola

---

### **FASE 3: HABITACIONES** (`HabitacionesPage.jsx`)

**Archivos a modificar**:
- `frontend/src/modules/gestion/pages/HabitacionesPage.jsx`

#### Tareas específicas:

#### ✅ 3.1 Grid de Habitaciones
- [ ] Cards con sombras sutiles
- [ ] Badges de estado con nuevos colores
- [ ] Iconos más grandes y sutiles
- [ ] **Validar**: Habitaciones se muestran con datos correctos

#### ✅ 3.2 Acciones
- [ ] Iconos de editar/eliminar más grandes (`size={20}`)
- [ ] Colores sutiles para acciones
- [ ] **Validar**: Editar y eliminar funcionan

#### ✅ 3.3 Modal de Crear/Editar
- [ ] Formulario con estilos consistentes
- [ ] **Validar**: CRUD de habitaciones funciona completamente

**Criterios de aceptación FASE 3**:
- ✅ Habitaciones se listan correctamente
- ✅ Crear habitación funciona
- ✅ Editar habitación funciona
- ✅ Eliminar habitación funciona (con confirmación)
- ✅ Estados se actualizan correctamente
- ✅ No hay errores en consola

---

### **FASE 4: OTRAS PÁGINAS**

#### 4.1 Huéspedes (`HuespedesPage.jsx`)
- [ ] Aplicar mismo patrón de colores y espaciado
- [ ] **Validar**: CRUD de huéspedes funciona

#### 4.2 Solicitudes (`SolicitudesPage.jsx`)
- [ ] Badges de estado con nuevos colores
- [ ] Iconos de acciones sutiles
- [ ] **Validar**: Gestión de solicitudes funciona

#### 4.3 Usuarios (`UsuariosPage.jsx`)
- [ ] Aplicar diseño consistente
- [ ] **Validar**: Gestión de usuarios (admin) funciona

#### 4.4 Historial de Reservas (`HistorialReservasPage.jsx`)
- [ ] Tabla con estilos sutiles
- [ ] **Validar**: Historial se muestra correctamente

#### 4.5 Reportes (`ReportesPage.jsx`)
- [ ] Mantener funcionalidad, mejorar visuales
- [ ] **Validar**: Reportes se generan correctamente

#### 4.6 Códigos QR (`CodigosQRPage.jsx`)
- [ ] Diseño limpio y funcional
- [ ] **Validar**: Generación de QR funciona

#### 4.7 Galería (`GaleriaPage.jsx`)
- [ ] Grid limpio y espaciado
- [ ] **Validar**: Upload y gestión de imágenes funciona

**Criterios de aceptación FASE 4**:
- ✅ Todas las páginas tienen diseño consistente
- ✅ Todas las funcionalidades intactas
- ✅ No hay errores en consola

---

### **FASE 5: SISTEMA DE NOTIFICACIONES Y MENSAJES**

**Archivos a modificar**:
- Todas las páginas que usen `toast.error()`, `toast.success()`, etc.
- Configuración de react-hot-toast (si existe archivo de config)

#### Tareas específicas:

#### ✅ 5.1 Mejorar Mensajes de Éxito
- [ ] Reservas creadas: Incluir ID de reserva
- [ ] Habitaciones creadas: Incluir número de habitación
- [ ] Estados actualizados: Incluir nuevo estado
- [ ] Usar formato: "✓ [Acción] [Entidad] #[ID] [resultado]"
- [ ] **Validar**: Los mensajes se muestran correctamente

#### ✅ 5.2 Mejorar Mensajes de Error
- [ ] Capturar errores específicos del backend
- [ ] Mostrar errores de validación campo por campo
- [ ] Ejemplo: Si falta email → "✗ El campo 'Email del huésped' es requerido"
- [ ] Si hay múltiples errores → Mostrarlos en lista
- [ ] Evitar mensajes genéricos tipo "Error al guardar"
- [ ] **Validar**: Los errores son claros y útiles

#### ✅ 5.3 Agregar Mensajes de Confirmación
- [ ] Antes de eliminar: Modal de confirmación con advertencia clara
- [ ] Antes de cancelar reserva: Confirmar acción
- [ ] Usar toast.promise() para operaciones largas
- [ ] **Validar**: Las confirmaciones previenen errores accidentales

#### ✅ 5.4 Mensajes de Carga/Loading
- [ ] "Cargando reservas..." → "Buscando reservas activas..."
- [ ] "Guardando..." → "Creando reserva..."
- [ ] Usar toast.loading() con mensajes específicos
- [ ] **Validar**: El usuario sabe qué está pasando en todo momento

#### ✅ 5.5 Configurar Toast Styling
- [ ] Configurar react-hot-toast con estilos corporativos
- [ ] Colores consistentes con paleta gris
- [ ] Posición: top-right
- [ ] Duración según tipo de mensaje
- [ ] **Validar**: Los toasts se ven profesionales y legibles

**Ejemplos de mejoras específicas**:

**ANTES**:
```javascript
toast.error('Error al crear la reserva')
```

**DESPUÉS**:
```javascript
// Capturar error específico del backend
if (error.response?.data?.errors) {
  const errores = error.response.data.errors
    .map(e => `• ${e.field}: ${e.message}`)
    .join('\n')
  toast.error(`✗ No se pudo crear la reserva:\n${errores}`, {
    duration: 5000,
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    }
  })
} else {
  toast.error(`✗ Error al crear reserva: ${error.response?.data?.message || 'Error desconocido'}`)
}
```

**Criterios de aceptación FASE 5**:
- ✅ Todos los mensajes son específicos y útiles
- ✅ Los errores muestran qué campo tiene problema
- ✅ Los éxitos incluyen IDs o referencias
- ✅ No más mensajes "localhost dice..."
- ✅ Confirmaciones antes de acciones destructivas
- ✅ Toasts con estilo corporativo consistente

---

### **FASE 6: COMPONENTES COMPARTIDOS**

**Archivos a modificar**:
- `frontend/src/shared/components/Badge.jsx`
- `frontend/src/shared/components/Button.jsx`
- `frontend/src/shared/components/Card.jsx`
- `frontend/src/shared/components/Modal.jsx`
- `frontend/src/shared/components/Table.jsx`

#### ✅ 6.1 Badge Component
- [ ] Refinar variantes con nuevos colores:
  - success: emerald suave
  - warning: amber suave
  - danger: rose suave
  - info: slate
- [ ] **Validar**: Badges se usan correctamente en todo el sistema

#### ✅ 6.2 Button Component
- [ ] Variantes con colores más sutiles
- [ ] Hover effects más profesionales
- [ ] **Validar**: Botones funcionan en todas las páginas

#### ✅ 6.3 Card Component
- [ ] Sombras más sutiles por defecto
- [ ] Bordes más delgados
- [ ] **Validar**: Cards se renderizan correctamente

#### ✅ 6.4 Modal Component
- [ ] Mantener funcionalidad, mejorar overlay y animaciones
- [ ] **Validar**: Modals abren/cierran correctamente

#### ✅ 6.5 Table Component
- [ ] Headers con fondo gris claro
- [ ] Hover en filas más sutil
- [ ] **Validar**: Tablas muestran datos correctamente

**Criterios de aceptación FASE 6**:
- ✅ Componentes tienen diseño consistente
- ✅ Todos los componentes funcionan en todas las páginas
- ✅ No hay regresiones visuales
- ✅ No hay errores en consola

---

### **FASE 7: REVISIÓN FINAL Y PULIDO**

#### 7.1 Auditoría Visual Completa
- [ ] Revisar todas las páginas una por una
- [ ] Verificar consistencia de colores
- [ ] Verificar consistencia de espaciado
- [ ] Verificar consistencia de tipografía

#### 7.2 Auditoría Funcional
- [ ] Probar todos los flujos CRUD
- [ ] Probar todos los filtros y búsquedas
- [ ] Probar todos los modals
- [ ] Probar WebSocket y notificaciones
- [ ] Probar responsive en mobile/tablet

#### 7.3 Performance
- [ ] Verificar que no hay re-renders innecesarios
- [ ] Verificar que las animaciones son fluidas
- [ ] Verificar que no hay console.errors

#### 7.4 Documentación
- [ ] Actualizar comentarios en componentes modificados
- [ ] Marcar todas las tareas completadas en este archivo

**Criterios de aceptación FASE 6**:
- ✅ Todo el módulo tiene diseño corporativo consistente
- ✅ Cero funcionalidades rotas
- ✅ Cero errores en consola
- ✅ Performance óptimo
- ✅ Listo para producción

---

## 📊 PROGRESO GENERAL

**Total de Fases**: 7
**Fases Completadas**: 0/7

### Estado por Fase:
- [ ] FASE 0: Preparación
- [ ] FASE 1: Dashboard Principal
- [ ] FASE 2: Reservas
- [ ] FASE 3: Habitaciones
- [ ] FASE 4: Otras Páginas
- [ ] FASE 5: Sistema de Notificaciones y Mensajes ⭐ **NUEVO**
- [ ] FASE 6: Componentes Compartidos
- [ ] FASE 7: Revisión Final

---

## ⚠️ NOTAS IMPORTANTES

1. **Antes de cada cambio**: Leer el código para entender la funcionalidad
2. **Después de cada cambio**: Validar que la funcionalidad sigue operando
3. **Si algo se rompe**: Revertir inmediatamente y analizar
4. **Comunicación**: Marcar cada tarea completada y reportar al usuario antes de continuar a la siguiente fase
5. **No asumir**: Si algo no está claro, preguntar antes de modificar

---

## 🎯 SIGUIENTE PASO

**Acción inmediata**: Esperar confirmación del usuario para iniciar FASE 1 - Dashboard Principal

Una vez confirmado, modificaremos `DashboardPage.jsx` siguiendo las tareas 1.1 a 1.5 y validaremos cada cambio.

---

**Fecha de inicio**: 2025-01-14
**Última actualización**: 2025-01-14
**Responsable**: Claude Code
**Aprobado por**: Usuario
