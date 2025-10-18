import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import { useWebSocket } from '@shared/context/WebSocketContext'
import reservasService from '@shared/services/reservasService'
import habitacionesService from '@shared/services/habitacionesService'
import solicitudesService from '@shared/services/solicitudesService'
import Card from '@shared/components/Card'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import { Calendar, Home, Bell, TrendingUp, Clock, Users, CheckCircle, LogIn, LogOut, ClockAlert } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getTodayLocalDate } from '@shared/utils/formatters'

// Función para obtener fecha y hora formateada
const getFormattedDateTime = () => {
  const now = new Date()
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const diaSemana = dias[now.getDay()]
  const dia = now.getDate()
  const mes = meses[now.getMonth()]
  const año = now.getFullYear()

  const horas = now.getHours()
  const minutos = now.getMinutes().toString().padStart(2, '0')
  const ampm = horas >= 12 ? 'PM' : 'AM'
  const horas12 = horas % 12 || 12

  return {
    fecha: `${diaSemana}, ${dia} de ${mes} ${año}`,
    hora: `${horas12}:${minutos} ${ampm}`
  }
}

const DashboardPage = () => {
  const { user } = useAuth()
  const { connected } = useWebSocket()
  const [loading, setLoading] = useState(true)
  const [dateTime, setDateTime] = useState(getFormattedDateTime())
  const [activeTab, setActiveTab] = useState('checkins') // 'checkins' | 'checkouts' | 'pendientes'
  const [stats, setStats] = useState({
    reservasActivas: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    solicitudesPendientes: 0,
    ocupacionPorcentaje: 0,
    checkinsHoy: [],
    checkoutsHoy: [],
    reservasPendientes: []
  })

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(getFormattedDateTime())
    }, 60000) // Actualizar cada 60 segundos

    return () => clearInterval(interval)
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)

      // Cargar datos en paralelo
      const [reservasRes, habitacionesRes, solicitudesRes] = await Promise.all([
        reservasService.listar({ estado: 'confirmada' }),
        habitacionesService.listar(),
        solicitudesService.listar({ estado: 'pendiente' })
      ])

      const reservas = reservasRes.reservas || []
      const habitaciones = habitacionesRes.habitaciones || []
      const solicitudes = solicitudesRes?.solicitudes || []

      // Calcular habitaciones por estado
      const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'disponible').length
      const habitacionesOcupadas = habitaciones.filter(h => h.estado === 'ocupada').length
      const totalHabitaciones = habitaciones.length

      // Calcular porcentaje de ocupación
      const ocupacionPorcentaje = totalHabitaciones > 0
        ? Math.round((habitacionesOcupadas / totalHabitaciones) * 100)
        : 0

      // Obtener check-ins y check-outs de hoy
      // FIX: Usar fecha local de Guatemala, NO UTC
      const hoy = getTodayLocalDate()

      // Cargar solo reservas activas (pendientes y confirmadas)
      const reservasActivas = await reservasService.listar({
        estados_excluir: 'completada,cancelada'
      })
      const reservasActivasData = reservasActivas.reservas || []

      // Filtrar solo reservas CONFIRMADAS con check-in hoy (las pendientes van a su propio tab)
      const checkinsHoy = reservasActivasData.filter(r => {
        const fechaCheckin = r.fecha_checkin?.split('T')[0]
        return fechaCheckin === hoy && r.estado_nombre === 'confirmada'
      })

      // Filtrar solo reservas CONFIRMADAS con check-out hoy (las pendientes van a su propio tab)
      const checkoutsHoy = reservasActivasData.filter(r => {
        const fechaCheckout = r.fecha_checkout?.split('T')[0]
        return fechaCheckout === hoy && r.estado_nombre === 'confirmada'
      })

      // Obtener todas las reservas pendientes (sin importar la fecha)
      const reservasPendientes = reservasActivasData.filter(r =>
        r.estado_nombre === 'pendiente'
      )

      setStats({
        reservasActivas: reservas.length,
        habitacionesDisponibles,
        habitacionesOcupadas,
        solicitudesPendientes: solicitudes.length,
        ocupacionPorcentaje,
        checkinsHoy,
        checkoutsHoy,
        reservasPendientes
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      toast.error('Error al cargar las estadísticas del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  const statsCards = [
    {
      label: 'Reservas Activas',
      value: stats.reservasActivas,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      link: '/gestion/reservas'
    },
    {
      label: 'Habitaciones Disponibles',
      value: stats.habitacionesDisponibles,
      icon: Home,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      link: '/gestion/habitaciones'
    },
    {
      label: 'Solicitudes Pendientes',
      value: stats.solicitudesPendientes,
      icon: Bell,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900',
      link: '/gestion/solicitudes'
    },
    {
      label: 'Ocupación',
      value: `${stats.ocupacionPorcentaje}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900',
      link: '/gestion/habitaciones'
    },
  ]

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              Bienvenido, {user?.nombre}
            </h1>
            <p className="text-slate-300 text-sm md:text-base">Panel de control - Casa Josefa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Calendar className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium text-white">{dateTime.fecha}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
              <Clock className="w-4 h-4 text-blue-200 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium text-blue-100">{dateTime.hora}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Card única con tabs para Check-ins, Check-outs y Pendientes */}
      <Card module="gestion" className="border-2 border-gray-200 shadow-lg">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('checkins')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === 'checkins'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <LogIn size={18} />
              Check-ins Hoy
              {stats.checkinsHoy.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'checkins' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats.checkinsHoy.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('checkouts')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === 'checkouts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <LogOut size={18} />
              Check-outs Hoy
              {stats.checkoutsHoy.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'checkouts' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats.checkoutsHoy.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pendientes')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === 'pendientes'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <ClockAlert size={18} />
              Reservas Pendientes
              {stats.reservasPendientes.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'pendientes' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats.reservasPendientes.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Check-ins Tab */}
          {activeTab === 'checkins' && (
            <div>
              {stats.checkinsHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <LogIn className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay check-ins programados para hoy</p>
                  <p className="text-sm text-gray-500 mt-1">Los huéspedes que lleguen hoy aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.checkinsHoy.map((reserva) => (
                    <div key={reserva.id} className="p-4 bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{reserva.huesped_nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Habitación {reserva.habitacion_numero || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {reserva.huesped_email || 'Sin email'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Huéspedes: {reserva.numero_huespedes} • Total: Q{parseFloat(reserva.precio_total || 0).toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="success">
                          CONFIRMADA
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Check-outs Tab */}
          {activeTab === 'checkouts' && (
            <div>
              {stats.checkoutsHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <LogOut className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay check-outs programados para hoy</p>
                  <p className="text-sm text-gray-500 mt-1">Los huéspedes que se vayan hoy aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.checkoutsHoy.map((reserva) => (
                    <div key={reserva.id} className="p-4 bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{reserva.huesped_nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Habitación {reserva.habitacion_numero || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {reserva.huesped_email || 'Sin email'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Huéspedes: {reserva.numero_huespedes} • Total: Q{parseFloat(reserva.precio_total || 0).toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="success">
                          CONFIRMADA
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reservas Pendientes Tab */}
          {activeTab === 'pendientes' && (
            <div>
              {stats.reservasPendientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <ClockAlert className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay reservas pendientes</p>
                  <p className="text-sm text-gray-500 mt-1">Todas las reservas están confirmadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.reservasPendientes.map((reserva) => (
                    <div key={reserva.id} className="p-4 bg-gradient-to-r from-orange-50 to-white border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{reserva.huesped_nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Habitación {reserva.habitacion_numero || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Check-in: {new Date(reserva.fecha_checkin).toLocaleDateString('es-GT')} •
                            Check-out: {new Date(reserva.fecha_checkout).toLocaleDateString('es-GT')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reserva.huesped_email || 'Sin email'} • Huéspedes: {reserva.numero_huespedes}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: Q{parseFloat(reserva.precio_total || 0).toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="warning">PENDIENTE</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

    </div>
  )
}

export default DashboardPage
