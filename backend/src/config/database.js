const { Pool } = require('pg');

console.log('🔧 Configuración de conexión DB:');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);
console.log('   SSL:', process.env.DB_SSL);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Configuración optimizada para Supabase
  max: 10, // Máximo permitido en Supabase free tier
  min: 2, // Mantener algunas conexiones vivas
  idleTimeoutMillis: 60000, // 60 segundos - más tiempo antes de cerrar conexiones idle
  connectionTimeoutMillis: 30000, // 30 segundos - tiempo aumentado para Supabase

  // Configuración de keepalive para evitar que Supabase cierre conexiones
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // 10 segundos
});

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
