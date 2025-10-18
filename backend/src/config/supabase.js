const { createClient } = require('@supabase/supabase-js');

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

module.exports = supabase;
