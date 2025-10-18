/**
 * Card minimalista para features/características - Diseño sobrio y elegante
 */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient = "from-plataforma-primary-500 to-plataforma-primary-600",
  delay = 0
}) => {
  return (
    <div className="group relative h-full">
      {/* Card principal minimalista */}
      <div className="relative bg-white rounded-2xl p-8 h-full
                      border border-gray-200
                      hover:border-plataforma-primary-300
                      transition-all duration-300 ease-out
                      hover:shadow-lg">

        {/* Contenido */}
        <div className="flex flex-col items-center text-center h-full">
          {/* Contenedor del icono simple */}
          <div className="mb-6">
            {/* Icono container con gradiente sutil */}
            <div className={`flex items-center justify-center w-16 h-16
                             bg-gradient-to-br ${gradient} rounded-xl
                             group-hover:scale-105
                             transition-transform duration-300`}>
              <Icon className="text-white" size={28} strokeWidth={2} />
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3
                         group-hover:text-plataforma-primary-700
                         transition-colors duration-300">
            {title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard
