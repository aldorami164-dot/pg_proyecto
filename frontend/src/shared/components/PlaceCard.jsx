import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react'

/**
 * Card elegante para lugares turísticos - Imagen full como ExperienceCard
 */
const PlaceCard = ({ lugar, onClick, delay = 0 }) => {
  const {
    imagen_principal,
    nombre,
    descripcion,
    ubicacion,
    horario,
    telefono,
    precio_entrada,
    categoria
  } = lugar

  const getCategoriaColor = (cat) => {
    const colores = {
      cultura: 'bg-purple-500',
      naturaleza: 'bg-green-500',
      gastronomia: 'bg-orange-500',
      aventura: 'bg-blue-500'
    }
    return colores[cat] || 'bg-gray-500'
  }

  const esGratis = !precio_entrada || parseFloat(precio_entrada) === 0

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer h-full"
    >
      {/* Card container - Altura fija */}
      <div className="relative h-[550px] bg-white rounded-2xl overflow-hidden
                      border border-gray-200
                      hover:border-plataforma-primary-300
                      transition-all duration-300 ease-out
                      hover:shadow-xl">

        {/* Imagen con overlay gradiente */}
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

              {/* Overlay gradiente oscuro desde abajo */}
              <div className="absolute inset-0 bg-gradient-to-t
                              from-black/80 via-black/40 to-transparent" />

              {/* Badge de categoría flotante */}
              {categoria && (
                <div className="absolute top-4 right-4">
                  <span className={`${getCategoriaColor(categoria)} text-white px-3 py-1.5
                                    rounded-full text-sm font-semibold capitalize shadow-lg`}>
                    {categoria}
                  </span>
                </div>
              )}

              {/* Precio flotante minimalista */}
              <div className="absolute top-4 left-4 px-4 py-2
                             bg-white/95 backdrop-blur-sm rounded-lg
                             border border-gray-200">
                {esGratis ? (
                  <div className="text-center">
                    <span className="text-lg font-bold text-green-600">GRATIS</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold text-gray-900">
                      Q{parseFloat(precio_entrada).toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500">entrada</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300
                            flex items-center justify-center">
              <div className="text-gray-400 text-6xl">📍</div>
            </div>
          )}

          {/* Contenido en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            {/* Título */}
            <h3 className="text-2xl font-semibold mb-3 leading-tight">
              {nombre}
            </h3>

            {/* Descripción - Line clamp */}
            <p className="text-white/95 mb-4 leading-relaxed line-clamp-2 text-sm">
              {descripcion}
            </p>

            {/* Detalles en lista vertical */}
            <div className="space-y-2 mb-3">
              {ubicacion && (
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="line-clamp-1">{ubicacion}</span>
                </div>
              )}

              {horario && (
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Clock size={14} className="flex-shrink-0" />
                  <span>{horario}</span>
                </div>
              )}

              {telefono && (
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Phone size={14} className="flex-shrink-0" />
                  <span>{telefono}</span>
                </div>
              )}
            </div>

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

export default PlaceCard
