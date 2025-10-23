// Script para verificar variables de entorno en Railway
console.log('\n=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===\n');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_SSL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓' : '✗';
  const displayValue = value
    ? (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD')
        ? '[REDACTED]'
        : value)
    : 'NO CONFIGURADA';

  console.log(`${status} ${varName}: ${displayValue}`);

  if (!value) allPresent = false;
});

console.log('\n=== VARIABLES DEL SISTEMA ===\n');
console.log('NODE_ENV:', process.env.NODE_ENV || 'no definido');
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'no definido');
console.log('PORT:', process.env.PORT || 'no definido');

console.log('\n=== RESULTADO ===\n');
if (allPresent) {
  console.log('✅ Todas las variables requeridas están configuradas');
  process.exit(0);
} else {
  console.log('❌ Faltan variables de entorno requeridas');
  console.log('\nPara configurarlas en Railway:');
  console.log('1. Ve a tu proyecto en https://railway.app');
  console.log('2. Selecciona tu servicio');
  console.log('3. Ve a la pestaña "Variables"');
  console.log('4. Agrega las variables faltantes');
  process.exit(1);
}
