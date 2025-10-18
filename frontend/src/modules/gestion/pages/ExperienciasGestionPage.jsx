import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import experienciasService from '@shared/services/experienciasService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import { Compass, Plus, Edit, Trash2, Image as ImageIcon, Check, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ExperienciasGestionPage = () => {
  const { isAdmin } = useAuth()
  const [experiencias, setExperiencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImagenesModal, setShowImagenesModal] = useState(false)
  const [selectedExperiencia, setSelectedExperiencia] = useState(null)
  const [imagenesExperiencia, setImagenesExperiencia] = useState([])
  const [loadingImagenes, setLoadingImagenes] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    ubicacion: '',
    duracion: '',
    capacidad: '',
    destacado: false,
    orden: 0
  })

  const categorias = [
    { value: 'aventura', label: 'Aventura' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'naturaleza', label: 'Naturaleza' },
    { value: 'gastronomia', label: 'Gastronomía' }
  ]

  useEffect(() => {
    cargarExperiencias()
  }, [])

  const cargarExperiencias = async () => {
    try {
      setLoading(true)
      const response = await experienciasService.listar()
      setExperiencias(response.experiencias || [])
    } catch (error) {
      console.error('Error al cargar experiencias:', error)
      toast.error('Error al cargar las experiencias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const dataToSend = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion || '',
        ubicacion: formData.ubicacion || '',
        duracion: formData.duracion || null,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
        destacado: formData.destacado,
        orden: parseInt(formData.orden) || 0
      }

      if (selectedExperiencia) {
        await experienciasService.actualizar(selectedExperiencia.id, dataToSend)
        toast.success('Experiencia actualizada exitosamente')
      } else {
        await experienciasService.crear(dataToSend)
        toast.success('Experiencia creada exitosamente')
      }

      setShowModal(false)
      resetForm()
      await cargarExperiencias()
    } catch (error) {
      console.error('Error al guardar experiencia:', error)
      toast.error(error.response?.data?.message || 'Error al guardar la experiencia')
    }
  }

  const handleDesactivar = async (experienciaId) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta experiencia?')) {
      return
    }

    try {
      await experienciasService.desactivar(experienciaId)
      toast.success('Experiencia desactivada exitosamente')
      cargarExperiencias()
    } catch (error) {
      console.error('Error al desactivar experiencia:', error)
      toast.error('Error al desactivar la experiencia')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      descripcion: '',
      ubicacion: '',
      duracion: '',
      capacidad: '',
      destacado: false,
      orden: 0
    })
    setSelectedExperiencia(null)
  }

  const handleEdit = (experiencia) => {
    setSelectedExperiencia(experiencia)
    setFormData({
      nombre: experiencia.nombre || '',
      categoria: experiencia.categoria || '',
      descripcion: experiencia.descripcion || '',
      ubicacion: experiencia.ubicacion || '',
      duracion: experiencia.duracion || '',
      capacidad: experiencia.capacidad || '',
      destacado: experiencia.destacado || false,
      orden: experiencia.orden || 0
    })
    setShowModal(true)
  }

  const abrirModalImagenes = async (experiencia) => {
    setSelectedExperiencia(experiencia)
    setShowImagenesModal(true)
    setLoadingImagenes(true)

    try {
      const response = await experienciasService.obtenerImagenes(experiencia.id)
      setImagenesExperiencia(response.imagenes || [])
    } catch (error) {
      console.error('Error al cargar imágenes:', error)
      toast.error('Error al cargar las imágenes de la experiencia')
    } finally {
      setLoadingImagenes(false)
    }
  }

  const handleMarcarPrincipal = async (imagenId) => {
    if (!selectedExperiencia) return

    try {
      await experienciasService.setImagenPrincipal(selectedExperiencia.id, imagenId)
      toast.success('Imagen marcada como principal')

      const response = await experienciasService.obtenerImagenes(selectedExperiencia.id)
      setImagenesExperiencia(response.imagenes || [])
      cargarExperiencias()
    } catch (error) {
      console.error('Error al marcar como principal:', error)
      toast.error('Error al marcar la imagen como principal')
    }
  }

  const handleDesvincular = async (imagenId, tituloImagen) => {
    if (!selectedExperiencia) return

    if (!confirm(`¿Estás seguro de que deseas desvincular la imagen "${tituloImagen}" de esta experiencia?`)) {
      return
    }

    try {
      await experienciasService.desvincularImagen(selectedExperiencia.id, imagenId)
      toast.success('Imagen desvinculada exitosamente')

      const response = await experienciasService.obtenerImagenes(selectedExperiencia.id)
      setImagenesExperiencia(response.imagenes || [])
      cargarExperiencias()
    } catch (error) {
      console.error('Error al desvincular imagen:', error)
      toast.error('Error al desvincular la imagen')
    }
  }

  const getCategoriaColor = (categoria) => {
    const colores = {
      aventura: 'from-orange-400 to-red-500',
      cultura: 'from-purple-400 to-pink-500',
      naturaleza: 'from-green-400 to-emerald-600',
      gastronomia: 'from-amber-400 to-orange-500'
    }
    return colores[categoria] || 'from-gray-400 to-gray-600'
  }

  if (loading && experiencias.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card module="gestion" className="border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Experiencias Turísticas</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Gestiona las experiencias turísticas de la plataforma</p>
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
              Nueva Experiencia
            </Button>
          )}
        </div>
      </Card>

      {/* Grid de Experiencias */}
      {experiencias.length === 0 && !loading ? (
        <Card module="gestion" className="text-center py-12">
          <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay experiencias registradas</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {experiencias.map((experiencia) => (
            <Card key={experiencia.id} module="gestion" className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border group">
              {/* Imagen / Placeholder con gradiente */}
              <div className={`relative h-48 ${!experiencia.imagen_url ? `bg-gradient-to-br ${getCategoriaColor(experiencia.categoria)}` : 'bg-gray-900'} flex items-center justify-center overflow-hidden`}>
                {/* Badge de categoría */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="default" className="bg-white/90 text-gray-800 capitalize">
                    {experiencia.categoria}
                  </Badge>
                </div>

                {/* Badge destacado */}
                {experiencia.destacado && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="warning" className="flex items-center gap-1">
                      <Star size={12} className="fill-current" />
                      Destacado
                    </Badge>
                  </div>
                )}

                {/* Imagen real o icono placeholder */}
                {experiencia.imagen_url ? (
                  <img
                    src={experiencia.imagen_url}
                    alt={experiencia.imagen_titulo || experiencia.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                {/* Icono central placeholder */}
                <div className={`relative z-10 ${experiencia.imagen_url ? 'hidden' : 'flex'} items-center justify-center`}>
                  <Compass className="w-16 h-16 text-white/80" strokeWidth={1.5} />
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {experiencia.nombre}
                </h3>

                {experiencia.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {experiencia.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div className="space-y-1 mb-4 pb-3 border-b border-gray-200">
                  {experiencia.duracion && (
                    <p className="text-xs text-gray-600">⏱️ {experiencia.duracion}</p>
                  )}
                  {experiencia.capacidad && (
                    <p className="text-xs text-gray-600">👥 Capacidad: {experiencia.capacidad} personas</p>
                  )}
                  {experiencia.ubicacion && (
                    <p className="text-xs text-gray-600 line-clamp-1">📍 {experiencia.ubicacion}</p>
                  )}
                </div>

                {/* Botones de acción */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={() => abrirModalImagenes(experiencia)}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <ImageIcon size={14} />
                      <span className="text-xs">Gestionar Imágenes ({experiencia.total_imagenes || 0})</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        module="gestion"
                        onClick={() => handleEdit(experiencia)}
                        className="flex-1"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDesactivar(experiencia.id)}
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

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedExperiencia ? 'Editar Experiencia' : 'Nueva Experiencia'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            module="gestion"
            placeholder="Ej: Tour en Kayak por el Lago Atitlán"
          />

          <Select
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            options={categorias}
            required
            module="gestion"
          />

          <Textarea
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={4}
            module="gestion"
            placeholder="Describe la experiencia turística..."
          />

          <Input
            label="Ubicación"
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            module="gestion"
            placeholder="Ej: Embarcadero principal de Santiago Atitlán"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración"
              type="text"
              name="duracion"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              module="gestion"
              placeholder="Ej: 3 horas"
            />

            <Input
              label="Capacidad (personas)"
              type="number"
              name="capacidad"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
              min="1"
              module="gestion"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="destacado"
                checked={formData.destacado}
                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="destacado" className="text-sm text-gray-700">
                Marcar como destacada
              </label>
            </div>

            <Input
              label="Orden"
              type="number"
              name="orden"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
              min="0"
              module="gestion"
            />
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
              {selectedExperiencia ? 'Actualizar' : 'Crear'} Experiencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestionar Imágenes */}
      <Modal
        isOpen={showImagenesModal}
        onClose={() => {
          setShowImagenesModal(false)
          setSelectedExperiencia(null)
          setImagenesExperiencia([])
        }}
        title={selectedExperiencia ? `Gestionar Imágenes - ${selectedExperiencia.nombre}` : 'Gestionar Imágenes'}
        size="lg"
      >
        {selectedExperiencia && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedExperiencia.nombre}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Gestiona las imágenes vinculadas a esta experiencia. Marca una como principal para que aparezca en la vista de lista.
              </p>
            </div>

            {loadingImagenes ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : imagenesExperiencia.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No hay imágenes vinculadas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ve a Galería y usa el botón "Vincular a Experiencia" para agregar imágenes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {imagenesExperiencia.map((imagen) => (
                  <Card key={imagen.relacion_id} module="gestion" className="p-4">
                    <div className="flex gap-4">
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={imagen.url_imagen}
                          alt={imagen.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">{imagen.titulo}</h4>
                            {imagen.es_principal && (
                              <Badge variant="success" className="flex-shrink-0">
                                ⭐ PRINCIPAL
                              </Badge>
                            )}
                          </div>
                          {imagen.descripcion && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{imagen.descripcion}</p>
                          )}
                        </div>

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

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowImagenesModal(false)
                  setSelectedExperiencia(null)
                  setImagenesExperiencia([])
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

export default ExperienciasGestionPage
