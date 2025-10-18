import { Link } from 'react-router-dom'
import { Building2, Users, QrCode, ArrowRight } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Logo y Título Principal */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl mb-6">
            <Building2 className="text-white" size={48} />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
            Casa Josefa
          </h1>
          <p className="text-xl text-blue-200">
            Sistema de Gestión Hotelera
          </p>
        </div>

        {/* Opciones de Acceso */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* OPCIÓN 1: Plataforma Pública */}
          <Link to="/plataforma">
            <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
              {/* Icono */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <QrCode className="text-white" size={48} />
                </div>
              </div>

              {/* Contenido */}
              <h2 className="text-3xl font-display font-bold text-white text-center mb-4">
                Plataforma Pública
              </h2>
              <p className="text-blue-100 text-center mb-6">
                Información del hotel, experiencias y servicios para huéspedes
              </p>

              {/* Características */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mr-3"></div>
                  Ver información del hotel
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mr-3"></div>
                  Explorar experiencias y servicios
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mr-3"></div>
                  Escanear código QR de habitación
                </li>
              </ul>

              {/* Botón */}
              <div className="flex items-center justify-center text-amber-400 font-semibold group-hover:text-amber-300 transition-colors">
                <span>Acceder a la plataforma</span>
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  PÚBLICO
                </span>
              </div>
            </div>
          </Link>

          {/* OPCIÓN 2: Portal de Gestión */}
          <Link to="/gestion/login">
            <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
              {/* Icono */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="text-white" size={48} />
                </div>
              </div>

              {/* Contenido */}
              <h2 className="text-3xl font-display font-bold text-white text-center mb-4">
                Portal de Gestión
              </h2>
              <p className="text-blue-100 text-center mb-6">
                Panel administrativo para personal del hotel
              </p>

              {/* Características */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  Gestionar reservas centralizadas
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  Administrar habitaciones y QR
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  Ver solicitudes en tiempo real
                </li>
              </ul>

              {/* Botón */}
              <div className="flex items-center justify-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                <span>Iniciar sesión</span>
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  PERSONAL
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-blue-300 text-sm">
            © {new Date().getFullYear()} Hotel Casa Josefa. Sistema de Gestión Hotelera v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default Landing
