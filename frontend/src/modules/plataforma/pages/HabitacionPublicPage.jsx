import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import { QrCode, AlertCircle, Loader2 } from 'lucide-react'
import qrService from '@shared/services/qrService'
import useHabitacion from '@shared/hooks/useHabitacion'

const HabitacionPublicPage = () => {
  const { codigoQR } = useParams()
  const navigate = useNavigate()
  const { guardarHabitacion } = useHabitacion()

  // Estados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

      // Guardar habitación en localStorage
      guardarHabitacion(habitacionData)

      // Redirigir al dashboard principal inmediatamente
      // NO desactivamos el loading para que no se muestre el contenido de la página
      navigate('/plataforma')
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err.response?.data?.error || 'No se pudo cargar la información de la habitación')
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-2xl mb-6 shadow-lg">
            <QrCode className="text-white" size={40} />
          </div>
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-700 font-semibold text-lg mb-2">Verificando código QR...</p>
          <p className="text-gray-500 text-sm">Te redirigiremos al dashboard en un momento</p>
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

  // Si llegamos aquí, es porque la redirección está en proceso o hubo un error
  // Normalmente no deberíamos llegar a este return porque siempre estaremos en loading o error
  return null
}

export default HabitacionPublicPage
