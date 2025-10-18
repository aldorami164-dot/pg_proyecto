# GUÍA DE PRUEBA: SOLICITUD DE SERVICIOS VÍA QR

## 🎯 OBJETIVO
Probar el flujo completo de un huésped solicitando un servicio desde su habitación.

---

## 📋 PREPARACIÓN (HACER UNA SOLA VEZ)

### 1. Crear datos de prueba en Gestión

**A. Iniciar sesión en el dashboard:**
```
http://localhost:5173/gestion/login
```

**B. Ir a "Códigos QR" y generar uno:**
- Clic en "Generar QR"
- Se creará un código (ejemplo: `ABC123`)
- **Copiar el código generado**

**C. Asignar el QR a una habitación:**
- En el mismo dashboard de QR
- Buscar el QR recién creado
- Clic en "Asignar"
- Seleccionar habitación (ejemplo: Habitación 101)
- Guardar

**D. Verificar que la habitación tiene una reserva activa (opcional):**
- Ir a "Reservas"
- Crear una reserva para Habitación 101
- Estado: "Confirmada" (check-in realizado)

---

## 🧪 OPCIÓN 1: PRUEBA RÁPIDA EN EL NAVEGADOR

### Paso 1: Acceder a la página de habitación
```
http://localhost:5173/plataforma/habitacion/ABC123
```
*(Reemplaza ABC123 con tu código QR real)*

### Paso 2: Verificar la información
✅ Debes ver:
- Número de habitación (101)
- Tipo de habitación (Doble, Triple, etc.)
- Lista de servicios disponibles

### Paso 3: Solicitar un servicio

**Servicio de PAGO (Lavandería):**
1. Seleccionar "Lavandería"
2. Llenar descripción (opcional)
3. Clic "Solicitar"
4. ✅ Debe mostrar confirmación

**Servicio GRATIS con horario (Cocina):**
1. Seleccionar "Uso de Cocina"
2. **Indicar horario** (ejemplo: "De 6:00 PM a 8:00 PM")
3. Clic "Solicitar"
4. ✅ Debe mostrar confirmación

**Servicio GRATIS con mensaje (Limpieza Extra):**
1. Seleccionar "Limpieza Extra"
2. **Escribir mensaje** (ejemplo: "Limpieza a las 2:00 PM por favor")
3. Clic "Solicitar"
4. ✅ Debe mostrar confirmación

### Paso 4: Verificar en dashboard de Gestión
```
http://localhost:5173/gestion/solicitudes
```
✅ Debes ver las solicitudes que acabas de hacer

---

## 📱 OPCIÓN 2: PRUEBA DESDE CELULAR (MISMA RED)

### Paso 1: Configurar Vite para acceso externo

**Editar `frontend/vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ← AGREGAR ESTO
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@gestion': path.resolve(__dirname, './src/modules/gestion'),
      '@plataforma': path.resolve(__dirname, './src/modules/plataforma')
    }
  }
})
```

### Paso 2: Reiniciar el frontend
```bash
cd frontend
npm run dev
```

### Paso 3: Obtener IP de tu PC

**Windows:**
```bash
ipconfig
```
Busca: `IPv4 Address` → Ejemplo: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
```
Busca: `inet` → Ejemplo: `192.168.1.100`

### Paso 4: Acceder desde el celular

**Conecta tu celular a la MISMA red WiFi que tu PC**

**Abre el navegador del celular y ve a:**
```
http://192.168.1.100:5173/plataforma/habitacion/ABC123
```
*(Reemplaza con tu IP y código QR)*

### Paso 5: Solicitar servicio desde el celular

Sigue los mismos pasos de la Opción 1.

---

## 🌐 OPCIÓN 3: GENERAR QR REAL PARA ESCANEAR

### Paso 1: Usar generador de QR online

**Ve a:** https://www.qr-code-generator.com/

**Genera QR con esta URL:**
```
http://192.168.1.100:5173/plataforma/habitacion/ABC123
```
*(Reemplaza con tu IP y código QR)*

### Paso 2: Descargar imagen del QR

Guarda la imagen generada.

### Paso 3: Escanear desde el celular

Usa la cámara o app de QR para escanear.

Debes abrir automáticamente la página de habitación.

---

## ✅ CHECKLIST DE PRUEBA COMPLETA

### Backend
- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Base de datos Supabase conectada
- [ ] Servicio Piscina agregado (5 servicios en total)

### Frontend
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Si pruebas desde celular: `host: '0.0.0.0'` configurado

### Dashboard de Gestión
- [ ] Login funcional
- [ ] QR generado y asignado a habitación
- [ ] Habitación tiene reserva confirmada (opcional)

### Plataforma Pública
- [ ] Página de habitación carga correctamente
- [ ] Se muestran los 5 servicios
- [ ] Servicios de pago muestran precio
- [ ] Servicios con horario/mensaje permiten ingresarlo
- [ ] Botón "Solicitar" funciona
- [ ] Confirmación se muestra después de solicitar

### Dashboard de Gestión (Verificación)
- [ ] Las solicitudes aparecen en `/gestion/solicitudes`
- [ ] Se muestra el número de habitación correcto
- [ ] Se muestra el servicio solicitado
- [ ] Se muestra la descripción/horario/mensaje
- [ ] Recepción puede marcar como "Completada"

---

## 🐛 TROUBLESHOOTING

### Error: "Código QR no encontrado"
**Solución:** Verifica que el código QR existe en la BD y está asignado a una habitación.

### Error: "No se pueden cargar los servicios"
**Solución:** Verifica que el backend esté corriendo y que hay servicios en la BD.

### No puedo acceder desde el celular
**Solución:**
1. Verifica que celular y PC están en la MISMA red WiFi
2. Verifica que `host: '0.0.0.0'` está en vite.config.js
3. Verifica que la IP es correcta
4. Desactiva el firewall temporalmente

### Las solicitudes no aparecen en Gestión
**Solución:**
1. Verifica que el backend está corriendo
2. Abre consola del navegador (F12) y busca errores
3. Verifica logs del backend

---

## 📝 NOTAS IMPORTANTES

1. **Piscina NO es solicitable:** Es solo informativo, no debe tener botón "Solicitar"
2. **4 servicios SON solicitables:** Lavandería, Sauna, Cocina, Limpieza
3. **Servicios de pago:** Lavandería (Q50), Sauna (Q100)
4. **Servicios gratis:** Cocina, Limpieza, Piscina
5. **Notificaciones:** Las solicitudes deben crear notificaciones en tiempo real para recepción

---

## 🎯 RESULTADO ESPERADO

Al finalizar las pruebas:

✅ Huésped puede escanear QR (o acceder a URL)
✅ Huésped ve su habitación y servicios disponibles
✅ Huésped puede solicitar servicios
✅ Recepción recibe las solicitudes en dashboard
✅ Recepción puede marcar como completadas
✅ Sistema envía notificaciones (si WebSocket está activo)

---

**Guía creada por:** Full Stack Developer con 30 años de experiencia
**Proyecto:** Hotel Casa Josefa - Sistema de Gestión Hotelera
**Fecha:** 2025-10-08
