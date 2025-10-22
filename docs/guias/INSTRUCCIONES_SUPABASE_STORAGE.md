# Configuración de Supabase Storage para Galería de Imágenes

## ❗ Error 500 al Subir Imágenes - Solución

Si recibes un error 500 al intentar subir imágenes, es porque el **bucket 'galeria' no existe en Supabase Storage**.

---

## 📝 Pasos para Crear el Bucket

### 1. Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **mxdepkjatymnjwumagsv**

### 2. Crear el Bucket 'galeria'

1. En el menú lateral, haz clic en **"Storage"**
2. Haz clic en **"Create a new bucket"** (botón verde)
3. Configura el bucket con los siguientes valores:

```
Name: galeria
Public bucket: ✅ Activado (IMPORTANTE)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
```

4. Haz clic en **"Create bucket"**

### 3. Verificar Políticas de Acceso (RLS)

Para que las imágenes sean accesibles públicamente, necesitas configurar las políticas:

1. Haz clic en el bucket **"galeria"** que acabas de crear
2. Ve a la pestaña **"Policies"**
3. Agrega las siguientes políticas:

#### Política 1: Lectura Pública (SELECT)
```
Policy name: Public Read Access
Allowed operation: SELECT
Policy definition: true (sin restricciones)
```

#### Política 2: Upload para Usuarios Autenticados (INSERT)
```
Policy name: Authenticated Users Can Upload
Allowed operation: INSERT
Policy definition: auth.role() = 'authenticated'
```

#### Política 3: Eliminación para Usuarios Autenticados (DELETE)
```
Policy name: Authenticated Users Can Delete
Allowed operation: DELETE
Policy definition: auth.role() = 'authenticated'
```

### 4. Verificar la Estructura de Carpetas

El backend guarda las imágenes en la ruta: `galeria/{timestamp}-{random}.{ext}`

Ejemplo: `galeria/1729012345678-abc123.jpg`

---

## ✅ Verificación

Una vez creado el bucket, intenta subir una imagen desde el dashboard de gestión:

1. Ve a: http://localhost:5173/gestion/galeria
2. Haz clic en **"Subir Imagen"**
3. Selecciona una imagen (máx 5MB)
4. Completa título y descripción
5. Haz clic en **"Subir Imagen"**

Si todo está bien configurado, deberías ver:
- ✅ Mensaje de éxito: "Imagen subida exitosamente"
- ✅ La imagen aparece en la galería
- ✅ URL pública funcional

---

## 🔧 Configuración Alternativa (Si usas SQL)

Si prefieres crear el bucket mediante SQL:

```sql
-- Crear el bucket (ejecutar desde Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('galeria', 'galeria', true);

-- Política de lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'galeria');

-- Política de upload autenticado
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'galeria'
  AND auth.role() = 'authenticated'
);

-- Política de eliminación autenticada
CREATE POLICY "Authenticated can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'galeria'
  AND auth.role() = 'authenticated'
);
```

---

## 📊 Estructura de la Tabla `imagenes_galeria`

La tabla ya existe en tu base de datos con esta estructura:

```sql
CREATE TABLE imagenes_galeria (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_imagen TEXT NOT NULL,           -- URL pública de Supabase Storage
  categoria VARCHAR(100) DEFAULT 'hotel_exterior',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  subido_por INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚨 Errores Comunes

### Error: "Bucket not found"
- **Causa**: El bucket 'galeria' no existe
- **Solución**: Crear el bucket siguiendo los pasos anteriores

### Error: "Policy violation"
- **Causa**: Faltan políticas de acceso
- **Solución**: Agregar las políticas de RLS

### Error: "File too large"
- **Causa**: Imagen mayor a 5MB
- **Solución**: Redimensionar la imagen antes de subirla

### Error: "Invalid file type"
- **Causa**: Formato no permitido
- **Solución**: Solo JPG, PNG, WEBP permitidos

---

## 📸 URLs Públicas

Las imágenes estarán disponibles en:

```
https://mxdepkjatymnjwumagsv.supabase.co/storage/v1/object/public/galeria/{filename}
```

Ejemplo:
```
https://mxdepkjatymnjwumagsv.supabase.co/storage/v1/object/public/galeria/1729012345678-abc123.jpg
```

---

## ✅ Una vez completado

Después de crear el bucket y configurar las políticas:

1. **Reinicia el servidor backend** (si estaba corriendo)
2. **Intenta subir una imagen** desde el dashboard
3. **Verifica que la URL pública funcione** haciendo clic en "Ver"

Si todo funciona, marca esta tarea como completada ✅
