const WebSocket = require('ws');
const { verifyAccessToken } = require('../config/jwt');
const { query } = require('../config/database');
const log = require('../utils/logger');

// Mapa de clientes conectados: userId -> WebSocket connection
const clients = new Map();

// Set de IDs de notificaciones ya enviadas (evita duplicados)
const notificacionesEnviadas = new Set();

// Última fecha de revisión de notificaciones
let ultimaRevision = new Date();

/**
 * Verificar autenticación de cliente WebSocket
 */
const autenticarCliente = async (token) => {
  try {
    const decoded = verifyAccessToken(token);

    // Verificar que el usuario existe y está activo
    const result = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1 AND u.activo = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    return null;
  }
};

/**
 * Verificar si el usuario tiene permisos para recibir notificaciones
 */
const tienePermisoRecepcion = (user) => {
  return ['administrador', 'recepcionista'].includes(user.rol);
};

/**
 * Enviar notificación a clientes conectados
 */
const enviarNotificacion = (notificacion) => {
  clients.forEach((clientData, userId) => {
    const { ws, user } = clientData;

    if (ws.readyState === WebSocket.OPEN && tienePermisoRecepcion(user)) {
      ws.send(JSON.stringify({
        type: 'nueva_notificacion',
        data: notificacion
      }));
    }
  });
};

/**
 * Polling de nuevas notificaciones cada 2 segundos
 */
const iniciarPollingNotificaciones = () => {
  setInterval(async () => {
    try {
      // Buscar notificaciones no leídas desde la última revisión
      const result = await query(
        `SELECT
          n.id,
          n.tipo,
          n.titulo,
          n.mensaje,
          n.prioridad,
          n.habitacion_numero,
          n.creado_en,
          n.leida
        FROM notificaciones n
        WHERE n.creado_en >= $1
        ORDER BY n.creado_en ASC`,
        [ultimaRevision]
      );

      if (result.rows.length > 0) {
        // Filtrar solo las notificaciones que no han sido enviadas y están sin leer
        const notificacionesNuevas = result.rows.filter(n =>
          !notificacionesEnviadas.has(n.id) && !n.leida
        );

        if (notificacionesNuevas.length > 0) {
          log.info(`${notificacionesNuevas.length} nueva(s) notificación(es) detectada(s)`);

          // Enviar cada notificación a los clientes y marcarla como enviada
          notificacionesNuevas.forEach(notificacion => {
            enviarNotificacion(notificacion);
            notificacionesEnviadas.add(notificacion.id);
          });

          // Actualizar última revisión con la fecha de la última notificación procesada
          const ultimaNotificacion = result.rows[result.rows.length - 1];
          ultimaRevision = new Date(ultimaNotificacion.creado_en);
        }

        // Limpiar el Set de notificaciones ya leídas para liberar memoria
        // Solo mantener las que siguen sin leer
        const idsNoLeidas = new Set(result.rows.filter(n => !n.leida).map(n => n.id));
        notificacionesEnviadas.forEach(id => {
          if (!idsNoLeidas.has(id)) {
            notificacionesEnviadas.delete(id);
          }
        });
      }
    } catch (error) {
      log.error('Error en polling de notificaciones:', error.message);
    }
  }, 2000); // Cada 2 segundos
};

/**
 * Iniciar servidor WebSocket
 */
const iniciarWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port });

  wss.on('listening', () => {
    log.success(`🔔 Servidor WebSocket escuchando en puerto ${port}`);
    log.info('   Clientes pueden conectarse para recibir notificaciones en tiempo real');
    log.info('');

    // Iniciar polling de notificaciones
    iniciarPollingNotificaciones();
  });

  wss.on('connection', (ws, req) => {
    log.info('Nueva conexión WebSocket recibida');

    let userId = null;
    let user = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        // Manejar autenticación
        if (data.type === 'auth' && data.token) {
          user = await autenticarCliente(data.token);

          if (!user) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Autenticación fallida. Token inválido o usuario inactivo.'
            }));
            ws.close();
            return;
          }

          if (!tienePermisoRecepcion(user)) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Acceso denegado. Solo administradores y recepcionistas pueden recibir notificaciones.'
            }));
            ws.close();
            return;
          }

          userId = user.id;
          clients.set(userId, { ws, user });

          ws.send(JSON.stringify({
            type: 'auth_success',
            message: `Autenticado como ${user.nombre} ${user.apellido} (${user.rol})`,
            user: {
              id: user.id,
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email,
              rol: user.rol
            }
          }));

          log.success(`Usuario autenticado en WebSocket: ${user.email}`);

          // Enviar notificaciones no leídas existentes
          const notificacionesResult = await query(
            `SELECT
              id,
              tipo,
              titulo,
              mensaje,
              prioridad,
              habitacion_numero,
              creado_en
            FROM notificaciones
            WHERE leida = false
            ORDER BY
              CASE WHEN prioridad = 'alta' THEN 0 ELSE 1 END,
              creado_en DESC
            LIMIT 20`
          );

          if (notificacionesResult.rows.length > 0) {
            ws.send(JSON.stringify({
              type: 'notificaciones_pendientes',
              data: notificacionesResult.rows,
              total: notificacionesResult.rows.length
            }));
          }
        }

        // Manejar ping/pong para mantener conexión alive
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        log.error('Error al procesar mensaje WebSocket:', error.message);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error al procesar mensaje'
        }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        log.info(`Cliente desconectado: ${user ? user.email : 'desconocido'}`);
      }
    });

    ws.on('error', (error) => {
      log.error('Error en conexión WebSocket:', error.message);
    });

    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Conectado al servidor de notificaciones. Envía tu token para autenticarte.',
      instructions: {
        auth: 'Envía: {"type": "auth", "token": "tu_access_token"}',
        ping: 'Envía: {"type": "ping"} para mantener conexión activa'
      }
    }));
  });

  // Manejar errores del servidor WebSocket
  wss.on('error', (error) => {
    log.error('Error en servidor WebSocket:', error.message);
  });

  return wss;
};

module.exports = {
  iniciarWebSocketServer,
  enviarNotificacion
};
