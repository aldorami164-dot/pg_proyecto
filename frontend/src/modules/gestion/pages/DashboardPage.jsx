import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import { useWebSocket } from '@shared/context/WebSocketContext'
import reservasService from '@shared/services/reservasService'
import habitacionesService from '@shared/services/habitacionesService'
import solicitudesService from '@shared/services/solicitudesService'
import dashboardService from '@shared/services/dashboardService'
import Card from '@shared/components/Card'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import AccionesRapidas from '@gestion/components/AccionesRapidas'
import { Calendar, Home, Bell, TrendingUp, Clock, Users, CheckCircle, LogIn, LogOut, AlertCircle, TrendingDown, BarChart3 } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('checkins') // 'checkins' | 'checkouts'
  const [stats, setStats] = useState({
    reservasActivas: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    solicitudesPendientes: 0,
    ocupacionPorcentaje: 0,
    checkinsHoy: [],
    checkoutsHoy: []
  })
  const [statsDetalladas, setStatsDetalladas] = useState(null)
  const [alertas, setAlertas] = useState(null)

  useEffect(() => {
    // Procesar reservas vencidas automáticamente al cargar
    procesarReservasVencidas()

    // Luego cargar estadísticas
    cargarEstadisticas()

    // Escuchar evento de actualización desde AccionesRapidas
    const handleDashboardUpdate = () => {
      cargarEstadisticas()
    }
    window.addEventListener('dashboard-update', handleDashboardUpdate)

    return () => {
      window.removeEventListener('dashboard-update', handleDashboardUpdate)
    }
  }, [])

  /**
   * Procesa automáticamente reservas vencidas (auto-cancelación)
   */
  const procesarReservasVencidas = async () => {
    console.log('🔍 INICIANDO procesamiento de reservas vencidas...')

    try {
      console.log('📡 Llamando a dashboardService.procesarReservasVencidas()...')
      const resultado = await dashboardService.procesarReservasVencidas()

      console.log('✅ Respuesta recibida:', resultado)

      if (resultado && resultado.reservas_canceladas > 0) {
        console.log(`✓ Auto-canceladas ${resultado.reservas_canceladas} reservas vencidas`)
        toast.success(`🗑️ ${resultado.reservas_canceladas} reserva(s) vencida(s) cancelada(s) automáticamente`, {
          duration: 4000,
          position: 'top-center'
        })
      } else {
        console.log('ℹ️ No hay reservas vencidas para cancelar')
      }
    } catch (error) {
      // Mostrar error para debugging
      console.error('❌ Error al procesar reservas vencidas:', error)
      console.error('❌ Error completo:', error.response?.data || error.message)
      toast.error(`Error al procesar reservas vencidas: ${error.response?.data?.message || error.message}`, {
        duration: 5000,
        position: 'top-center'
      })
    }
  }

  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(getFormattedDateTime())
    }, 60000) // Actualizar cada 60 segundos

    return () => clearInterval(interval)
  }, [])

  // Actualizar alertas cada 30 segundos
  useEffect(() => {
    const cargarAlertasYStats = async () => {
      try {
        const [alertasRes, statsRes] = await Promise.all([
          dashboardService.obtenerAlertas(),
          dashboardService.obtenerStatsDetalladas()
        ])
        setAlertas(alertasRes.alertas)
        setStatsDetalladas(statsRes.stats)
      } catch (error) {
        console.error('Error al cargar alertas y stats:', error)
      }
    }

    cargarAlertasYStats()
    const interval = setInterval(cargarAlertasYStats, 30000) // Cada 30 segundos

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

      setStats({
        reservasActivas: reservas.length,
        habitacionesDisponibles,
        habitacionesOcupadas,
        solicitudesPendientes: solicitudes.length,
        ocupacionPorcentaje,
        checkinsHoy,
        checkoutsHoy
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

  // Construir cards con diseño profesional (cards blancas, iconos con color)
  const statsCards = [
    {
      label: 'Reservas Activas',
      value: statsDetalladas?.reservas?.activas || stats.reservasActivas,
      icon: Calendar,
      bgColor: 'bg-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-gray-900',
      link: '/gestion/reservas',
      alertas: alertas && (
        <>
          {alertas.criticas.reservas_vencen_hoy > 0 && (
            <Badge variant="error" className="text-xs px-2 py-0.5 animate-pulse">
              {alertas.criticas.reservas_vencen_hoy} vencen hoy
            </Badge>
          )}
          {alertas.advertencias.reservas_vencen_manana > 0 && (
            <Badge variant="warning" className="text-xs px-2 py-0.5">
              {alertas.advertencias.reservas_vencen_manana} vencen mañana
            </Badge>
          )}
        </>
      )
    },
    {
      label: 'Habitaciones Disponibles',
      value: statsDetalladas?.habitaciones?.disponibles || stats.habitacionesDisponibles,
      icon: Home,
      bgColor: 'bg-white',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-gray-900',
      link: '/gestion/habitaciones',
      alertas: alertas && alertas.criticas.habitaciones_limpieza_retrasada > 0 && (
        <Badge variant="error" className="text-xs px-2 py-0.5 animate-pulse">
          {alertas.criticas.habitaciones_limpieza_retrasada} limpieza retrasada
        </Badge>
      )
    },
    {
      label: 'Solicitudes Pendientes',
      value: stats.solicitudesPendientes,
      icon: Bell,
      bgColor: 'bg-white',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-gray-900',
      link: '/gestion/solicitudes',
      alertas: alertas && alertas.criticas.solicitudes_urgentes > 0 && (
        <Badge variant="error" className="text-xs px-2 py-0.5 animate-pulse">
          {alertas.criticas.solicitudes_urgentes} urgentes (&gt;2h)
        </Badge>
      )
    },
    {
      label: 'Ocupación',
      value: `${statsDetalladas?.ocupacion?.porcentaje_actual || stats.ocupacionPorcentaje}%`,
      icon: BarChart3,
      bgColor: 'bg-white',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-gray-900',
      link: '/gestion/habitaciones'
    },
  ]

  return (
    <div className="space-y-4">
      {/* Welcome Header - Diseño profesional minimalista */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
              Bienvenido, {user?.rol === 'administrador' ? 'Admin' : 'Recepcionista'} {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-gray-500 text-sm md:text-base">Panel de control - Casa Josefa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700">{dateTime.fecha}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700">{dateTime.hora}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: Stats compactas + Check-ins/Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna izquierda: Stats + Check-ins (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Grid - MUY compactas (estilo Booking.com) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${stat.iconBg} rounded-full p-1.5`}>
                    <stat.icon className={stat.iconColor} size={16} strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                </div>
                <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>

                {/* Alertas críticas */}
                {stat.alertas && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {stat.alertas}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Card de Check-ins/Check-outs */}
          <Card module="gestion" className="border-2 border-gray-200 shadow-lg h-full">
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
                    <div key={`checkin-${reserva.id}`} className="p-4 bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:shadow-md transition-all">
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
                    <div key={`checkout-${reserva.id}`} className="p-4 bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all">
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

        </div>
          </Card>
        </div>

        {/* Panel de Acciones Rápidas (1/3 del ancho - EMPIEZA DESDE ARRIBA) */}
        <div className="lg:col-span-1">
          <AccionesRapidas />
        </div>
      </div>

    </div>
  )
}

export default DashboardPage
