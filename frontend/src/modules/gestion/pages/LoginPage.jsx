import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Input from '@shared/components/Input'
import Button from '@shared/components/Button'
import { Lock, Mail, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gestion-primary-600 to-gestion-primary-800 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-strong p-8 animate-scale-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gestion-primary-600 rounded-full mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Casa Josefa</h1>
            <p className="text-gray-600">Portal de Gestión</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-slide-up">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Error al iniciar sesión</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
              module="gestion"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              module="gestion"
            />

            <Button
              type="submit"
              variant="primary"
              module="gestion"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Sistema de gestión hotelera</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Casa Josefa</p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center text-white text-sm">
          <p>¿Problemas para iniciar sesión? Contacta al administrador</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
