import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

/**
 * Componente para proteger rutas que requieren autenticación
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gestion-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    // Redirigir a login guardando la ruta intentada
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Verificar rol si es requerido
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/gestion/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
