import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Badge from '@shared/components/Badge'
import {
  MapPin, Clock, Phone, DollarSign, Info, Map as MapIcon,
  CheckCircle, AlertCircle, ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  Image as ImageIcon, ExternalLink
} from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const LugarDetallePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lugar, setLugar] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [imagenActual, setImagenActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarLugar()
  }, [id])

  const cargarLugar = async () => {
    try {
      setLoading(true)
      const data = await plataformaService.getLugaresTuristicos()
      const lug = data.find(l => l.id === parseInt(id))

      if (!lug) {
        setError('Lugar turístico no encontrado')
      } else {
        setLugar(lug)
        // Cargar imágenes del lugar usando el endpoint público
        try {
          const imagenesData = await plataformaService.getImagenesLugar(id)
          setImagenes(imagenesData || [])
        } catch (imgError) {
          console.error('Error al cargar imágenes:', imgError)
          // No es crítico, continuar sin imágenes
        }
      }
    } catch (err) {
      console.error('Error al cargar lugar:', err)
      setError('Error al cargar los detalles del lugar')
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

  const getCategoriaColor = (categoria) => {
    const colores = {
      cultura: 'from-purple-500 to-purple-600',
      naturaleza: 'from-green-500 to-green-600',
      gastronomia: 'from-orange-500 to-orange-600',
      aventura: 'from-blue-500 to-blue-600'
    }
    return colores[categoria] || 'from-gray-500 to-gray-600'
  }

  const getRecomendacionesPorCategoria = (categoria) => {
    const recomendaciones = {
      cultura: [
        'Viste ropa respetuosa que cubra hombros y rodillas',
        'Pregunta antes de tomar fotografías',
        'Apoya a los artesanos locales comprando sus productos',
        'Escucha con atención las explicaciones de los guías locales'
      ],
      naturaleza: [
        'Lleva zapatos cómodos para caminar',
        'Usa protector solar y repelente de insectos',
        'Respeta la flora y fauna del lugar',
        'No dejes basura, lleva una bolsa para recoger tus desperdicios',
        'Mantente en los senderos marcados'
      ],
      gastronomia: [
        'Lleva efectivo, algunos lugares no aceptan tarjetas',
        'Pregunta por los platillos típicos de la región',
        'Ten mente abierta para probar nuevos sabores',
        'Respeta las horas de servicio del establecimiento'
      ],
      aventura: [
        'Usa ropa y calzado adecuados para la actividad',
        'Lleva agua suficiente',
        'Informa sobre condiciones médicas especiales',
        'Sigue las indicaciones de seguridad',
        'Lleva una muda de ropa adicional'
      ]
    }
    return recomendaciones[categoria] || recomendaciones.naturaleza
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-secondary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando lugar turístico...</p>
        </div>
      </div>
    )
  }

  if (error || !lugar) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card module="plataforma" className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              {error || 'Lugar turístico no encontrado'}
            </h2>
            <Button
              variant="primary"
              module="plataforma"
              onClick={() => navigate('/plataforma/lugares')}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Lugares
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
          onClick={() => navigate('/plataforma/lugares')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Lugares
        </Button>
      </div>

      {/* Galería de imágenes */}
      {imagenes.length > 0 ? (
        <div className="mb-8 space-y-4">
          {/* Imagen principal grande */}
          <div className="relative w-full h-96 bg-gradient-to-br from-plataforma-secondary-200 via-plataforma-nature-200 to-plataforma-accent-200 rounded-xl overflow-hidden shadow-xl border-2 border-plataforma-secondary-100">
            <img
              src={imagenes[imagenActual].url_imagen}
              alt={imagenes[imagenActual].titulo || lugar.nombre}
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

            {/* Badge de categoría */}
            <div className="absolute top-4 left-4">
              <Badge
                variant="default"
                className={`bg-gradient-to-r ${getCategoriaColor(lugar.categoria)} text-white capitalize shadow-lg text-sm px-4 py-2`}
              >
                {lugar.categoria}
              </Badge>
            </div>
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
                      ? 'border-plataforma-secondary-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-plataforma-secondary-300 opacity-70 hover:opacity-100'
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
        <div className="w-full h-96 bg-gradient-to-br from-plataforma-secondary-200 via-plataforma-nature-200 to-plataforma-accent-200 rounded-xl overflow-hidden mb-8 shadow-xl border-2 border-plataforma-secondary-100 flex items-center justify-center">
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
            <h1 className="text-4xl font-display font-bold text-plataforma-secondary-700 mb-2">
              {lugar.nombre}
            </h1>
            {lugar.ubicacion && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={20} className="text-plataforma-secondary-500" />
                <span className="text-lg">{lugar.ubicacion}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <Card module="plataforma" className="border-2 border-plataforma-secondary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-secondary-700 mb-4">
              Descripción
            </h2>
            <p className="text-plataforma-nature-700 leading-relaxed">
              {lugar.descripcion}
            </p>
          </Card>

          {/* Recomendaciones */}
          <Card module="plataforma" className="border-2 border-plataforma-secondary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-secondary-700 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
                <Info size={20} className="text-white" />
              </div>
              Recomendaciones
            </h2>
            <ul className="space-y-2">
              {getRecomendacionesPorCategoria(lugar.categoria).map((recomendacion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-plataforma-nature-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{recomendacion}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Tips generales */}
          <Card module="plataforma" className="border-2 border-plataforma-secondary-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-plataforma-secondary-700 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-xl shadow-lg">
                <MapIcon size={20} className="text-white" />
              </div>
              Tips para tu Visita
            </h2>
            <ul className="space-y-3 text-plataforma-nature-700">
              <li className="flex items-start gap-2">
                <span className="text-plataforma-secondary-600 font-bold">•</span>
                <span>Verifica el horario de atención antes de visitar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-secondary-600 font-bold">•</span>
                <span>Lleva efectivo, algunos lugares no aceptan tarjetas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-secondary-600 font-bold">•</span>
                <span>Consulta el clima antes de salir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-secondary-600 font-bold">•</span>
                <span>Respeta las normas del lugar y a la comunidad local</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-plataforma-secondary-600 font-bold">•</span>
                <span>Pregunta en recepción por opciones de transporte</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Sidebar - Información práctica */}
        <div className="lg:col-span-1">
          <Card module="plataforma" className="sticky top-6 border-2 border-plataforma-secondary-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-display font-bold text-plataforma-secondary-700 mb-4">
              Información Práctica
            </h3>

            <div className="space-y-4">
              {/* Horario */}
              {lugar.horario && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Horario</p>
                    <p className="font-bold text-plataforma-secondary-700">{lugar.horario}</p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              {lugar.ubicacion && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Ubicación</p>
                    <p className="font-bold text-plataforma-secondary-700">{lugar.ubicacion}</p>
                  </div>
                </div>
              )}

              {/* Teléfono */}
              {lugar.telefono && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-xl shadow-lg">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-plataforma-nature-600">Contacto</p>
                    <p className="font-bold text-plataforma-secondary-700">{lugar.telefono}</p>
                  </div>
                </div>
              )}

              {/* Precio de entrada */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-xl shadow-lg">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-plataforma-nature-600">Entrada</p>
                  {lugar.precio_entrada && parseFloat(lugar.precio_entrada) > 0 ? (
                    <>
                      <p className="font-bold text-plataforma-accent-600 text-2xl">
                        Q{parseFloat(lugar.precio_entrada).toFixed(2)}
                      </p>
                      <p className="text-xs text-plataforma-nature-600">Por persona</p>
                    </>
                  ) : (
                    <p className="font-bold text-green-600 text-xl">GRATIS</p>
                  )}
                </div>
              </div>

              {/* Google Maps */}
              {lugar.url_maps && (
                <div className="pt-4 border-t border-plataforma-secondary-200">
                  <a
                    href={lugar.url_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-plataforma-secondary-500 to-plataforma-secondary-600 text-white font-medium py-3 px-4 rounded-lg hover:from-plataforma-secondary-600 hover:to-plataforma-secondary-700 transition-all shadow-lg"
                  >
                    <MapIcon size={20} />
                    Abrir en Google Maps
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-plataforma-secondary-200">
              <div className="bg-gradient-to-br from-plataforma-secondary-50 to-plataforma-primary-50 border border-plataforma-secondary-200 rounded-lg p-4">
                <p className="text-sm text-plataforma-nature-700">
                  <strong className="text-plataforma-secondary-700">¿Necesitas ayuda?</strong>
                  <br />
                  Consulta en recepción para obtener indicaciones, transporte y más información sobre este lugar.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LugarDetallePage
