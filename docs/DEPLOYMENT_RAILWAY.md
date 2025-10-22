# 🚀 Guía de Deployment en Railway (Plan Hobby $5/mes)

## 📋 Pre-requisitos

- ✅ Cuenta en Railway (https://railway.app)
- ✅ Cuenta en Supabase con base de datos configurada
- ✅ Cuenta en Vercel/Netlify para el frontend (opcional)
- ✅ Migraciones SQL ya ejecutadas en Supabase

## 🎯 PASO 1: Preparar el Proyecto

### 1.1 Verificar que NO hay credenciales hardcodeadas

```bash
# Buscar posibles credenciales en el código
grep -r "password" backend/src/
grep -r "PPDPdhNo5ourm1ta" backend/
```

✅ **VERIFICADO**: Las credenciales ahora se leen desde variables de entorno.

### 1.2 Verificar archivos de configuración

- ✅ `railway.json` - Configuración de Railway
- ✅ `nixpacks.toml` - Configuración de build
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `backend/.env.example` - Ejemplo de variables de entorno

## 🚂 PASO 2: Deployment en Railway

### 2.1 Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio "PG IMPLEMENTACION"

### 2.2 Configurar Variables de Entorno

En Railway Dashboard → Variables, agrega:

```env
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://tkapgaullvnpzjkssthb.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-desde-supabase
SUPABASE_SERVICE_KEY=tu-service-role-key-desde-supabase

# Database (Supabase Pooler - IMPORTANTE usar Pooler)
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.tkapgaullvnpzjkssthb
DB_PASSWORD=tu-password-aqui
DB_SSL=true

# JWT (Genera nuevos secretos para producción)
JWT_SECRET=genera-un-secret-seguro-aqui
JWT_REFRESH_SECRET=genera-otro-secret-seguro-aqui

# CORS (URL del frontend en Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# WebSocket
WS_PORT=3002
```

**🔐 IMPORTANTE - Generar JWT Secrets seguros:**

```bash
# En tu terminal, ejecuta:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copia el resultado para JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copia el resultado para JWT_REFRESH_SECRET
```

### 2.3 Configurar el Build

Railway debería detectar automáticamente la configuración de `railway.json`, pero verifica:

- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: `/`

### 2.4 Deploy

1. Railway automáticamente desplegará cuando hagas push a GitHub
2. O puedes hacer "Deploy Now" desde el dashboard
3. Espera a que termine el build (2-5 minutos)

### 2.5 Verificar Deployment

Una vez desplegado, Railway te dará una URL como:
```
https://tu-proyecto.up.railway.app
```

Verifica el health check:
```bash
curl https://tu-proyecto.up.railway.app/health
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-22T...",
  "environment": "production"
}
```

## 🌐 PASO 3: Deployment del Frontend en Vercel

### 3.1 Preparar Frontend

1. Actualiza `frontend/.env.production`:

```env
VITE_API_URL=https://tu-proyecto.up.railway.app
```

### 3.2 Deploy en Vercel

1. Ve a https://vercel.com
2. "Import Project" desde GitHub
3. Selecciona el repositorio
4. Configura:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Configurar Variables de Entorno en Vercel

```env
VITE_API_URL=https://tu-proyecto.up.railway.app
```

### 3.4 Actualizar CORS en Railway

Vuelve a Railway y actualiza la variable:

```env
FRONTEND_URL=https://tu-app.vercel.app
```

## ✅ PASO 4: Verificaciones Post-Deployment

### 4.1 Verificar Backend

```bash
# Health check
curl https://tu-proyecto.up.railway.app/health

# Login (prueba endpoint)
curl -X POST https://tu-proyecto.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@casajosefa.com","password":"tu-password"}'
```

### 4.2 Verificar Frontend

1. Abre tu app en el navegador
2. Prueba el login
3. Verifica que carguen las reservas
4. Prueba crear una solicitud desde el módulo público (QR)

### 4.3 Verificar Conexión a Base de Datos

Revisa los logs en Railway Dashboard:
- ✅ "Conectado a PostgreSQL"
- ✅ "Base de datos: postgres"
- ✅ No debe haber errores de conexión

## 🐛 Troubleshooting

### Error: "Connection timeout"
- Verifica que estés usando el **Pooler** de Supabase (puerto 6543)
- Verifica que `DB_HOST` sea el pooler: `aws-1-us-east-2.pooler.supabase.com`

### Error: "Not allowed by CORS"
- Verifica que `FRONTEND_URL` en Railway coincida con la URL de Vercel
- Agrega `.vercel.app` si usas preview deployments

### Error: "Invalid JWT"
- Asegúrate de haber generado nuevos JWT secrets para producción
- No uses los mismos secrets de desarrollo

### La app se desconecta frecuentemente
- Verifica que `max: 5` en el pool config (ya configurado)
- El plan Hobby de Railway tiene límites de conexiones

## 💰 Optimización para Plan Hobby ($5/mes)

El proyecto ya está optimizado:

✅ **Pool de conexiones limitado**: max: 5 conexiones
✅ **Cierre automático de idle**: 10 segundos
✅ **Sin WebSocket en producción**: Ahorra recursos
✅ **Uso de Supabase Pooler**: Maneja conexiones eficientemente

### Límites del Plan Hobby:
- ⚠️ 500 horas de ejecución/mes (~20 días)
- ⚠️ $5 de crédito/mes
- ⚠️ 1GB RAM
- ⚠️ 1GB Disco

**Recomendación**: Monitorea el uso en Railway Dashboard

## 🎉 ¡Listo para Producción!

Tu aplicación ahora está:
- ✅ Desplegada en Railway
- ✅ Frontend en Vercel
- ✅ Base de datos en Supabase
- ✅ Sin credenciales hardcodeadas
- ✅ Optimizada para plan Hobby
- ✅ CORS configurado
- ✅ SSL habilitado

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway Dashboard
2. Revisa los logs en Vercel Dashboard
3. Verifica las variables de entorno
4. Consulta la documentación en `/docs/guias/`
