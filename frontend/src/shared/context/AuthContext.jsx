import { createContext, useContext, useState, useEffect } from 'react'
import authService from '@shared/services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getUser()
        const token = authService.getToken()

        if (storedUser && token) {
          // Verificar que el token siga siendo válido
          const { data } = await authService.me()
          setUser(data.usuario)
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error)
        // Si falla, limpiar todo
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const { usuario } = await authService.login(email, password)
    setUser(usuario)
    return usuario
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'administrador',
    isRecepcionista: user?.rol === 'recepcionista',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
