import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import reservasService from '@shared/services/reservasService'
import Card from '@shared/components/Card'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Modal from '@shared/components/Modal'
import Loader from '@shared/components/Loader'
import { CheckCircle, XCircle, Eye, Archive, Trash2, ChevronDown, Calendar } from 'lucide-react'
import { formatDate, formatCurrency, calcularNoches } from '@shared/utils/formatters'
import toastMessages from '@shared/utils/toastMessages'

const HistorialReservasPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('completadas') // 'completadas' | 'canceladas'
  const [reservas, setReservas] = useState([])
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reservaToDelete, setReservaToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Estados para paginación y filtros
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15, // Mostrar 15 por defecto
    total: 0,
    totalPages: 0
  })
  const [filtroFechas, setFiltroFechas] = useState('ultimos30') // 'ultimos7' | 'ultimos30' | 'ultimos90' | 'todos'

  useEffect(() => {
    cargarReservas()
  }, [activeTab, pagination.page, filtroFechas])

  // Calcular rango de fechas según el filtro
  const calcularRangoFechas = () => {
    if (filtroFechas === 'todos') return {}

    const hoy = new Date()
    const fechaHasta = hoy.toISOString().split('T')[0]
    let fechaDesde = new Date()

    switch (filtroFechas) {
      case 'ultimos7':
        fechaDesde.setDate(hoy.getDate() - 7)
        break
      case 'ultimos30':
        fechaDesde.setDate(hoy.getDate() - 30)
        break
      case 'ultimos90':
        fechaDesde.setDate(hoy.getDate() - 90)
        break
      default:
        return {}
    }

    return {
      fecha_desde: fechaDesde.toISOString().split('T')[0],
      fecha_hasta: fechaHasta
    }
  }

  const cargarReservas = async () => {
    try {
      setLoading(true)
      const rangoFechas = calcularRangoFechas()
      const params = {
        estado: activeTab === 'completadas' ? 'completada' : 'cancelada',
        page: pagination.page,
        limit: pagination.limit,
        ...rangoFechas
      }
      const response = await reservasService.listar(params)
      setReservas(response.reservas || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }))
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toastMessages.reservas.cargar.error()
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarReserva = async () => {
    if (!reservaToDelete) return

    try {
      setDeleting(true)
      await reservasService.eliminar(reservaToDelete.id)
      toastMessages.reservas.eliminar.success()
      setShowDeleteModal(false)
      setReservaToDelete(null)
      cargarReservas() // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar reserva:', error)
      console.error('Detalles del error:', error.response?.data)
      console.error('Mensaje del backend:', error.response?.data?.message)

      // Mostrar mensaje específico del backend si está disponible
      const errorMessage = error.response?.data?.message || 'Error al eliminar la reserva'
      toastMessages.generico.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleChangePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleChangeFiltroFechas = (nuevoFiltro) => {
    setFiltroFechas(nuevoFiltro)
    setPagination(prev => ({ ...prev, page: 1 })) // Resetear a página 1
  }

  const handleVerDetalle = (reserva) => {
    setSelectedReserva(reserva)
    setShowDetailModal(true)
  }

  const handleConfirmarEliminar = (reserva) => {
    setReservaToDelete(reserva)
    setShowDeleteModal(true)
  }

  const getEstadoBadgeVariant = (estado) => {
    return estado === 'completada' ? 'info' : 'danger'
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (reserva) => `#${reserva.id}`
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (reserva) => reserva.codigo_reserva || 'N/A'
    },
    {
      key: 'huesped',
      label: 'Huésped',
      render: (reserva) => (
        <div>
          <div className="font-medium text-gray-900">{reserva.huesped_nombre}</div>
          <div className="text-sm text-gray-500">{reserva.huesped_email || 'Sin email'}</div>
        </div>
      )
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (reserva) => `Hab. ${reserva.habitacion_numero || 'N/A'}`
    },
    {
      key: 'fechas',
      label: 'Fechas',
      render: (reserva) => (
        <div className="text-sm">
          <div>Check-in: {formatDate(reserva.fecha_checkin)}</div>
          <div>Check-out: {formatDate(reserva.fecha_checkout)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {calcularNoches(reserva.fecha_checkin, reserva.fecha_checkout)} noche(s)
          </div>
        </div>
      )
    },
    {
      key: 'precio',
      label: 'Total',
      render: (reserva) => formatCurrency(reserva.precio_total)
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (reserva) => (
        <Badge variant={getEstadoBadgeVariant(reserva.estado_nombre)}>
          {reserva.estado_nombre?.toUpperCase() || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (reserva) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerDetalle(reserva)}
            className="text-gestion-primary-600 hover:text-gestion-primary-700"
            title="Ver detalles"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleConfirmarEliminar(reserva)}
            className="text-red-600 hover:text-red-700"
            title="Eliminar reserva"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  if (loading && reservas.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Archive size={28} />
            Historial de Reservas
          </h1>
          <p className="text-gray-600 mt-1">
            Consulta reservas completadas y canceladas
          </p>
        </div>
      </div>

      {/* Tabs y Filtros */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('completadas')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === 'completadas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <CheckCircle size={18} />
              Completadas
            </button>
            <button
              onClick={() => setActiveTab('canceladas')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === 'canceladas'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <XCircle size={18} />
              Canceladas
            </button>
          </nav>

          {/* Filtro de fechas */}
          <div className="flex items-center gap-2 pb-4">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={filtroFechas}
              onChange={(e) => handleChangeFiltroFechas(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gestion-primary-500"
            >
              <option value="ultimos7">Últimos 7 días</option>
              <option value="ultimos30">Últimos 30 días</option>
              <option value="ultimos90">Últimos 3 meses</option>
              <option value="todos">Todas las fechas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total {activeTab}</p>
              <p className="text-2xl font-bold text-gray-900">{reservas.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${activeTab === 'completadas' ? 'bg-blue-100' : 'bg-red-100'}`}>
              {activeTab === 'completadas' ? (
                <CheckCircle className="text-blue-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
            </div>
          </div>
        </Card>

        {/* Ingresos totales - SOLO para completadas */}
        {activeTab === 'completadas' && (
          <Card module="gestion">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reservas.reduce((sum, r) => sum + parseFloat(r.precio_total || 0), 0))}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total noches</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservas.reduce((sum, r) => sum + calcularNoches(r.fecha_checkin, r.fecha_checkout), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla */}
      <Card module="gestion">
        <Table
          columns={columns}
          data={reservas}
          emptyMessage={`No hay reservas ${activeTab}`}
        />

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Mostrando {reservas.length} de {pagination.total} reservas
              {filtroFechas !== 'todos' && (
                <span className="ml-1 text-gray-500">
                  (filtradas por {filtroFechas === 'ultimos7' ? 'últimos 7 días' : filtroFechas === 'ultimos30' ? 'últimos 30 días' : 'últimos 3 meses'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChangePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1.5 text-sm border rounded-lg ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handleChangePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-1.5 text-sm border rounded-lg ${
                  pagination.page === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Detalles (solo lectura) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedReserva(null)
        }}
        title="Detalles de la Reserva"
        size="md"
      >
        {selectedReserva && (
          <div className="space-y-4">
            {/* Banner de estado */}
            <div className={`border-l-4 p-4 ${
              selectedReserva.estado_nombre === 'completada'
                ? 'bg-blue-50 border-blue-400'
                : 'bg-red-50 border-red-400'
            }`}>
              <p className="text-sm font-medium flex items-center gap-2">
                {selectedReserva.estado_nombre === 'completada' ? (
                  <>
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-blue-800">Reserva completada exitosamente</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-red-800">Reserva cancelada</span>
                  </>
                )}
              </p>
              {selectedReserva.fecha_cancelacion && activeTab === 'canceladas' && (
                <p className="text-xs text-red-700 mt-1">
                  Cancelada el: {formatDate(selectedReserva.fecha_cancelacion)}
                </p>
              )}
            </div>

            {/* Información general */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Reserva</label>
                <p className="text-gray-900">#{selectedReserva.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Código</label>
                <p className="text-gray-900 font-mono">{selectedReserva.codigo_reserva || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge variant={getEstadoBadgeVariant(selectedReserva.estado_nombre)}>
                    {selectedReserva.estado_nombre?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Canal</label>
                <p className="text-gray-900 capitalize">{selectedReserva.canal || 'N/A'}</p>
              </div>
            </div>

            {/* Datos del huésped */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Información del Huésped</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre completo</label>
                  <p className="text-gray-900">{selectedReserva.huesped_nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedReserva.huesped_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{selectedReserva.huesped_telefono || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">País</label>
                  <p className="text-gray-900">{selectedReserva.huesped_pais || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Datos de la reserva */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Detalles de la Estadía</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Habitación</label>
                  <p className="text-gray-900">Hab. {selectedReserva.habitacion_numero || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <p className="text-gray-900">{selectedReserva.tipo_habitacion || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-in</label>
                  <p className="text-gray-900">{formatDate(selectedReserva.fecha_checkin)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-out</label>
                  <p className="text-gray-900">{formatDate(selectedReserva.fecha_checkout)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Noches</label>
                  <p className="text-gray-900">
                    {calcularNoches(selectedReserva.fecha_checkin, selectedReserva.fecha_checkout)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Huéspedes</label>
                  <p className="text-gray-900">{selectedReserva.numero_huespedes}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Precio por noche</label>
                  <p className="text-gray-900">{formatCurrency(selectedReserva.precio_por_noche)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Precio Total</label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {formatCurrency(selectedReserva.precio_total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {selectedReserva.notas && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded">{selectedReserva.notas}</p>
              </div>
            )}

            {/* Información de registro */}
            <div className="border-t pt-4 text-xs text-gray-500">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Creada por:</span> {selectedReserva.creado_por_nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Fecha de creación:</span> {formatDate(selectedReserva.creado_en)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setReservaToDelete(null)
        }}
        title="Confirmar Eliminación"
        size="sm"
      >
        {reservaToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <Trash2 className="text-red-600 mt-0.5 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    ¿Estás seguro de eliminar esta reserva {activeTab === 'canceladas' ? 'cancelada' : 'completada'}?
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta acción no se puede deshacer. La reserva será eliminada permanentemente del sistema.
                  </p>
                  <p className="text-xs text-red-700 mt-2">
                    {activeTab === 'completadas'
                      ? 'Nota: Solo elimina reservas completadas si necesitas limpiar el historial.'
                      : 'Nota: Esto es útil para limpiar reservas canceladas antiguas del historial.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">Reserva #{reservaToDelete.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                Código: {reservaToDelete.codigo_reserva || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                Huésped: {reservaToDelete.huesped_nombre}
              </p>
              <p className="text-xs text-gray-600">
                Habitación: {reservaToDelete.habitacion_numero}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setReservaToDelete(null)
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarReserva}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Eliminar Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HistorialReservasPage
