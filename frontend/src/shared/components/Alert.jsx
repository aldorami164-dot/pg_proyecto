import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * Componente Alert reutilizable con variantes
 * Uso:
 * <Alert variant="success" title="Éxito">Reserva creada</Alert>
 * <Alert variant="error" onClose={() => {}}>Error al guardar</Alert>
 */

const Alert = ({
  variant = 'info', // 'success' | 'error' | 'warning' | 'info'
  title,
  children,
  onClose,
  className = '',
  icon: CustomIcon,
  actions
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-400 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-900'
    },
    error: {
      container: 'bg-red-50 border-red-400 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900'
    },
    info: {
      container: 'bg-blue-50 border-blue-400 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900'
    }
  }

  const config = variants[variant] || variants.info
  const IconComponent = CustomIcon || config.icon

  return (
    <div className={`border-l-4 p-4 rounded-r ${config.container} ${className}`} role="alert">
      <div className="flex items-start">
        {/* Icono */}
        <div className="flex-shrink-0">
          <IconComponent className={`${config.iconColor} w-5 h-5`} />
        </div>

        {/* Contenido */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}

          {/* Acciones opcionales */}
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${config.iconColor} hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
