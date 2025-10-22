import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Badge from '@shared/components/Badge'
import dashboardService from '@shared/services/dashboardService'
import reservasService from '@shared/services/reservasService'
import solicitudesService from '@shared/services/solicitudesService'
import habitacionesService from '@shared/services/habitacionesService'
import { LogOut, CheckCircle, Clock, Zap, Home } from 'lucide-react'
import { toast } from 'react-hot-toast'

/**
 * Componente de Acciones Rápidas para el Dashboard
 * Permite realizar acciones comunes sin navegar a otras páginas
 *
 * Acciones disponibles:
 * - Check-out exprés
 * - Confirmar reserva pendiente
 * - Completar solicitud de servicio
 * - Cambiar estado de habitación
 */
const AccionesRapidas = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(null) // ID del elemento siendo procesado
  const [datos, setDatos] = useState({
    reservasPendientes: [],
    solicitudesPendientes: [],
    habitacionesOcupadas: []
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.obtenerAccionesRapidas()
      setDatos({
        reservasPendientes: response.acciones_rapidas.reservas_pendientes || [],
        solicitudesPendientes: response.acciones_rapidas.solicitudes_pendientes || [],
        habitacionesOcupadas: response.acciones_rapidas.habitaciones_ocupadas || []
      })
    } catch (error) {
      console.error('Error al cargar datos de acciones rápidas:', error)
      toast.error('Error al cargar acciones rápidas')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check-out exprés de una habitación
   */
  const handleCheckout = async (reservaId, numeroHabitacion) => {
    try {
      setProcesando(`checkout-${reservaId}`)
      await reservasService.cambiarEstado(reservaId, 'completada')
      toast.success(`✓ Check-out completado: Habitación ${numeroHabitacion}`, {
        duration: 3000,
        position: 'top-right'
      })
      await cargarDatos() // Recargar datos
      // Emit event para que el dashboard padre recargue sus stats
      window.dispatchEvent(new CustomEvent('dashboard-update'))
    } catch (error) {
      console.error('Error al realizar check-out:', error)
      toast.error('Error al realizar check-out', {
        duration: 4000,
        position: 'top-right'
      })
    } finally {
      setProcesando(null)
    }
  }

  /**
   * Confirmar reserva pendiente
   */
  const handleConfirmarReserva = async (reservaId, codigoReserva) => {
    try {
      setProcesando(`confirmar-${reservaId}`)
      await reservasService.cambiarEstado(reservaId, 'confirmada')
      toast.success(`✓ Reserva ${codigoReserva} confirmada exitosamente`, {
        duration: 3000,
        position: 'top-right'
      })
      await cargarDatos()
      window.dispatchEvent(new CustomEvent('dashboard-update'))
    } catch (error) {
      console.error('Error al confirmar reserva:', error)
      toast.error('Error al confirmar reserva', {
        duration: 4000,
        position: 'top-right'
      })
    } finally {
      setProcesando(null)
    }
  }

  /**
   * Completar solicitud de servicio
   */
  const handleCompletarSolicitud = async (solicitudId, servicio) => {
    try {
      setProcesando(`solicitud-${solicitudId}`)
      await solicitudesService.completar(solicitudId, 'Completado desde acciones rápidas')
      toast.success(`✓ Solicitud completada: ${servicio}`, {
        duration: 3000,
        position: 'top-right'
      })
      await cargarDatos()
      window.dispatchEvent(new CustomEvent('dashboard-update'))
    } catch (error) {
      console.error('Error al completar solicitud:', error)
      toast.error('Error al completar solicitud', {
        duration: 4000,
        position: 'top-right'
      })
    } finally {
      setProcesando(null)
    }
  }

  /**
   * Cambiar estado de habitación
   */
  const handleCambiarEstadoHabitacion = async (habitacionId, nuevoEstado, numeroHabitacion) => {
    const estadosLabels = {
      disponible: 'Disponible',
      limpieza: 'En Limpieza',
      mantenimiento: 'En Mantenimiento'
    }

    try {
      setProcesando(`habitacion-${habitacionId}-${nuevoEstado}`)
      await habitacionesService.cambiarEstado(habitacionId, nuevoEstado)
      toast.success(`✓ Habitación ${numeroHabitacion}: ${estadosLabels[nuevoEstado]}`, {
        duration: 3000,
        position: 'top-right'
      })
      await cargarDatos()
      window.dispatchEvent(new CustomEvent('dashboard-update'))
    } catch (error) {
      console.error('Error al cambiar estado de habitación:', error)
      toast.error('Error al cambiar estado de habitación', {
        duration: 4000,
        position: 'top-right'
      })
    } finally {
      setProcesando(null)
    }
  }

  /**
   * Formatear tiempo de espera
   */
  const formatearTiempoEspera = (horas) => {
    const h = Math.floor(horas)
    const m = Math.floor((horas - h) * 60)

    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  if (loading) {
    return (
      <Card module="gestion" className="h-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card module="gestion" className="h-full sticky top-4">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Zap className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-bold text-gray-900">Acciones Rápidas</h3>
        </div>

        {/* Check-out Exprés */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-blue-600" />
              Check-out Exprés
            </h4>
          </div>

          {datos.habitacionesOcupadas.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No hay habitaciones ocupadas</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {datos.habitacionesOcupadas.slice(0, 5).map((hab) => (
                <div
                  key={hab.id}
                  className="p-2.5 bg-blue-50/30 border border-blue-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-gray-900">Hab. {hab.numero}</span>
                    <span className="text-xs text-gray-500 font-medium">Ocupada</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 truncate">{hab.huesped_nombre}</p>
                  <button
                    onClick={() => handleCheckout(hab.reserva_id, hab.numero)}
                    disabled={procesando === `checkout-${hab.reserva_id}`}
                    className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {procesando === `checkout-${hab.reserva_id}` ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
                        Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogOut className="w-3 h-3" />
                        Check-out
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmar Reservas Pendientes */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Confirmar Reservas
            </h4>
          </div>

          {datos.reservasPendientes.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No hay reservas pendientes</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {datos.reservasPendientes.map((reserva) => {
                // Verificar si la reserva está vencida
                const fechaCheckin = reserva.fecha_checkin?.split('T')[0]
                const hoy = new Date().toISOString().split('T')[0]
                const estaVencida = fechaCheckin < hoy

                return (
                  <div
                    key={reserva.id}
                    className={`p-2.5 border rounded-lg hover:shadow-sm transition-all ${
                      estaVencida ? 'border-red-300 bg-red-50' : 'bg-green-50/30 border-green-100 hover:border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">{reserva.codigo_reserva}</span>
                      {estaVencida ? (
                        <Badge variant="error" className="text-xs px-1.5 py-0.5 animate-pulse">
                          VENCIDA
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatearTiempoEspera(reserva.horas_pendiente)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1 truncate">{reserva.huesped_nombre}</p>
                    <p className="text-xs text-gray-500 mb-2">Hab. {reserva.habitacion_numero}</p>

                    {estaVencida ? (
                      <p className="text-xs text-red-600 font-medium italic">
                        Se auto-cancelará automáticamente
                      </p>
                    ) : (
                      <button
                        onClick={() => handleConfirmarReserva(reserva.id, reserva.codigo_reserva)}
                        disabled={procesando === `confirmar-${reserva.id}`}
                        className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {procesando === `confirmar-${reserva.id}` ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
                            Confirmando...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Confirmar
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completar Solicitudes */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600" />
              Solicitudes Pendientes
            </h4>
          </div>

          {datos.solicitudesPendientes.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No hay solicitudes pendientes</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {datos.solicitudesPendientes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-gray-900">Hab. {solicitud.habitacion_numero}</span>
                    <div className="flex items-center gap-1.5">
                      {solicitud.tiene_costo && (
                        <span className="text-xs text-amber-600 font-semibold">$</span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatearTiempoEspera(solicitud.horas_pendiente)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{solicitud.servicio_nombre}</p>
                  <button
                    onClick={() => handleCompletarSolicitud(solicitud.id, solicitud.servicio_nombre)}
                    disabled={procesando === `solicitud-${solicitud.id}`}
                    className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {procesando === `solicitud-${solicitud.id}` ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
                        Completando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        Completar
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de recarga */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="w-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </Card>
  )
}

export default AccionesRapidas
