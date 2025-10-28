// =====================================================
// MIGRACIÓN: Agregar tipos de habitación Cuádruple, Quíntuple y Apartamento
// Fecha: 2025-01-27
// =====================================================

// Cargar variables de entorno
require('./load-env.js');

const { pool } = require('./src/config/database');

async function ejecutarMigracion() {
  const client = await pool.connect();

  try {
    console.log('\n========================================');
    console.log('🚀 INICIANDO MIGRACIÓN DE TIPOS DE HABITACIÓN');
    console.log('========================================\n');

    // PASO 0: Verificar estado actual
    console.log('📊 PASO 0: Verificando estado actual...\n');

    const resultActual = await client.query(`
      SELECT * FROM tipos_habitacion ORDER BY id;
    `);

    console.log('Tipos de habitación actuales:');
    resultActual.rows.forEach(tipo => {
      console.log(`  - ${tipo.nombre} (capacidad: ${tipo.capacidad_maxima})`);
    });
    console.log('');

    // Verificar constraint actual
    const constraintQuery = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'tipos_habitacion'::regclass
      AND conname = 'tipos_habitacion_nombre_check';
    `);

    if (constraintQuery.rows.length > 0) {
      console.log('Constraint actual:');
      console.log(`  ${constraintQuery.rows[0].definition}\n`);
    }

    // Iniciar transacción
    console.log('🔄 Iniciando transacción...\n');
    await client.query('BEGIN');

    // PASO 1: Eliminar el CHECK CONSTRAINT restrictivo
    console.log('📝 PASO 1: Eliminando constraint restrictivo...');
    await client.query(`
      ALTER TABLE tipos_habitacion
      DROP CONSTRAINT IF EXISTS tipos_habitacion_nombre_check;
    `);
    console.log('✅ Constraint eliminado\n');

    // PASO 2: Crear nuevo CHECK CONSTRAINT con los 7 tipos
    console.log('📝 PASO 2: Creando nuevo constraint con 7 tipos...');
    await client.query(`
      ALTER TABLE tipos_habitacion
      ADD CONSTRAINT tipos_habitacion_nombre_check
      CHECK (nombre IN (
        'Individual',
        'Doble',
        'Triple',
        'Familiar',
        'Cuadruple',
        'Quintuple',
        'Apartamento'
      ));
    `);
    console.log('✅ Nuevo constraint creado\n');

    // PASO 3: Insertar los nuevos tipos
    console.log('📝 PASO 3: Insertando nuevos tipos de habitación...');

    const resultInsert = await client.query(`
      INSERT INTO tipos_habitacion (nombre, capacidad_maxima, descripcion) VALUES
      ('Cuadruple', 4, 'Habitación para cuatro personas con camas individuales o literas'),
      ('Quintuple', 5, 'Habitación espaciosa con capacidad para cinco personas'),
      ('Apartamento', 8, 'Suite tipo apartamento con sala, cocina y dormitorios, ideal para familias grandes o estancias largas')
      ON CONFLICT (nombre) DO NOTHING
      RETURNING *;
    `);

    if (resultInsert.rows.length > 0) {
      console.log(`✅ Se insertaron ${resultInsert.rows.length} nuevos tipos:\n`);
      resultInsert.rows.forEach(tipo => {
        console.log(`  ✓ ${tipo.nombre} (capacidad: ${tipo.capacidad_maxima})`);
      });
    } else {
      console.log('⚠️  No se insertaron nuevos tipos (ya existen)\n');
    }
    console.log('');

    // PASO 4: Confirmar transacción
    console.log('💾 Confirmando cambios...');
    await client.query('COMMIT');
    console.log('✅ Transacción confirmada\n');

    // PASO 5: Verificar resultado final
    console.log('🔍 VERIFICACIÓN FINAL:\n');
    const resultFinal = await client.query(`
      SELECT * FROM tipos_habitacion ORDER BY id;
    `);

    console.log('Tipos de habitación después de la migración:');
    resultFinal.rows.forEach(tipo => {
      console.log(`  - ${tipo.nombre} (capacidad: ${tipo.capacidad_maxima})`);
    });
    console.log('');

    // Verificar nuevo constraint
    const newConstraintQuery = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'tipos_habitacion'::regclass
      AND conname = 'tipos_habitacion_nombre_check';
    `);

    if (newConstraintQuery.rows.length > 0) {
      console.log('Nuevo constraint:');
      console.log(`  ${newConstraintQuery.rows[0].definition}\n`);
    }

    console.log('========================================');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');

  } catch (error) {
    // Rollback en caso de error
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR durante la migración:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalle:', error.detail || 'N/A');
    console.error('\n🔄 Transacción revertida (ROLLBACK)\n');
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
