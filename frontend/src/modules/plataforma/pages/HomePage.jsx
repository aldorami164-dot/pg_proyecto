import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@shared/components/Button'
import Card from '@shared/components/Card'
import FeatureCard from '@shared/components/FeatureCard'
import {
  MapPin, Star, Users, Award, Wifi, Clock, Phone, Shield,
  Coffee, Loader2, CheckCircle, Info
} from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'
import hotelImage from '@/assets/HOTEL.jpg'

const HomePage = () => {
  const [contenido, setContenido] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarContenido()
  }, [])

  const cargarContenido = async () => {
    try {
      setLoading(true)
      const data = await plataformaService.getContenido()
      setContenido(data || [])
    } catch (error) {
      console.error('Error al cargar contenido:', error)
      // Si hay error, usar contenido por defecto
      setContenido([])
    } finally {
      setLoading(false)
    }
  }

  const getContenidoBySeccion = (seccion) => {
    const item = contenido.find(c => c.seccion === seccion)
    return item || { titulo: '', contenido: '' }
  }

  return (
    <div>
      {/* Hero Section con imagen de fondo */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${hotelImage})`
          }}
        />

        {/* Overlay oscuro para que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />

        {/* Contenido */}
        <div className="relative z-10 text-center px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 drop-shadow-2xl">
            Bienvenido a Casa Josefa
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-lg">
            Tu hogar en el corazón del Lago Atitlán
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/plataforma/experiencias">
              <Button variant="primary" module="plataforma" size="lg">
                Explorar Experiencias
              </Button>
            </Link>
            <Link to="/plataforma/servicios">
              <Button variant="secondary" module="plataforma" size="lg">
                Ver Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4
                         bg-gradient-to-r from-plataforma-primary-700 via-plataforma-nature-700 to-plataforma-primary-700
                         bg-clip-text text-transparent">
            ¿Por qué Casa Josefa?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experimenta la hospitalidad guatemalteca en su máxima expresión
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={MapPin}
            title="Ubicación Privilegiada"
            description="En el corazón del Lago Atitlán, rodeado de naturaleza"
            gradient="from-plataforma-accent-500 to-plataforma-accent-600"
            delay={0}
          />

          <FeatureCard
            icon={Star}
            title="Servicio Excepcional"
            description="Atención personalizada para hacer tu estadía inolvidable"
            gradient="from-plataforma-primary-500 to-plataforma-primary-600"
            delay={0.1}
          />

          <FeatureCard
            icon={Users}
            title="Ambiente Familiar"
            description="Un hotel pequeño con el calor de hogar"
            gradient="from-plataforma-secondary-400 to-plataforma-secondary-500"
            delay={0.2}
          />

          <FeatureCard
            icon={Award}
            title="Experiencias Únicas"
            description="Tours y actividades para conectar con la cultura local"
            gradient="from-plataforma-nature-500 to-plataforma-nature-600"
            delay={0.3}
          />
        </div>
      </section>

      {/* Información del Hotel */}
      {loading ? (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-plataforma-primary-600" size={48} />
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-plataforma-primary-700 mb-4">
                Información Importante
              </h2>
              <p className="text-lg text-gray-600">
                Todo lo que necesitas saber para tu estadía
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Normas del Hotel */}
              <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-xl flex-shrink-0 shadow-lg">
                    <CheckCircle className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-3">
                      Normas del Hotel
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Check-in:</strong> 12:00 PM (mediodía)</p>
                      <p><strong>Check-out:</strong> 11:00 AM</p>
                      <p><strong>Horario de silencio:</strong> 10:00 PM - 7:00 AM</p>
                      <p className="text-sm text-plataforma-nature-600 mt-3">
                        Por favor respeta las áreas comunes y mantén el volumen bajo durante las horas de descanso.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Horarios */}
              <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl flex-shrink-0 shadow-lg">
                    <Clock className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-3">
                      Horarios de Servicio
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Recepción:</span>
                        <span>24 horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Desayuno:</span>
                        <span>7:00 AM - 10:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Sauna:</span>
                        <span>9:00 AM - 9:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cocina Compartida:</span>
                        <span>6:00 AM - 10:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Piscina:</span>
                        <span>8:00 AM - 7:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* WiFi */}
              <Card module="plataforma" className="border-2 border-plataforma-primary-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-xl flex-shrink-0 shadow-lg">
                    <Wifi className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-3">
                      Conexión WiFi
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Red:</strong> CasaJosefa_Guests</p>
                      <p><strong>Contraseña:</strong> Atitlan2024</p>
                      <p className="text-sm text-plataforma-nature-600 mt-3">
                        Internet de alta velocidad disponible en todas las áreas del hotel.
                        Si tienes problemas de conexión, contacta a recepción.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contactos de Emergencia */}
              <Card module="plataforma" className="border-2 border-red-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex-shrink-0 shadow-lg">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-red-700 mb-3">
                      Contactos de Emergencia
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Recepción (24h):</span>
                        <span>Ext. 0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Policía:</span>
                        <span>110</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Bomberos:</span>
                        <span>122</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ambulancia:</span>
                        <span>123</span>
                      </div>
                      <p className="text-sm text-plataforma-nature-600 mt-3">
                        En caso de emergencia, contacta primero a recepción. Nuestro personal está capacitado para asistirte.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Nota informativa */}
            <div className="mt-12 max-w-4xl mx-auto">
              <Card module="plataforma" className="bg-gradient-to-br from-plataforma-accent-50 to-plataforma-primary-50 border-2 border-plataforma-primary-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
                    <Info className="text-white flex-shrink-0" size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-lg">
                      ¿Tienes dudas o necesitas algo?
                    </h3>
                    <p className="text-plataforma-nature-700">
                      Nuestra recepción está disponible 24/7 para atender todas tus consultas.
                      Si estás en tu habitación, escanea el código QR para solicitar servicios adicionales.
                      ¡Estamos aquí para hacer tu estadía perfecta!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-plataforma-primary-700 via-plataforma-primary-600 to-plataforma-nature-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-bold mb-6 drop-shadow-lg">
            ¿Tienes preguntas?
          </h2>
          <p className="text-xl mb-8 text-plataforma-accent-100 drop-shadow">
            Contáctanos y descubre todo lo que Casa Josefa tiene para ti
          </p>
          <Link to="/plataforma/contacto">
            <Button variant="secondary" module="plataforma" size="lg">
              Información de Contacto
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
