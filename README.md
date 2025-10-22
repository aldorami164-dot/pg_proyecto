# 🏨 Hotel Casa Josefa - Sistema de Gestión Hotelera

Sistema integral de gestión hotelera para Hotel Casa Josefa, ubicado en el hermoso Lago Atitlán, Guatemala.

## 📋 Descripción

Plataforma web completa que incluye:
- **Módulo de Gestión**: Sistema administrativo para gestionar reservas, habitaciones, huéspedes, y operaciones del hotel
- **Plataforma Pública**: Sitio web informativo con códigos QR para huéspedes, tours guiados, lugares cercanos y servicios

## 🚀 Tecnologías

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- JWT Authentication
- WebSocket para notificaciones en tiempo real
- Supabase Storage para imágenes

### Frontend
- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Hook Form + Yup
- Recharts para gráficos
- Lucide React para iconos

## 📁 Estructura del Proyecto

```
📦 PG IMPLEMENTACION/
├── 📁 backend/           # API REST con Express
├── 📁 frontend/          # Aplicación React
└── 📁 docs/              # Documentación
    ├── database/         # Schemas y migraciones SQL
    └── guias/           # Guías de instalación y uso
```

## 🔧 Instalación

### Requisitos Previos
- Node.js >= 18.0.0
- PostgreSQL (o cuenta en Supabase)
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌍 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
WS_PORT=3001

# Database
DB_HOST=tu-host
DB_PORT=5432
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=tu-database
DB_SSL=true

# JWT
JWT_SECRET=tu-secret-key
JWT_REFRESH_SECRET=tu-refresh-secret

# Supabase Storage
SUPABASE_URL=tu-supabase-url
SUPABASE_ANON_KEY=tu-anon-key

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```

## 📚 Documentación Adicional

- [Instalación y Configuración](./docs/guias/README_INSTALACION.md)
- [Configuración de Supabase Storage](./docs/guias/INSTRUCCIONES_SUPABASE_STORAGE.md)
- [Documentación de Fechas](./docs/guias/DOCUMENTACION_FECHAS.md)
- [Endpoints Backend](./docs/endpoints_backend.md)
- [Endpoints Frontend](./docs/endpoints_frontend.md)
- [Diseño del Sistema](./docs/diseño.md)

## 🎯 Funcionalidades Principales

### Módulo de Gestión (Administrativo)
- Dashboard con métricas en tiempo real
- Gestión de reservas y disponibilidad
- Control de habitaciones y estados
- Registro de huéspedes
- Generación de códigos QR por habitación
- Gestión de solicitudes de servicio
- Sistema de notificaciones en tiempo real
- Reportes y estadísticas
- Gestión de galería de imágenes
- Administración de experiencias turísticas
- Gestión de lugares cercanos
- Control de servicios del hotel

### Plataforma Pública
- Home page informativa
- Acceso mediante código QR por habitación
- Tours guiados disponibles
- Lugares cercanos de interés
- Servicios del hotel
- Normas y reglamentos
- Formulario de contacto
- Solicitudes de servicio para huéspedes

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting para prevenir abuso
- Helmet para headers de seguridad HTTP
- CORS configurado correctamente
- Validación de entrada con Joi/Yup
- Sanitización de datos
- Encriptación de contraseñas con bcrypt

## 🚢 Deployment

Este proyecto está configurado para desplegarse en:
- **Backend**: Railway / Render
- **Frontend**: Vercel / Netlify
- **Base de datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

Ver instrucciones detalladas de deployment en `docs/guias/`

## 👥 Autor Antonio Ramirez Ajtzip

Desarrollado para Hotel Casa Josefa
Lago Atitlán, Guatemala

## 📄 Licencia

ISC
