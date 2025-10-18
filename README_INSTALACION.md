# 🏨 INSTALACIÓN BASE DE DATOS - HOTEL CASA JOSEFA

## ✅ VERSIÓN 1.1 - LISTA PARA SUPABASE

---

## 🚀 INSTALACIÓN RÁPIDA

### Opción 1: Script Completo (RECOMENDADO)

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega TODO el contenido de `EJECUTAR_COMPLETO.sql`
3. Ejecuta (Run)
4. Verifica que veas el mensaje: `INSTALACIÓN COMPLETADA EXITOSAMENTE`

**Tiempo estimado:** 2-3 minutos

---

### Opción 2: Scripts Modulares

Si prefieres ejecutar por partes:

```bash
# Orden de ejecución en Supabase SQL Editor:
1. fase1_schema.sql       # Crea 16 tablas
2. fase1_funciones.sql    # Crea 2 funciones de negocio
3. fase1_triggers.sql     # Crea 4 triggers automáticos
4. fase1_indices.sql      # Crea 40+ índices
5. fase1_datos_iniciales.sql  # Inserta datos predefinidos
```

---

## 📊 ¿QUÉ SE INSTALA?

### 16 Tablas
```
✅ roles                    - Control de acceso (admin/recepcionista)
✅ usuarios                 - Personal del hotel
✅ tipos_habitacion         - Individual, Doble, Triple, Familiar
✅ habitaciones             - Habitaciones físicas del hotel
✅ codigos_qr              - Gestión de QR (INDEPENDIENTE de habitaciones)
✅ huespedes               - Clientes (con DPI/pasaporte)
✅ estados_reserva         - Ciclo de vida de reservas
✅ reservas                - Centralización manual de reservas
✅ servicios               - Catálogo de servicios (pago/gratuitos)
✅ solicitudes_servicios   - Pedidos desde plataforma QR
✅ notificaciones          - Sistema de alertas en tiempo real
✅ reportes_ocupacion      - Métricas históricas
✅ contenido_plataforma    - CMS bilingüe (ES/EN)
✅ experiencias_turisticas - Info turística de Santiago Atitlán
✅ imagenes_galeria        - Galería de fotos
✅ comentarios_huespedes   - Feedback público
```

### 2 Funciones de Negocio
```
✅ validar_solapamiento_reservas()  - Evita conflictos de fechas (CRÍTICA)
✅ generar_reporte_ocupacion()      - Calcula métricas de ocupación
```

### 4 Triggers Automáticos
```
✅ actualizar_estado_habitacion    - Cambia estado según check-in/out
✅ notificar_solicitud_servicio    - Crea notificación al solicitar servicio
✅ actualizar_timestamp            - Actualiza fecha de modificación
✅ generar_codigo_reserva          - Genera código único RES-YYYYMMDD-NNNNNN
```

### 40+ Índices
```
✅ Índices en FK (joins rápidos)
✅ Índice compuesto CRÍTICO en reservas (validación solapamiento)
✅ Índices de texto completo (búsqueda de huéspedes/experiencias)
✅ Índices parciales (filtros optimizados)
```

### Datos Iniciales
```
✅ 2 roles (administrador, recepcionista)
✅ 4 estados de reserva (pendiente, confirmada, completada, cancelada)
✅ 4 tipos de habitación (Individual, Doble, Triple, Familiar)
✅ 4 servicios (Lavandería Q50, Sauna Q100, Limpieza Q0, Cocina Q0)
✅ 5 secciones CMS bilingüe (bienvenida, normas, horarios, wifi, contacto)
✅ 6 experiencias turísticas de Santiago Atitlán
✅ 1 usuario admin (email: admin@casajosefa.com, password: Admin123!)
```

---

## ⚠️ ERRORES CORREGIDOS (v1.1)

### Error 1: Subquery en índice parcial ✅ CORREGIDO
PostgreSQL no permite subqueries en predicados WHERE de índices.

### Error 2: nextval() en DEFAULT ✅ CORREGIDO
Reemplazado por trigger con secuencia dedicada.

### Error 3: Campo 'orden' faltante ✅ CORREGIDO
Agregado campo `orden` en tabla `experiencias_turisticas`.

### Error 4: NEW.id en BEFORE INSERT ✅ CORREGIDO
Creada secuencia `seq_codigo_reserva` para generar códigos únicos.

**Ver detalles en:** `CORRECCIONES_SUPABASE.md`

---

## 🧪 VERIFICACIÓN POST-INSTALACIÓN

### 1. Verificar tablas creadas
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
**Debe retornar:** 16 tablas

### 2. Verificar triggers
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```
**Debe mostrar:** ~14 triggers (10 de timestamp + 4 de negocio)

### 3. Verificar datos iniciales
```sql
SELECT
    (SELECT COUNT(*) FROM roles) as roles,
    (SELECT COUNT(*) FROM estados_reserva) as estados,
    (SELECT COUNT(*) FROM tipos_habitacion) as tipos,
    (SELECT COUNT(*) FROM servicios) as servicios,
    (SELECT COUNT(*) FROM contenido_plataforma) as contenido,
    (SELECT COUNT(*) FROM experiencias_turisticas) as experiencias,
    (SELECT COUNT(*) FROM usuarios) as usuarios;
```
**Debe retornar:** 2, 4, 4, 4, 5, 6, 1

### 4. Probar código de reserva autogenerado
```sql
-- Insertar huésped de prueba
INSERT INTO huespedes (nombre, apellido) VALUES ('Juan', 'Pérez');

-- Necesitas primero crear una habitación
INSERT INTO habitaciones (numero, tipo_habitacion_id, precio_por_noche)
VALUES (
    '101',
    (SELECT id FROM tipos_habitacion WHERE nombre = 'Doble' LIMIT 1),
    250.00
);

-- Crear reserva (el código se genera automáticamente)
INSERT INTO reservas (
    huesped_id,
    habitacion_id,
    fecha_checkin,
    fecha_checkout,
    precio_por_noche,
    canal_reserva,
    estado_id
) VALUES (
    (SELECT id FROM huespedes WHERE nombre = 'Juan' LIMIT 1),
    (SELECT id FROM habitaciones WHERE numero = '101'),
    CURRENT_DATE + 1,
    CURRENT_DATE + 3,
    250.00,
    'presencial',
    (SELECT id FROM estados_reserva WHERE nombre = 'pendiente')
);

-- Ver código generado
SELECT id, codigo_reserva, fecha_checkin, fecha_checkout
FROM reservas
ORDER BY id DESC
LIMIT 1;
```
**Debe mostrar:** Código como `RES-20251005-000001`

### 5. Probar validación de solapamiento
```sql
-- Intentar crear reserva solapada (debe retornar FALSE)
SELECT validar_solapamiento_reservas(
    (SELECT id FROM habitaciones WHERE numero = '101'),
    CURRENT_DATE + 2,  -- Solapa con reserva anterior
    CURRENT_DATE + 4,
    NULL
);
```
**Debe retornar:** `false` (hay conflicto)

### 6. Probar trigger de notificación
```sql
-- Crear solicitud de servicio
INSERT INTO solicitudes_servicios (habitacion_id, servicio_id, origen)
VALUES (
    (SELECT id FROM habitaciones WHERE numero = '101'),
    (SELECT id FROM servicios WHERE categoria = 'lavanderia'),
    'plataforma_qr'
);

-- Verificar que se creó notificación automáticamente
SELECT * FROM notificaciones ORDER BY creado_en DESC LIMIT 1;
```
**Debe mostrar:** Notificación con mensaje "Habitación 101 solicita: Servicio de Lavandería"

---

## 🔐 SEGURIDAD POST-INSTALACIÓN

### ⚠️ CRÍTICO: Cambiar password de admin

```sql
-- Generar hash bcrypt del nuevo password en tu backend Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('TuPasswordSeguro123!', 10);

UPDATE usuarios
SET password_hash = '$2b$10$TU_HASH_BCRYPT_AQUI'
WHERE email = 'admin@casajosefa.com';
```

### Actualizar información del hotel

```sql
-- Actualizar WiFi real
UPDATE contenido_plataforma
SET contenido_es = E'Red WiFi: TU_RED_REAL\nContraseña: TU_PASSWORD_REAL\n\n...',
    contenido_en = E'WiFi Network: TU_RED_REAL\nPassword: TU_PASSWORD_REAL\n\n...'
WHERE seccion = 'wifi';

-- Actualizar teléfonos de emergencia
UPDATE contenido_plataforma
SET contenido_es = E'• Recepción Hotel: +502 XXXX-XXXX\n...',
    contenido_en = E'• Hotel Reception: +502 XXXX-XXXX\n...'
WHERE seccion = 'contacto_emergencia';
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
PG IMPLEMENTACION/
├── EJECUTAR_COMPLETO.sql          ⭐ USAR ESTE (todo en uno)
├── fase1_schema.sql                (16 tablas)
├── fase1_funciones.sql             (2 funciones)
├── fase1_triggers.sql              (4 triggers + secuencia)
├── fase1_indices.sql               (40+ índices)
├── fase1_datos_iniciales.sql       (datos predefinidos)
├── FASE_1_COMPLETADA.md            (documentación completa)
├── CORRECCIONES_SUPABASE.md        (errores corregidos)
├── README_INSTALACION.md           (este archivo)
└── INTRUCCION FASE UNO.md          (especificaciones originales)
```

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Crear proyecto en Supabase
- [ ] Copiar credenciales de conexión (para Fase 2)
- [ ] Ejecutar `EJECUTAR_COMPLETO.sql` en SQL Editor
- [ ] Verificar mensaje "INSTALACIÓN COMPLETADA EXITOSAMENTE"
- [ ] Ejecutar queries de verificación
- [ ] Cambiar password del usuario admin
- [ ] Actualizar información del hotel (WiFi, teléfonos)
- [ ] Crear habitaciones reales del hotel
- [ ] Crear usuarios del personal (recepcionistas)
- [ ] Probar creación de reserva manualmente
- [ ] Documentar credenciales de Supabase para Fase 2

---

## 🎯 PRÓXIMOS PASOS

### Fase 2: Backend (Node.js + Express)

**Preparación necesaria:**
1. Anotar credenciales de Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `DATABASE_URL` (connection string)

2. Tecnologías confirmadas:
   - ✅ Autenticación: JWT manual (no Supabase Auth)
   - ✅ Storage imágenes: Supabase Storage
   - ✅ Notificaciones: WebSockets manual (no Supabase Realtime)

3. Endpoints críticos a implementar:
   - Autenticación (login, logout, refresh token)
   - Reservas con validación de solapamiento
   - Gestión de QR (generar, asignar, desasignar)
   - Solicitudes de servicio + notificaciones WebSocket
   - Reportes de ocupación

**Ver plan completo en:** `FASE_1_COMPLETADA.md`

---

## 📞 SOPORTE

Si encuentras errores durante la instalación:

1. Verifica que estás usando PostgreSQL 12+
2. Revisa `CORRECCIONES_SUPABASE.md` para errores conocidos
3. Verifica que copiaste TODO el contenido de `EJECUTAR_COMPLETO.sql`
4. Ejecuta queries de verificación para identificar qué falta

---

## 📝 NOTAS DE VERSIÓN

### v1.1 (2025-10-05) - ACTUAL
- ✅ Corregidos 4 errores de compatibilidad con Supabase
- ✅ Agregado campo `orden` en experiencias_turisticas
- ✅ Creada secuencia `seq_codigo_reserva`
- ✅ Corregido trigger generar_codigo_reserva
- ✅ Eliminado subquery en índice parcial
- ✅ 100% compatible con Supabase PostgreSQL

### v1.0 (2025-10-05)
- ✅ Implementación inicial de 16 tablas
- ✅ 2 funciones, 3 triggers, 40+ índices
- ✅ Datos iniciales completos

---

**¡Base de datos lista para producción!** 🎉
