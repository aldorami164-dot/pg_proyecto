import { Clock, CheckCircle, Info, Bell } from 'lucide-react'

/**
 * Card profesional para servicios - Diseño elegante y minimalista
 */
const ServiceCard = ({
  servicio,
  IconComponent,
  detalles,
  delay = 0,
  onSolicitar = null,
  tieneHabitacion = false
}) => {
  const esPago = servicio.tiene_costo && parseFloat(servicio.precio) > 0

  return (
    <div className="group relative h-full">
      {/* Card container con fondo gris claro y bordes sutiles */}
      <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden
                      border border-gray-200
                      shadow hover:shadow-lg
                      transition-all duration-300 ease-out
                      hover:-translate-y-1">

        {/* NUEVO: Imagen principal si existe */}
        {servicio.imagen_principal && (
          <div className="w-full h-48 overflow-hidden relative">
            <img
              src={servicio.imagen_principal}
              alt={servicio.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay sutil para mejorar legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
          </div>
        )}

        {/* Contenido compacto */}
        <div className="flex flex-col p-4">
          {/* Header compacto con icono y título */}
          <div className="flex items-start gap-3 mb-3">
            {/* Icono compacto */}
            <div className={`relative flex-shrink-0 p-2 rounded-lg
                             ${esPago
                               ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                               : 'bg-gradient-to-br from-slate-500 to-slate-600'}
                             shadow
                             group-hover:scale-105
                             transition-transform duration-300`}>
              <IconComponent className="text-white" size={22} />
            </div>

            {/* Título y precio más compactos */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-0.5 leading-tight">
                {servicio.nombre}
              </h3>

              {esPago ? (
                <span className="text-lg font-bold text-gray-800">
                  Q{parseFloat(servicio.precio).toFixed(2)}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 text-xs font-semibold
                                 bg-white text-gray-700 rounded
                                 border border-gray-300 shadow-sm">
                  Incluido
                </span>
              )}
            </div>
          </div>

          {/* Descripción más compacta */}
          <p className="text-gray-700 mb-3 leading-snug text-sm">
            {servicio.descripcion}
          </p>

          {/* Horario compacto */}
          {servicio.horario && (
            <div className="flex items-center gap-2 p-2 mb-3
                            bg-white rounded border border-gray-200">
              <Clock size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">
                <strong className="font-semibold">Horario:</strong>{' '}
                {servicio.horario}
              </span>
            </div>
          )}

          {/* Instrucciones compactas */}
          {detalles.instrucciones && detalles.instrucciones.length > 0 && (
            <div className="mb-3 flex-1">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5 text-xs">
                <Info size={14} className="text-gray-500" />
                {detalles.solicitable ? 'Instrucciones' : 'Normas de Uso'}
              </h4>
              <ul className="space-y-1.5">
                {detalles.instrucciones.map((instruccion, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-snug">{instruccion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón o Badge informativo - Compacto */}
          <div className="mt-auto pt-3 border-t border-gray-200">
            {detalles.solicitable ? (
              <div>
                {/* Botón Solicitar compacto - solo si hay habitación activa */}
                {tieneHabitacion && onSolicitar ? (
                  <button
                    onClick={() => onSolicitar(servicio)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-600 to-slate-700
                               hover:from-slate-700 hover:to-slate-800
                               text-white font-semibold rounded-lg text-sm
                               shadow hover:shadow-md
                               transform hover:scale-[1.02]
                               transition-all duration-300
                               flex items-center justify-center gap-2"
                  >
                    <Bell size={16} />
                    Solicitar Servicio
                  </button>
                ) : (
                  /* Badge informativo compacto - solo si NO tiene habitación */
                  <div className="rounded-lg p-2.5 bg-white border border-gray-200">
                    <p className="text-xs text-gray-800 flex items-center gap-1.5 font-semibold mb-1">
                      <CheckCircle size={14} className="text-gray-600" />
                      Solicitable desde tu habitación
                    </p>
                    <p className="text-xs text-gray-600 leading-snug">
                      Escanea el código QR de tu habitación
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg p-2.5 bg-white border border-gray-200">
                <p className="text-xs text-gray-800 flex items-center gap-1.5 font-semibold mb-1">
                  <Info size={14} className="text-gray-600" />
                  Servicio de acceso libre
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  Disponible sin solicitud previa
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
