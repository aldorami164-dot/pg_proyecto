import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '@shared/components/Card'
import ServiceCard from '@shared/components/ServiceCard'
import {
  Shirt, Waves, UtensilsCrossed, Sparkles, Droplets,
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const ServiciosPage = () => {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await plataformaService.getServicios()
      setServicios(data)
    } catch (err) {
      console.error('Error al cargar servicios:', err)
      setError(err.response?.data?.error || 'Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  // Íconos específicos por categoría de servicio
  const getIconForService = (categoria) => {
    const iconMap = {
      lavanderia: Shirt,
      sauna: Waves,
      cocina: UtensilsCrossed,
      limpieza: Sparkles,
      piscina: Droplets
    }
    return iconMap[categoria] || CheckCircle
  }

  // Información detallada por categoría
  const getDetallesServicio = (categoria) => {
    const detalles = {
      lavanderia: {
        instrucciones: [
          'Deja tu ropa en la bolsa de lavandería',
          'Tiempo de entrega: 24 horas',
          'Servicio incluye lavado, secado y planchado',
          'Disponible de lunes a domingo'
        ],
        solicitable: true
      },
      sauna: {
        instrucciones: [
          'Horario: 9:00 AM - 9:00 PM',
          'Duración máxima: 30 minutos por sesión',
          'Traer toalla y ropa cómoda',
          'Hidrátate bien antes y después',
          'Reserva con anticipación en recepción'
        ],
        solicitable: true
      },
      cocina: {
        instrucciones: [
          'Horario: 6:00 AM - 10:00 PM',
          'Limpia después de usar',
          'Respeta el espacio de otros huéspedes',
          'Utensilios y ollas disponibles',
          'Solicita acceso indicando tu horario preferido'
        ],
        solicitable: true
      },
      limpieza: {
        instrucciones: [
          'Servicio diario de 8:00 AM - 2:00 PM',
          'Incluye cambio de sábanas y toallas',
          'Limpieza extra disponible bajo solicitud',
          'Indica el horario que prefieras en el mensaje',
          'Respetamos el cartel "No Molestar"'
        ],
        solicitable: true
      },
      piscina: {
        instrucciones: [
          'Horario: Lunes a Domingo 8:00 AM - 7:00 PM',
          'Llevar ropa de baño adecuada',
          'Ducha obligatoria antes de ingresar',
          'Si usa cremas o aceites, bañarse primero',
          'No está permitido correr alrededor de la piscina',
          'Niños menores de 12 años con supervisión de adulto',
          'Toallas disponibles en recepción'
        ],
        solicitable: false
      }
    }
    return detalles[categoria] || { instrucciones: [], solicitable: false }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card module="plataforma" className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              Error al Cargar Servicios
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4
                       bg-gradient-to-r from-plataforma-primary-700 via-plataforma-secondary-600 to-plataforma-accent-700
                       bg-clip-text text-transparent">
          Nuestros Servicios
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Todo lo que necesitas para una estadía perfecta en Casa Josefa
        </p>
      </motion.div>

      {/* Lista de servicios */}
      {servicios.length === 0 ? (
        <Card module="plataforma">
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-plataforma-primary-400 mb-4" size={64} />
            <p className="text-lg text-gray-600">No hay servicios disponibles en este momento</p>
            <p className="text-gray-500 mt-2">
              Consulta en recepción para más información
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {servicios.map((servicio, index) => {
            const IconComponent = getIconForService(servicio.categoria)
            const detalles = getDetallesServicio(servicio.categoria)

            return (
              <ServiceCard
                key={servicio.id}
                servicio={servicio}
                IconComponent={IconComponent}
                detalles={detalles}
                delay={index * 0.1}
              />
            )
          })}
        </div>
      )}

      {/* Servicios incluidos en la estadía */}
      <div className="mt-16">
        <h2 className="text-3xl font-display font-bold text-plataforma-primary-700 text-center mb-8">
          Servicios Incluidos
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card module="plataforma" className="text-center border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-2xl mb-4 mx-auto shadow-lg">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h3 className="font-display font-bold text-plataforma-primary-700 mb-2">WiFi Gratuito</h3>
            <p className="text-sm text-plataforma-nature-600">
              Internet de alta velocidad en todas las áreas
            </p>
          </Card>

          <Card module="plataforma" className="text-center border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-2xl mb-4 mx-auto shadow-lg">
              <UtensilsCrossed className="text-white" size={32} />
            </div>
            <h3 className="font-display font-bold text-plataforma-primary-700 mb-2">Desayuno Típico</h3>
            <p className="text-sm text-plataforma-nature-600">
              Desayuno guatemalteco de 7:00 AM - 10:00 AM
            </p>
          </Card>

          <Card module="plataforma" className="text-center border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-2xl mb-4 mx-auto shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <h3 className="font-display font-bold text-plataforma-primary-700 mb-2">Limpieza Diaria</h3>
            <p className="text-sm text-plataforma-nature-600">
              Servicio de limpieza y cambio de toallas
            </p>
          </Card>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-12 max-w-4xl mx-auto">
        <Card module="plataforma" className="bg-gradient-to-br from-plataforma-accent-50 to-plataforma-primary-50 border-2 border-plataforma-primary-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
              <CheckCircle className="text-white flex-shrink-0" size={24} />
            </div>
            <div>
              <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-lg">
                ¿Cómo solicitar un servicio?
              </h3>
              <p className="text-plataforma-nature-700 mb-2">
                Si eres huésped y estás en tu habitación, escanea el código QR en tu puerta
                para acceder al sistema de solicitudes. Podrás pedir servicios como lavandería,
                sauna, cocina y limpieza extra de forma rápida y fácil.
              </p>
              <p className="text-plataforma-nature-700">
                Si tienes alguna duda o necesitas ayuda, contacta a recepción (Ext. 0) disponible 24/7.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ServiciosPage
