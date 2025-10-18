/**
 * Componente Badge reutilizable
 */
const Badge = ({ children, variant = 'info', className = '', ...props }) => {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  }

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}

export default Badge
