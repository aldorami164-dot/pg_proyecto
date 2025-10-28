// =====================================================
// MIGRACIÓN: Agregar columna numero_huespedes_total a grupos_reservas
// Fecha: 2025-10-27
// Descripción: Corregir bug donde numero_huespedes se duplicaba por habitación
// =====================================================

require('./load-env.js');

const { pool } = require('./src/config/database');

async function ejecutarMigracion() {
  const client = await pool.connect();

  try {
    console.log('\n========================================');
    console.log('🚀 MIGRACIÓN: Agregar numero_huespedes_total');
    console.log('========================================\n');

    // Verificar si la columna ya existe
    const checkColumna = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'grupos_reservas'
      AND column_name = 'numero_huespedes_total';
    `);

    if (checkColumna.rows.length > 0) {
      console.log('⚠️  La columna numero_huespedes_total YA EXISTE');
      console.log('   Esta migración ya fue ejecutada anteriormente.\n');
      return;
    }

    console.log('🔄 Iniciando transacción...');
    await client.query('BEGIN');

    // Agregar columna numero_huespedes_total
    console.log('📝 Agregando columna numero_huespedes_total...');
    await client.query(`
      ALTER TABLE grupos_reservas
      ADD COLUMN numero_huespedes_total INTEGER CHECK (numero_huespedes_total > 0);
    `);

    // Agregar comentario
    await client.query(`
      COMMENT ON COLUMN grupos_reservas.numero_huespedes_total IS 'Número total de huéspedes en el grupo (suma de todas las habitaciones)';
    `);

    console.log('✅ Columna agregada exitosamente\n');

    // Confirmar transacción
    console.log('💾 Confirmando cambios (COMMIT)...');
    await client.query('COMMIT');

    console.log('\n========================================');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR DURANTE LA MIGRACIÓN');
    console.error('Mensaje:', error.message);
    console.error('🔄 ROLLBACK EJECUTADO\n');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
ejecutarMigracion()
  .then(() => {
    console.log('✅ Script de migración finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script de migración falló');
    process.exit(1);
  });
