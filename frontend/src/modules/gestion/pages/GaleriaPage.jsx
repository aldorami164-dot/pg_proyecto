import { useState, useEffect } from 'react'
import galeriaService from '@shared/services/galeriaService'
import habitacionesService from '@shared/services/habitacionesService'
import experienciasService from '@shared/services/experienciasService'
import lugaresTuristicosService from '@shared/services/lugaresTuristicosService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Loader from '@shared/components/Loader'
import Select from '@shared/components/Select'
import { ImageIcon, Plus, Edit, Trash2, Power, Upload, Eye, Link as LinkIcon } from 'lucide-react'
import toastMessages from '@shared/utils/toastMessages'

const GaleriaPage = () => {
  const [imagenes, setImagenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [selectedImagen, setSelectedImagen] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [vinculando, setVinculando] = useState(false)
  const [habitaciones, setHabitaciones] = useState([])
  const [experiencias, setExperiencias] = useState([])
  const [lugares, setLugares] = useState([])
  const [tipoEntidad, setTipoEntidad] = useState('habitacion') // 'habitacion', 'experiencia', 'lugar'
  const [entidadSeleccionada, setEntidadSeleccionada] = useState('')
  const [esPrincipal, setEsPrincipal] = useState(false)
  const [filters, setFilters] = useState({
    activo: ''
  })

  // Estado del formulario de upload
  const [uploadData, setUploadData] = useState({
    titulo: '',
    descripcion: '',
    imagen: null
  })

  // Estado del formulario de edición
  const [editData, setEditData] = useState({
    titulo: '',
    descripcion: ''
  })

  useEffect(() => {
    cargarImagenes()
  }, [filters])

  const cargarImagenes = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.activo !== '') params.activo = filters.activo

      const response = await galeriaService.listar(params)
      setImagenes(response.imagenes || [])
    } catch (error) {
      console.error('Error al cargar imágenes:', error)
      toastMessages.generico.error('Error al cargar la galería')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastMessages.generico.error('La imagen no debe superar los 5MB')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toastMessages.generico.error('El archivo debe ser una imagen')
        return
      }

      setUploadData({ ...uploadData, imagen: file })
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!uploadData.imagen) {
      toastMessages.generico.error('Debes seleccionar una imagen')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('imagen', uploadData.imagen)
      formData.append('titulo', uploadData.titulo)
      formData.append('descripcion', uploadData.descripcion)

      await galeriaService.subir(formData)
      toastMessages.generico.success('Imagen subida exitosamente')

      setShowUploadModal(false)
      resetUploadForm()
      cargarImagenes()
    } catch (error) {
      console.error('Error al subir imagen:', error)
      const mensaje = error.response?.data?.message || 'Error al subir la imagen'
      toastMessages.generico.error(mensaje)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (imagen) => {
    setSelectedImagen(imagen)
    setEditData({
      titulo: imagen.titulo,
      descripcion: imagen.descripcion || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()

    try {
      await galeriaService.actualizar(selectedImagen.id, editData)
      toastMessages.generico.success('Información actualizada exitosamente')
      setShowEditModal(false)
      setSelectedImagen(null)
      cargarImagenes()
    } catch (error) {
      console.error('Error al actualizar:', error)
      toastMessages.generico.error('Error al actualizar la información')
    }
  }

  const handleToggleActivo = async (imagenId) => {
    try {
      await galeriaService.toggleActivo(imagenId)
      toastMessages.generico.success('Estado actualizado exitosamente')
      cargarImagenes()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toastMessages.generico.error('Error al cambiar el estado')
    }
  }

  const handleDelete = async (imagenId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await galeriaService.eliminar(imagenId)
      toastMessages.generico.success('Imagen eliminada exitosamente')
      cargarImagenes()
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      toastMessages.generico.error('Error al eliminar la imagen')
    }
  }

  const resetUploadForm = () => {
    setUploadData({
      titulo: '',
      descripcion: '',
      imagen: null
    })
    // Reset file input
    const fileInput = document.getElementById('imagen-upload')
    if (fileInput) fileInput.value = ''
  }

  const verImagen = (imagen) => {
    setSelectedImagen(imagen)
    setShowImageModal(true)
  }

  const abrirModalVincular = async (imagen) => {
    setSelectedImagen(imagen)
    setTipoEntidad('habitacion')
    setEntidadSeleccionada('')
    setEsPrincipal(false)

    try {
      // Cargar todas las entidades en paralelo
      const [habitacionesRes, experienciasRes, lugaresRes] = await Promise.all([
        habitacionesService.listar({ activo: true }),
        experienciasService.getExperiencias({ activo: true }),
        lugaresTuristicosService.getLugares({ activo: true })
      ])

      setHabitaciones(habitacionesRes.habitaciones || [])
      setExperiencias(experienciasRes.experiencias || [])
      setLugares(lugaresRes.lugares || [])
      setShowVincularModal(true)
    } catch (error) {
      console.error('Error al cargar entidades:', error)
      toastMessages.generico.error('Error al cargar las opciones de vinculación')
    }
  }

  const handleVincular = async () => {
    if (!entidadSeleccionada) {
      const tipoTexto = tipoEntidad === 'habitacion' ? 'habitación' : tipoEntidad === 'experiencia' ? 'experiencia' : 'lugar turístico'
      toastMessages.generico.error(`Debes seleccionar ${tipoEntidad === 'habitacion' ? 'una' : 'un'} ${tipoTexto}`)
      return
    }

    try {
      setVinculando(true)

      const vincularData = {
        imagen_id: selectedImagen.id,
        orden: 0,
        es_principal: esPrincipal
      }

      // Vincular según el tipo de entidad seleccionado
      if (tipoEntidad === 'habitacion') {
        await habitacionesService.vincularImagen(entidadSeleccionada, vincularData)
        toastMessages.generico.success('Imagen vinculada exitosamente a la habitación')
      } else if (tipoEntidad === 'experiencia') {
        await experienciasService.vincularImagen(entidadSeleccionada, vincularData)
        toastMessages.generico.success('Imagen vinculada exitosamente a la experiencia')
      } else if (tipoEntidad === 'lugar') {
        await lugaresTuristicosService.vincularImagen(entidadSeleccionada, vincularData)
        toastMessages.generico.success('Imagen vinculada exitosamente al lugar turístico')
      }

      setShowVincularModal(false)
      setSelectedImagen(null)
      setTipoEntidad('habitacion')
      setEntidadSeleccionada('')
      setEsPrincipal(false)
    } catch (error) {
      console.error('Error al vincular imagen:', error)
      const mensaje = error.response?.data?.message || 'Error al vincular la imagen'
      toastMessages.generico.error(mensaje)
    } finally {
      setVinculando(false)
    }
  }

  // Estadísticas
  const imagenesActivas = imagenes.filter(i => i.activo).length
  const imagenesInactivas = imagenes.filter(i => !i.activo).length

  if (loading && imagenes.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galería de Imágenes</h1>
          <p className="text-gray-600 mt-1">Gestiona las imágenes del hotel almacenadas en Supabase</p>
        </div>
        <Button
          variant="primary"
          module="gestion"
          onClick={() => {
            resetUploadForm()
            setShowUploadModal(true)
          }}
        >
          <Plus size={20} className="mr-2" />
          Subir Imagen
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Imágenes</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{imagenes.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ImageIcon className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{imagenesActivas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivas</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{imagenesInactivas}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Power className="text-gray-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card module="gestion">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, activo: '' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.activo === ''
                  ? 'bg-gestion-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilters({ ...filters, activo: 'true' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.activo === 'true'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setFilters({ ...filters, activo: 'false' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.activo === 'false'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactivas
            </button>
          </div>
        </div>
      </Card>

      {/* Grid de Imágenes */}
      {imagenes.length === 0 ? (
        <Card module="gestion">
          <div className="text-center py-12">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No hay imágenes en la galería</p>
            <p className="text-sm text-gray-500 mt-2">Sube tu primera imagen para comenzar</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {imagenes.map((imagen) => (
            <Card key={imagen.id} module="gestion" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                {/* Imagen */}
                <div
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => verImagen(imagen)}
                >
                  <img
                    src={imagen.url_imagen}
                    alt={imagen.titulo}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{imagen.titulo}</h3>
                    <Badge variant={imagen.activo ? 'success' : 'default'} className="flex-shrink-0">
                      {imagen.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  {imagen.descripcion && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{imagen.descripcion}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500">
                  <div>Subida: {new Date(imagen.creado_en).toLocaleDateString()}</div>
                </div>

                {/* Acciones */}
                <div className="space-y-2 pt-2 border-t">
                  {/* Primera fila: Ver y Vincular */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={() => verImagen(imagen)}
                      className="flex-1"
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      module="gestion"
                      onClick={() => abrirModalVincular(imagen)}
                      className="flex-1"
                      disabled={!imagen.activo}
                      title={imagen.activo ? 'Vincular a habitación, experiencia o lugar' : 'Activa la imagen para vincular'}
                    >
                      <LinkIcon size={16} className="mr-1" />
                      Vincular
                    </Button>
                  </div>

                  {/* Segunda fila: Editar, Toggle, Eliminar */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      module="gestion"
                      onClick={() => handleEdit(imagen)}
                      title="Editar información"
                      className="flex-1"
                    >
                      <Edit size={16} />
                    </Button>

                    <Button
                      variant={imagen.activo ? 'warning' : 'success'}
                      size="sm"
                      onClick={() => handleToggleActivo(imagen.id)}
                      title={imagen.activo ? 'Desactivar' : 'Activar'}
                      className="flex-1"
                    >
                      <Power size={16} />
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(imagen.id)}
                      title="Eliminar"
                      className="flex-1"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Subir Imagen */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          resetUploadForm()
        }}
        title="Subir Nueva Imagen"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Título"
            type="text"
            name="titulo"
            value={uploadData.titulo}
            onChange={(e) => setUploadData({ ...uploadData, titulo: e.target.value })}
            required
            module="gestion"
            placeholder="Ej: Habitación Suite Presidencial"
          />

          <Textarea
            label="Descripción (opcional)"
            name="descripcion"
            value={uploadData.descripcion}
            onChange={(e) => setUploadData({ ...uploadData, descripcion: e.target.value })}
            rows={3}
            module="gestion"
            placeholder="Describe la imagen..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Imagen *
            </label>
            <input
              id="imagen-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gestion-primary-50 file:text-gestion-primary-700
                hover:file:bg-gestion-primary-100
                cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 5MB - Formatos: JPG, PNG, WEBP</p>
          </div>

          {uploadData.imagen && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ Archivo seleccionado: <strong>{uploadData.imagen.name}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Tamaño: {(uploadData.imagen.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Las imágenes se almacenarán en Supabase Storage y estarán disponibles públicamente.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              module="gestion"
              onClick={() => {
                setShowUploadModal(false)
                resetUploadForm()
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              module="gestion"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Upload className="animate-spin mr-2" size={16} />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Subir Imagen
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Información */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedImagen(null)
        }}
        title="Editar Información de la Imagen"
        size="md"
      >
        {selectedImagen && (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImagen.url_imagen}
                alt={selectedImagen.titulo}
                className="w-full h-full object-cover"
              />
            </div>

            <Input
              label="Título"
              type="text"
              name="titulo"
              value={editData.titulo}
              onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
              required
              module="gestion"
            />

            <Textarea
              label="Descripción"
              name="descripcion"
              value={editData.descripcion}
              onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
              rows={3}
              module="gestion"
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ℹ️ No se puede cambiar la imagen. Para cambiarla, elimina esta y sube una nueva.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedImagen(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" module="gestion">
                Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Ver Imagen */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false)
          setSelectedImagen(null)
        }}
        title="Vista de Imagen"
        size="xl"
      >
        {selectedImagen && (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden">
              <img
                src={selectedImagen.url_imagen}
                alt={selectedImagen.titulo}
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedImagen.titulo}</h3>
                {selectedImagen.descripcion && (
                  <p className="text-gray-600 mt-1">{selectedImagen.descripcion}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={selectedImagen.activo ? 'success' : 'default'}>
                  {selectedImagen.activo ? 'ACTIVA' : 'INACTIVA'}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL Pública:</span>
                  <a
                    href={selectedImagen.url_imagen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gestion-primary-600 hover:underline"
                  >
                    Abrir en nueva pestaña ↗
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subida el:</span>
                  <span className="font-medium">
                    {new Date(selectedImagen.creado_en).toLocaleString('es-GT')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Vincular Imagen */}
      <Modal
        isOpen={showVincularModal}
        onClose={() => {
          setShowVincularModal(false)
          setSelectedImagen(null)
          setTipoEntidad('habitacion')
          setEntidadSeleccionada('')
          setEsPrincipal(false)
        }}
        title="Vincular Imagen"
        size="md"
      >
        {selectedImagen && (
          <div className="space-y-4">
            {/* Previsualización de la imagen */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImagen.url_imagen}
                alt={selectedImagen.titulo}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedImagen.titulo}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selecciona el tipo de contenido y luego elige el elemento específico
              </p>
            </div>

            {/* Selector de tipo de entidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vincular a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoEntidad('habitacion')
                    setEntidadSeleccionada('')
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    tipoEntidad === 'habitacion'
                      ? 'bg-gestion-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Habitación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoEntidad('experiencia')
                    setEntidadSeleccionada('')
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    tipoEntidad === 'experiencia'
                      ? 'bg-plataforma-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Experiencia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoEntidad('lugar')
                    setEntidadSeleccionada('')
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    tipoEntidad === 'lugar'
                      ? 'bg-plataforma-secondary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Lugar
                </button>
              </div>
            </div>

            {/* Selector dinámico según tipo de entidad */}
            {tipoEntidad === 'habitacion' && (
              <Select
                label="Habitación"
                name="entidad"
                value={entidadSeleccionada}
                onChange={(e) => setEntidadSeleccionada(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona una habitación' },
                  ...habitaciones.map(hab => ({
                    value: hab.id.toString(),
                    label: `Habitación ${hab.numero} - ${hab.tipo_habitacion_nombre} (${hab.estado})`
                  }))
                ]}
                required
                module="gestion"
              />
            )}

            {tipoEntidad === 'experiencia' && (
              <Select
                label="Experiencia Turística"
                name="entidad"
                value={entidadSeleccionada}
                onChange={(e) => setEntidadSeleccionada(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona una experiencia' },
                  ...experiencias.map(exp => ({
                    value: exp.id.toString(),
                    label: `${exp.nombre} - ${exp.categoria}`
                  }))
                ]}
                required
                module="gestion"
              />
            )}

            {tipoEntidad === 'lugar' && (
              <Select
                label="Lugar Turístico"
                name="entidad"
                value={entidadSeleccionada}
                onChange={(e) => setEntidadSeleccionada(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona un lugar' },
                  ...lugares.map(lugar => ({
                    value: lugar.id.toString(),
                    label: `${lugar.nombre} - ${lugar.categoria}`
                  }))
                ]}
                required
                module="gestion"
              />
            )}

            {/* Checkbox imagen principal */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="es-principal"
                checked={esPrincipal}
                onChange={(e) => setEsPrincipal(e.target.checked)}
                className="w-4 h-4 text-gestion-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-gestion-primary-500"
              />
              <label htmlFor="es-principal" className="text-sm text-gray-700 cursor-pointer">
                Establecer como imagen principal {
                  tipoEntidad === 'habitacion' ? 'de la habitación' :
                  tipoEntidad === 'experiencia' ? 'de la experiencia' :
                  'del lugar turístico'
                }
              </label>
            </div>

            {esPrincipal && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  ⚠️ Si marcas esta opción, automáticamente se desmarcará cualquier otra imagen que sea principal en {
                    tipoEntidad === 'habitacion' ? 'esta habitación' :
                    tipoEntidad === 'experiencia' ? 'esta experiencia' :
                    'este lugar'
                  }.
                </p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Puedes vincular la misma imagen a múltiples {
                  tipoEntidad === 'habitacion' ? 'habitaciones' :
                  tipoEntidad === 'experiencia' ? 'experiencias' :
                  'lugares'
                }. La imagen se reutilizará sin duplicar el archivo.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowVincularModal(false)
                  setSelectedImagen(null)
                  setTipoEntidad('habitacion')
                  setEntidadSeleccionada('')
                  setEsPrincipal(false)
                }}
                disabled={vinculando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                module="gestion"
                onClick={handleVincular}
                disabled={!entidadSeleccionada || vinculando}
              >
                {vinculando ? (
                  <>
                    <LinkIcon className="animate-pulse mr-2" size={16} />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} className="mr-2" />
                    Vincular Imagen
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default GaleriaPage
