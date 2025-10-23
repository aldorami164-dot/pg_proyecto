#!/usr/bin/env node

console.log('\n================================================');
console.log('🔍 DIAGNÓSTICO COMPLETO DE VARIABLES DE ENTORNO');
console.log('================================================\n');

// 1. Intentar cargar dotenv explícitamente
console.log('📦 Intentando cargar dotenv...');
try {
  require('dotenv').config();
  console.log('✅ dotenv cargado\n');
} catch (err) {
  console.log('⚠️  dotenv no disponible:', err.message, '\n');
}

// 2. Mostrar información del sistema
console.log('🖥️  INFORMACIÓN DEL SISTEMA:');
console.log('   Node version:', process.version);
console.log('   Platform:', process.platform);
console.log('   CWD:', process.cwd());
console.log('   __dirname:', __dirname);
console.log('');

// 3. Verificar variables de Railway
console.log('🚂 VARIABLES DE RAILWAY:');
console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || '❌ No definida');
console.log('   RAILWAY_PROJECT_NAME:', process.env.RAILWAY_PROJECT_NAME || '❌ No definida');
console.log('   RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME || '❌ No definida');
console.log('   NODE_ENV:', process.env.NODE_ENV || '❌ No definida');
console.log('');

// 4. Verificar variables requeridas
console.log('🔐 VARIABLES REQUERIDAS:');
const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
  'DB_HOST': process.env.DB_HOST,
  'DB_PORT': process.env.DB_PORT,
  'DB_NAME': process.env.DB_NAME,
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'DB_SSL': process.env.DB_SSL,
  'JWT_SECRET': process.env.JWT_SECRET,
  'JWT_REFRESH_SECRET': process.env.JWT_REFRESH_SECRET,
};

let missingVars = [];
Object.keys(requiredVars).forEach(key => {
  const value = requiredVars[key];
  const isSensitive = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD');

  if (value) {
    const display = isSensitive ? '[REDACTED]' : value;
    console.log(`   ✅ ${key}: ${display}`);
  } else {
    console.log(`   ❌ ${key}: NO CONFIGURADA`);
    missingVars.push(key);
  }
});

console.log('');

// 5. Listar TODAS las variables de entorno (filtradas)
console.log('🌍 TODAS LAS VARIABLES DE ENTORNO DISPONIBLES:');
const allEnvKeys = Object.keys(process.env).sort();
console.log(`   Total: ${allEnvKeys.length} variables`);
console.log('   Variables disponibles:', allEnvKeys.join(', '));
console.log('');

// 6. Resultado final
console.log('================================================');
if (missingVars.length === 0) {
  console.log('✅ TODAS las variables están configuradas');
  console.log('================================================\n');
  process.exit(0);
} else {
  console.log('❌ FALTAN', missingVars.length, 'VARIABLES:');
  missingVars.forEach(v => console.log('   -', v));
  console.log('');
  console.log('📋 SOLUCIÓN:');
  console.log('   1. Ve a Railway Dashboard');
  console.log('   2. Selecciona tu servicio');
  console.log('   3. Ve a Variables tab');
  console.log('   4. Agrega las variables faltantes');
  console.log('   5. Railway hará redeploy automático');
  console.log('================================================\n');
  process.exit(1);
}
