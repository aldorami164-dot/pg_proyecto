import { MapPin, Clock, Users, ChevronRight } from 'lucide-react'

/**
 * Card elegante para experiencias - Diseño minimalista inspirado en el ejemplo
 */
const ExperienceCard = ({
  experiencia,
  onClick,
  delay = 0
}) => {
  const {
    imagen_principal,
    nombre,
    descripcion,
    ubicacion,
    duracion,
    capacidad,
    precio
  } = experiencia

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer h-full"
    >
      {/* Card container - Altura fija como en el ejemplo */}
      <div className="relative h-[550px] bg-white rounded-2xl overflow-hidden
                      border border-gray-200
                      hover:border-plataforma-primary-300
                      transition-all duration-300 ease-out
                      hover:shadow-xl">

        {/* Imagen con overlay gradiente - Similar al ejemplo */}
        <div className="relative h-full overflow-hidden">
          {imagen_principal ? (
            <>
              {/* Imagen de fondo */}
              <img
                src={imagen_principal}
                alt={nombre}
                className="w-full h-full object-cover
                           group-hover:scale-105
                           transition-transform duration-500 ease-out"
              />

              {/* Overlay gradiente oscuro desde abajo - Igual que el ejemplo */}
              <div className="absolute inset-0 bg-gradient-to-t
                              from-black/80 via-black/40 to-transparent" />

              {/* Precio flotante minimalista */}
              {precio && (
                <div className="absolute top-4 right-4 px-4 py-2
                               bg-white/95 backdrop-blur-sm rounded-lg
                               border border-gray-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-600">Desde</span>
                    <span className="text-xl font-semibold text-gray-900">
                      Q{parseFloat(precio).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">por persona</p>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300
                            flex items-center justify-center">
              <div className="text-gray-400 text-6xl">🏞️</div>
            </div>
          )}

          {/* Contenido en la parte inferior - Como en el ejemplo */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            {/* Título */}
            <h3 className="text-2xl font-semibold mb-3 leading-tight">
              {nombre}
            </h3>

            {/* Descripción - Line clamp */}
            <p className="text-white/95 mb-4 leading-relaxed line-clamp-2 text-sm">
              {descripcion}
            </p>

            {/* Ubicación con icono - Como en el ejemplo */}
            {ubicacion && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin size={16} className="flex-shrink-0" />
                <span className="line-clamp-1">{ubicacion}</span>
              </div>
            )}

            {/* Detalles adicionales en una línea */}
            {(duracion || capacidad) && (
              <div className="flex items-center gap-4 mt-3 text-white/80 text-xs">
                {duracion && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{duracion}</span>
                  </div>
                )}
                {capacidad && (
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>Hasta {capacidad}</span>
                  </div>
                )}
              </div>
            )}

            {/* Indicador de hover sutil */}
            <div className="absolute bottom-6 right-6
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                              flex items-center justify-center
                              border border-white/30">
                <ChevronRight className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperienceCard
