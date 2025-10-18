import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import authService from '@shared/services/authService'
import notificacionesService from '@shared/services/notificacionesService'

const WebSocketContext = createContext(null)

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)

  // Conectar al WebSocket
  const connect = useCallback(() => {
    // Solo conectar si el usuario está autenticado y es admin o recepcionista
    if (!isAuthenticated || !user) {
      return
    }

    if (!['administrador', 'recepcionista'].includes(user.rol)) {
      return
    }

    // Si ya hay una conexión activa, no reconectar
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Conectado al servidor WebSocket')
        setConnected(true)
        reconnectAttempts.current = 0

        // Autenticarse enviando el token
        const token = authService.getToken()
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case 'welcome':
              console.log('Mensaje de bienvenida:', message.message)
              break

            case 'auth_success':
              console.log('✅ Autenticado en WebSocket:', message.message)
              break

            case 'notificaciones_pendientes':
              console.log(`📬 ${message.total} notificaciones pendientes recibidas`)
              // Reemplazar todas las notificaciones con las pendientes
              setNotifications(message.data || [])
              break

            case 'nueva_notificacion':
              console.log('🔔 Nueva notificación:', message.data)
              // Agregar solo si no existe ya (evitar duplicados)
              setNotifications((prev) => {
                const exists = prev.some(n => n.id === message.data.id)
                if (exists) {
                  console.warn('⚠️ Notificación duplicada ignorada:', message.data.id)
                  return prev
                }
                return [message.data, ...prev]
              })
              break

            case 'pong':
              // Respuesta al ping
              break

            case 'error':
              console.error('❌ Error del servidor WebSocket:', message.message)
              break

            default:
              console.log('Mensaje WebSocket no reconocido:', message)
          }
        } catch (error) {
          console.error('Error al parsear mensaje WebSocket:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error)
      }

      ws.onclose = () => {
        console.log('Desconectado del servidor WebSocket')
        setConnected(false)

        // Intentar reconectar con backoff exponencial
        if (isAuthenticated && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`Reintentando conexión en ${delay / 1000}s...`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error('Error al conectar WebSocket:', error)
    }
  }, [isAuthenticated, user])

  // Desconectar del WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setConnected(false)
    setNotifications([])
  }, [])

  // Enviar ping para mantener conexión activa
  useEffect(() => {
    if (!connected) return

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(pingInterval)
  }, [connected])

  // Conectar/desconectar según autenticación
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, connect, disconnect])

  // Eliminar notificación del estado local
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  // Limpiar todas las notificaciones del estado local
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Recargar notificaciones desde el backend
  const reloadNotifications = useCallback(async () => {
    try {
      console.log('🔄 Recargando notificaciones desde el backend...')
      const data = await notificacionesService.listar({ leida: false, limit: 50 })
      const notifs = data?.notificaciones || []
      setNotifications(notifs)
      console.log(`✅ ${notifs.length} notificaciones recargadas`)
      return notifs
    } catch (error) {
      console.error('❌ Error al recargar notificaciones:', error)
      return []
    }
  }, [])

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log('📖 Marcando notificación como leída:', notificationId)

      // Actualizar en el backend primero
      await notificacionesService.marcarLeida(notificationId)

      // Si el backend responde OK, actualizar estado local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, leida: true } : n))
      )

      console.log('✅ Notificación marcada como leída exitosamente')
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error)
      // No actualizar estado local si falla el backend
    }
  }, [])

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('📖 Marcando todas las notificaciones como leídas...')

      // Actualizar en el backend primero
      const result = await notificacionesService.marcarTodasLeidas()
      console.log('✅ Backend respondió:', result)

      // Si el backend responde OK, actualizar estado local
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))

      console.log('✅ Todas las notificaciones marcadas como leídas')
    } catch (error) {
      console.error('❌ Error al marcar todas las notificaciones como leídas:', error)
      // No actualizar estado local si falla el backend
    }
  }, [])

  const value = {
    connected,
    notifications,
    removeNotification,
    clearNotifications,
    reloadNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter((n) => !n.leida).length,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
