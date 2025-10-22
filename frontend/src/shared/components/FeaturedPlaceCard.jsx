import { MapPin, Navigation, Star, ChevronRight } from 'lucide-react'

/**
 * Card horizontal grande para lugar turístico destacado
 */
const FeaturedPlaceCard = ({ lugar, onClick }) => {
  if (!lugar) return null

  const {
    imagen_principal,
    nombre,
    descripcion,
    ubicacion,
    distancia_hotel,
    categoria
  } = lugar

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer w-full"
    >
      {/* Card horizontal grande */}
      <div className="relative bg-white rounded-2xl overflow-hidden
                      border border-gray-200
                      hover:border-plataforma-secondary-300
                      transition-all duration-300 ease-out
                      hover:shadow-xl">

        <div className="grid md:grid-cols-2 gap-0 min-h-[400px]">
          {/* Imagen - Lado izquierdo */}
          <div className="relative h-[400px] md:h-auto overflow-hidden">
            {imagen_principal ? (
              <>
                <img
                  src={imagen_principal}
                  alt={nombre}
                  className="w-full h-full object-cover
                             group-hover:scale-105
                             transition-transform duration-500 ease-out"
                />
                {/* Badge "Destacado" */}
                <div className="absolute top-4 left-4 px-4 py-2
                               bg-plataforma-secondary-600 text-white rounded-lg
                               font-semibold text-sm shadow-lg">
                  ⭐ Lugar Destacado
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300
                              flex items-center justify-center">
                <div className="text-gray-400 text-8xl">🏞️</div>
              </div>
            )}
          </div>

          {/* Contenido - Lado derecho */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            {/* Categoría */}
            {categoria && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-plataforma-secondary-100 text-plataforma-secondary-700
                                 rounded-full text-sm font-semibold capitalize">
                  {categoria}
                </span>
              </div>
            )}

            {/* Título */}
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {nombre}
            </h3>

            {/* Descripción */}
            <p className="text-gray-600 mb-6 leading-relaxed text-base line-clamp-4">
              {descripcion}
            </p>

            {/* Detalles en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {ubicacion && (
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="text-plataforma-secondary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Ubicación</p>
                    <p className="text-sm text-gray-800 font-medium">{ubicacion}</p>
                  </div>
                </div>
              )}

              {distancia_hotel && (
                <div className="flex items-start gap-2">
                  <Navigation size={20} className="text-plataforma-secondary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Distancia</p>
                    <p className="text-sm text-gray-800 font-medium">{distancia_hotel}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botón */}
            <div className="flex items-center gap-3 text-plataforma-secondary-600 font-semibold
                            group-hover:text-plataforma-secondary-700 transition-colors">
              <span>Ver detalles completos</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedPlaceCard
