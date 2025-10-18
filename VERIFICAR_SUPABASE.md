# ⚠️ ERROR: Proyecto de Supabase No Encontrado

## 🔴 Problema Detectado

El dominio **`mxdepkjatymnjwumagsv.supabase.co`** no existe en DNS.

```
Error: getaddrinfo ENOTFOUND mxdepkjatymnjwumagsv.supabase.co
```

Esto significa que:
- ❌ El proyecto fue **eliminado** de Supabase
- ❌ El proyecto fue **pausado** por inactividad
- ❌ La URL en `.env` es **incorrecta**

---

## ✅ Solución: Verificar y Actualizar Proyecto

### **Opción 1: Verificar si el Proyecto Existe**

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión
3. **Busca tu proyecto** en la lista
4. Si aparece como "Paused" o "Inactive":
   - Haz clic en el proyecto
   - Clic en **"Restore"** o **"Resume"**

### **Opción 2: Obtener la URL Correcta**

Si el proyecto existe pero la URL es diferente:

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia la **URL** que aparece en "Project URL"
5. Actualiza tu archivo `.env`:

```bash
# En: backend/.env
SUPABASE_URL=https://TU-PROYECTO-REAL.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Opción 3: Crear un Nuevo Proyecto**

Si el proyecto fue eliminado, necesitas crear uno nuevo:

1. Ve a: https://supabase.com/dashboard
2. Clic en **"New Project"**
3. Configura:
   - **Name**: Hotel Casa Josefa
   - **Database Password**: (elige una segura)
   - **Region**: Closest to you (ej: South America - Sao Paulo)
4. Espera ~2 minutos a que se cree
5. Ve a **Settings** → **API**
6. Copia:
   - **Project URL**
   - **service_role key** (secret)
7. Actualiza tu `.env`:

```bash
SUPABASE_URL=https://tu-nuevo-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

8. **Ejecuta el script de base de datos** en el SQL Editor de Supabase:
   - Ve a **SQL Editor**
   - Copia y pega todo el contenido de `EJECUTAR_COMPLETO.sql`
   - Ejecuta

9. **Crea el bucket 'galeria'** siguiendo `INSTRUCCIONES_SUPABASE_STORAGE.md`

---

## 🧪 Verificar Conexión

Una vez actualizado el `.env`:

### **Prueba rápida con CURL:**

```bash
curl https://TU-PROYECTO.supabase.co/rest/v1/
```

Si devuelve un JSON con rutas, la conexión funciona ✅

### **Reinicia el servidor backend:**

```bash
cd backend
npm run dev
```

Deberías ver en los logs:
```
✅ Conectado a PostgreSQL (Supabase)
```

---

## 📋 Checklist

- [ ] Verificar que el proyecto existe en Supabase Dashboard
- [ ] Copiar la URL correcta del proyecto
- [ ] Copiar la `service_role` key
- [ ] Actualizar `backend/.env` con los valores correctos
- [ ] Reiniciar el servidor backend
- [ ] Ejecutar `EJECUTAR_COMPLETO.sql` en Supabase SQL Editor (si es proyecto nuevo)
- [ ] Crear el bucket 'galeria' en Supabase Storage
- [ ] Probar subir una imagen desde el frontend

---

## 🔍 Logs del Backend para Verificar

Después de reiniciar el backend, busca en los logs:

### ✅ **Conexión Exitosa:**
```
[INFO] ✅ Conectado a PostgreSQL (Supabase)
[INFO] 🚀 Servidor corriendo en http://localhost:3001
```

### ❌ **Aún con Error:**
```
[ERROR] Error al conectar a PostgreSQL
```

Si ves el error, revisa:
- `DATABASE_URL` en `.env`
- Credenciales de conexión a PostgreSQL

---

## 📞 Información del Proyecto Actual (en .env)

```
SUPABASE_URL=https://mxdepkjatymnjwumagsv.supabase.co
```

**Este dominio NO existe** - necesitas actualizarlo.

---

## 💡 Nota Importante sobre la Base de Datos

Tu aplicación usa **Supabase solo para Storage (imágenes)**.

La base de datos PostgreSQL está configurada con `DATABASE_URL` que es diferente.

Si `DATABASE_URL` funciona pero `SUPABASE_URL` no, significa:
- ✅ Base de datos funcionando correctamente
- ❌ Storage de imágenes no funcionando

**Solución**: Actualizar solo `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` para el Storage.

---

## 🎯 Próximos Pasos

1. **Ahora mismo**: Ve a Supabase Dashboard y verifica si el proyecto existe
2. **Copia la URL correcta** de Settings → API
3. **Actualiza el `.env`** con la URL real
4. **Reinicia el backend**: `npm run dev`
5. **Prueba subir una imagen** nuevamente

**Avísame qué encuentras en el dashboard de Supabase.** 🚀
