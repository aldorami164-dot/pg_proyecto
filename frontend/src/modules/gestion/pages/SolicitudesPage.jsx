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
import { ClipboardList, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react'
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

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'pendiente': 'warning',
      'completada': 'success'
    }
    return variants[estado] || 'default'
  }

  const columns = [
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
        <div>
          <div className="font-medium text-gray-900">
            Hab. {solicitud.habitacion_numero || 'N/A'}
          </div>
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
      key: 'estado',
      label: 'Estado',
      render: (solicitud) => (
        <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
          {solicitud.estado === 'en_proceso' ? 'EN PROCESO' : solicitud.estado.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (solicitud) => (
        <div className="flex items-center gap-2">
          {solicitud.estado !== 'completada' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleCompletarSolicitud(solicitud.id)}
              className="text-sm"
            >
              <CheckCircle size={16} className="mr-1" />
              Completar
            </Button>
          )}
          {solicitud.estado === 'completada' && solicitud.fecha_atencion && (
            <span className="text-sm text-gray-500">
              Completada el {new Date(solicitud.fecha_atencion).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    }
  ]

  // Separar solicitudes por estado
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente')
  const solicitudesCompletadas = solicitudes.filter(s => s.estado === 'completada')

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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {solicitudesPendientes.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas Hoy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {solicitudesCompletadas.filter(s => {
                  if (!s.fecha_atencion) return false
                  const hoy = new Date().toDateString()
                  const fechaCompletada = new Date(s.fecha_atencion).toDateString()
                  return hoy === fechaCompletada
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card module="gestion">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </Card>

      {/* Tabla de Solicitudes */}
      <Card title="Todas las Solicitudes" module="gestion">
        <Table
          columns={columns}
          data={solicitudes}
          emptyMessage="No hay solicitudes registradas"
        />
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
