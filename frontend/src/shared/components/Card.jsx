/**
 * Componente Card reutilizable
 */
const Card = ({ children, title, module = 'gestion', className = '', ...props }) => {
  const cardClasses = module === 'gestion' ? 'card-gestion' : 'card-plataforma'

  return (
    <div className={`${cardClasses} ${className}`} {...props}>
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${module === 'plataforma' ? 'font-display text-plataforma-primary-700' : 'text-gray-900'}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default Card
