import { useState } from 'react'

const CeldaDia = ({ fecha, habitacion, reserva, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  // Obtener iniciales del huésped
  const getIniciales = (nombre, apellido) => {
    const inicial1 = nombre?.charAt(0)?.toUpperCase() || ''
    const inicial2 = apellido?.charAt(0)?.toUpperCase() || ''
    return `${inicial1}.${inicial2}.`
  }

  // Determinar si está disponible u ocupada
  const isDisponible = !reserva
  const isOcupada = reserva && reserva.estado_nombre === 'confirmada'

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onClick={() => onClick && onClick(fecha, habitacion, reserva)}
        className={`
          w-full h-12 flex items-center justify-center transition-all duration-200 cursor-pointer
          ${isDisponible ? 'bg-green-500 hover:bg-green-600' : ''}
          ${isOcupada ? 'bg-red-500 hover:bg-red-600' : ''}
        `}
      >
        {isOcupada && (
          <span className="text-white text-xs font-semibold">
            {getIniciales(reserva.huesped_nombre, reserva.huesped_apellido)}
          </span>
        )}
      </div>

      {/* Tooltip detallado */}
      {showTooltip && (
        <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-3 px-4 shadow-xl">
            {isDisponible && (
              <div>
                <div className="font-semibold text-green-400 mb-1">✓ Disponible</div>
                <div className="text-gray-300">
                  Habitación {habitacion.numero} - {habitacion.tipo_habitacion}
                </div>
                <div className="text-gray-400 mt-1 text-[10px]">
                  Click para crear una reserva
                </div>
              </div>
            )}

            {isOcupada && (
              <div>
                <div className="font-semibold text-red-400 mb-2">Ocupada</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-400">Huésped:</span>{' '}
                    <span className="text-white font-medium">
                      {reserva.huesped_nombre} {reserva.huesped_apellido}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Código:</span>{' '}
                    <span className="text-white">{reserva.codigo_reserva}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-in:</span>{' '}
                    <span className="text-white">{reserva.fecha_checkin}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-out:</span>{' '}
                    <span className="text-white">{reserva.fecha_checkout}</span>
                  </div>
                  {reserva.numero_huespedes && (
                    <div>
                      <span className="text-gray-400">Huéspedes:</span>{' '}
                      <span className="text-white">{reserva.numero_huespedes}</span>
                    </div>
                  )}
                </div>
                <div className="text-gray-400 mt-2 text-[10px] border-t border-gray-700 pt-2">
                  Click para ver detalles completos
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CeldaDia
