import CeldaDia from './CeldaDia'

const CalendarioMensual = ({ mes, anio, habitaciones, reservas, habitacionFiltrada, onCeldaClick }) => {
  // Obtener primer y último día del mes
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const diasEnMes = ultimoDia.getDate()

  // Generar array de días del mes
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1)

  // Filtrar habitaciones si hay una seleccionada
  const habitacionesMostrar = habitacionFiltrada
    ? habitaciones.filter(h => h.id === habitacionFiltrada)
    : habitaciones

  // Función para obtener reserva de una habitación en una fecha específica
  const getReservaPorFecha = (habitacionId, dia) => {
    const fecha = new Date(anio, mes, dia)

    return reservas.find(r => {
      if (r.habitacion_id !== habitacionId) return false

      // Excluir canceladas, completadas y pendientes (solo confirmadas bloquean)
      if (['cancelada', 'completada', 'pendiente'].includes(r.estado_nombre)) return false

      const checkin = new Date(r.fecha_checkin)
      const checkout = new Date(r.fecha_checkout)

      // La fecha debe estar entre checkin (inclusive) y checkout (exclusive)
      return fecha >= checkin && fecha < checkout
    })
  }

  // Nombres de días de la semana
  const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Contenedor con scroll */}
      <div className="overflow-auto" style={{ maxHeight: '700px' }}>
        {habitacionesMostrar.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay habitaciones para mostrar
          </div>
        ) : (
          <table className="w-full border-collapse">
            {/* Header de la tabla */}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {/* Columna de habitaciones */}
                <th
                  className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 text-sm bg-gray-50"
                  style={{ width: '150px', minWidth: '120px', maxWidth: '180px' }}
                >
                  Habitación
                </th>

                {/* Días del mes */}
                {dias.map(dia => {
                  const fecha = new Date(anio, mes, dia)
                  const diaSemana = fecha.getDay()
                  const nombreDia = diasSemana[diaSemana]
                  const esHoy = fecha.toDateString() === new Date().toDateString()

                  return (
                    <th
                      key={`header-${dia}`}
                      className={`border border-gray-200 py-1 px-0.5 text-center text-xs ${
                        esHoy ? 'bg-blue-100' : 'bg-gray-50'
                      }`}
                      style={{ width: '40px', minWidth: '40px' }}
                    >
                      <div className={`text-[10px] font-medium ${esHoy ? 'text-blue-700' : 'text-gray-500'}`}>
                        {nombreDia}
                      </div>
                      <div className={`text-xs font-semibold ${esHoy ? 'text-blue-700' : 'text-gray-700'}`}>
                        {dia}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody>
              {habitacionesMostrar.map((habitacion) => (
                <tr
                  key={habitacion.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Nombre de habitación */}
                  <td
                    className="border border-gray-200 px-4 py-3 bg-gray-50 font-medium sticky left-0 z-5"
                    style={{ width: '150px', minWidth: '120px', maxWidth: '180px' }}
                  >
                    <div className="font-semibold text-gray-800 text-sm">
                      {habitacion.numero}
                    </div>
                    <div className="text-xs text-gray-500">
                      {habitacion.tipo_habitacion}
                    </div>
                  </td>

                  {/* Celdas de días */}
                  {dias.map(dia => {
                    const fecha = new Date(anio, mes, dia)
                    const reserva = getReservaPorFecha(habitacion.id, dia)

                    return (
                      <td
                        key={`celda-${habitacion.id}-${dia}`}
                        className="border border-gray-200 p-0"
                        style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}
                      >
                        <CeldaDia
                          fecha={fecha}
                          habitacion={habitacion}
                          reserva={reserva}
                          onClick={onCeldaClick}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CalendarioMensual
