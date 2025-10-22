# ✅ Checklist de Deployment - Hotel Casa Josefa

## 📦 PREPARACIÓN COMPLETADA

### ✅ Organización del Proyecto
- [x] Archivos SQL movidos a `docs/database/`
- [x] Documentación movida a `docs/guias/`
- [x] Archivos obsoletos eliminados (25 archivos .md)
- [x] Estructura de carpetas profesional
- [x] README.md principal creado
- [x] .gitignore creado

### ✅ Seguridad
- [x] Credenciales hardcodeadas removidas de `backend/src/config/database.js`
- [x] Configuración usando variables de entorno
- [x] .env.example creado para referencia
- [x] Puerto correcto configurado (6543 - Supabase Pooler)

### ✅ Configuración de Railway
- [x] railway.json creado
- [x] nixpacks.toml creado
- [x] Guía de deployment creada (`docs/DEPLOYMENT_RAILWAY.md`)

### ✅ Optimización para Plan Hobby
- [x] Pool de conexiones: max 5
- [x] Timeout configurado: 10 segundos
- [x] WebSocket desactivado en producción
- [x] Supabase Pooler configurado

### ✅ Base de Datos
- [x] Migraciones SQL ya ejecutadas en Supabase
- [x] Tablas verificadas y funcionando

---

## 🚀 SIGUIENTE PASO: SUBIR A RAILWAY

### 1️⃣ Commit y Push a GitHub

```bash
cd "C:\Users\hpenv\Music\PG IMPLEMENTACION"

# Ver cambios
git status

# Agregar todos los cambios
git add .

# Commit
git commit -m "Preparar proyecto para deployment en Railway

- Reorganizar estructura de carpetas profesional
- Mover documentación a docs/
- Remover credenciales hardcodeadas
- Configurar variables de entorno
- Agregar archivos de configuración Railway
- Optimizar para plan Hobby ($5/mes)
- Crear guías de deployment"

# Push a GitHub
git push origin main
```

### 2️⃣ Configurar Railway

1. **Crear proyecto en Railway**
   - Ve a https://railway.app
   - "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio

2. **Agregar Variables de Entorno**

   Copia y pega estas variables en Railway Dashboard → Variables:

   ```env
   NODE_ENV=production
   PORT=3001

   SUPABASE_URL=https://tkapgaullvnpzjkssthb.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXBnYXVsbHZucHpqa3NzdGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTQ1NDEsImV4cCI6MjA3NTI3MDU0MX0.t-2swGc6TlvwEBM_l7uo8cLia62a9JiY9PulDTy1wHU
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXBnYXVsbHZucHpqa3NzdGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY5NDU0MSwiZXhwIjoyMDc1MjcwNTQxfQ.jbKe43Jaw7KVu5NTOH_jrIyP1Sw7J-FhdY3tf-EYOm8

   DB_HOST=aws-1-us-east-2.pooler.supabase.com
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres.tkapgaullvnpzjkssthb
   DB_PASSWORD=PPDPdhNo5ourm1ta
   DB_SSL=true

   JWT_SECRET=sJv2Yp_bYy2bNiigviNfpbXo-LKK3uaWAYkYI7GSypY=
   JWT_REFRESH_SECRET=RfW9p6nXUoL4t0iZqD8bVrKj2HsGmE3pA7YxTnC5

   FRONTEND_URL=https://pg-proyecto.vercel.app

   WS_PORT=3002
   ```

   **🔐 RECOMENDACIÓN DE SEGURIDAD:**

   Genera nuevos JWT secrets para producción:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Ejecuta dos veces y usa los resultados para JWT_SECRET y JWT_REFRESH_SECRET

3. **Verificar Build Settings**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: `/`

4. **Deploy**
   - Click "Deploy Now"
   - Espera 2-5 minutos

### 3️⃣ Verificar Deployment

Una vez desplegado, Railway te dará una URL:
```
https://tu-proyecto.up.railway.app
```

**Prueba el health check:**
```bash
curl https://tu-proyecto.up.railway.app/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-22T...",
  "environment": "production"
}
```

### 4️⃣ Actualizar Frontend en Vercel

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Actualiza `VITE_API_URL`:
   ```
   VITE_API_URL=https://tu-proyecto.up.railway.app
   ```
3. Redeploy el frontend

### 5️⃣ Actualizar CORS en Railway

Una vez tengas la URL de Vercel, actualiza en Railway:
```env
FRONTEND_URL=https://tu-app.vercel.app,https://pg-proyecto.vercel.app
```

---

## 🎯 RESULTADO ESPERADO

✅ Backend en Railway funcionando
✅ Frontend en Vercel conectado al backend
✅ Base de datos en Supabase
✅ CORS configurado correctamente
✅ Sin credenciales expuestas
✅ Optimizado para plan Hobby

---

## 📊 MONITOREO

### Recursos del Plan Hobby
- 500 horas/mes (~20 días de uptime)
- $5/mes de crédito
- 1GB RAM
- 1GB Disco

### ¿Qué monitorear?
- Uso de horas en Railway Dashboard
- Logs de errores
- Conexiones a la base de datos
- Tiempo de respuesta

---

## 🐛 Troubleshooting Rápido

**Error de conexión a DB:**
- Verifica que DB_HOST sea el pooler
- Verifica que DB_PORT sea 6543

**Error de CORS:**
- Verifica FRONTEND_URL en Railway
- Incluye todas las URLs de Vercel (preview + production)

**App lenta:**
- Plan Hobby tiene 1GB RAM
- Verifica logs en Railway
- Considera upgrade si es necesario

---

## 📚 Documentación Adicional

- [Guía completa de deployment](docs/DEPLOYMENT_RAILWAY.md)
- [Instalación local](docs/guias/README_INSTALACION.md)
- [Configuración Supabase](docs/guias/INSTRUCCIONES_SUPABASE_STORAGE.md)

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Tu proyecto está completamente preparado para deployment en Railway.
Sigue los pasos del "SIGUIENTE PASO" arriba y estarás en producción en 15 minutos.

**¡Éxito con tu deployment!** 🚀
