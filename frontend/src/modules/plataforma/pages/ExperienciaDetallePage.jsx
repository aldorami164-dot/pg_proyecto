import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import {
  MapPin, Clock, Users, DollarSign, Backpack, Compass,
  CheckCircle, AlertCircle, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const ExperienciaDetallePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [experiencia, setExperiencia] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [imagenActual, setImagenActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarExperiencia()
  }, [id])

  const cargarExperiencia = async () => {
    try {
      setLoading(true)
      const data = await plataformaService.getExperiencias()
      const exp = data.find(e => e.id === parseInt(id))

      if (!exp) {
        setError('Experiencia no encontrada')
      } else {
        setExperiencia(exp)
        // Cargar imágenes de la experiencia usando el endpoint público
        try {
          const imagenesData = await plataformaService.getImagenesExperiencia(id)
          setImagenes(imagenesData || [])
        } catch (imgError) {
          console.error('Error al cargar imágenes:', imgError)
          // No es crítico, continuar sin imágenes
        }
      }
    } catch (err) {
      console.error('Error al cargar experiencia:', err)
      setError('Error al cargar los detalles de la experiencia')
    } finally {
      setLoading(false)
    }
  }

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length)
  }

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando experiencia...</p>
        </div>
      </div>
    )
  }

  if (error || !experiencia) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card module="plataforma" className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              {error || 'Experiencia no encontrada'}
            </h2>
            <Button
              variant="primary"
              module="plataforma"
              onClick={() => navigate('/plataforma/experiencias')}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Experiencias
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Botón volver */}
      <div className="mb-6">
        <Button
          variant="secondary"
          module="plataforma"
          onClick={() => navigate('/plataforma/experiencias')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Experiencias
        </Button>
      </div>

      {/* Galería de imágenes */}
      {imagenes.length > 0 ? (
        <div className="mb-8 space-y-4">
          {/* Imagen principal grande */}
          <div className="relative w-full h-96 bg-gradient-to-br from-plataforma-primary-200 via-plataforma-nature-200 to-plataforma-accent-200 rounded-xl overflow-hidden shadow-xl border-2 border-plataforma-primary-100">
            <img
              src={imagenes[imagenActual].url_imagen}
              alt={imagenes[imagenActual].titulo || experiencia.nombre}
              className="w-full h-full object-cover"
            />

            {/* Controles de navegación */}
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={anteriorImagen}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={siguienteImagen}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Contador */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {imagenActual + 1} / {imagenes.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {imagenes.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {imagenes.map((imagen, index) => (
                <button
                  key={imagen.id}
                  onClick={() => setImagenActual(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === imagenActual
                      ? 'border-plataforma-primary-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-plataforma-primary-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imagen.url_imagen}
                    alt={imagen.titulo || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-96 bg-gradient-to-br from-plataforma-primary-200 via-plataforma-nature-200 to-plataforma-accent-200 rounded-xl overflow-hidden mb-8 shadow-xl border-2 border-plataforma-primary-100 flex items-center justify-center">
          <div className="text-center text-white/70">
            <ImageIcon size={64} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Sin imágenes disponibles</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título */}
          <div>
            <h1 className="text-4xl font-display font-bold text-plataforma-primary-700 mb-2">
              {experiencia.nombre}
            </h1>
            {experiencia.ubicacion && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={20} className="text-plataforma-primary-500" />
                <span className="text-lg">{experiencia.ubicacion}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-primary-700 mb-4">
              Descripción
            </h2>
            <p className="text-plataforma-nature-700 leading-relaxed">
              {experiencia.descripcion}
            </p>
          </Card>

          {/* Qué llevar (basado en categoría) */}
          <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-primary-700 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
                <Backpack size={20} className="text-white" />
              </div>
              ¿Qué llevar?
            </h2>
            <ul className="space-y-2">
              {experiencia.categoria === 'atracciones' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Zapatos cómodos para caminar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Agua y snacks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Protector solar y sombrero</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Cámara fotográfica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Mochila pequeña</span>
                  </li>
                </>
              )}
              {experiencia.categoria === 'actividades' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ropa cómoda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Agua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Protector solar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Cambio de ropa (si incluye agua)</span>
                  </li>
                </>
              )}
              {experiencia.categoria === 'cultura' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ropa respetuosa (cubre hombros y rodillas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Cámara (pedir permiso antes de fotografiar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Actitud abierta y respetuosa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Efectivo para compras locales</span>
                  </li>
                </>
              )}
              {(!experiencia.categoria || experiencia.categoria === 'gastronomia') && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Apetito y mente abierta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Efectivo para propinas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Cámara para capturar los platillos</span>
                  </li>
                </>
              )}
            </ul>
          </Card>

          {/* Tips e indicaciones */}
          <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-primary-700 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
                <Compass size={20} className="text-white" />
              </div>
              Tips para una Mejor Experiencia
            </h2>
            <ul className="space-y-3 text-plataforma-nature-700">
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>Llega 10-15 minutos antes de la hora acordada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>Consulta el clima y vístete apropiadamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>Respeta las costumbres y tradiciones locales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>Apoya a los artesanos y comerciantes locales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>No dejes basura, ayuda a mantener limpia la comunidad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-primary-600 font-bold">•</span>
                <span>Si tienes condiciones médicas especiales, informa al guía</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Sidebar - Información */}
        <div className="lg:col-span-1">
          <Card module="plataforma" className="sticky top-6 border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-4">
              Detalles de la Experiencia
            </h3>

            <div className="space-y-4">
              {/* Duración */}
              {experiencia.duracion && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Duración</p>
                    <p className="font-bold text-plataforma-primary-700">{experiencia.duracion}</p>
                  </div>
                </div>
              )}

              {/* Capacidad */}
              {experiencia.capacidad && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-xl shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Grupo máximo</p>
                    <p className="font-bold text-plataforma-primary-700">Hasta {experiencia.capacidad} personas</p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              {experiencia.ubicacion && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Ubicación</p>
                    <p className="font-bold text-plataforma-primary-700">{experiencia.ubicacion}</p>
                  </div>
                </div>
              )}

              {/* Precio */}
              {experiencia.precio && parseFloat(experiencia.precio) > 0 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-xl shadow-lg">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Precio aproximado</p>
                    <p className="font-bold text-plataforma-accent-600 text-2xl">
                      Q{parseFloat(experiencia.precio).toFixed(2)}
                    </p>
                    <p className="text-xs text-plataforma-nature-600">Por persona</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-plataforma-primary-200">
              <div className="bg-gradient-to-br from-plataforma-accent-50 to-plataforma-primary-50 border border-plataforma-primary-200 rounded-lg p-4">
                <p className="text-sm text-plataforma-nature-700">
                  <strong className="text-plataforma-primary-700">¿Interesado?</strong>
                  <br />
                  Consulta en recepción para más información, disponibilidad y reservaciones.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ExperienciaDetallePage
