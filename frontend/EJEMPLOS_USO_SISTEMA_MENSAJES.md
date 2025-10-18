# Sistema de Mensajes Mejorado - Guía de Uso

## ✅ Implementación Completada

Se implementó un sistema profesional de notificaciones con:
- **Toast Messages**: Notificaciones temporales con iconos y colores
- **Alert Component**: Alertas inline reutilizables
- **Mensajes estandarizados**: Librería centralizada de mensajes

---

## 📚 Ejemplos de Uso

### 1. Toast Messages (Notificaciones Temporales)

#### Importar
```javascript
import toastMessages from '@shared/utils/toastMessages'
```

#### Reservas
```javascript
// ✅ Crear reserva con éxito (con datos)
toastMessages.reservas.crear.success({
  codigo: 'RES-2024-001',
  huesped: 'Juan Pérez'
})
// Muestra: "Reserva RES-2024-001 creada para Juan Pérez"

// ✅ Crear reserva con éxito (sin datos)
toastMessages.reservas.crear.success()
// Muestra: "Reserva creada exitosamente"

// ❌ Error al crear
toastMessages.reservas.crear.error('La habitación ya está reservada')
// Muestra: "La habitación ya está reservada"

// 🔄 Actualizar reserva
toastMessages.reservas.actualizar.success({ codigo: 'RES-2024-001' })
// Muestra: "Reserva RES-2024-001 actualizada"

// ✅ Cambiar estado
toastMessages.reservas.cambiarEstado.success('confirmada')
// Muestra: "Reserva confirmada exitosamente"

toastMessages.reservas.cambiarEstado.success('completada')
// Muestra: "Check-out realizado exitosamente"

// 🗑️ Eliminar
toastMessages.reservas.eliminar.success()
// Muestra: "Reserva eliminada correctamente"

// ⚠️ Sin disponibilidad
toastMessages.reservas.disponibilidad.noDisponible('101', '15/10/2024', '20/10/2024')
// Muestra: "La habitación 101 no está disponible del 15/10/2024 al 20/10/2024"

// ❌ Validación de fechas
toastMessages.reservas.validacion.fechasInvalidas()
// Muestra: "La fecha de check-out debe ser posterior a la fecha de check-in"
```

#### Habitaciones
```javascript
// ✅ Crear habitación
toastMessages.habitaciones.crear.success('101')
// Muestra: "Habitación 101 creada exitosamente"

// ✅ Actualizar
toastMessages.habitaciones.actualizar.success('101')
// Muestra: "Habitación 101 actualizada"

// ❌ Error al cargar
toastMessages.habitaciones.cargar.error()
// Muestra: "Error al cargar las habitaciones"
```

#### Huéspedes
```javascript
// ✅ Registrar huésped
toastMessages.huespedes.crear.success('Juan Pérez')
// Muestra: "Huésped Juan Pérez registrado"

// ✅ Actualizar datos
toastMessages.huespedes.actualizar.success()
// Muestra: "Datos del huésped actualizados"
```

#### Usuarios
```javascript
// ✅ Crear usuario
toastMessages.usuarios.crear.success('maria@hotel.com')
// Muestra: "Usuario maria@hotel.com creado"

// 🗑️ Eliminar
toastMessages.usuarios.eliminar.success()
// Muestra: "Usuario eliminado correctamente"
```

#### Mensajes Genéricos
```javascript
// ✅ Éxito personalizado
toastMessages.generico.success('Configuración guardada')

// ❌ Error personalizado
toastMessages.generico.error('No se pudo conectar al servidor')

// ⚠️ Advertencia
toastMessages.generico.warning('El sistema se reiniciará en 5 minutos')

// ℹ️ Información
toastMessages.generico.info('Nueva actualización disponible')

// 🔄 Cargando
const loadingToast = toastMessages.generico.loading('Procesando pago...')
// Para cerrar: dismissToast(loadingToast)
```

---

### 2. Alert Component (Alertas Inline)

#### Importar
```javascript
import Alert from '@shared/components/Alert'
```

#### Ejemplos Básicos

```jsx
// ✅ Alerta de éxito
<Alert variant="success" title="¡Reserva confirmada!">
  La reserva RES-2024-001 ha sido confirmada exitosamente.
</Alert>

// ❌ Alerta de error
<Alert variant="error" title="Error al procesar">
  No se pudo completar la operación. Por favor intenta nuevamente.
</Alert>

// ⚠️ Alerta de advertencia
<Alert variant="warning" title="Atención">
  Esta habitación requiere mantenimiento urgente.
</Alert>

// ℹ️ Alerta informativa
<Alert variant="info" title="Información">
  El check-out es a las 12:00 PM.
</Alert>
```

#### Con botón de cerrar

```jsx
const [showAlert, setShowAlert] = useState(true)

{showAlert && (
  <Alert
    variant="success"
    title="Operación exitosa"
    onClose={() => setShowAlert(false)}
  >
    Los cambios se guardaron correctamente.
  </Alert>
)}
```

#### Con acciones personalizadas

```jsx
<Alert
  variant="warning"
  title="Reserva sin confirmar"
  actions={
    <>
      <button
        onClick={handleConfirmar}
        className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
      >
        Confirmar ahora
      </button>
      <button
        onClick={handleCancelar}
        className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
      >
        Cancelar
      </button>
    </>
  }
>
  Esta reserva lleva 24 horas sin confirmación.
</Alert>
```

#### Con icono personalizado

```jsx
import { Calendar } from 'lucide-react'

<Alert
  variant="info"
  title="Próximo check-out"
  icon={Calendar}
>
  3 huéspedes harán check-out hoy.
</Alert>
```

---

### 3. Uso en Formularios

#### Mostrar errores de validación

```jsx
const [formErrors, setFormErrors] = useState([])

// Al enviar el formulario
try {
  await reservasService.crear(data)
  toastMessages.reservas.crear.success()
} catch (error) {
  if (error.response?.data?.errors) {
    setFormErrors(error.response.data.errors)
  } else {
    toastMessages.reservas.crear.error(error.response?.data?.message)
  }
}

// En el JSX
{formErrors.length > 0 && (
  <Alert variant="error" title="Errores de validación" onClose={() => setFormErrors([])}>
    <ul className="list-disc list-inside space-y-1">
      {formErrors.map((err, idx) => (
        <li key={idx}>{err.message}</li>
      ))}
    </ul>
  </Alert>
)}
```

---

### 4. Uso en Modales de Confirmación

```jsx
const handleEliminar = () => {
  toastMessages.reservas.eliminar.confirm() // ⚠️ Advertencia
  setShowDeleteModal(true)
}

const confirmarEliminacion = async () => {
  try {
    await reservasService.eliminar(id)
    toastMessages.reservas.eliminar.success() // ✅ Éxito
    setShowDeleteModal(false)
  } catch (error) {
    toastMessages.reservas.eliminar.error() // ❌ Error
  }
}
```

---

### 5. Cerrar Toasts Manualmente

```javascript
import { dismissToast, dismissAllToasts } from '@shared/utils/toastMessages'

// Cerrar un toast específico
const toastId = toastMessages.generico.loading('Procesando...')
// ... hacer algo
dismissToast(toastId)

// Cerrar todos los toasts
dismissAllToasts()
```

---

## 🎨 Personalización de Duraciones

Los toasts tienen duraciones predefinidas:
- **Success**: 3-4 segundos
- **Error**: 4-5 segundos
- **Warning**: 4 segundos
- **Info**: 3 segundos
- **Loading**: Infinito (manual dismiss)

---

## 📦 Archivos Creados

1. **`frontend/src/shared/utils/toastMessages.js`**
   - Sistema centralizado de mensajes
   - Funciones helper para todos los módulos

2. **`frontend/src/shared/components/Alert.jsx`**
   - Componente reutilizable de alertas inline
   - 4 variantes: success, error, warning, info

3. **Archivos Actualizados:**
   - `frontend/src/modules/gestion/pages/ReservasPage.jsx`
   - `frontend/src/modules/gestion/pages/HistorialReservasPage.jsx`

---

## ✨ Beneficios

✅ **Mensajes consistentes** - Mismo estilo en toda la app
✅ **Fácil mantenimiento** - Cambios centralizados
✅ **Mejor UX** - Mensajes claros y descriptivos
✅ **Tipado implícito** - Menos errores de escritura
✅ **Extensible** - Fácil agregar nuevos mensajes
✅ **Sin datos inventados** - Solo usa datos reales del backend

---

## 🔧 Agregar Nuevos Mensajes

Para agregar mensajes de un nuevo módulo:

```javascript
// En toastMessages.js

const miNuevoModulo = {
  crear: {
    success: (data) => createToast('success', `Item ${data.id} creado`, CheckCircle, 3000),
    error: () => createToast('error', 'Error al crear item', XCircle, 4000)
  },
  // ... más acciones
}

export const toastMessages = {
  reservas,
  habitaciones,
  huespedes,
  usuarios,
  solicitudes,
  miNuevoModulo, // ← Agregar aquí
  generico
}
```

---

## 🎯 Mejores Prácticas

1. **Usa mensajes específicos** en lugar de genéricos siempre que sea posible
2. **Incluye datos relevantes** (códigos, nombres) cuando estén disponibles
3. **Usa Alert para errores persistentes** que el usuario debe leer
4. **Usa Toast para confirmaciones rápidas** de acciones exitosas
5. **No abuses de las notificaciones** - solo para acciones importantes

---

**Sistema implementado con precisión quirúrgica - Sin datos inventados ✅**
