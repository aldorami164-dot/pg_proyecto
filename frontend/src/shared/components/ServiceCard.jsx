import { Clock, CheckCircle, Info } from 'lucide-react'

/**
 * Card limpio y minimalista para servicios
 */
const ServiceCard = ({
  servicio,
  IconComponent,
  detalles,
  delay = 0
}) => {
  const esPago = servicio.tiene_costo && parseFloat(servicio.precio) > 0

  return (
    <div className="group relative h-full">
      {/* Card container minimalista */}
      <div className="relative h-full bg-white rounded-2xl overflow-hidden p-6
                      border border-gray-200
                      hover:border-plataforma-primary-300
                      transition-all duration-300 ease-out
                      hover:shadow-lg">

        {/* Contenido */}
        <div className="flex flex-col h-full">
          {/* Header con icono y título */}
          <div className="flex items-start gap-4 mb-4">
            {/* Icono simple con gradiente */}
            <div className={`relative flex-shrink-0 p-3 rounded-xl
                             bg-gradient-to-br
                             ${esPago
                               ? 'from-plataforma-accent-500 to-plataforma-accent-600'
                               : 'from-plataforma-primary-500 to-plataforma-primary-600'}
                             group-hover:scale-105
                             transition-transform duration-300`}>
              <IconComponent className="text-white" size={28} />
            </div>

            {/* Título y precio */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {servicio.nombre}
              </h3>

              {esPago ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-gray-900">
                    Q{parseFloat(servicio.precio).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 text-xs font-medium
                                 bg-green-50 text-green-700 rounded-full
                                 border border-green-200">
                  Gratuito
                </span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">
            {servicio.descripcion}
          </p>

          {/* Horario */}
          {servicio.horario && (
            <div className="flex items-center gap-2 p-3 mb-4
                            bg-gray-50 rounded-lg border border-gray-100">
              <Clock size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <strong className="font-medium">Horario:</strong>{' '}
                {servicio.horario}
              </span>
            </div>
          )}

          {/* Instrucciones */}
          {detalles.instrucciones && detalles.instrucciones.length > 0 && (
            <div className="mb-4 flex-1">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Info size={16} className="text-gray-500" />
                {detalles.solicitable ? 'Instrucciones' : 'Normas de Uso'}
              </h4>
              <ul className="space-y-2">
                {detalles.instrucciones.map((instruccion, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{instruccion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Badge de tipo de servicio minimalista */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            {detalles.solicitable ? (
              <div className="rounded-lg p-3 bg-blue-50 border border-blue-100">
                <p className="text-sm text-gray-800 flex items-center gap-2 font-medium mb-1">
                  <CheckCircle size={16} className="text-blue-600" />
                  Solicitable desde tu habitación
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Escanea el código QR de tu habitación para solicitar este servicio
                </p>
              </div>
            ) : (
              <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-800 flex items-center gap-2 font-medium mb-1">
                  <Info size={16} className="text-gray-600" />
                  Servicio de acceso libre
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Disponible sin necesidad de solicitud previa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
