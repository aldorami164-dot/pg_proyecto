const { createClient } = require('@supabase/supabase-js');

// Validar que las variables existan ANTES de crear el cliente
console.log('\n🔧 Inicializando cliente de Supabase...');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL || '❌ NO CONFIGURADA');
console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Configurada' : '❌ NO CONFIGURADA');

if (!process.env.SUPABASE_URL) {
  console.error('\n❌ ERROR: SUPABASE_URL no está configurada en las variables de entorno');
  console.error('   Configúrala en Railway Dashboard → Variables');
  throw new Error('SUPABASE_URL no está configurada en las variables de entorno');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_KEY no está configurada en las variables de entorno');
  console.error('   Configúrala en Railway Dashboard → Variables');
  throw new Error('SUPABASE_SERVICE_KEY no está configurada en las variables de entorno');
}

// Cliente de Supabase (SOLO para Storage de imágenes)
// NO usar para autenticación ni base de datos
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY, // Service key para operaciones administrativas
  {
    auth: {
      persistSession: false
    }
  }
);

console.log('✅ Cliente de Supabase inicializado correctamente\n');

module.exports = supabase;
