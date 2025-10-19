const { Pool } = require('pg');

// Usar DATABASE_URL si está disponible (para producción en Render)
// Si no, usar variables individuales (para desarrollo local)
const useConnectionString = process.env.DATABASE_URL;

if (useConnectionString) {
  console.log('🔧 Usando DATABASE_URL para conexión');
} else {
  console.log('🔧 Configuración de conexión DB:');
  console.log('   Host:', process.env.DB_HOST);
  console.log('   Port:', process.env.DB_PORT);
  console.log('   User:', process.env.DB_USER);
  console.log('   Database:', process.env.DB_NAME);
  console.log('   SSL:', process.env.DB_SSL);
}

const poolConfig = useConnectionString
  ? {
      // NO usar connectionString porque causa problemas con IPv6
      // En su lugar, parsear manualmente para forzar IPv4
      host: 'db.tkapgaullvnpzjkssthb.supabase.co',
      port: 5432,
      user: 'postgres.tkapgaullvnpzjkssthb',
      password: 'PPDPdhNo5ourm1ta',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },

      // Configuración optimizada para Supabase en Render
      max: 5,                            // Reducir conexiones máximas
      min: 0,                            // No mantener conexiones idle
      idleTimeoutMillis: 10000,          // Cerrar idle después de 10s
      connectionTimeoutMillis: 10000,    // Timeout más corto
      acquireTimeoutMillis: 10000,       // Timeout para adquirir conexión
      allowExitOnIdle: true,             // Permitir cerrar cuando no hay conexiones
      keepAlive: false,                  // Desactivar keep-alive
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

      // Configuración para desarrollo local
      max: 10,
      min: 2,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

const pool = new Pool(poolConfig);

// Manejo de errores del pool (NO matar el servidor)
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
  // NO hacer process.exit() - solo loguear el error
  // El pool intentará recuperarse automáticamente
});

// Conexión inicial para verificar que funciona
pool.on('connect', (client) => {
  console.log('✅ Nueva conexión establecida al pool');
});

pool.on('remove', (client) => {
  console.log('⚠️  Conexión removida del pool');
});

// Función helper para ejecutar queries
const query = (text, params) => pool.query(text, params);

// Función helper para transacciones
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient
};
