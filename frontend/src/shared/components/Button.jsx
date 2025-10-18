/**
 * Componente Button reutilizable
 */
const Button = ({
  children,
  variant = 'primary',
  module = 'gestion',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  // Clases base
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Variantes de tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  // Variantes de estilo por módulo
  const variantClasses = {
    gestion: {
      primary: 'bg-gestion-primary-600 hover:bg-gestion-primary-700 text-white shadow-sm focus:ring-gestion-primary-500',
      secondary: 'bg-white hover:bg-gray-50 text-gestion-secondary-700 border border-gray-300 shadow-sm focus:ring-gestion-primary-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
      success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-green-500',
      ghost: 'hover:bg-gray-100 text-gray-700',
    },
    plataforma: {
      primary: 'bg-plataforma-primary-500 hover:bg-plataforma-primary-600 text-white shadow-medium transform hover:scale-105 focus:ring-plataforma-primary-400 rounded-xl',
      secondary: 'bg-white hover:bg-gray-50 text-plataforma-primary-600 border-2 border-plataforma-primary-500 transform hover:scale-105 rounded-xl',
      accent: 'bg-plataforma-accent-500 hover:bg-plataforma-accent-600 text-white shadow-medium transform hover:scale-105 focus:ring-plataforma-accent-400 rounded-xl',
      ghost: 'hover:bg-plataforma-primary-50 text-plataforma-primary-600',
    },
  }

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[module][variant]}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
