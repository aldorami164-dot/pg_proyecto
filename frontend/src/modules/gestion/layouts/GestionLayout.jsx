import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { useWebSocket } from '@shared/context/WebSocketContext'
import NotificationsDropdown from '@shared/components/NotificationsDropdown'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Home,
  QrCode,
  Bell,
  Users,
  UserCheck,
  BarChart3,
  ImageIcon,
  LogOut,
  Menu,
  X,
  User,
  Archive,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
} from 'lucide-react'

const GestionLayout = () => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, connected } = useWebSocket()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/gestion/login')
  }

  const menuItems = [
    { path: '/gestion/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/gestion/reservas', icon: Calendar, label: 'Reservas' },
    { path: '/gestion/calendario', icon: CalendarDays, label: 'Calendario' },
    { path: '/gestion/historial-reservas', icon: Archive, label: 'Historial' },
    { path: '/gestion/habitaciones', icon: Home, label: 'Habitaciones' },
    { path: '/gestion/huespedes', icon: UserCheck, label: 'Huéspedes' },
    { path: '/gestion/qr', icon: QrCode, label: 'Códigos QR' },
    { path: '/gestion/solicitudes', icon: Bell, label: 'Solicitudes' },
    { path: '/gestion/usuarios', icon: Users, label: 'Usuarios', adminOnly: true },
    { path: '/gestion/reportes', icon: BarChart3, label: 'Reportes' },
    { path: '/gestion/galeria', icon: ImageIcon, label: 'Galería' },
    { path: '/gestion/experiencias', icon: Compass, label: 'Experiencias', adminOnly: true },
    { path: '/gestion/lugares-turisticos', icon: MapPin, label: 'Lugares', adminOnly: true },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Estilo SAT Guatemala */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-60' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="h-16 flex items-center justify-center px-4 border-b border-slate-800">
            {sidebarOpen ? (
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Home size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-semibold text-white">Casa Josefa</h1>
                {/* Botón mobile close */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden ml-auto p-2 rounded hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                {/* Botón para expandir en modo colapsado - solo visible en desktop */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800 transition-all duration-300 ease-in-out"
                  title="Expandir menú"
                >
                  <Menu size={22} className="text-gray-300" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                // Si es solo para admin y el usuario no es admin, no mostrar
                if (item.adminOnly && user?.rol !== 'administrador') {
                  return null
                }

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                          isActive
                            ? 'bg-slate-700 text-white shadow-md border-l-4 border-slate-400'
                            : 'text-gray-300 hover:bg-slate-800 hover:text-gray-100'
                        } ${!sidebarOpen && 'justify-center'}`
                      }
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <item.icon size={24} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="font-medium text-base transition-opacity duration-300">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User info & Logout */}
          <div className="p-3 border-t border-slate-800">
            {sidebarOpen ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-xs text-gray-400 truncate capitalize">
                      {user?.rol}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-300 ease-in-out"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center p-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-300 ease-in-out"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-60' : 'md:ml-20'}`}>
        {/* Top bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300 font-medium">
              Sistema de Gestión Hotelera
            </div>
          </div>

          {/* Notificaciones y estado */}
          <div className="flex items-center gap-4">
            <NotificationsDropdown />

            {/* Indicador WebSocket */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800">
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-xs text-gray-300 font-medium">
                {connected ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default GestionLayout
