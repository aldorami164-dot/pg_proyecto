import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { Lock, Mail, Eye, EyeOff, AlertCircle, ExternalLink, Hotel, Shield, Sparkles } from 'lucide-react'

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirigir si ya está autenticado al cargar la página
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/gestion/dashboard'
      window.location.href = from
    }
  }, []) // Ejecutar solo al montar, NO cuando isAuthenticated cambie

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('') // Limpiar error al escribir
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)

      // Forzar redirección inmediata con window.location para evitar race condition
      const from = location.state?.from?.pathname || '/gestion/dashboard'
      window.location.href = from
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError(
        err.response?.data?.message ||
          'Credenciales incorrectas. Por favor, intenta de nuevo.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ============================================
          LADO IZQUIERDO - BRANDING
          ============================================ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Patrón de puntos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Efectos de fondo sutiles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        </div>

        {/* Contenido del lado izquierdo */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo y nombre */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600/30 shadow-xl">
              <Hotel className="text-slate-300" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Casa Josefa</h1>
              <p className="text-slate-400 text-sm mt-1">Sistema de Gestión Hotelera</p>
            </div>
          </div>

          {/* Candado central y frase */}
          <div className="space-y-12">
            {/* Candado decorativo grande */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-amber-500/20 to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>

                {/* Círculo exterior con borde dorado */}
                <div className="relative w-40 h-40 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-full flex items-center justify-center border-4 border-amber-600/30 shadow-2xl">
                  {/* Círculo interior */}
                  <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full"></div>

                  {/* Candado */}
                  <Shield className="relative text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={70} strokeWidth={1.5} />
                </div>

                {/* Partículas decorativas alrededor */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>

            {/* Frase elegante */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Excelencia en cada reserva
              </h2>
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Footer izquierdo */}
          <div className="text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Casa Josefa. Todos los derechos reservados.</p>
          </div>
        </div>

        {/* División Diagonal Suave */}
        <div className="absolute top-0 right-0 h-full w-24 overflow-hidden">
          <svg
            className="absolute top-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Diagonal principal */}
            <path
              d="M 0 0 L 100 15 L 100 100 L 0 85 Z"
              fill="white"
            />
            {/* Sombra suave para profundidad */}
            <path
              d="M 0 0 L 100 15 L 100 100 L 0 85 Z"
              fill="url(#diagonalShadow)"
              opacity="0.1"
            />
            <defs>
              <linearGradient id="diagonalShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#000000', stopOpacity: 0.3}} />
                <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 0}} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ============================================
          LADO DERECHO - FORMULARIO LOGIN
          ============================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 relative overflow-hidden">
        {/* Patrón geométrico de fondo - Grid de puntos */}
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Patrón adicional - Líneas diagonales sutiles */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, #64748b 35px, #64748b 37px)',
          }}></div>
        </div>

        {/* Efectos de luz decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/30 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100/20 via-transparent to-transparent rounded-full blur-3xl"></div>

        {/* Sombra decorativa en el borde izquierdo */}
        <div className="hidden lg:block absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Header del formulario */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
            <p className="text-slate-600 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slide-up">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-red-900 font-semibold">Error de autenticación</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botón Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={18} />
                  Iniciar sesión
                </span>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">o</span>
            </div>
          </div>

          {/* Botón Plataforma */}
          <Link to="/plataforma">
            <button
              type="button"
              className="w-full border-2 border-amber-500 hover:border-amber-600 text-amber-600 hover:bg-amber-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Visitar Plataforma
              <ExternalLink size={16} />
            </button>
          </Link>

          {/* Ayuda */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              ¿Problemas para acceder?{' '}
              <span className="text-slate-900 hover:underline cursor-pointer font-medium">
                Contacta al administrador
              </span>
            </p>
          </div>

          {/* Logo móvil (solo visible en pantallas pequeñas) */}
          <div className="lg:hidden mt-12 flex items-center justify-center gap-2 text-slate-400">
            <Hotel size={20} />
            <span className="text-sm">Casa Josefa &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
