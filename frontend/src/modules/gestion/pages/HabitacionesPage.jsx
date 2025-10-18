import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import habitacionesService from '@shared/services/habitacionesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import { Home, Plus, Edit, Trash2, Settings, Users, DollarSign, Check, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

const HabitacionesPage = () => {
  const { isAdmin } = useAuth()
  const [habitaciones, setHabitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [showImagenesModal, setShowImagenesModal] = useState(false)
  const [selectedHabitacion, setSelectedHabitacion] = useState(null)
  const [imagenesHabitacion, setImagenesHabitacion] = useState([])
  const [loadingImagenes, setLoadingImagenes] = useState(false)
  const [filters, setFilters] = useState({
    estado: '',
    tipo_habitacion_id: ''
  })

  // Estado del formulario
  const [formData, setFormData] = useState({
    numero: '',
    tipo_habitacion: '',
    precio_por_noche: '',
    descripcion: '',
    capacidad_maxima: 2
  })

  // Estado para cambiar estado de habitación
  const [nuevoEstado, setNuevoEstado] = useState('')

  const estadosHabitacion = [
    { value: '', label: 'Todos los estados' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'limpieza', label: 'En Limpieza' },
    { value: 'mantenimiento', label: 'Mantenimiento' }
  ]

  const tiposHabitacion = [
    { value: 'simple', label: 'Individual' },
    { value: 'doble', label: 'Doble' },
    { value: 'triple', label: 'Triple' },
    { value: 'familiar', label: 'Familiar' }
  ]

  const tiposHabitacionFiltro = [
    { value: '', label: 'Todos los tipos' },
    { value: '1', label: 'Individual' },
    { value: '2', label: 'Doble' },
    { value: '3', label: 'Triple' },
    { value: '4', label: 'Familiar' }
  ]

  useEffect(() => {
    cargarHabitaciones()
  }, [filters])

  const cargarHabitaciones = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.estado) params.estado = filters.estado
      if (filters.tipo_habitacion_id) params.tipo_habitacion_id = filters.tipo_habitacion_id

      const response = await habitacionesService.listar(params)
      setHabitaciones(response.habitaciones || [])
    } catch (error) {
      console.error('Error al cargar habitaciones:', error)
      toast.error('Error al cargar las habitaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Mapear tipo de habitación a ID
      const tipoHabitacionMap = {
        'simple': 1,
        'doble': 2,
        'triple': 3,
        'familiar': 4
      }

      const dataToSend = {
        numero: formData.numero,
        tipo_habitacion_id: tipoHabitacionMap[formData.tipo_habitacion],
        precio_por_noche: parseFloat(formData.precio_por_noche),
        descripcion: formData.descripcion || ''
      }

      if (selectedHabitacion) {
        // Para actualizar solo enviar precio y descripción
        console.log('Actualizando habitación:', selectedHabitacion.id, {
          precio_por_noche: dataToSend.precio_por_noche,
          descripcion: dataToSend.descripcion
        })

        const result = await habitacionesService.actualizar(selectedHabitacion.id, {
          precio_por_noche: dataToSend.precio_por_noche,
          descripcion: dataToSend.descripcion
        })

        console.log('Resultado de actualización:', result)
        toast.success('Habitación actualizada exitosamente')
      } else {
        await habitacionesService.crear(dataToSend)
        toast.success('Habitación creada exitosamente')
      }

      setShowModal(false)
      resetForm()
      await cargarHabitaciones()
    } catch (error) {
      console.error('Error al guardar habitación:', error)
      toast.error(error.response?.data?.message || 'Error al guardar la habitación')
    }
  }

  const handleCambiarEstado = async () => {
    if (!nuevoEstado || !selectedHabitacion) return

    try {
      await habitacionesService.cambiarEstado(selectedHabitacion.id, nuevoEstado)
      toast.success('Estado actualizado exitosamente')
      setShowEstadoModal(false)
      setSelectedHabitacion(null)
      setNuevoEstado('')
      cargarHabitaciones()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado')
    }
  }

  const handleDesactivar = async (habitacionId) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta habitación?')) {
      return
    }

    try {
      await habitacionesService.desactivar(habitacionId)
      toast.success('Habitación desactivada exitosamente')
      cargarHabitaciones()
    } catch (error) {
      console.error('Error al desactivar habitación:', error)
      toast.error('Error al desactivar la habitación')
    }
  }

  const resetForm = () => {
    setFormData({
      numero: '',
      tipo_habitacion: '',
      precio_por_noche: '',
      descripcion: '',
      capacidad_maxima: 2
    })
    setSelectedHabitacion(null)
  }

  const handleEdit = (habitacion) => {
    setSelectedHabitacion(habitacion)

    // Mapear ID de tipo de habitación a valor del select
    const tipoHabitacionMap = {
      1: 'simple',
      2: 'doble',
      3: 'triple',
      4: 'familiar'
    }

    setFormData({
      numero: habitacion.numero || '',
      tipo_habitacion: tipoHabitacionMap[habitacion.tipo_habitacion_id] || '',
      precio_por_noche: habitacion.precio_por_noche || '',
      descripcion: habitacion.descripcion || '',
      capacidad_maxima: habitacion.capacidad_maxima || 2
    })
    setShowModal(true)
  }

  const abrirModalEstado = (habitacion) => {
    setSelectedHabitacion(habitacion)
    setNuevoEstado(habitacion.estado)
    setShowEstadoModal(true)
  }

  const abrirModalImagenes = async (habitacion) => {
    setSelectedHabitacion(habitacion)
    setShowImagenesModal(true)
    setLoadingImagenes(true)

    try {
      const response = await habitacionesService.getImagenesHabitacion(habitacion.id)
      setImagenesHabitacion(response.imagenes || [])
    } catch (error) {
      console.error('Error al cargar imágenes:', error)
      toast.error('Error al cargar las imágenes de la habitación')
    } finally {
      setLoadingImagenes(false)
    }
  }

  const handleMarcarPrincipal = async (imagenId) => {
    if (!selectedHabitacion) return

    try {
      await habitacionesService.setImagenPrincipal(selectedHabitacion.id, imagenId)
      toast.success('Imagen marcada como principal')

      // Recargar imágenes
      const response = await habitacionesService.getImagenesHabitacion(selectedHabitacion.id)
      setImagenesHabitacion(response.imagenes || [])

      // Recargar lista de habitaciones para actualizar la vista
      cargarHabitaciones()
    } catch (error) {
      console.error('Error al marcar como principal:', error)
      toast.error('Error al marcar la imagen como principal')
    }
  }

  const handleDesvincular = async (imagenId, tituloImagen) => {
    if (!selectedHabitacion) return

    if (!confirm(`¿Estás seguro de que deseas desvincular la imagen "${tituloImagen}" de esta habitación?`)) {
      return
    }

    try {
      await habitacionesService.desvincularImagen(selectedHabitacion.id, imagenId)
      toast.success('Imagen desvinculada exitosamente')

      // Recargar imágenes
      const response = await habitacionesService.getImagenesHabitacion(selectedHabitacion.id)
      setImagenesHabitacion(response.imagenes || [])

      // Recargar lista de habitaciones
      cargarHabitaciones()
    } catch (error) {
      console.error('Error al desvincular imagen:', error)
      toast.error('Error al desvincular la imagen')
    }
  }

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'disponible': 'success',
      'ocupada': 'danger',
      'limpieza': 'warning',
      'mantenimiento': 'info'
    }
    return variants[estado] || 'default'
  }

  // Función para obtener gradiente según tipo de habitación (placeholder de foto)
  const getGradientePorTipo = (tipoId) => {
    const gradientes = {
      1: 'from-blue-400 to-blue-600',      // Individual
      2: 'from-cyan-400 to-blue-500',      // Doble
      3: 'from-indigo-400 to-blue-600',    // Triple
      4: 'from-slate-500 to-blue-700'      // Familiar
    }
    return gradientes[tipoId] || 'from-gray-400 to-gray-600'
  }

  if (loading && habitaciones.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card module="gestion" className="border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Habitaciones</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Gestiona las habitaciones del hotel</p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              module="gestion"
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="w-full sm:w-auto"
            >
              <Plus size={20} className="mr-2" />
              Nueva Habitación
            </Button>
          )}
        </div>
      </Card>

      {/* Filtros */}
      <Card module="gestion" className="border shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Estado"
            name="estado"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            options={estadosHabitacion}
            module="gestion"
          />

          <Select
            label="Tipo de Habitación"
            name="tipo_habitacion_id"
            value={filters.tipo_habitacion_id}
            onChange={(e) => setFilters({ ...filters, tipo_habitacion_id: e.target.value })}
            options={tiposHabitacionFiltro}
            module="gestion"
          />
        </div>
      </Card>

      {/* Grid de Habitaciones con fotos */}
      {habitaciones.length === 0 && !loading ? (
        <Card module="gestion" className="text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay habitaciones registradas</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {habitaciones.map((habitacion) => (
            <Card key={habitacion.id} module="gestion" className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border group">
              {/* Imagen / Placeholder con gradiente */}
              <div className={`relative h-48 ${!habitacion.imagen_url ? `bg-gradient-to-br ${getGradientePorTipo(habitacion.tipo_habitacion_id)}` : 'bg-gray-900'} flex items-center justify-center overflow-hidden`}>
                {/* Badge de estado flotante con fondo de color */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`
                    px-3 py-1.5 rounded-full font-semibold text-xs shadow-xl border-2
                    flex items-center gap-1.5 backdrop-blur-sm
                    ${habitacion.estado === 'disponible' ? 'bg-green-500/90 text-white border-green-300' :
                      habitacion.estado === 'ocupada' ? 'bg-red-500/90 text-white border-red-300' :
                      habitacion.estado === 'limpieza' ? 'bg-yellow-500/90 text-white border-yellow-300' :
                      habitacion.estado === 'mantenimiento' ? 'bg-blue-500/90 text-white border-blue-300' :
                      'bg-gray-500/90 text-white border-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      habitacion.estado === 'disponible' ? 'bg-green-200' :
                      habitacion.estado === 'ocupada' ? 'bg-red-200' :
                      habitacion.estado === 'limpieza' ? 'bg-yellow-200' :
                      habitacion.estado === 'mantenimiento' ? 'bg-blue-200' : 'bg-gray-200'
                    }`}></span>
                    {habitacion.estado.toUpperCase()}
                  </div>
                </div>

                {/* Imagen real o icono placeholder */}
                {habitacion.imagen_url ? (
                  <img
                    src={habitacion.imagen_url}
                    alt={habitacion.imagen_titulo || `Habitación ${habitacion.numero}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                {/* Icono central placeholder (se muestra si no hay imagen o si falla la carga) */}
                <div className={`relative z-10 ${habitacion.imagen_url ? 'hidden' : 'flex'} items-center justify-center`}>
                  <Home className="w-16 h-16 text-white/80" strokeWidth={1.5} />
                </div>

                {/* Número de habitación en esquina inferior */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">Hab. {habitacion.numero}</h3>
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-4">
                {/* Tipo y capacidad */}
                <div className="mb-3">
                  <h4 className="text-base font-bold text-gray-900 mb-1 capitalize">
                    {habitacion.tipo_habitacion_nombre}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{habitacion.capacidad_maxima || 2} personas</span>
                    </div>
                    {habitacion.tiene_qr_asignado && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>QR</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {habitacion.descripcion && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {habitacion.descripcion}
                  </p>
                )}

                {/* Precio */}
                <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-gray-200">
                  <span className="text-xl font-bold text-gray-900">Q{parseFloat(habitacion.precio_por_noche).toFixed(2)}</span>
                  <span className="text-xs text-gray-500">/ noche</span>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  {/* Primera fila */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      module="gestion"
                      onClick={() => abrirModalEstado(habitacion)}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <Settings size={14} />
                      <span className="text-xs">Estado</span>
                    </Button>

                    {isAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        module="gestion"
                        onClick={() => abrirModalImagenes(habitacion)}
                        className="flex-1 flex items-center justify-center gap-1"
                        title="Gestionar Imágenes"
                      >
                        <ImageIcon size={14} />
                        <span className="text-xs">Imágenes</span>
                      </Button>
                    )}
                  </div>

                  {/* Segunda fila (solo admin) */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        module="gestion"
                        onClick={() => handleEdit(habitacion)}
                        className="flex-1"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDesactivar(habitacion.id)}
                        className="flex-1"
                        title="Desactivar"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedHabitacion ? 'Editar Habitación' : 'Nueva Habitación'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Número de Habitación"
            type="text"
            name="numero"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            required
            module="gestion"
            placeholder="Ej: 101, 102, 201..."
          />

          <Select
            label="Tipo de Habitación"
            name="tipo_habitacion"
            value={formData.tipo_habitacion}
            onChange={(e) => setFormData({ ...formData, tipo_habitacion: e.target.value })}
            options={tiposHabitacion}
            required
            module="gestion"
          />

          <Input
            label="Precio por noche (Q)"
            type="number"
            name="precio_por_noche"
            value={formData.precio_por_noche}
            onChange={(e) => setFormData({ ...formData, precio_por_noche: e.target.value })}
            step="0.01"
            min="0"
            required
            module="gestion"
          />

          <Input
            label="Capacidad máxima"
            type="number"
            name="capacidad_maxima"
            value={formData.capacidad_maxima}
            onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
            min="1"
            max="10"
            required
            module="gestion"
          />

          <Textarea
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            module="gestion"
            placeholder="Descripción de la habitación, amenidades, etc."
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              module="gestion"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" module="gestion">
              {selectedHabitacion ? 'Actualizar' : 'Crear'} Habitación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cambiar Estado */}
      <Modal
        isOpen={showEstadoModal}
        onClose={() => {
          setShowEstadoModal(false)
          setSelectedHabitacion(null)
          setNuevoEstado('')
        }}
        title="Cambiar Estado de Habitación"
        size="sm"
      >
        {selectedHabitacion && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Cambiar estado de la <span className="font-semibold">Habitación {selectedHabitacion.numero}</span>
            </p>

            <Select
              label="Nuevo Estado"
              name="estado"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              options={estadosHabitacion.filter(e => e.value !== '')}
              required
              module="gestion"
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowEstadoModal(false)
                  setSelectedHabitacion(null)
                  setNuevoEstado('')
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                module="gestion"
                onClick={handleCambiarEstado}
                disabled={!nuevoEstado}
              >
                Actualizar Estado
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Gestionar Imágenes */}
      <Modal
        isOpen={showImagenesModal}
        onClose={() => {
          setShowImagenesModal(false)
          setSelectedHabitacion(null)
          setImagenesHabitacion([])
        }}
        title={selectedHabitacion ? `Gestionar Imágenes - Habitación ${selectedHabitacion.numero}` : 'Gestionar Imágenes'}
        size="lg"
      >
        {selectedHabitacion && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Habitación {selectedHabitacion.numero}</strong> - {selectedHabitacion.tipo_habitacion_nombre}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Gestiona las imágenes vinculadas a esta habitación. Marca una como principal o desvincula las que no necesites.
              </p>
            </div>

            {loadingImagenes ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : imagenesHabitacion.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No hay imágenes vinculadas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ve a Galería y usa el botón "Vincular" para agregar imágenes a esta habitación
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {imagenesHabitacion.map((imagen) => (
                  <Card key={imagen.relacion_id} module="gestion" className="p-4">
                    <div className="flex gap-4">
                      {/* Imagen preview */}
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={imagen.url_imagen}
                          alt={imagen.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info y acciones */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">{imagen.titulo}</h4>
                            {imagen.es_principal && (
                              <Badge variant="success" className="flex-shrink-0">
                                ⭐ PRINCIPAL
                              </Badge>
                            )}
                            {!imagen.activo && (
                              <Badge variant="default" className="flex-shrink-0">
                                INACTIVA
                              </Badge>
                            )}
                          </div>
                          {imagen.descripcion && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{imagen.descripcion}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Orden: {imagen.orden} • Vinculada el {new Date(imagen.creado_en).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 mt-3">
                          {!imagen.es_principal && (
                            <Button
                              variant="primary"
                              size="sm"
                              module="gestion"
                              onClick={() => handleMarcarPrincipal(imagen.imagen_id)}
                              className="flex-1"
                            >
                              <Check size={14} className="mr-1" />
                              Marcar como Principal
                            </Button>
                          )}
                          {imagen.es_principal && (
                            <Button
                              variant="secondary"
                              size="sm"
                              module="gestion"
                              disabled
                              className="flex-1"
                            >
                              <Check size={14} className="mr-1" />
                              Es la Principal
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDesvincular(imagen.imagen_id, imagen.titulo)}
                            className="flex-1"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Desvincular
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {imagenesHabitacion.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  ⚠️ <strong>Nota:</strong> Al marcar una imagen como principal, automáticamente se desmarcará la actual. Desvincular una imagen no la elimina de la galería.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowImagenesModal(false)
                  setSelectedHabitacion(null)
                  setImagenesHabitacion([])
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HabitacionesPage
