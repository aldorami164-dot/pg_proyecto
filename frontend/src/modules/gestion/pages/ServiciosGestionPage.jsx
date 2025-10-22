import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import serviciosService from '@shared/services/serviciosService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import { Sparkles, Plus, Edit, Trash2, List, Check, DollarSign, Clock, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ServiciosGestionPage = () => {
  const { isAdmin } = useAuth()
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInstruccionesModal, setShowInstruccionesModal] = useState(false)
  const [selectedServicio, setSelectedServicio] = useState(null)
  const [instruccionesServicio, setInstruccionesServicio] = useState([])
  const [loadingInstrucciones, setLoadingInstrucciones] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('')

  // Estado del formulario de servicio
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    precio: '',
    tiene_costo: false,
    horario_inicio: '',
    horario_fin: '',
    solicitable: true,
    icono: 'CheckCircle'
  })

  // Estado del formulario de instrucción
  const [instruccionForm, setInstruccionForm] = useState({
    texto_instruccion: '',
    orden: 0
  })
  const [editingInstruccion, setEditingInstruccion] = useState(null)

  const categorias = [
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'alimentos', label: 'Alimentos y Bebidas' },
    { value: 'lavanderia', label: 'Lavandería' },
    { value: 'bienestar', label: 'Bienestar' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'otros', label: 'Otros' }
  ]

  const iconos = [
    { value: 'CheckCircle', label: '✓ CheckCircle' },
    { value: 'Sparkles', label: '✨ Sparkles' },
    { value: 'Shirt', label: '👕 Shirt (Lavandería)' },
    { value: 'Waves', label: '🌊 Waves (Sauna)' },
    { value: 'UtensilsCrossed', label: '🍴 UtensilsCrossed (Comida)' },
    { value: 'Droplets', label: '💧 Droplets (Limpieza)' },
    { value: 'Coffee', label: '☕ Coffee' },
    { value: 'Car', label: '🚗 Car (Transporte)' },
    { value: 'Home', label: '🏠 Home' },
    { value: 'Bell', label: '🔔 Bell' }
  ]

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    try {
      setLoading(true)
      const data = await serviciosService.getServicios()
      // El backend retorna { servicios: [...], total: ... }
      setServicios(data.servicios || [])
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      toast.error('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Convertir horarios de HH:MM:SS a HH:MM si es necesario
      const formatearHorario = (horario) => {
        if (!horario) return null
        // Si viene en formato HH:MM:SS, convertir a HH:MM
        if (horario.length === 8) {
          return horario.substring(0, 5)
        }
        return horario
      }

      const dataToSend = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion || '',
        precio: formData.tiene_costo && formData.precio ? parseFloat(formData.precio) : null,
        tiene_costo: formData.tiene_costo,
        horario_inicio: formatearHorario(formData.horario_inicio),
        horario_fin: formatearHorario(formData.horario_fin),
        solicitable: formData.solicitable,
        icono: formData.icono
      }

      if (selectedServicio) {
        await serviciosService.updateServicio(selectedServicio.id, dataToSend)
        toast.success('Servicio actualizado exitosamente')
      } else {
        await serviciosService.createServicio(dataToSend)
        toast.success('Servicio creado exitosamente')
      }

      setShowModal(false)
      resetForm()
      await cargarServicios()
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      const mensaje = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el servicio'
      toast.error(mensaje)
    }
  }

  const handleDesactivar = async (servicioId) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este servicio?')) {
      return
    }

    try {
      await serviciosService.deleteServicio(servicioId)
      toast.success('Servicio desactivado exitosamente')
      cargarServicios()
    } catch (error) {
      console.error('Error al desactivar servicio:', error)
      toast.error('Error al desactivar el servicio')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      descripcion: '',
      precio: '',
      tiene_costo: false,
      horario_inicio: '',
      horario_fin: '',
      solicitable: true,
      icono: 'CheckCircle'
    })
    setSelectedServicio(null)
  }

  const handleEdit = (servicio) => {
    setSelectedServicio(servicio)
    setFormData({
      nombre: servicio.nombre || '',
      categoria: servicio.categoria || '',
      descripcion: servicio.descripcion || '',
      precio: servicio.precio || '',
      tiene_costo: servicio.tiene_costo || false,
      horario_inicio: servicio.horario_inicio || '',
      horario_fin: servicio.horario_fin || '',
      solicitable: servicio.solicitable !== undefined ? servicio.solicitable : true,
      icono: servicio.icono || 'CheckCircle'
    })
    setShowModal(true)
  }

  // ========== GESTIÓN DE INSTRUCCIONES ==========

  const abrirModalInstrucciones = async (servicio) => {
    setSelectedServicio(servicio)
    setShowInstruccionesModal(true)
    setLoadingInstrucciones(true)

    try {
      const data = await serviciosService.getInstrucciones(servicio.id)
      // El backend retorna { instrucciones: [...], total: ... }
      setInstruccionesServicio(data.instrucciones || [])
    } catch (error) {
      console.error('Error al cargar instrucciones:', error)
      toast.error('Error al cargar las instrucciones del servicio')
    } finally {
      setLoadingInstrucciones(false)
    }
  }

  const handleSubmitInstruccion = async (e) => {
    e.preventDefault()

    if (!selectedServicio) return

    try {
      const dataToSend = {
        texto_instruccion: instruccionForm.texto_instruccion,
        orden: parseInt(instruccionForm.orden) || 0
      }

      if (editingInstruccion) {
        await serviciosService.updateInstruccion(
          selectedServicio.id,
          editingInstruccion.id,
          dataToSend
        )
        toast.success('Instrucción actualizada exitosamente')
      } else {
        await serviciosService.createInstruccion(selectedServicio.id, dataToSend)
        toast.success('Instrucción agregada exitosamente')
      }

      resetInstruccionForm()

      // Recargar instrucciones
      const data = await serviciosService.getInstrucciones(selectedServicio.id)
      setInstruccionesServicio(data.instrucciones || [])
    } catch (error) {
      console.error('Error al guardar instrucción:', error)
      const mensaje = error.response?.data?.error || error.response?.data?.message || 'Error al guardar la instrucción'
      toast.error(mensaje)
    }
  }

  const handleEditInstruccion = (instruccion) => {
    setEditingInstruccion(instruccion)
    setInstruccionForm({
      texto_instruccion: instruccion.texto_instruccion,
      orden: instruccion.orden || 0
    })
  }

  const handleEliminarInstruccion = async (instruccionId) => {
    if (!selectedServicio) return

    if (!confirm('¿Estás seguro de que deseas eliminar esta instrucción?')) {
      return
    }

    try {
      await serviciosService.deleteInstruccion(selectedServicio.id, instruccionId)
      toast.success('Instrucción eliminada exitosamente')

      // Recargar instrucciones
      const data = await serviciosService.getInstrucciones(selectedServicio.id)
      setInstruccionesServicio(data.instrucciones || [])
    } catch (error) {
      console.error('Error al eliminar instrucción:', error)
      const mensaje = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar la instrucción'
      toast.error(mensaje)
    }
  }

  const resetInstruccionForm = () => {
    setInstruccionForm({
      texto_instruccion: '',
      orden: 0
    })
    setEditingInstruccion(null)
  }

  const getCategoriaColor = (categoria) => {
    const colores = {
      limpieza: 'from-blue-400 to-cyan-500',
      alimentos: 'from-orange-400 to-amber-500',
      lavanderia: 'from-purple-400 to-pink-500',
      bienestar: 'from-green-400 to-emerald-600',
      transporte: 'from-gray-400 to-slate-600',
      otros: 'from-indigo-400 to-purple-500'
    }
    return colores[categoria] || 'from-gray-400 to-gray-600'
  }

  // Filtrar servicios por categoría
  const serviciosFiltrados = filtroCategoria
    ? servicios.filter(s => s.categoria === filtroCategoria)
    : servicios

  if (loading && servicios.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card module="gestion" className="border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Administra los servicios disponibles para los huéspedes</p>
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
              Nuevo Servicio
            </Button>
          )}
        </div>
      </Card>

      {/* Filtros */}
      {servicios.length > 0 && (
        <Card module="gestion">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-500" />
            <h3 className="font-medium text-gray-900">Filtrar por categoría</h3>
          </div>
          <div className="max-w-xs">
            <Select
              name="categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categorias
              ]}
              module="gestion"
            />
          </div>
          {filtroCategoria && (
            <div className="mt-3 text-sm text-gray-600">
              Mostrando {serviciosFiltrados.length} de {servicios.length} servicios
            </div>
          )}
        </Card>
      )}

      {/* Grid de Servicios */}
      {servicios.length === 0 && !loading ? (
        <Card module="gestion" className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay servicios registrados</p>
        </Card>
      ) : serviciosFiltrados.length === 0 ? (
        <Card module="gestion" className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay servicios en esta categoría</p>
          <Button
            variant="secondary"
            module="gestion"
            onClick={() => setFiltroCategoria('')}
            className="mt-4"
          >
            Limpiar filtro
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviciosFiltrados.map((servicio) => (
            <Card key={servicio.id} module="gestion" className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border group">
              {/* Header con imagen o gradiente */}
              <div className={`relative h-48 ${!servicio.imagen_principal ? `bg-gradient-to-br ${getCategoriaColor(servicio.categoria)}` : 'bg-gray-900'} flex items-center justify-center overflow-hidden`}>
                {/* Badge de categoría */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="default" className="bg-white/90 text-gray-800 capitalize text-xs">
                    {servicio.categoria}
                  </Badge>
                </div>

                {/* Badge de tiene costo */}
                {servicio.tiene_costo && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="success" className="flex items-center gap-1 text-xs">
                      <DollarSign size={12} />
                      Q{servicio.precio}
                    </Badge>
                  </div>
                )}

                {/* Imagen real o icono placeholder */}
                {servicio.imagen_principal ? (
                  <img
                    src={servicio.imagen_principal.url_imagen || servicio.imagen_principal}
                    alt={servicio.imagen_principal.titulo || servicio.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                {/* Icono central placeholder */}
                <div className={`relative z-10 ${servicio.imagen_principal ? 'hidden' : 'flex'} items-center justify-center`}>
                  <Sparkles className="w-12 h-12 text-white/90" strokeWidth={1.5} />
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {servicio.nombre}
                </h3>

                {servicio.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {servicio.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div className="space-y-1 mb-4 pb-3 border-b border-gray-200">
                  {(servicio.horario_inicio && servicio.horario_fin) && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={12} />
                      {servicio.horario_inicio} - {servicio.horario_fin}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={servicio.solicitable ? 'success' : 'default'} className="text-xs">
                      {servicio.solicitable ? 'Solicitable' : 'Solo informativo'}
                    </Badge>
                  </div>
                </div>

                {/* Botones de acción */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={() => abrirModalInstrucciones(servicio)}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <List size={14} />
                      <span className="text-xs">Gestionar Instrucciones</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        module="gestion"
                        onClick={() => handleEdit(servicio)}
                        className="flex-1"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDesactivar(servicio.id)}
                        className="flex-1"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Servicio */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Servicio"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            module="gestion"
            placeholder="Ej: Lavandería Express"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoría"
              name="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              options={categorias}
              required
              module="gestion"
            />

            <Select
              label="Icono"
              name="icono"
              value={formData.icono}
              onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
              options={iconos}
              required
              module="gestion"
            />
          </div>

          <Textarea
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            module="gestion"
            placeholder="Describe el servicio..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tiene_costo"
                checked={formData.tiene_costo}
                onChange={(e) => setFormData({ ...formData, tiene_costo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="tiene_costo" className="text-sm text-gray-700">
                Tiene costo
              </label>
            </div>

            {formData.tiene_costo && (
              <Input
                label="Precio (Q)"
                type="number"
                name="precio"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                min="0"
                step="0.01"
                module="gestion"
                placeholder="0.00"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Horario Inicio (opcional)"
              type="time"
              name="horario_inicio"
              value={formData.horario_inicio}
              onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
              module="gestion"
            />

            <Input
              label="Horario Fin (opcional)"
              type="time"
              name="horario_fin"
              value={formData.horario_fin}
              onChange={(e) => setFormData({ ...formData, horario_fin: e.target.value })}
              module="gestion"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="solicitable"
              checked={formData.solicitable}
              onChange={(e) => setFormData({ ...formData, solicitable: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="solicitable" className="text-sm text-gray-700">
              Los huéspedes pueden solicitar este servicio
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              {selectedServicio ? 'Actualizar' : 'Crear'} Servicio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestionar Instrucciones */}
      <Modal
        isOpen={showInstruccionesModal}
        onClose={() => {
          setShowInstruccionesModal(false)
          setSelectedServicio(null)
          setInstruccionesServicio([])
          resetInstruccionForm()
        }}
        title={selectedServicio ? `Instrucciones - ${selectedServicio.nombre}` : 'Gestionar Instrucciones'}
        size="lg"
      >
        {selectedServicio && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedServicio.nombre}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Agrega instrucciones o pasos para usar este servicio. Se mostrarán en la vista pública.
              </p>
            </div>

            {/* Formulario para agregar/editar instrucción */}
            <Card module="gestion" className="bg-gray-50">
              <form onSubmit={handleSubmitInstruccion} className="space-y-3">
                <Textarea
                  label={editingInstruccion ? 'Editar Instrucción' : 'Nueva Instrucción'}
                  name="texto_instruccion"
                  value={instruccionForm.texto_instruccion}
                  onChange={(e) => setInstruccionForm({ ...instruccionForm, texto_instruccion: e.target.value })}
                  rows={2}
                  module="gestion"
                  placeholder="Ej: Coloca tu ropa en la bolsa especial de lavandería"
                  required
                />

                <Input
                  label="Orden"
                  type="number"
                  name="orden"
                  value={instruccionForm.orden}
                  onChange={(e) => setInstruccionForm({ ...instruccionForm, orden: e.target.value })}
                  min="0"
                  module="gestion"
                />

                <div className="flex justify-end gap-2">
                  {editingInstruccion && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={resetInstruccionForm}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" variant="primary" size="sm" module="gestion">
                    {editingInstruccion ? 'Actualizar' : 'Agregar'} Instrucción
                  </Button>
                </div>
              </form>
            </Card>

            {/* Lista de instrucciones */}
            {loadingInstrucciones ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : instruccionesServicio.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <List className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No hay instrucciones agregadas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Usa el formulario de arriba para agregar instrucciones
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm">Instrucciones actuales:</h4>
                {instruccionesServicio.map((instruccion, index) => (
                  <Card key={instruccion.id} module="gestion" className="p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gestion-primary-100 text-gestion-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{instruccion.texto_instruccion}</p>
                        <p className="text-xs text-gray-500 mt-1">Orden: {instruccion.orden}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          module="gestion"
                          onClick={() => handleEditInstruccion(instruccion)}
                          className="px-2"
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminarInstruccion(instruccion.id)}
                          className="px-2"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowInstruccionesModal(false)
                  setSelectedServicio(null)
                  setInstruccionesServicio([])
                  resetInstruccionForm()
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

export default ServiciosGestionPage
