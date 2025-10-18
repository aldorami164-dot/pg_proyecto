import { useState, useEffect } from 'react'
import huespedesService from '@shared/services/huespedesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Loader from '@shared/components/Loader'
import { Users, UserCheck, History, Search, Eye, Edit, Trash2, Calendar, Phone, Mail, MapPin, IdCard } from 'lucide-react'
import { toast } from 'react-hot-toast'

const HuespedesPage = () => {
  const [activeTab, setActiveTab] = useState('activos')
  const [huespedes, setHuespedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedHuesped, setSelectedHuesped] = useState(null)
  const [huespedDetalle, setHuespedDetalle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Estado del formulario de edición
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dpi_pasaporte: '',
    email: '',
    telefono: '',
    pais: '',
    direccion: '',
    fecha_nacimiento: ''
  })

  const tabs = [
    { id: 'activos', label: 'Activos', icon: Users, description: 'Huéspedes con reservas futuras' },
    { id: 'checkin', label: 'En Hotel', icon: UserCheck, description: 'Huéspedes actualmente en el hotel' },
    { id: 'historicos', label: 'Históricos', icon: History, description: 'Huéspedes con estadías completadas' }
  ]

  useEffect(() => {
    cargarHuespedes()
  }, [activeTab, searchTerm, pagination.page])

  const cargarHuespedes = async () => {
    try {
      setLoading(true)
      const params = {
        tipo: activeTab,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      }

      const response = await huespedesService.listar(params)
      setHuespedes(response.huespedes || [])
      setPagination(prev => ({
        ...prev,
        ...response.pagination
      }))
    } catch (error) {
      console.error('Error al cargar huéspedes:', error)
      toast.error('Error al cargar los huéspedes')
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalle = async (huesped) => {
    try {
      const detalle = await huespedesService.obtener(huesped.id)
      setHuespedDetalle(detalle)
      setShowDetalleModal(true)
    } catch (error) {
      console.error('Error al obtener detalle:', error)
      toast.error('Error al cargar los detalles del huésped')
    }
  }

  const handleEdit = (huesped) => {
    setSelectedHuesped(huesped)
    setFormData({
      nombre: huesped.nombre || '',
      apellido: huesped.apellido || '',
      dpi_pasaporte: huesped.dpi_pasaporte || '',
      email: huesped.email || '',
      telefono: huesped.telefono || '',
      pais: huesped.pais || '',
      direccion: huesped.direccion || '',
      fecha_nacimiento: huesped.fecha_nacimiento ? huesped.fecha_nacimiento.split('T')[0] : ''
    })
    setShowEditModal(true)
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()

    try {
      await huespedesService.actualizar(selectedHuesped.id, formData)
      toast.success('Huésped actualizado exitosamente')
      setShowEditModal(false)
      setSelectedHuesped(null)
      cargarHuespedes()
    } catch (error) {
      console.error('Error al actualizar huésped:', error)
      const errorMsg = error.response?.data?.message || 'Error al actualizar el huésped'
      toast.error(errorMsg)
    }
  }

  const handleDelete = async (huesped) => {
    // Validar que es un huésped histórico
    if (parseInt(huesped.reservas_pendientes) > 0 || parseInt(huesped.reservas_confirmadas) > 0) {
      toast.error('No se puede eliminar un huésped con reservas activas o confirmadas')
      return
    }

    if (!confirm(`¿Está seguro de eliminar al huésped ${huesped.nombre} ${huesped.apellido || ''}?`)) {
      return
    }

    try {
      await huespedesService.eliminar(huesped.id)
      toast.success('Huésped eliminado exitosamente')
      cargarHuespedes()
    } catch (error) {
      console.error('Error al eliminar huésped:', error)
      const errorMsg = error.response?.data?.message || 'Error al eliminar el huésped'
      toast.error(errorMsg)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getBadgeEstado = (huesped) => {
    const activos = parseInt(huesped.reservas_pendientes) || 0
    const confirmadas = parseInt(huesped.reservas_confirmadas) || 0
    const completadas = parseInt(huesped.reservas_completadas) || 0
    const canceladas = parseInt(huesped.reservas_canceladas) || 0

    if (confirmadas > 0) {
      return <Badge variant="success">En Hotel ({confirmadas})</Badge>
    }
    if (activos > 0) {
      return <Badge variant="warning">Reserva Futura ({activos})</Badge>
    }
    if (completadas > 0 || canceladas > 0) {
      return <Badge variant="info">Histórico</Badge>
    }
    return <Badge variant="secondary">Sin reservas</Badge>
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (huesped) => (
        <div>
          <div className="font-medium text-gray-900">
            {huesped.nombre} {huesped.apellido || ''}
          </div>
          {huesped.email && (
            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" />
              {huesped.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (huesped) => (
        <div className="text-sm">
          {huesped.telefono && (
            <div className="flex items-center gap-1 text-gray-700">
              <Phone className="w-3 h-3" />
              {huesped.telefono}
            </div>
          )}
          {huesped.pais && (
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {huesped.pais}
            </div>
          )}
          {huesped.dpi_pasaporte && (
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <IdCard className="w-3 h-3" />
              {huesped.dpi_pasaporte}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'reservas',
      label: 'Reservas',
      render: (huesped) => (
        <div className="flex flex-wrap gap-1">
          {getBadgeEstado(huesped)}
        </div>
      )
    },
    {
      key: 'estadisticas',
      label: 'Estadísticas',
      render: (huesped) => (
        <div className="text-sm text-gray-600">
          <div>Total: {huesped.total_reservas || 0}</div>
          <div className="text-xs text-gray-500">
            C: {huesped.reservas_completadas || 0} |
            Ca: {huesped.reservas_canceladas || 0}
          </div>
        </div>
      )
    },
    {
      key: 'proximas_fechas',
      label: 'Próximas Fechas',
      render: (huesped) => (
        <div className="text-sm">
          {huesped.proxima_entrada && (
            <div className="text-blue-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Entrada: {new Date(huesped.proxima_entrada).toLocaleDateString()}
            </div>
          )}
          {huesped.proxima_salida && (
            <div className="text-orange-600 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              Salida: {new Date(huesped.proxima_salida).toLocaleDateString()}
            </div>
          )}
          {!huesped.proxima_entrada && !huesped.proxima_salida && (
            <span className="text-gray-400">—</span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (huesped) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleVerDetalle(huesped)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(huesped)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {activeTab === 'historicos' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(huesped)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Huéspedes</h1>
          <p className="text-gray-600 mt-1">Administra la información de los huéspedes del hotel</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPagination(prev => ({ ...prev, page: 1 }))
                  setSearchTerm('')
                }}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Descripción del tab actual */}
      <Card>
        <div className="flex items-center gap-3 text-gray-600">
          {(() => {
            const currentTab = tabs.find(t => t.id === activeTab)
            const Icon = currentTab.icon
            return (
              <>
                <Icon className="w-5 h-5 text-gray-400" />
                <p>{currentTab.description}</p>
              </>
            )
          })()}
        </div>
      </Card>

      {/* Búsqueda */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre, apellido, email, teléfono o DPI..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      {loading ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        </Card>
      ) : (
        <Card>
          {huespedes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron huéspedes
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'No hay huéspedes que coincidan con tu búsqueda'
                  : `No hay huéspedes ${activeTab === 'activos' ? 'con reservas futuras' : activeTab === 'checkin' ? 'actualmente en el hotel' : 'históricos'}`
                }
              </p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={huespedes} />

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} huéspedes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Modal de Detalle */}
      <Modal
        isOpen={showDetalleModal}
        onClose={() => {
          setShowDetalleModal(false)
          setHuespedDetalle(null)
        }}
        title="Detalle del Huésped"
      >
        {huespedDetalle && (
          <div className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="mt-1 text-gray-900">{huespedDetalle.nombre} {huespedDetalle.apellido || ''}</p>
                </div>
                {huespedDetalle.dpi_pasaporte && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DPI/Pasaporte</label>
                    <p className="mt-1 text-gray-900">{huespedDetalle.dpi_pasaporte}</p>
                  </div>
                )}
                {huespedDetalle.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{huespedDetalle.email}</p>
                  </div>
                )}
                {huespedDetalle.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="mt-1 text-gray-900">{huespedDetalle.telefono}</p>
                  </div>
                )}
                {huespedDetalle.pais && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <p className="mt-1 text-gray-900">{huespedDetalle.pais}</p>
                  </div>
                )}
                {huespedDetalle.fecha_nacimiento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(huespedDetalle.fecha_nacimiento).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {huespedDetalle.direccion && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="mt-1 text-gray-900">{huespedDetalle.direccion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Reservas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Reservas</h3>
              {huespedDetalle.reservas && huespedDetalle.reservas.length > 0 ? (
                <div className="space-y-3">
                  {huespedDetalle.reservas.map((reserva) => (
                    <div key={reserva.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            Habitación {reserva.habitacion_numero} - {reserva.tipo_habitacion}
                          </p>
                          <p className="text-sm text-gray-600">
                            Código: {reserva.codigo_reserva}
                          </p>
                        </div>
                        <Badge
                          variant={
                            reserva.estado === 'confirmada' ? 'success' :
                            reserva.estado === 'pendiente' ? 'warning' :
                            reserva.estado === 'completada' ? 'info' : 'danger'
                          }
                        >
                          {reserva.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Check-in:</span>{' '}
                          <span className="text-gray-900">
                            {new Date(reserva.fecha_checkin).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-out:</span>{' '}
                          <span className="text-gray-900">
                            {new Date(reserva.fecha_checkout).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Noches:</span>{' '}
                          <span className="text-gray-900">{reserva.numero_noches}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>{' '}
                          <span className="text-gray-900">
                            Q{parseFloat(reserva.precio_total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No hay reservas registradas</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedHuesped(null)
        }}
        title="Editar Huésped"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="DPI/Pasaporte"
              name="dpi_pasaporte"
              value={formData.dpi_pasaporte}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
            />
            <Input
              label="País"
              name="pais"
              value={formData.pais}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Fecha de Nacimiento"
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleInputChange}
          />

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false)
                setSelectedHuesped(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default HuespedesPage
