import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '@shared/components/Card'
import ServiceCard from '@shared/components/ServiceCard'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import * as LucideIcons from 'lucide-react'
const {
  Shirt, Waves, UtensilsCrossed, Sparkles, Droplets,
  Loader2, AlertCircle, CheckCircle, QrCode, Coffee, Car, Home, Bell
} = LucideIcons
import plataformaService from '@shared/services/plataformaService'
import solicitudesService from '@shared/services/solicitudesService'
import useHabitacion from '@shared/hooks/useHabitacion'

const ServiciosPage = () => {
  const navigate = useNavigate()
  const { habitacion, tieneHabitacion, loading: loadingHabitacion } = useHabitacion()
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState('todos')

  // Estados del modal de solicitud
  const [showModal, setShowModal] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [notas, setNotas] = useState('')
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
  const [solicitudEnviada, setSolicitudEnviada] = useState(false)

  // Categorías con iconos
  const categorias = [
    { id: 'todos', label: 'Todos', Icon: Sparkles, color: 'from-plataforma-primary-500 to-plataforma-primary-600' },
    { id: 'limpieza', label: 'Limpieza', Icon: Droplets, color: 'from-blue-500 to-cyan-600' },
    { id: 'alimentos', label: 'Alimentos', Icon: UtensilsCrossed, color: 'from-orange-500 to-amber-600' },
    { id: 'lavanderia', label: 'Lavandería', Icon: Shirt, color: 'from-purple-500 to-pink-600' },
    { id: 'otros', label: 'Otros', Icon: Home, color: 'from-indigo-500 to-purple-600' }
  ]

  // Filtrar servicios por categoría
  const serviciosFiltrados = categoriaActiva === 'todos'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaActiva)

  const cargarServicios = useCallback(async () => {
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
  }, [])

  // Validar sesión de habitación al cargar
  useEffect(() => {
    if (loadingHabitacion) {
      return // Esperar a que termine de cargar
    }

    // Usar habitacion.id directamente para evitar comparaciones de objetos
    const habitacionId = habitacion?.id

    if (!habitacionId) {
      // No hay sesión activa, mostrar advertencia y no cargar servicios
      setLoading(false)
      return
    }

    // Hay habitación activa, cargar servicios
    cargarServicios()
  }, [loadingHabitacion, habitacion?.id, cargarServicios])

  // Manejar apertura del modal de solicitud
  const handleSolicitar = (servicio) => {
    if (!tieneHabitacion()) {
      alert('Para solicitar servicios, escanea el código QR de tu habitación')
      return
    }

    setServicioSeleccionado(servicio)
    setNotas('')
    setShowModal(true)
  }

  // Enviar solicitud de servicio
  const handleEnviarSolicitud = async (e) => {
    e.preventDefault()
    setEnviandoSolicitud(true)

    try {
      await solicitudesService.createSolicitud({
        habitacion_id: habitacion.id,
        servicio_id: servicioSeleccionado.id,
        notas: notas.trim()
      })

      // Mostrar confirmación
      setSolicitudEnviada(true)
      setNotas('')

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowModal(false)
        setSolicitudEnviada(false)
        setServicioSeleccionado(null)
      }, 2000)
    } catch (err) {
      console.error('Error al enviar solicitud:', err)
      alert(err.response?.data?.error || 'Error al enviar la solicitud')
    } finally {
      setEnviandoSolicitud(false)
    }
  }

  // Obtener componente de icono dinámicamente desde lucide-react
  const getIconForService = (iconName) => {
    // iconName viene de la BD (ej: "Shirt", "Waves", etc.)
    if (!iconName) return LucideIcons.CheckCircle
    const IconComponent = LucideIcons[iconName]
    return IconComponent || LucideIcons.CheckCircle
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

  // Validar si tiene sesión de habitación activa
  if (!tieneHabitacion()) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card module="plataforma" className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <QrCode className="mx-auto text-plataforma-primary-500 mb-4" size={64} />
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
              Escanea el Código QR de tu Habitación
            </h2>
            <p className="text-gray-600 mb-6">
              Para solicitar servicios, debes escanear el código QR ubicado en tu habitación.
            </p>
            <div className="bg-plataforma-primary-50 border border-plataforma-primary-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-plataforma-primary-800">
                <strong>¿No encuentras el código QR?</strong><br />
                Búscalo en la entrada de tu habitación o consulta en recepción.
              </p>
            </div>
            <Button
              variant="primary"
              module="plataforma"
              onClick={() => navigate('/plataforma')}
            >
              Volver al Inicio
            </Button>
          </div>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-plataforma-primary-600 via-plataforma-secondary-500 to-plataforma-accent-600 overflow-hidden"
      >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="container mx-auto px-6 py-8 md:py-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-white">
              Nuestros Servicios
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto font-light mb-6">
              Descubre los servicios disponibles durante tu estadía en Casa Josefa y disfruta de una experiencia completa junto al Lago de Atitlán.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-xl px-6 py-3 border-2 border-amber-200 shadow-lg">
                <div className="text-3xl font-bold text-amber-900">{servicios.length}</div>
                <div className="text-sm text-amber-800 font-semibold">Servicios Disponibles</div>
              </div>
              <div className="bg-white rounded-xl px-6 py-3 border-2 border-amber-200 shadow-lg">
                <div className="text-3xl font-bold text-amber-900">{servicios.filter(s => !s.tiene_costo).length}</div>
                <div className="text-sm text-amber-800 font-semibold">Servicios Incluidos</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Onda decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12">
        {/* TABS DE CATEGORÍAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categorias.map((categoria) => {
              const isActive = categoriaActiva === categoria.id
              return (
                <motion.button
                  key={categoria.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoriaActiva(categoria.id)}
                  className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${categoria.color} text-white shadow-lg shadow-${categoria.color}/30`
                      : 'bg-white text-gray-700 hover:shadow-md border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <categoria.Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} />
                    <span>{categoria.label}</span>
                    {categoria.id !== 'todos' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {servicios.filter(s => s.categoria === categoria.id).length}
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Lista de servicios */}
        {serviciosFiltrados.length === 0 ? (
          <Card module="plataforma">
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-plataforma-primary-400 mb-4" size={64} />
              <p className="text-lg text-gray-600">No hay servicios en esta categoría</p>
              <Button
                variant="secondary"
                module="plataforma"
                onClick={() => setCategoriaActiva('todos')}
                className="mt-4"
              >
                Ver todos los servicios
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {serviciosFiltrados.map((servicio, index) => {
            // Obtener icono dinámicamente desde el campo 'icono' de la BD
            const IconComponent = getIconForService(servicio.icono)

            // Los detalles ahora vienen directamente del servicio (desde la BD)
            const detalles = {
              instrucciones: servicio.instrucciones || [],
              solicitable: servicio.solicitable !== undefined ? servicio.solicitable : true
            }

            return (
              <ServiceCard
                key={servicio.id}
                servicio={servicio}
                IconComponent={IconComponent}
                detalles={detalles}
                delay={index * 0.1}
                onSolicitar={handleSolicitar}
                tieneHabitacion={tieneHabitacion()}
              />
            )
          })}
        </div>
      )}

        {/* Servicios incluidos en la estadía - REDISEÑADO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 mb-16"
        >
          <div className="relative bg-gradient-to-br from-plataforma-primary-50 to-plataforma-secondary-50 rounded-3xl p-8 md:p-12 border border-plataforma-primary-100 shadow-xl overflow-hidden">
            {/* Patrón decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-plataforma-primary-200/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-plataforma-secondary-200/20 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-md">
                  <CheckCircle className="text-plataforma-nature-600" size={20} />
                  <span className="text-sm font-semibold text-plataforma-primary-700">Incluido en tu estadía</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-plataforma-primary-700 mb-2">
                  Servicios Complementarios
                </h2>
                <p className="text-plataforma-nature-600 max-w-2xl mx-auto">
                  Disfruta de estos servicios esenciales sin costo adicional
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: CheckCircle,
                    titulo: 'WiFi Gratuito',
                    descripcion: 'Internet de alta velocidad en todas las áreas',
                    gradient: 'from-plataforma-nature-500 to-plataforma-nature-600'
                  },
                  {
                    icon: Droplets,
                    titulo: 'Agua Caliente 24/7',
                    descripcion: 'Servicio de agua caliente disponible todo el día',
                    gradient: 'from-plataforma-secondary-400 to-plataforma-secondary-500'
                  },
                  {
                    icon: Sparkles,
                    titulo: 'Limpieza Diaria',
                    descripcion: 'Servicio de limpieza y cambio de toallas',
                    gradient: 'from-plataforma-primary-500 to-plataforma-primary-600'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="text-white" size={32} />
                    </div>
                    <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-lg">
                      {item.titulo}
                    </h3>
                    <p className="text-sm text-plataforma-nature-600 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de solicitud de servicio */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!enviandoSolicitud && !solicitudEnviada) {
            setShowModal(false)
            setServicioSeleccionado(null)
            setNotas('')
          }
        }}
        title={`Solicitar ${servicioSeleccionado?.nombre || 'Servicio'}`}
        module="plataforma"
      >
        {solicitudEnviada ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-2xl mb-4 mx-auto shadow-lg">
              <CheckCircle className="text-white" size={48} />
            </div>
            <h3 className="text-2xl font-display font-bold text-plataforma-primary-700 mb-2">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-plataforma-nature-700">
              El personal del hotel atenderá tu solicitud en breve
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnviarSolicitud} className="space-y-4">
            {/* Información de la habitación */}
            <div className="bg-gradient-to-br from-plataforma-primary-50 to-plataforma-nature-50 border border-plataforma-primary-200 p-4 rounded-lg">
              <p className="text-sm text-plataforma-nature-700">
                <strong className="text-plataforma-primary-700">Habitación:</strong> {habitacion?.numero}
              </p>
              <p className="text-sm text-plataforma-nature-700">
                <strong className="text-plataforma-primary-700">Servicio:</strong> {servicioSeleccionado?.nombre}
              </p>
            </div>

            {/* Notas opcionales */}
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios o preferencias (opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={4}
                placeholder="Ejemplo: Necesito el servicio a las 3:00 PM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plataforma-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes especificar horarios, preferencias o cualquier detalle adicional
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                module="plataforma"
                onClick={() => {
                  setShowModal(false)
                  setServicioSeleccionado(null)
                  setNotas('')
                }}
                disabled={enviandoSolicitud}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                module="plataforma"
                disabled={enviandoSolicitud}
              >
                {enviandoSolicitud ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default ServiciosPage
