import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Clock, RefreshCw } from 'lucide-react'
import { useWebSocket } from '@shared/context/WebSocketContext'

const NotificationsDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, reloadNotifications } = useWebSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [reloading, setReloading] = useState(false)
  const dropdownRef = useRef(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    if (!notification.leida) {
      markAsRead(notification.id)
    }
  }

  const handleReload = async () => {
    setReloading(true)
    await reloadNotifications()
    setReloading(false)
  }

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'solicitud_servicio':
        return <Bell size={16} className="text-blue-500" />
      case 'reserva_nueva':
        return <Clock size={16} className="text-green-500" />
      default:
        return <Bell size={16} className="text-gray-500" />
    }
  }

  const formatTime = (fecha) => {
    const now = new Date()
    const notifDate = new Date(fecha)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    return notifDate.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative"
      >
        <Bell size={20} className="text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReload}
                disabled={reloading}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Recargar notificaciones"
              >
                <RefreshCw
                  size={16}
                  className={`text-gray-500 ${reloading ? 'animate-spin' : ''}`}
                />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                    !notif.leida
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.leida ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notif.titulo}
                      </p>
                      {notif.mensaje && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notif.creado_en)}
                      </p>
                    </div>
                    {!notif.leida && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-center text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                  : 'Todas las notificaciones leídas'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown
