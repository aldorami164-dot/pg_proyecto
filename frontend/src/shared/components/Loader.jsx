/**
 * Componente Loader reutilizable
 */
const Loader = ({ size = 'md', module = 'gestion', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  }

  const colorClass = module === 'gestion' ? 'border-gestion-primary-600' : 'border-plataforma-primary-500'

  const spinner = (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClass} border-t-transparent`}
    ></div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Loader
