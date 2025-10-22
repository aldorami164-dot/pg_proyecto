import { useState, useEffect } from 'react'
import { useWebSocket } from '@shared/context/WebSocketContext'
import solicitudesService from '@shared/services/solicitudesService'
import habitacionesService from '@shared/services/habitacionesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Select from '@shared/components/Select'
import Loader from '@shared/components/Loader'
import { ClipboardList, CheckCircle, Clock, AlertCircle, Filter, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const SolicitudesPage = () => {
  const { connected } = useWebSocket()
  const [solicitudes, setSolicitudes] = useState([])
  const [habitaciones, setHabitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    estado: '',
    habitacion_id: ''
  })

  const estadosSolicitud = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completada', label: 'Completada' }
  ]

  useEffect(() => {
    cargarDatos()
  }, [filters])

  useEffect(() => {
    // Escuchar notificaciones de nuevas solicitudes via WebSocket
    if (connected) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'nueva_solicitud') {
          // Recargar solicitudes cuando llegue una nueva
          cargarSolicitudes()

          // Mostrar notificación
          toast.success(`Nueva solicitud de servicio`, {
            duration: 5000,
            icon: '🔔'
          })
        }
      }

      // Agregar listener
      window.addEventListener('message', handleMessage)

      return () => {
        window.removeEventListener('message', handleMessage)
      }
    }
  }, [connected])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      await Promise.all([
        cargarSolicitudes(),
        cargarHabitaciones()
      ])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const cargarSolicitudes = async () => {
    const params = {}
    if (filters.estado) params.estado = filters.estado
    if (filters.habitacion_id) params.habitacion_id = filters.habitacion_id

    const data = await solicitudesService.listar(params)
    console.log('📋 Solicitudes cargadas:', data)
    setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : [])
  }

  const cargarHabitaciones = async () => {
    const data = await habitacionesService.listar()
    console.log('🏠 Habitaciones cargadas:', data)
    setHabitaciones(Array.isArray(data?.habitaciones) ? data.habitaciones : [])
  }

  const handleCompletarSolicitud = async (solicitudId) => {
    try {
      await solicitudesService.completar(solicitudId)
      toast.success('Solicitud marcada como completada')
      cargarSolicitudes()
    } catch (error) {
      console.error('Error al completar solicitud:', error)
      toast.error('Error al completar la solicitud')
    }
  }

  const handleEliminarSolicitud = async (solicitudId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await solicitudesService.eliminar(solicitudId)
      toast.success('Solicitud eliminada exitosamente')
      cargarSolicitudes()
    } catch (error) {
      console.error('Error al eliminar solicitud:', error)
      const mensaje = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar la solicitud'
      toast.error(mensaje)
    }
  }

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'pendiente': 'warning',
      'completada': 'success'
    }
    return variants[estado] || 'default'
  }

  // Columnas para solicitudes PENDIENTES
  const columnasPendientes = [
    {
      key: 'id',
      label: 'ID',
      render: (solicitud) => (
        <div className="flex items-center gap-2">
          <span>#{solicitud.id}</span>
          {solicitud.tiene_costo && (
            <AlertCircle className="text-red-500" size={16} title="Servicio de pago - Prioridad alta" />
          )}
        </div>
      )
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (solicitud) => (
        <div className="font-medium text-gray-900">
          Hab. {solicitud.habitacion_numero || 'N/A'}
        </div>
      )
    },
    {
      key: 'servicio',
      label: 'Servicio',
      render: (solicitud) => (
        <div>
          <div className="font-medium text-gray-900">
            {solicitud.servicio_nombre || 'N/A'}
          </div>
          {solicitud.notas && (
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {solicitud.notas}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'creado_en',
      label: 'Fecha/Hora',
      render: (solicitud) => (
        <div className="text-sm">
          <div>{new Date(solicitud.creado_en).toLocaleDateString()}</div>
          <div className="text-gray-500">
            {new Date(solicitud.creado_en).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (solicitud) => (
        <Button
          variant="success"
          size="sm"
          onClick={() => handleCompletarSolicitud(solicitud.id)}
          className="text-sm"
        >
          <CheckCircle size={16} className="mr-1" />
          Completar
        </Button>
      )
    }
  ]

  // Columnas para solicitudes COMPLETADAS
  const columnasCompletadas = [
    {
      key: 'id',
      label: 'ID',
      render: (solicitud) => <span>#{solicitud.id}</span>
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (solicitud) => (
        <div className="font-medium text-gray-900">
          Hab. {solicitud.habitacion_numero || 'N/A'}
        </div>
      )
    },
    {
      key: 'servicio',
      label: 'Servicio',
      render: (solicitud) => (
        <div>
          <div className="font-medium text-gray-900">
            {solicitud.servicio_nombre || 'N/A'}
          </div>
          {solicitud.notas && (
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {solicitud.notas}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'creado_en',
      label: 'Solicitado',
      render: (solicitud) => (
        <div className="text-sm">
          <div>{new Date(solicitud.creado_en).toLocaleDateString()}</div>
          <div className="text-gray-500">
            {new Date(solicitud.creado_en).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'fecha_atencion',
      label: 'Completado',
      render: (solicitud) => (
        <div className="text-sm">
          {solicitud.fecha_atencion ? (
            <>
              <div>{new Date(solicitud.fecha_atencion).toLocaleDateString()}</div>
              <div className="text-gray-500">
                {new Date(solicitud.fecha_atencion).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (solicitud) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleEliminarSolicitud(solicitud.id)}
          className="text-sm"
        >
          <Trash2 size={16} className="mr-1" />
          Eliminar
        </Button>
      )
    }
  ]

  // Separar solicitudes por estado
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente')
  const solicitudesCompletadasTodas = solicitudes.filter(s => s.estado === 'completada')
  // Mostrar solo las últimas 5 completadas
  const solicitudesCompletadas = solicitudesCompletadasTodas.slice(0, 5)

  if (loading && solicitudes.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Servicio</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de los huéspedes</p>
        </div>

        {/* Indicador WebSocket */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Conectado en tiempo real' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Estadísticas rápidas - Compactas */}
      <div className="grid grid-cols-2 gap-3">
        <Card module="gestion" className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-600">Pendientes</p>
              <p className="text-xl font-bold text-yellow-600">
                {solicitudesPendientes.length}
              </p>
            </div>
          </div>
        </Card>

        <Card module="gestion" className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-600">Completadas Hoy</p>
              <p className="text-xl font-bold text-green-600">
                {solicitudesCompletadas.filter(s => {
                  if (!s.fecha_atencion) return false
                  const hoy = new Date().toDateString()
                  const fechaCompletada = new Date(s.fecha_atencion).toDateString()
                  return hoy === fechaCompletada
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros - Compactos */}
      <Card module="gestion" className="p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Filter size={16} className="text-gray-500" />
            <h3 className="font-medium text-gray-900 text-sm">Filtros:</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full sm:w-auto">
            <Select
              label="Estado"
              name="estado"
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              options={estadosSolicitud}
              module="gestion"
            />

            <Select
              label="Habitación"
              name="habitacion_id"
              value={filters.habitacion_id}
              onChange={(e) => setFilters({ ...filters, habitacion_id: e.target.value })}
              options={[
                { value: '', label: 'Todas las habitaciones' },
                ...habitaciones.map(h => ({ value: h.id, label: `Hab. ${h.numero}` }))
              ]}
              module="gestion"
            />
          </div>
        </div>
      </Card>

      {/* Tabla de Solicitudes PENDIENTES */}
      <Card module="gestion">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Solicitudes Pendientes</h3>
          <Badge variant="warning">{solicitudesPendientes.length}</Badge>
        </div>
        <Table
          columns={columnasPendientes}
          data={solicitudesPendientes}
          emptyMessage="No hay solicitudes pendientes"
        />
      </Card>

      {/* Tabla de Solicitudes COMPLETADAS */}
      <Card module="gestion">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <h3 className="font-semibold text-gray-900">Solicitudes Completadas</h3>
            <Badge variant="success">{solicitudesCompletadasTodas.length}</Badge>
          </div>
          {solicitudesCompletadasTodas.length > 5 && (
            <span className="text-sm text-gray-500">
              Mostrando últimas 5 de {solicitudesCompletadasTodas.length}
            </span>
          )}
        </div>
        <Table
          columns={columnasCompletadas}
          data={solicitudesCompletadas}
          emptyMessage="No hay solicitudes completadas"
        />
        {solicitudesCompletadasTodas.length > 5 && (
          <div className="mt-3 text-center text-sm text-gray-500">
            💡 Elimina las solicitudes antiguas para mantener la lista limpia
          </div>
        )}
      </Card>

      {/* Notas informativas */}
      <Card module="gestion">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Información sobre Solicitudes
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los servicios marcados con <AlertCircle className="inline text-red-500" size={14} /> son de pago y tienen prioridad alta</li>
                <li>• Las solicitudes nuevas aparecerán automáticamente en tiempo real</li>
                <li>• Los servicios gratuitos incluyen: limpieza, toallas, mantenimiento</li>
                <li>• Los servicios de pago incluyen: spa, lavandería, restaurante, room service</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SolicitudesPage
