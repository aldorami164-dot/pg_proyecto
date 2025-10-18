# SISTEMA DE GESTIÓN HOTELERA - HOTEL CASA JOSEFA
## FASE 3: FRONTEND - REACT + VITE + TAILWIND CSS

### CONTEXTO DEL PROYECTO
Continuación de Fase 1 (Base de datos) y Fase 2 (Backend API REST + WebSocket).

**Dos aplicaciones frontend independientes:**
1. **Panel de Administración (Interno):** Dashboard para personal del hotel
2. **Plataforma QR (Pública):** Interfaz para huéspedes vía código QR

---

## STACK TECNOLÓGICO

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite 5+
- **Styling:** Tailwind CSS 3+
- **Routing:** React Router DOM 6+
- **State Management:** Context API + Hooks
- **HTTP Client:** Axios
- **WebSocket Client:** Native WebSocket API
- **Forms:** React Hook Form + Yup validación
- **UI Components:** Headless UI (para modales, dropdowns)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Handling:** date-fns

### Librerías Requeridas
```json
{
  "dependencies": {
    "react": "^18.2.0",no solo 
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "yup": "^1.3.3",
    "@headlessui/react": "^1.7.17",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0"
  }
}
```

---

## ARQUITECTURA DEL PROYECTO

### Estructura de Carpetas (UN SOLO FRONTEND - DOS MÓDULOS)
```
frontend/
├── public/
│   ├── logo.png
│   └── fonts/
│       ├── Inter-Regular.woff2
│       └── Poppins-Bold.woff2
├── src/
│   ├── modules/
│   │   ├── gestion/              # MÓDULO GESTIÓN (Admin/Recepcionista)
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Reservas.jsx
│   │   │   │   ├── Habitaciones.jsx
│   │   │   │   ├── CodigosQR.jsx
│   │   │   │   ├── Solicitudes.jsx
│   │   │   │   ├── Usuarios.jsx
│   │   │   │   ├── Reportes.jsx
│   │   │   │   └── Galeria.jsx
│   │   │   ├── components/
│   │   │   │   ├── ReservaForm.jsx
│   │   │   │   ├── ReservasList.jsx
│   │   │   │   ├── HabitacionCard.jsx
│   │   │   │   ├── QRGenerator.jsx
│   │   │   │   └── SolicitudCard.jsx
│   │   │   └── layouts/
│   │   │       └── GestionLayout.jsx
│   │   │
│   │   └── plataforma/           # MÓDULO PLATAFORMA (Público)
│   │       ├── pages/
│   │       │   ├── Home.jsx
│   │       │   ├── Habitacion.jsx
│   │       │   ├── Experiencias.jsx
│   │       │   ├── Servicios.jsx
│   │       │   └── Comentarios.jsx
│   │       ├── components/
│   │       │   ├── ExperienciaCard.jsx
│   │       │   ├── ServicioCard.jsx
│   │       │   ├── ComentarioForm.jsx
│   │       │   └── LanguageSelector.jsx
│   │       └── layouts/
│   │           └── PlataformaLayout.jsx
│   │
│   ├── shared/                   # COMPARTIDO entre módulos
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── WebSocketContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useWebSocket.js
│   │   │   └── usePagination.js
│   │   └── services/
│   │       ├── api.js
│   │       ├── authService.js
│   │       ├── reservasService.js
│   │       ├── habitacionesService.js
│   │       ├── qrService.js
│   │       ├── solicitudesService.js
│   │       ├── notificacionesService.js
│   │       ├── usuariosService.js
│   │       ├── reportesService.js
│   │       ├── plataformaService.js
│   │       └── galeriaService.js
│   │
│   ├── pages/
│   │   ├── Landing.jsx            # Página de selección (Gestión o Plataforma)
│   │   └── Login.jsx              # Login para Gestión
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🎨 GUÍA DE DISEÑO PROFESIONAL

### Paleta de Colores por Módulo

#### MÓDULO GESTIÓN (Admin/Recepcionista)
**Identidad:** Profesional, corporativo, confiable, eficiente

**Colores principales:**
- **Primary (Azul Corporativo):** `#0ea5e9` (Sky Blue 500)
  - Botones principales, enlaces, elementos interactivos
  - Transmite confianza y profesionalismo

- **Secondary (Gris Pizarra):** `#64748b` (Slate 500)
  - Texto secundario, bordes, fondos sutiles
  - Da elegancia y sofisticación

- **Success (Verde):** `#10b981` - Estados completados, confirmaciones
- **Warning (Ámbar):** `#f59e0b` - Alertas, estados pendientes
- **Error (Rojo):** `#ef4444` - Errores, cancelaciones
- **Info (Azul):** `#3b82f6` - Información adicional

**Fondos:**
- Fondo principal: `#f8fafc` (Slate 50)
- Cards/Modales: `#ffffff` (Blanco puro)
- Sidebar: `#0f172a` (Slate 900) con degradado sutil

**Tipografía:**
- **Headings:** Poppins Bold (600-700)
- **Body:** Inter Regular (400)
- **Buttons:** Inter Medium (500)

#### MÓDULO PLATAFORMA (Público/Huéspedes)
**Identidad:** Acogedor, cálido, turístico, amigable

**Colores principales:**
- **Primary (Dorado/Ámbar):** `#d97706` (Amber 600)
  - Botones, CTAs, elementos destacados
  - Evoca calidez y hospitalidad

- **Secondary (Verde Esmeralda):** `#10b981` (Emerald 500)
  - Elementos secundarios, íconos de confirmación
  - Representa naturaleza del Lago Atitlán

- **Accent (Magenta):** `#d946ef` (Fuchsia 500)
  - Destacar experiencias, elementos especiales
  - Añade vibrancia y energía

**Fondos:**
- Fondo principal: Degradado suave (`#fef3c7` a `#ffffff`)
- Cards: Blanco con sombra suave
- Header: Transparente con backdrop-blur

**Tipografía:**
- **Headings:** Poppins Bold (700)
- **Body:** Inter Regular (400)
- **Highlights:** Poppins SemiBold (600)

### Componentes de UI Estandarizados

#### Botones
```jsx
// Botón Primary Gestión
className="px-4 py-2 bg-gestion-primary-600 hover:bg-gestion-primary-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"

// Botón Secondary Gestión
className="px-4 py-2 bg-gestion-secondary-100 hover:bg-gestion-secondary-200 text-gestion-secondary-700 font-medium rounded-lg transition-all duration-200"

// Botón Primary Plataforma
className="px-6 py-3 bg-plataforma-primary-600 hover:bg-plataforma-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all duration-200 hover:shadow-medium"

// Botón Secondary Plataforma
className="px-6 py-3 bg-plataforma-secondary-500 hover:bg-plataforma-secondary-600 text-white font-semibold rounded-xl shadow-soft transition-all duration-200"
```

#### Cards
```jsx
// Card Gestión
className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 p-6 border border-gestion-secondary-100"

// Card Plataforma
className="bg-white rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 p-8 backdrop-blur-sm"
```

#### Inputs
```jsx
// Input Gestión
className="w-full px-4 py-2.5 border border-gestion-secondary-300 rounded-lg focus:ring-2 focus:ring-gestion-primary-500 focus:border-gestion-primary-500 transition-all"

// Input Plataforma
className="w-full px-5 py-3 border-2 border-plataforma-neutral-200 rounded-xl focus:ring-2 focus:ring-plataforma-primary-500 focus:border-plataforma-primary-500 transition-all"
```

#### Badges de Estado
```jsx
// Pendiente
className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"

// Confirmada
className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"

// Completada
className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"

// Cancelada
className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full"
```

### Layouts Responsivos

#### MÓDULO GESTIÓN
```jsx
// Sidebar (Desktop: Fixed left, Mobile: Drawer)
<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gestion-secondary-900 transform transition-transform duration-300 lg:translate-x-0">
  {/* Navegación */}
</aside>

// Main Content
<main className="lg:ml-64 min-h-screen bg-gestion-secondary-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Contenido */}
  </div>
</main>

// Navbar
<nav className="sticky top-0 z-40 bg-white border-b border-gestion-secondary-200 shadow-sm">
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      {/* Logo, Search, Notifications, User */}
    </div>
  </div>
</nav>
```

#### MÓDULO PLATAFORMA
```jsx
// Header (Transparente con blur)
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-plataforma-neutral-200 shadow-soft">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      {/* Logo, Nav, Language */}
    </div>
  </div>
</header>

// Hero Section
<section className="relative bg-gradient-to-br from-plataforma-primary-50 via-white to-plataforma-secondary-50 py-20">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Hero Content */}
  </div>
</section>

// Content Section
<section className="py-16 bg-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Grid de contenido */}
  </div>
</section>
```

### Animaciones y Transiciones

```css
/* Transiciones suaves globales */
* {
  @apply transition-colors duration-200;
}

/* Hover effects para cards */
.card-hover {
  @apply transform transition-all duration-300 hover:-translate-y-1 hover:shadow-strong;
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Skeleton loading */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
```

### Iconografía
Usar **Lucide React** con tamaños consistentes:
- Icons pequeños: `size={16}` o `w-4 h-4`
- Icons medianos: `size={20}` o `w-5 h-5`
- Icons grandes: `size={24}` o `w-6 h-6`
- Icons hero: `size={48}` o `w-12 h-12`

### Espaciado Consistente
- **Padding cards:** `p-6` (Gestión), `p-8` (Plataforma)
- **Gap en grids:** `gap-6` (Desktop), `gap-4` (Mobile)
- **Margin secciones:** `mb-8` o `mb-12`
- **Padding contenedores:** `px-4 sm:px-6 lg:px-8`

### Sombras Profesionales
- **Soft:** Hover states, elementos flotantes sutiles
- **Medium:** Cards, dropdowns, modales
- **Strong:** Elementos destacados, imágenes importantes

---

## VARIABLES DE ENTORNO (.env)

```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3001

# Configuración
VITE_APP_NAME=Hotel Casa Josefa
VITE_ITEMS_PER_PAGE=20
```

---

## CONFIGURACIÓN INICIAL

### 1. vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### 2. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MÓDULO GESTIÓN - Colores profesionales corporativos
        gestion: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // MÓDULO PLATAFORMA - Colores cálidos y acogedores
        plataforma: {
          primary: {
            50: '#fef3c7',
            100: '#fde68a',
            200: '#fcd34d',
            300: '#fbbf24',
            400: '#f59e0b',
            500: '#d97706',
            600: '#b45309',
            700: '#92400e',
            800: '#78350f',
            900: '#451a03',
          },
          secondary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
          },
          accent: {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75',
          },
          neutral: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
```

### 3. postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## SERVICIOS API (services/)

### api.js - Axios Instance
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` }
          }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### authService.js
```javascript
import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    return response.data;
  }
};
```

### reservasService.js
```javascript
import api from './api';

export const reservasService = {
  listar: async (params = {}) => {
    const response = await api.get('/reservas', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/reservas', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/reservas/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/reservas/${id}/estado`, { estado });
    return response.data;
  },

  consultarDisponibilidad: async (fecha_checkin, fecha_checkout) => {
    const response = await api.get('/reservas/disponibilidad', {
      params: { fecha_checkin, fecha_checkout }
    });
    return response.data;
  }
};
```

### habitacionesService.js
```javascript
import api from './api';

export const habitacionesService = {
  listar: async (params = {}) => {
    const response = await api.get('/habitaciones', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/habitaciones/${id}`);
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/habitaciones', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/habitaciones/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/habitaciones/${id}/estado`, { estado });
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.delete(`/habitaciones/${id}`);
    return response.data;
  }
};
```

### qrService.js
```javascript
import api from './api';

export const qrService = {
  listar: async (params = {}) => {
    const response = await api.get('/qr', { params });
    return response.data;
  },

  generar: async (cantidad) => {
    const response = await api.post('/qr/generar', { cantidad });
    return response.data;
  },

  asignar: async (id, habitacion_id) => {
    const response = await api.patch(`/qr/${id}/asignar`, { habitacion_id });
    return response.data;
  },

  desasignar: async (id) => {
    const response = await api.patch(`/qr/${id}/desasignar`);
    return response.data;
  },

  escanear: async (codigo) => {
    // PÚBLICO - sin autenticación
    const response = await api.get(`/qr/${codigo}/habitacion`);
    return response.data;
  }
};
```

### solicitudesService.js
```javascript
import api from './api';

export const solicitudesService = {
  listar: async (params = {}) => {
    const response = await api.get('/solicitudes', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  crear: async (data) => {
    // PÚBLICO - sin autenticación
    const response = await api.post('/solicitudes', data);
    return response.data;
  },

  completar: async (id) => {
    const response = await api.patch(`/solicitudes/${id}/completar`);
    return response.data;
  }
};
```

### notificacionesService.js
```javascript
import api from './api';

export const notificacionesService = {
  listar: async (params = {}) => {
    const response = await api.get('/notificaciones', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/notificaciones/${id}`);
    return response.data;
  },

  marcarLeida: async (id) => {
    const response = await api.patch(`/notificaciones/${id}/leer`);
    return response.data;
  },

  marcarTodasLeidas: async () => {
    const response = await api.patch('/notificaciones/leer-todas');
    return response.data;
  }
};
```

### usuariosService.js
```javascript
import api from './api';

export const usuariosService = {
  listar: async (params = {}) => {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  toggleActivo: async (id) => {
    const response = await api.patch(`/usuarios/${id}/toggle-activo`);
    return response.data;
  }
};
```

### reportesService.js
```javascript
import api from './api';

export const reportesService = {
  generar: async (data) => {
    const response = await api.post('/reportes/ocupacion', data);
    return response.data;
  },

  listar: async (params = {}) => {
    const response = await api.get('/reportes/ocupacion', { params });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/reportes/ocupacion/${id}`);
    return response.data;
  }
};
```

### plataformaService.js
```javascript
import api from './api';

export const plataformaService = {
  obtenerContenido: async (idioma = 'es') => {
    const response = await api.get('/plataforma/contenido', {
      params: { idioma }
    });
    return response.data;
  },

  obtenerExperiencias: async (params = {}) => {
    const response = await api.get('/plataforma/experiencias', { params });
    return response.data;
  },

  obtenerServicios: async () => {
    const response = await api.get('/plataforma/servicios');
    return response.data;
  },

  crearComentario: async (data) => {
    const response = await api.post('/plataforma/comentarios', data);
    return response.data;
  },

  listarComentarios: async (limit = 10) => {
    const response = await api.get('/plataforma/comentarios', {
      params: { limit }
    });
    return response.data;
  }
};
```

### galeriaService.js
```javascript
import api from './api';

export const galeriaService = {
  listar: async (params = {}) => {
    const response = await api.get('/galeria', { params });
    return response.data;
  },

  subir: async (formData) => {
    const response = await api.post('/galeria', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/galeria/${id}`, data);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/galeria/${id}`);
    return response.data;
  },

  toggleActivo: async (id) => {
    const response = await api.patch(`/galeria/${id}/toggle-activo`);
    return response.data;
  }
};
```

---

## CONTEXT PROVIDERS

### AuthContext.jsx
```javascript
import { createContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.me();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'administrador',
    isPersonal: ['administrador', 'recepcionista'].includes(user?.rol)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### WebSocketContext.jsx
```javascript
import { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const websocket = new WebSocket(import.meta.env.VITE_WS_URL);

    websocket.onopen = () => {
      console.log('WebSocket conectado');
      setConnected(true);

      // Autenticar
      websocket.send(JSON.stringify({
        type: 'auth',
        token
      }));

      // Ping cada 30 segundos
      const pingInterval = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      websocket.pingInterval = pingInterval;
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'nueva_notificacion') {
        setNotificaciones(prev => [data.data, ...prev]);

        // Mostrar toast
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {data.data.titulo}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data.data.mensaje}
                </p>
              </div>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right'
        });
      }

      if (data.type === 'notificaciones_pendientes') {
        setNotificaciones(data.data);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket desconectado');
      setConnected(false);
      if (websocket.pingInterval) {
        clearInterval(websocket.pingInterval);
      }

      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        if (localStorage.getItem('accessToken')) {
          connect();
        }
      }, 5000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      if (websocket.pingInterval) {
        clearInterval(websocket.pingInterval);
      }
      websocket.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const value = {
    ws,
    connected,
    notificaciones,
    setNotificaciones
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
```

---

## HOOKS PERSONALIZADOS

### useAuth.js
```javascript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### useWebSocket.js
```javascript
import { useContext } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe usarse dentro de WebSocketProvider');
  }
  return context;
};
```

---

## RUTAS DE LA APLICACIÓN

### App.jsx
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { Toaster } from 'react-hot-toast';

// Auth
import Login from '@/pages/auth/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Admin
import Dashboard from '@/pages/admin/Dashboard';
import Reservas from '@/pages/admin/Reservas';
import Habitaciones from '@/pages/admin/Habitaciones';
import CodigosQR from '@/pages/admin/CodigosQR';
import Solicitudes from '@/pages/admin/Solicitudes';
import Usuarios from '@/pages/admin/Usuarios';
import Reportes from '@/pages/admin/Reportes';
import Galeria from '@/pages/admin/Galeria';

// Plataforma Pública
import PlataformaHome from '@/pages/plataforma/Home';
import PlataformaHabitacion from '@/pages/plataforma/Habitacion';
import PlataformaExperiencias from '@/pages/plataforma/Experiencias';
import PlataformaServicios from '@/pages/plataforma/Servicios';
import PlataformaComentarios from '@/pages/plataforma/Comentarios';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Toaster position="top-right" />

          <Routes>
            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin - Rutas protegidas */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reservas" element={<Reservas />} />
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="codigos-qr" element={<CodigosQR />} />
              <Route path="solicitudes" element={<Solicitudes />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="galeria" element={<Galeria />} />
            </Route>

            {/* Plataforma Pública */}
            <Route path="/" element={<PlataformaHome />} />
            <Route path="/habitacion/:codigo" element={<PlataformaHabitacion />} />
            <Route path="/experiencias" element={<PlataformaExperiencias />} />
            <Route path="/servicios" element={<PlataformaServicios />} />
            <Route path="/comentarios" element={<PlataformaComentarios />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## COMPONENTES COMUNES

### Button.jsx
Componente reutilizable para botones con variantes (primary, secondary, danger).

### Input.jsx
Componente de input con validación y manejo de errores.

### Modal.jsx
Modal usando Headless UI para diálogos y formularios.

### Table.jsx
Tabla reutilizable con sorting, paginación y acciones.

### Badge.jsx
Badges para estados (pendiente, confirmada, completada, cancelada).

### Card.jsx
Card container para dashboard y listas.

### Loading.jsx
Spinner de carga.

### ErrorMessage.jsx
Mensaje de error estandarizado.

---

## PÁGINAS PRINCIPALES

### 1. Login.jsx
- Form con email + password
- Validación con React Hook Form + Yup
- Llamada a `authService.login()`
- Redirección a `/admin/dashboard` si exitoso

### 2. Dashboard.jsx
- Métricas principales:
  - Total reservas activas
  - Habitaciones ocupadas vs disponibles
  - Solicitudes pendientes
  - Notificaciones no leídas
- Gráficos de ocupación (últimos 7 días)
- Lista de check-ins/check-outs del día

### 3. Reservas.jsx
- Listado con filtros (estado, canal, fechas, habitación)
- Tabla con paginación
- Botón "Nueva Reserva" (abre modal)
- Acciones: Ver detalles, Check-in, Check-out, Cancelar

### 4. Habitaciones.jsx
- Grid de cards de habitaciones
- Filtros por tipo y estado
- Botón "Nueva Habitación" (solo admin)
- Editar precio (solo admin)
- Cambiar estado (limpieza, mantenimiento, disponible)

### 5. CodigosQR.jsx
- Botón "Generar QR" (cantidad)
- Lista de QR con estado (sin_asignar, asignado, inactivo)
- Acción "Asignar a habitación" (dropdown)
- Acción "Desasignar"
- Mostrar QR code visual (usar library qrcode.react)

### 6. Solicitudes.jsx
- Lista de solicitudes con filtros (estado, habitación)
- Botón "Completar" para marcar como atendida
- Badge de prioridad (alta para servicios de pago)

### 7. Usuarios.jsx (SOLO admin)
- Listado de usuarios
- Crear/editar usuarios
- Toggle activo/inactivo
- No permitir desactivar al usuario actual

### 8. Reportes.jsx
- Form para generar reporte (fechas, tipo_periodo)
- Historial de reportes generados
- Visualización de métricas

### 9. Galeria.jsx
- Grid de imágenes
- Upload de nuevas imágenes (drag & drop)
- Editar título/categoría/orden
- Eliminar imagen
- Toggle activo/inactivo

### 10. PlataformaHome.jsx (Público)
- Header con logo
- Contenido CMS (bienvenida, normas, horarios, wifi, contacto)
- Selector de idioma (ES/EN)
- Links a experiencias, servicios, comentarios

### 11. PlataformaHabitacion.jsx (Público)
- Detectar código QR desde URL param
- Llamar a `qrService.escanear(codigo)`
- Mostrar info de habitación
- Links rápidos a solicitar servicios

### 12. PlataformaServicios.jsx (Público)
- Lista de servicios disponibles
- Botón "Solicitar" (abre modal con form)
- Form: seleccionar habitación, notas
- Llamar a `solicitudesService.crear()`

### 13. PlataformaComentarios.jsx (Público)
- Lista de comentarios aprobados
- Promedio de calificaciones
- Form para dejar comentario (nombre, comentario, calificación 1-5 estrellas)

---

## UTILIDADES

### constants.js
```javascript
export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
};

export const ESTADOS_HABITACION = {
  DISPONIBLE: 'disponible',
  OCUPADA: 'ocupada',
  LIMPIEZA: 'limpieza',
  MANTENIMIENTO: 'mantenimiento'
};

export const CANALES_RESERVA = [
  { value: 'booking', label: 'Booking.com' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'presencial', label: 'Presencial' }
];

export const CATEGORIAS_GALERIA = [
  { value: 'hotel_exterior', label: 'Hotel Exterior' },
  { value: 'habitaciones', label: 'Habitaciones' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'vistas', label: 'Vistas' }
];
```

### formatters.js
```javascript
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date) => {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: es });
};

export const formatDateTime = (date) => {
  return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: es });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(amount);
};
```

---

## LIBRERÍAS ADICIONALES RECOMENDADAS

```bash
npm install qrcode.react          # Para mostrar QR codes
npm install recharts              # Para gráficos en dashboard
npm install react-dropzone        # Para upload de imágenes
```

---

## TESTING

### Flujo de Pruebas Recomendado

1. **Login:**
   - Login con admin@casajosefa.com
   - Verificar redirección a dashboard
   - Verificar que WebSocket conecta

2. **Dashboard:**
   - Verificar métricas
   - Verificar que notificaciones aparecen en tiempo real

3. **Reservas:**
   - Crear reserva con huésped nuevo
   - Validar que no permita solapamiento de fechas
   - Hacer check-in (cambiar estado a confirmada)
   - Verificar que habitación cambia a "ocupada"

4. **Códigos QR:**
   - Generar 5 QR
   - Asignar QR a habitación
   - Abrir URL pública `/habitacion/{codigo}` en incognito
   - Verificar que muestra info correcta

5. **Solicitudes:**
   - Desde plataforma pública, solicitar servicio
   - Verificar que notificación aparece en tiempo real en panel admin
   - Completar solicitud

6. **Galería:**
   - Subir imagen
   - Verificar que se guarda en Supabase Storage
   - Verificar que aparece en plataforma pública

---

## ENTREGABLES

1. ✅ Proyecto Vite + React configurado
2. ✅ Tailwind CSS instalado y configurado
3. ✅ Todos los servicios API implementados (10 archivos)
4. ✅ Context API (Auth + WebSocket)
5. ✅ Hooks personalizados
6. ✅ Componentes comunes reutilizables
7. ✅ Layout (Navbar + Sidebar para admin)
8. ✅ Todas las páginas del panel admin (8 páginas)
9. ✅ Todas las páginas de plataforma pública (5 páginas)
10. ✅ Integración completa con backend
11. ✅ WebSocket funcionando en tiempo real
12. ✅ Upload de imágenes a Supabase Storage
13. ✅ README con instrucciones de instalación

---

## PRIORIDADES DE IMPLEMENTACIÓN

### Fase 3A (Crítico - Implementar primero)
1. Configuración inicial (Vite, Tailwind, dependencias)
2. Servicios API (api.js + todos los services)
3. Context Providers (Auth + WebSocket)
4. Layout básico (Navbar + Sidebar)
5. Login + ProtectedRoute

### Fase 3B (Importante)
6. Dashboard con métricas
7. Reservas (CRUD completo)
8. Habitaciones (CRUD)
9. Notificaciones en tiempo real

### Fase 3C (Complementario)
10. Códigos QR
11. Solicitudes
12. Usuarios
13. Reportes
14. Galería

### Fase 3D (Plataforma Pública)
15. Home público
16. Escaneo QR
17. Experiencias
18. Servicios
19. Comentarios

---

**¿Listo para empezar la implementación?**

Este documento servirá como guía completa para implementar el frontend paso a paso, asegurando que todos los endpoints del backend se usen correctamente.
