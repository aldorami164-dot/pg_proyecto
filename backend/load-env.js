// ESTE ARCHIVO DEBE EJECUTARSE ANTES QUE CUALQUIER OTRO
// Se ejecuta con: node -r ./load-env.js server.js

const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('🚀 CARGANDO VARIABLES DE ENTORNO');
console.log('========================================\n');

// Detectar si estamos en Railway/producción
const isProduction = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';

// Establecer NODE_ENV si no está definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = isProduction ? 'production' : 'development';
  console.log(`✅ NODE_ENV establecido a: ${process.env.NODE_ENV}`);
}

// Determinar qué archivo .env cargar
const envFile = isProduction ? '.env.production' : '.env';
const envPath = path.join(__dirname, envFile);

console.log(`🔧 Entorno: ${isProduction ? 'PRODUCCIÓN (Railway)' : 'DESARROLLO'}`);
console.log(`🔧 Archivo: ${envFile}`);
console.log(`🔧 Ruta: ${envPath}`);
console.log(`🔧 Archivo existe: ${fs.existsSync(envPath) ? '✅ SÍ' : '❌ NO'}\n`);

// Cargar dotenv
const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.error('❌ ERROR cargando .env:', result.error.message);
  console.error('   Intentando cargar variables manualmente...\n');

  // Intentar leer el archivo manualmente
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let count = 0;

    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
          count++;
        }
      }
    });

    console.log(`✅ Cargadas ${count} variables manualmente\n`);
  } else {
    console.error('❌ El archivo .env.production NO EXISTE en el build\n');
    console.error('📂 Contenido del directorio backend:');
    fs.readdirSync(__dirname).forEach(file => {
      console.error(`   - ${file}`);
    });
    console.error('');
  }
} else {
  const varCount = Object.keys(result.parsed || {}).length;
  console.log(`✅ Variables cargadas desde dotenv: ${varCount}\n`);
}

// Verificar variables críticas
console.log('🔍 Verificando variables críticas:');
const critical = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
critical.forEach(key => {
  const value = process.env[key];
  const status = value ? '✅' : '❌';
  const display = key.includes('KEY') || key.includes('PASSWORD') ? '[REDACTED]' : (value || 'NO CONFIGURADA');
  console.log(`   ${status} ${key}: ${display}`);
});

console.log('\n========================================');
console.log('✅ CARGA DE VARIABLES COMPLETADA');
console.log('========================================\n');
