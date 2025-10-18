import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import lugaresTuristicosService from '@shared/services/lugaresTuristicosService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import { MapPin, Plus, Edit, Trash2, Image as ImageIcon, Check, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

const LugaresTuristicosPage = () => {
  const { isAdmin } = useAuth()
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImagenesModal, setShowImagenesModal] = useState(false)
  const [selectedLugar, setSelectedLugar] = useState(null)
  const [imagenesLugar, setImagenesLugar] = useState([])
  const [loadingImagenes, setLoadingImagenes] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    ubicacion: '',
    url_maps: '',
    telefono: '',
    horario: '',
    precio_entrada: 0,
    orden: 0
  })

  const categorias = [
    { value: 'cultura', label: 'Cultura' },
    { value: 'naturaleza', label: 'Naturaleza' },
    { value: 'gastronomia', label: 'Gastronomía' },
    { value: 'aventura', label: 'Aventura' }
  ]

  useEffect(() => {
    cargarLugares()
  }, [])

  const cargarLugares = async () => {
    try {
      setLoading(true)
      const response = await lugaresTuristicosService.listar()
      setLugares(response.lugares || [])
    } catch (error) {
      console.error('Error al cargar lugares:', error)
      toast.error('Error al cargar los lugares turísticos')
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
        url_maps: formData.url_maps || '',
        telefono: formData.telefono || '',
        horario: formData.horario || '',
        precio_entrada: parseFloat(formData.precio_entrada) || 0,
        orden: parseInt(formData.orden) || 0
      }

      if (selectedLugar) {
        await lugaresTuristicosService.actualizar(selectedLugar.id, dataToSend)
        toast.success('Lugar turístico actualizado exitosamente')
      } else {
        await lugaresTuristicosService.crear(dataToSend)
        toast.success('Lugar turístico creado exitosamente')
      }

      setShowModal(false)
      resetForm()
      await cargarLugares()
    } catch (error) {
      console.error('Error al guardar lugar:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el lugar turístico')
    }
  }

  const handleDesactivar = async (lugarId) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este lugar turístico?')) {
      return
    }

    try {
      await lugaresTuristicosService.desactivar(lugarId)
      toast.success('Lugar turístico desactivado exitosamente')
      cargarLugares()
    } catch (error) {
      console.error('Error al desactivar lugar:', error)
      toast.error('Error al desactivar el lugar turístico')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      descripcion: '',
      ubicacion: '',
      url_maps: '',
      telefono: '',
      horario: '',
      precio_entrada: 0,
      orden: 0
    })
    setSelectedLugar(null)
  }

  const handleEdit = (lugar) => {
    setSelectedLugar(lugar)
    setFormData({
      nombre: lugar.nombre || '',
      categoria: lugar.categoria || '',
      descripcion: lugar.descripcion || '',
      ubicacion: lugar.ubicacion || '',
      url_maps: lugar.url_maps || '',
      telefono: lugar.telefono || '',
      horario: lugar.horario || '',
      precio_entrada: lugar.precio_entrada || 0,
      orden: lugar.orden || 0
    })
    setShowModal(true)
  }

  const abrirModalImagenes = async (lugar) => {
    setSelectedLugar(lugar)
    setShowImagenesModal(true)
    setLoadingImagenes(true)

    try {
      const response = await lugaresTuristicosService.obtenerImagenes(lugar.id)
      setImagenesLugar(response.imagenes || [])
    } catch (error) {
      console.error('Error al cargar imágenes:', error)
      toast.error('Error al cargar las imágenes del lugar')
    } finally {
      setLoadingImagenes(false)
    }
  }

  const handleMarcarPrincipal = async (imagenId) => {
    if (!selectedLugar) return

    try {
      await lugaresTuristicosService.setImagenPrincipal(selectedLugar.id, imagenId)
      toast.success('Imagen marcada como principal')

      const response = await lugaresTuristicosService.obtenerImagenes(selectedLugar.id)
      setImagenesLugar(response.imagenes || [])
      cargarLugares()
    } catch (error) {
      console.error('Error al marcar como principal:', error)
      toast.error('Error al marcar la imagen como principal')
    }
  }

  const handleDesvincular = async (imagenId, tituloImagen) => {
    if (!selectedLugar) return

    if (!confirm(`¿Estás seguro de que deseas desvincular la imagen "${tituloImagen}" de este lugar?`)) {
      return
    }

    try {
      await lugaresTuristicosService.desvincularImagen(selectedLugar.id, imagenId)
      toast.success('Imagen desvinculada exitosamente')

      const response = await lugaresTuristicosService.obtenerImagenes(selectedLugar.id)
      setImagenesLugar(response.imagenes || [])
      cargarLugares()
    } catch (error) {
      console.error('Error al desvincular imagen:', error)
      toast.error('Error al desvincular la imagen')
    }
  }

  const getCategoriaColor = (categoria) => {
    const colores = {
      cultura: 'from-purple-400 to-pink-500',
      naturaleza: 'from-green-400 to-emerald-600',
      gastronomia: 'from-amber-400 to-orange-500',
      aventura: 'from-blue-400 to-cyan-500'
    }
    return colores[categoria] || 'from-gray-400 to-gray-600'
  }

  if (loading && lugares.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card module="gestion" className="border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lugares Turísticos</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Gestiona los lugares turísticos de la plataforma</p>
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
              Nuevo Lugar
            </Button>
          )}
        </div>
      </Card>

      {/* Grid de Lugares */}
      {lugares.length === 0 && !loading ? (
        <Card module="gestion" className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay lugares turísticos registrados</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lugares.map((lugar) => (
            <Card key={lugar.id} module="gestion" className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border group">
              {/* Imagen / Placeholder con gradiente */}
              <div className={`relative h-48 ${!lugar.imagen_url ? `bg-gradient-to-br ${getCategoriaColor(lugar.categoria)}` : 'bg-gray-900'} flex items-center justify-center overflow-hidden`}>
                {/* Badge de categoría */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="default" className="bg-white/90 text-gray-800 capitalize">
                    {lugar.categoria}
                  </Badge>
                </div>

                {/* Badge de precio */}
                {lugar.precio_entrada > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="success" className="flex items-center gap-1">
                      <DollarSign size={12} />
                      Q{lugar.precio_entrada}
                    </Badge>
                  </div>
                )}

                {lugar.precio_entrada === 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="info" className="text-xs">
                      GRATIS
                    </Badge>
                  </div>
                )}

                {/* Imagen real o icono placeholder */}
                {lugar.imagen_url ? (
                  <img
                    src={lugar.imagen_url}
                    alt={lugar.imagen_titulo || lugar.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                {/* Icono central placeholder */}
                <div className={`relative z-10 ${lugar.imagen_url ? 'hidden' : 'flex'} items-center justify-center`}>
                  <MapPin className="w-16 h-16 text-white/80" strokeWidth={1.5} />
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {lugar.nombre}
                </h3>

                {lugar.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {lugar.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div className="space-y-1 mb-4 pb-3 border-b border-gray-200">
                  {lugar.ubicacion && (
                    <p className="text-xs text-gray-600 line-clamp-1">📍 {lugar.ubicacion}</p>
                  )}
                  {lugar.horario && (
                    <p className="text-xs text-gray-600">⏰ {lugar.horario}</p>
                  )}
                  {lugar.telefono && (
                    <p className="text-xs text-gray-600">📞 {lugar.telefono}</p>
                  )}
                </div>

                {/* Botones de acción */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={() => abrirModalImagenes(lugar)}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <ImageIcon size={14} />
                      <span className="text-xs">Gestionar Imágenes ({lugar.total_imagenes || 0})</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        module="gestion"
                        onClick={() => handleEdit(lugar)}
                        className="flex-1"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDesactivar(lugar.id)}
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
        title={selectedLugar ? 'Editar Lugar Turístico' : 'Nuevo Lugar Turístico'}
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
            placeholder="Ej: Parque Central de Santiago Atitlán"
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
            placeholder="Describe el lugar turístico..."
          />

          <Input
            label="Ubicación"
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            module="gestion"
            placeholder="Dirección o ubicación del lugar"
          />

          <Input
            label="URL de Google Maps"
            type="url"
            name="url_maps"
            value={formData.url_maps}
            onChange={(e) => setFormData({ ...formData, url_maps: e.target.value })}
            module="gestion"
            placeholder="https://maps.google.com/..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              module="gestion"
              placeholder="Ej: +502 1234-5678"
            />

            <Input
              label="Horario"
              type="text"
              name="horario"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              module="gestion"
              placeholder="Ej: 9:00 AM - 5:00 PM"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio de Entrada (Q)"
              type="number"
              name="precio_entrada"
              value={formData.precio_entrada}
              onChange={(e) => setFormData({ ...formData, precio_entrada: e.target.value })}
              step="0.01"
              min="0"
              module="gestion"
              placeholder="0 si es gratis"
            />

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
              {selectedLugar ? 'Actualizar' : 'Crear'} Lugar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestionar Imágenes */}
      <Modal
        isOpen={showImagenesModal}
        onClose={() => {
          setShowImagenesModal(false)
          setSelectedLugar(null)
          setImagenesLugar([])
        }}
        title={selectedLugar ? `Gestionar Imágenes - ${selectedLugar.nombre}` : 'Gestionar Imágenes'}
        size="lg"
      >
        {selectedLugar && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedLugar.nombre}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Gestiona las imágenes vinculadas a este lugar. Marca una como principal para que aparezca en la vista de lista.
              </p>
            </div>

            {loadingImagenes ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : imagenesLugar.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No hay imágenes vinculadas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ve a Galería y usa el botón "Vincular a Lugar Turístico" para agregar imágenes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {imagenesLugar.map((imagen) => (
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
                  setSelectedLugar(null)
                  setImagenesLugar([])
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

export default LugaresTuristicosPage
