import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import { QrCode, Bell, BedDouble, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import qrService from '@shared/services/qrService'
import solicitudesService from '@shared/services/solicitudesService'
import plataformaService from '@shared/services/plataformaService'

const HabitacionPublicPage = () => {
  const { codigoQR } = useParams()

  // Estados
  const [habitacion, setHabitacion] = useState(null)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [solicitudEnviada, setSolicitudEnviada] = useState(false)

  // Estados del formulario de solicitud
  const [solicitudForm, setSolicitudForm] = useState({
    servicio_id: '',
    notas: '',
    habitacion_id: null
  })
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)

  // Cargar información de la habitación y servicios
  useEffect(() => {
    cargarDatos()
  }, [codigoQR])

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener información de la habitación por código QR
      const response = await qrService.getHabitacionPorCodigo(codigoQR)
      console.log('🏠 Respuesta del QR:', response)

      // El backend retorna { habitacion: {...}, mensaje_bienvenida: "..." }
      const habitacionData = response.habitacion
      console.log('🏠 Habitación extraída:', habitacionData)

      setHabitacion(habitacionData)
      setSolicitudForm(prev => ({
        ...prev,
        habitacion_id: habitacionData.id
      }))
      console.log('✅ habitacion_id seteado a:', habitacionData.id)

      // Obtener servicios disponibles
      const serviciosData = await plataformaService.getServicios()
      setServicios(serviciosData)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err.response?.data?.error || 'No se pudo cargar la información de la habitación')
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitudChange = (e) => {
    const { name, value } = e.target
    setSolicitudForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEnviarSolicitud = async (e) => {
    e.preventDefault()
    setEnviandoSolicitud(true)

    try {
      console.log('📤 Enviando solicitud con datos:', {
        habitacion_id: solicitudForm.habitacion_id,
        servicio_id: parseInt(solicitudForm.servicio_id),
        notas: solicitudForm.notas
      })

      await solicitudesService.createSolicitud({
        habitacion_id: solicitudForm.habitacion_id,
        servicio_id: parseInt(solicitudForm.servicio_id),
        notas: solicitudForm.notas
      })

      // Mostrar confirmación
      setSolicitudEnviada(true)

      // Resetear formulario
      setSolicitudForm({
        servicio_id: '',
        notas: '',
        habitacion_id: habitacion.id
      })

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowModal(false)
        setSolicitudEnviada(false)
      }, 2000)
    } catch (err) {
      console.error('Error al enviar solicitud:', err)
      alert(err.response?.data?.error || 'Error al enviar la solicitud')
    } finally {
      setEnviandoSolicitud(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando información de la habitación...</p>
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
              Error al Cargar Habitación
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">
              Por favor, verifica que el código QR sea válido o contacta a recepción
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Encabezado */}
      <Card module="plataforma" className="max-w-4xl mx-auto mb-8 border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-2xl mb-4 shadow-lg">
            <QrCode className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-plataforma-primary-700 mb-2">
            Bienvenido a tu Habitación
          </h1>
          <p className="text-plataforma-nature-600 font-semibold">Habitación {habitacion?.numero}</p>
        </div>

        {/* Información de la habitación */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-plataforma-primary-50 to-plataforma-nature-50 border border-plataforma-primary-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-xl shadow-lg">
                <BedDouble className="text-white" size={20} />
              </div>
              <h3 className="font-display font-bold text-plataforma-primary-700">
                Tipo de Habitación
              </h3>
            </div>
            <p className="text-plataforma-nature-700 font-medium">{habitacion?.tipo || 'Estándar'}</p>
          </div>

          <div className="bg-gradient-to-br from-plataforma-accent-50 to-plataforma-primary-50 border border-plataforma-primary-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
                <Users className="text-white" size={20} />
              </div>
              <h3 className="font-display font-bold text-plataforma-primary-700">
                Capacidad
              </h3>
            </div>
            <p className="text-plataforma-nature-700 font-medium">{habitacion?.capacidad_maxima || 2} personas</p>
          </div>
        </div>

        {/* Botón de solicitar servicio */}
        <div className="text-center">
          <Button
            variant="primary"
            module="plataforma"
            size="lg"
            onClick={() => setShowModal(true)}
          >
            <Bell className="mr-2" size={20} />
            Solicitar Servicio a la Habitación
          </Button>
        </div>
      </Card>

      {/* Descripción */}
      {habitacion?.descripcion && (
        <Card module="plataforma" className="max-w-4xl mx-auto border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-4">
            Acerca de tu Habitación
          </h3>
          <p className="text-plataforma-nature-700 leading-relaxed">{habitacion.descripcion}</p>
        </Card>
      )}

      {/* Modal de solicitud de servicio */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!enviandoSolicitud && !solicitudEnviada) {
            setShowModal(false)
          }
        }}
        title="Solicitar Servicio"
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
            {/* Selector de servicio */}
            <div>
              <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio *
              </label>
              <select
                id="servicio_id"
                name="servicio_id"
                value={solicitudForm.servicio_id}
                onChange={handleSolicitudChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plataforma-primary-500 focus:border-transparent"
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción o Comentarios
              </label>
              <textarea
                id="notas"
                name="notas"
                value={solicitudForm.notas}
                onChange={handleSolicitudChange}
                rows={4}
                placeholder="Describe tu solicitud o agrega detalles adicionales..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plataforma-primary-500 focus:border-transparent"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                module="plataforma"
                onClick={() => setShowModal(false)}
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

export default HabitacionPublicPage
