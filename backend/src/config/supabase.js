const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase (SOLO para Storage de imágenes)
// NO usar para autenticación ni base de datos

// Verificar que las variables existan
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de Supabase no configuradas');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING');
  console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'OK' : 'MISSING');
  throw new Error('Supabase configuration missing');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false
    }
  }
);

module.exports = supabase;
