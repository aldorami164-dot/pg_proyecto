import Card from '@shared/components/Card'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, ExternalLink, AlertCircle } from 'lucide-react'

const ContactoPage = () => {
  const hotelPhone = '+50277217139'
  const hotelEmail = 'casajosefaatitlan@gmail.com'
  const whatsappMessage = encodeURIComponent('Hola Casa Josefa, necesito información...')

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-plataforma-primary-700 mb-4">
          Contáctanos
        </h1>
        <p className="text-lg text-gray-600">
          Estamos aquí para ayudarte durante tu estadía
        </p>
      </div>

      {/* Información de contacto principal con botones */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {/* Teléfono / Recepción */}
        <Card module="plataforma" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-plataforma-primary-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-primary-500 to-plataforma-primary-600 rounded-2xl mb-4 shadow-lg">
            <Phone className="text-white" size={32} />
          </div>
          <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-xl">Recepción 24/7</h3>
          <p className="text-plataforma-primary-600 font-semibold mb-1">+502 7721-7139</p>
          <p className="text-sm text-plataforma-nature-600 mb-4">Ext. 0 desde tu habitación</p>

          <a
            href={`tel:${hotelPhone}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-plataforma-primary-600 hover:bg-plataforma-primary-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-xl"
          >
            <Phone size={18} />
            Llamar Ahora
          </a>
        </Card>

        {/* Email */}
        <Card module="plataforma" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-plataforma-primary-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-nature-500 to-plataforma-nature-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="text-white" size={32} />
          </div>
          <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-xl">Correo Electrónico</h3>
          <p className="text-plataforma-nature-700 font-medium mb-1 text-sm break-all">{hotelEmail}</p>
          <p className="text-sm text-plataforma-nature-600 mb-4">Respuesta en 24 horas</p>

          <a
            href={`mailto:${hotelEmail}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-plataforma-nature-600 hover:bg-plataforma-nature-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-xl"
          >
            <Mail size={18} />
            Enviar Email
          </a>
        </Card>

        {/* WhatsApp */}
        <Card module="plataforma" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-plataforma-primary-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-2xl mb-4 shadow-lg">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h3 className="font-display font-bold text-plataforma-primary-700 mb-2 text-xl">WhatsApp</h3>
          <p className="text-plataforma-secondary-600 font-semibold mb-1">+502 7721-7139</p>
          <p className="text-sm text-plataforma-nature-600 mb-4">Respuesta inmediata</p>

          <a
            href={`https://wa.me/${hotelPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-plataforma-secondary-500 hover:bg-plataforma-secondary-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-xl"
          >
            <MessageCircle size={18} />
            Chatear
          </a>
        </Card>
      </div>

      {/* Mapa de ubicación y horarios */}
      <div className="max-w-6xl mx-auto mb-12">
        <Card module="plataforma" className="overflow-hidden border-2 border-plataforma-primary-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-plataforma-accent-500 to-plataforma-accent-600 rounded-xl shadow-lg">
              <MapPin className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-plataforma-primary-700">
                Nuestra Ubicación
              </h3>
              <p className="text-plataforma-nature-600">
                Canton Tzanjuyu, Santiago Atitlán, Sololá
              </p>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3852.1234567890123!2d-91.2299152!3d14.6411078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDM4JzI4LjAiTiA5McKwMTMnNDcuNyJX!5e0!3m2!1ses!2sgt!4v1234567890123!5m2!1ses!2sgt"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Casa Josefa Hotel"
            />
          </div>

          <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-xl">
            <MapPin className="text-plataforma-primary-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <p className="text-gray-700 font-medium mb-2">
                <strong>Casa Josefa Hotel</strong>
              </p>
              <p className="text-gray-600 mb-3">
                Canton Tzanjuyu<br />
                Santiago Atitlán, Sololá<br />
                Guatemala
              </p>
              <p className="text-sm text-gray-500">
                Ubicados en el corazón del Lago Atitlán, rodeados de volcanes y naturaleza.
                Fácil acceso desde todas las localidades alrededor del lago.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Horarios de Servicio */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card module="plataforma" className="border-2 border-plataforma-primary-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-500 rounded-xl shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-display font-bold text-plataforma-primary-700">
              Horarios de Servicio
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Recepción:</span>
                <span className="text-gray-700">24 horas</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Check-in:</span>
                <span className="text-gray-700">12:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Check-out:</span>
                <span className="text-gray-700">11:00 AM</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Desayuno:</span>
                <span className="text-gray-700">7:00 AM - 10:00 AM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Sauna:</span>
                <span className="text-gray-700">9:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Piscina:</span>
                <span className="text-gray-700">8:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contactos de Emergencia */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card module="plataforma" className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <AlertCircle className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-display font-bold text-red-700">
              Contactos de Emergencia
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-md">
              <p className="font-semibold text-plataforma-primary-700 mb-1">Recepción</p>
              <p className="text-red-600 font-bold">Ext. 0 desde tu habitación</p>
              <p className="text-sm text-plataforma-nature-600">+502 7721-7139</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-md">
              <p className="font-semibold text-plataforma-primary-700 mb-1">Policía Nacional</p>
              <p className="text-red-600 font-bold text-2xl">110</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-md">
              <p className="font-semibold text-plataforma-primary-700 mb-1">Bomberos</p>
              <p className="text-red-600 font-bold text-2xl">122</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-md">
              <p className="font-semibold text-plataforma-primary-700 mb-1">Ambulancia</p>
              <p className="text-red-600 font-bold text-2xl">123</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Redes sociales */}
      <Card module="plataforma" className="max-w-4xl mx-auto border-2 border-plataforma-primary-100">
        <div className="text-center">
          <h3 className="text-2xl font-display font-bold text-plataforma-primary-700 mb-4">
            Síguenos en Redes Sociales
          </h3>
          <p className="text-plataforma-nature-600 mb-8">
            Mantente al día con nuestras novedades, promociones y las bellezas del Lago Atitlán
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://facebook.com/casajosefaatitlan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-plataforma-primary-600 to-plataforma-primary-700 hover:from-plataforma-primary-700 hover:to-plataforma-primary-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Facebook size={24} />
              <span className="font-bold">Facebook</span>
              <ExternalLink size={16} />
            </a>
            <a
              href="https://instagram.com/casajosefaatitlan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-plataforma-secondary-400 to-plataforma-secondary-500 hover:from-plataforma-secondary-500 hover:to-plataforma-secondary-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Instagram size={24} />
              <span className="font-bold">Instagram</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ContactoPage
