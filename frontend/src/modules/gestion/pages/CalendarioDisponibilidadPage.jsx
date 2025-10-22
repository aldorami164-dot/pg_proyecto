import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import CalendarioMensual from '../components/calendario/CalendarioMensual'
import FiltroHabitaciones from '../components/calendario/FiltroHabitaciones'
import reservasService from '@shared/services/reservasService'
import habitacionesService from '@shared/services/habitacionesService'

const CalendarioDisponibilidadPage = () => {
  const [mes, setMes] = useState(new Date().getMonth())
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [habitaciones, setHabitaciones] = useState([])
  const [reservas, setReservas] = useState([])
  const [habitacionFiltrada, setHabitacionFiltrada] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [mes, anio])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Calcular fechas del mes
      const primerDia = new Date(anio, mes, 1)
      const ultimoDia = new Date(anio, mes + 1, 0)

      // Formatear fechas para API
      const fechaDesde = primerDia.toISOString().split('T')[0]
      const fechaHasta = ultimoDia.toISOString().split('T')[0]

      // Cargar habitaciones y reservas en paralelo
      const [habitacionesData, reservasData] = await Promise.all([
        habitacionesService.listar(),
        reservasService.listar({
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          page: 1,
          limit: 1000 // Traer todas las reservas del mes
        })
      ])

      console.log('habitacionesData:', habitacionesData)
      console.log('reservasData:', reservasData)

      // Asegurar que habitaciones sea un array
      const habitacionesArray = Array.isArray(habitacionesData)
        ? habitacionesData
        : (habitacionesData?.habitaciones || [])

      setHabitaciones(habitacionesArray)
      setReservas(reservasData.reservas || reservasData)

    } catch (error) {
      console.error('Error al cargar datos del calendario:', error)
      toast.error('Error al cargar el calendario')
    } finally {
      setLoading(false)
    }
  }

  // Navegación de meses
  const mesAnterior = () => {
    if (mes === 0) {
      setMes(11)
      setAnio(anio - 1)
    } else {
      setMes(mes - 1)
    }
  }

  const mesSiguiente = () => {
    if (mes === 11) {
      setMes(0)
      setAnio(anio + 1)
    } else {
      setMes(mes + 1)
    }
  }

  const irHoy = () => {
    const hoy = new Date()
    setMes(hoy.getMonth())
    setAnio(hoy.getFullYear())
  }

  // Manejo de click en celda
  const handleCeldaClick = (fecha, habitacion, reserva) => {
    if (reserva) {
      // Si hay reserva, mostrar detalles
      toast(
        <div>
          <div className="font-semibold mb-1">Reserva {reserva.estado_nombre}</div>
          <div className="text-sm">
            <div>Código: {reserva.codigo_reserva}</div>
            <div>Huésped: {reserva.huesped_nombre} {reserva.huesped_apellido}</div>
            <div>Del {reserva.fecha_checkin} al {reserva.fecha_checkout}</div>
          </div>
        </div>,
        { duration: 5000 }
      )
    } else {
      // Si está disponible, sugerir crear reserva
      const fechaFormato = fecha.toLocaleDateString('es-GT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      toast(
        <div>
          <div className="font-semibold mb-1">Habitación disponible</div>
          <div className="text-sm">
            <div>Habitación {habitacion.numero}</div>
            <div>{fechaFormato}</div>
            <div className="mt-2 text-blue-600">
              Ir a Reservas para crear una nueva reserva
            </div>
          </div>
        </div>,
        { duration: 4000 }
      )
    }
  }

  // Nombres de meses
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={32} />
            Calendario de Disponibilidad
          </h1>
          <p className="text-gray-600 mt-1">
            Vista mensual de ocupación de habitaciones
          </p>
        </div>

        <button
          onClick={irHoy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ir a Hoy
        </button>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Navegación de mes */}
          <div className="flex items-center gap-4">
            <button
              onClick={mesAnterior}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            <div className="text-center min-w-[200px]">
              <div className="text-2xl font-bold text-gray-800">
                {nombresMeses[mes]} {anio}
              </div>
            </div>

            <button
              onClick={mesSiguiente}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Filtro de habitaciones */}
          <FiltroHabitaciones
            habitaciones={habitaciones}
            habitacionSeleccionada={habitacionFiltrada}
            onChange={setHabitacionFiltrada}
          />
        </div>
      </div>

      {/* Estados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">Ocupado (Check-in realizado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">Completado (Check-out realizado)</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      ) : (
        <CalendarioMensual
          mes={mes}
          anio={anio}
          habitaciones={habitaciones}
          reservas={reservas}
          habitacionFiltrada={habitacionFiltrada}
          onCeldaClick={handleCeldaClick}
        />
      )}

    </div>
  )
}

export default CalendarioDisponibilidadPage
