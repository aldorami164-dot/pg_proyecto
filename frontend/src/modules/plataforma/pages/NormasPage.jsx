import { motion } from 'framer-motion'
import Card from '@shared/components/Card'
import {
  CheckCircle, Clock, Bell, Shield, Coffee, Cigarette,
  Users, Volume2, Droplets, Wifi, AlertCircle
} from 'lucide-react'

const NormasPage = () => {
  const normas = [
    {
      icon: Clock,
      title: 'Horarios',
      color: 'from-blue-500 to-blue-600',
      items: [
        { label: 'Check-in', value: '12:00 PM (mediodía)' },
        { label: 'Check-out', value: '11:00 AM' },
        { label: 'Horario de silencio', value: '10:00 PM - 7:00 AM' }
      ]
    },
    {
      icon: Volume2,
      title: 'Áreas Comunes',
      color: 'from-purple-500 to-purple-600',
      items: [
        { label: 'Respeta el espacio de otros huéspedes' },
        { label: 'Mantén el volumen bajo en horas de descanso' },
        { label: 'Deja las áreas comunes limpias después de usarlas' }
      ]
    },
    {
      icon: Users,
      title: 'Capacidad de Habitación',
      color: 'from-green-500 to-green-600',
      items: [
        { label: 'Respeta el número máximo de ocupantes por habitación' },
        { label: 'Registra todos los huéspedes adicionales en recepción' },
        { label: 'No se permiten visitas después de las 10:00 PM' }
      ]
    },
    {
      icon: Cigarette,
      title: 'Prohibido Fumar',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Casa Josefa es un hotel 100% libre de humo' },
        { label: 'Áreas designadas para fumar disponibles al aire libre' },
        { label: 'Protegemos la salud y comodidad de todos nuestros huéspedes' }
      ]
    },
    {
      icon: Coffee,
      title: 'Cocina Compartida',
      color: 'from-orange-500 to-orange-600',
      items: [
        { label: 'Limpia todos los utensilios después de usarlos' },
        { label: 'Etiqueta tu comida con tu nombre y número de habitación' },
        { label: 'No dejes ollas o sartenes sin supervisión' }
      ]
    },
    {
      icon: Droplets,
      title: 'Uso Responsable del Agua',
      color: 'from-cyan-500 to-cyan-600',
      items: [
        { label: 'Cierra las llaves mientras te enjabonas' },
        { label: 'Reporta cualquier fuga o goteo a recepción' },
        { label: 'Ayúdanos a conservar este recurso vital' }
      ]
    }
  ]

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
          Normas del Hotel
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Para garantizar una estadía agradable para todos nuestros huéspedes
        </p>
      </motion.div>

      {/* Grid de normas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
        {normas.map((norma, index) => {
          const IconComponent = norma.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card module="plataforma" className="h-full border-2 border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col h-full">
                  {/* Header con icono */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-3 bg-gradient-to-br ${norma.color} rounded-xl flex-shrink-0 shadow-lg`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-gray-900">
                        {norma.title}
                      </h3>
                    </div>
                  </div>

                  {/* Lista de items */}
                  <ul className="space-y-2.5">
                    {norma.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <div className="flex-1">
                          {item.label && item.value ? (
                            <div>
                              <span className="font-semibold">{item.label}:</span>{' '}
                              <span>{item.value}</span>
                            </div>
                          ) : (
                            <span>{item.label || item}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Secciones informativas adicionales */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Seguridad */}
        <Card module="plataforma" className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex-shrink-0 shadow-lg">
              <Shield className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                Seguridad y Responsabilidad
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span>Casa Josefa no se hace responsable por objetos de valor dejados en las habitaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span>Utiliza la caja fuerte de tu habitación para guardar documentos y objetos valiosos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span>Cierra con llave tu habitación cada vez que salgas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span>Reporta cualquier actividad sospechosa inmediatamente a recepción</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Política de Cancelación y Daños */}
        <Card module="plataforma" className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex-shrink-0 shadow-lg">
              <AlertCircle className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                Daños y Responsabilidades
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Los huéspedes son responsables de cualquier daño causado a la propiedad del hotel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Los daños serán cobrados al momento del check-out según el costo de reparación</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Reporta cualquier accidente o daño inmediatamente a recepción</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Nota final */}
        <Card module="plataforma" className="bg-gradient-to-br from-plataforma-accent-50 to-plataforma-primary-50 border-2 border-plataforma-primary-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl flex-shrink-0 shadow-lg">
              <CheckCircle className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-plataforma-primary-700 mb-3">
                Agradecemos tu Colaboración
              </h3>
              <p className="text-plataforma-nature-700 leading-relaxed">
                Estas normas están diseñadas para asegurar una experiencia positiva para todos nuestros huéspedes.
                Al respetar estas reglas, contribuyes a crear un ambiente armonioso y agradable para toda nuestra
                comunidad. Si tienes alguna pregunta sobre nuestras políticas, no dudes en contactar a recepción
                en cualquier momento. ¡Gracias por elegir Casa Josefa!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default NormasPage
