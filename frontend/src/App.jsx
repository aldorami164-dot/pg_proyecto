import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@shared/context/AuthContext'
import { WebSocketProvider } from '@shared/context/WebSocketContext'

// Importar layouts
import GestionLayout from '@gestion/layouts/GestionLayout'
import PlataformaLayout from '@plataforma/layouts/PlataformaLayout'

// Importar páginas de Gestión
import LoginPage from '@gestion/pages/LoginPage'
import DashboardPage from '@gestion/pages/DashboardPage'
import ReservasPage from '@gestion/pages/ReservasPage'
import CalendarioDisponibilidadPage from '@gestion/pages/CalendarioDisponibilidadPage'
import HistorialReservasPage from '@gestion/pages/HistorialReservasPage'
import HabitacionesPage from '@gestion/pages/HabitacionesPage'
import HuespedesPage from '@gestion/pages/HuespedesPage'
import CodigosQRPage from '@gestion/pages/CodigosQRPage'
import SolicitudesPage from '@gestion/pages/SolicitudesPage'
import UsuariosPage from '@gestion/pages/UsuariosPage'
import ReportesPage from '@gestion/pages/ReportesPage'
import GaleriaPage from '@gestion/pages/GaleriaPage'
import ExperienciasGestionPage from '@gestion/pages/ExperienciasGestionPage'
import LugaresTuristicosPage from '@gestion/pages/LugaresTuristicosPage'
import ServiciosGestionPage from '@gestion/pages/ServiciosGestionPage'

// Importar páginas de Plataforma
import HomePage from '@plataforma/pages/HomePage'
import HabitacionPublicPage from '@plataforma/pages/HabitacionPublicPage'
import ExperienciasPage from '@plataforma/pages/ExperienciasPage'
import ExperienciaDetallePage from '@plataforma/pages/ExperienciaDetallePage'
import LugaresPage from '@plataforma/pages/LugaresPage'
import LugarDetallePage from '@plataforma/pages/LugarDetallePage'
import ServiciosPage from '@plataforma/pages/ServiciosPage'
import NormasPage from '@plataforma/pages/NormasPage'
import ContactoPage from '@plataforma/pages/ContactoPage'

// Componente para rutas protegidas
import ProtectedRoute from '@shared/components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        {/* Toaster para mostrar notificaciones */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* ===================================================================
              LOGIN - PÁGINA PRINCIPAL
              =================================================================== */}
          <Route path="/" element={<LoginPage />} />

          {/* ===================================================================
              MÓDULO PLATAFORMA PÚBLICA
              =================================================================== */}
          <Route path="/plataforma" element={<PlataformaLayout />}>
            <Route index element={<HomePage />} />
            <Route path="habitacion/:codigoQR" element={<HabitacionPublicPage />} />
            <Route path="experiencias" element={<ExperienciasPage />} />
            <Route path="experiencias/:id" element={<ExperienciaDetallePage />} />
            <Route path="lugares" element={<LugaresPage />} />
            <Route path="lugares/:id" element={<LugarDetallePage />} />
            <Route path="servicios" element={<ServiciosPage />} />
            <Route path="normas" element={<NormasPage />} />
            <Route path="contacto" element={<ContactoPage />} />
          </Route>

          {/* Ruta de compatibilidad para QR antiguos con dominio casajosefa.com */}
          <Route path="/habitacion/:numeroHabitacion" element={<HabitacionPublicPage />} />

          {/* ===================================================================
              MÓDULO GESTIÓN (ADMIN)
              =================================================================== */}

          {/* Rutas protegidas de Gestión */}
          <Route
            path="/gestion"
            element={
              <ProtectedRoute>
                <GestionLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/gestion/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reservas" element={<ReservasPage />} />
            <Route path="calendario" element={<CalendarioDisponibilidadPage />} />
            <Route path="historial-reservas" element={<HistorialReservasPage />} />
            <Route path="habitaciones" element={<HabitacionesPage />} />
            <Route path="huespedes" element={<HuespedesPage />} />
            <Route path="qr" element={<CodigosQRPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="galeria" element={<GaleriaPage />} />
            <Route path="experiencias" element={<ExperienciasGestionPage />} />
            <Route path="lugares-turisticos" element={<LugaresTuristicosPage />} />
            <Route path="servicios" element={<ServiciosGestionPage />} />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App
