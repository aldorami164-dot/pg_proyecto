import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, Calendar, User, Home, Trash2 } from 'lucide-react'

/**
 * Sistema de mensajes estandarizados para toda la aplicación
 * Uso: toastMessages.reservas.crear.success({ codigo: 'RES-001', huesped: 'Juan Pérez' })
 */

// Función helper para crear toast con icono
const createToast = (type, message, icon, duration = 4000) => {
  const config = {
    duration,
    style: {
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
    },
    iconTheme: {
      primary: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6',
      secondary: '#ffffff',
    },
  }

  switch (type) {
    case 'success':
      return toast.success(message, config)
    case 'error':
      return toast.error(message, config)
    case 'warning':
      return toast(message, { ...config, icon: '⚠️' })
    case 'info':
      return toast(message, { ...config, icon: 'ℹ️' })
    case 'loading':
      return toast.loading(message, config)
    default:
      return toast(message, config)
  }
}

// Mensajes para Reservas
const reservas = {
  crear: {
    success: (data = {}) => {
      const mensaje = data.codigo && data.huesped
        ? `Reserva ${data.codigo} creada para ${data.huesped}`
        : 'Reserva creada exitosamente'
      return createToast('success', mensaje, CheckCircle, 4000)
    },
    error: (mensaje = 'Error al crear la reserva') => {
      return createToast('error', mensaje, XCircle, 5000)
    },
    loading: () => {
      return createToast('loading', 'Creando reserva...', null, Infinity)
    }
  },
  actualizar: {
    success: (data = {}) => {
      const mensaje = data.codigo
        ? `Reserva ${data.codigo} actualizada`
        : 'Reserva actualizada exitosamente'
      return createToast('success', mensaje, CheckCircle, 3000)
    },
    error: (mensaje = 'Error al actualizar la reserva') => {
      return createToast('error', mensaje, XCircle, 5000)
    }
  },
  cambiarEstado: {
    success: (estado) => {
      const mensajes = {
        confirmada: 'Reserva confirmada exitosamente',
        completada: 'Check-out realizado exitosamente',
        cancelada: 'Reserva cancelada'
      }
      return createToast('success', mensajes[estado] || 'Estado actualizado', CheckCircle, 3000)
    },
    error: () => {
      return createToast('error', 'Error al cambiar el estado de la reserva', XCircle, 5000)
    }
  },
  eliminar: {
    success: () => {
      return createToast('success', 'Reserva eliminada correctamente', Trash2, 3000)
    },
    error: () => {
      return createToast('error', 'Error al eliminar la reserva', XCircle, 5000)
    },
    confirm: () => {
      return createToast('warning', 'Esta acción no se puede deshacer', AlertTriangle, 4000)
    }
  },
  cargar: {
    error: () => {
      return createToast('error', 'Error al cargar las reservas', XCircle, 4000)
    }
  },
  disponibilidad: {
    error: () => {
      return createToast('error', 'Error al verificar disponibilidad de habitaciones', XCircle, 5000)
    },
    noDisponible: (habitacion, fechaIn, fechaOut) => {
      const mensaje = habitacion
        ? `La habitación ${habitacion} no está disponible del ${fechaIn} al ${fechaOut}`
        : 'No hay habitaciones disponibles para estas fechas'
      return createToast('warning', mensaje, AlertTriangle, 5000)
    }
  },
  validacion: {
    fechasInvalidas: () => {
      return createToast('error', 'La fecha de check-out debe ser posterior a la fecha de check-in', XCircle, 4000)
    },
    camposRequeridos: () => {
      return createToast('error', 'Por favor completa todos los campos requeridos', XCircle, 4000)
    }
  }
}

// Mensajes para Habitaciones
const habitaciones = {
  crear: {
    success: (numero) => {
      const mensaje = numero
        ? `Habitación ${numero} creada exitosamente`
        : 'Habitación creada exitosamente'
      return createToast('success', mensaje, Home, 3000)
    },
    error: () => {
      return createToast('error', 'Error al crear la habitación', XCircle, 4000)
    }
  },
  actualizar: {
    success: (numero) => {
      const mensaje = numero
        ? `Habitación ${numero} actualizada`
        : 'Habitación actualizada exitosamente'
      return createToast('success', mensaje, CheckCircle, 3000)
    },
    error: () => {
      return createToast('error', 'Error al actualizar la habitación', XCircle, 4000)
    }
  },
  eliminar: {
    success: () => {
      return createToast('success', 'Habitación eliminada correctamente', Trash2, 3000)
    },
    error: () => {
      return createToast('error', 'Error al eliminar la habitación', XCircle, 4000)
    }
  },
  cargar: {
    error: () => {
      return createToast('error', 'Error al cargar las habitaciones', XCircle, 4000)
    }
  }
}

// Mensajes para Huéspedes
const huespedes = {
  crear: {
    success: (nombre) => {
      const mensaje = nombre
        ? `Huésped ${nombre} registrado`
        : 'Huésped registrado exitosamente'
      return createToast('success', mensaje, User, 3000)
    },
    error: () => {
      return createToast('error', 'Error al registrar el huésped', XCircle, 4000)
    }
  },
  actualizar: {
    success: () => {
      return createToast('success', 'Datos del huésped actualizados', CheckCircle, 3000)
    },
    error: () => {
      return createToast('error', 'Error al actualizar el huésped', XCircle, 4000)
    }
  },
  cargar: {
    error: () => {
      return createToast('error', 'Error al cargar los huéspedes', XCircle, 4000)
    }
  }
}

// Mensajes para Usuarios
const usuarios = {
  crear: {
    success: (nombre) => {
      const mensaje = nombre
        ? `Usuario ${nombre} creado`
        : 'Usuario creado exitosamente'
      return createToast('success', mensaje, User, 3000)
    },
    error: () => {
      return createToast('error', 'Error al crear el usuario', XCircle, 4000)
    }
  },
  actualizar: {
    success: () => {
      return createToast('success', 'Usuario actualizado exitosamente', CheckCircle, 3000)
    },
    error: () => {
      return createToast('error', 'Error al actualizar el usuario', XCircle, 4000)
    }
  },
  eliminar: {
    success: () => {
      return createToast('success', 'Usuario eliminado correctamente', Trash2, 3000)
    },
    error: () => {
      return createToast('error', 'Error al eliminar el usuario', XCircle, 4000)
    }
  },
  cargar: {
    error: () => {
      return createToast('error', 'Error al cargar los usuarios', XCircle, 4000)
    }
  }
}

// Mensajes para Solicitudes
const solicitudes = {
  cargar: {
    error: () => {
      return createToast('error', 'Error al cargar las solicitudes', XCircle, 4000)
    }
  },
  actualizar: {
    success: () => {
      return createToast('success', 'Estado de solicitud actualizado', CheckCircle, 3000)
    },
    error: () => {
      return createToast('error', 'Error al actualizar la solicitud', XCircle, 4000)
    }
  }
}

// Mensajes Genéricos
const generico = {
  success: (mensaje = 'Operación exitosa') => {
    return createToast('success', mensaje, CheckCircle, 3000)
  },
  error: (mensaje = 'Ocurrió un error') => {
    return createToast('error', mensaje, XCircle, 4000)
  },
  warning: (mensaje) => {
    return createToast('warning', mensaje, AlertTriangle, 4000)
  },
  info: (mensaje) => {
    return createToast('info', mensaje, Info, 3000)
  },
  loading: (mensaje = 'Cargando...') => {
    return createToast('loading', mensaje, null, Infinity)
  }
}

// Exportar todo el sistema de mensajes
export const toastMessages = {
  reservas,
  habitaciones,
  huespedes,
  usuarios,
  solicitudes,
  generico
}

// Helper para cerrar un toast específico
export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

// Helper para cerrar todos los toasts
export const dismissAllToasts = () => {
  toast.dismiss()
}

export default toastMessages
