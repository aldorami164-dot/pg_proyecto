// =====================================================
// MIGRACIÓN: Sistema de Reservas Múltiples
// Fecha: 2025-10-28
// Descripción: Agregar soporte para agrupar múltiples habitaciones en una reserva
// SEGURIDAD: Usa transacciones, 100% compatible con sistema actual
// =====================================================

require('./load-env.js');

const { pool } = require('./src/config/database');

async function ejecutarMigracion() {
  const client = await pool.connect();

  try {
    console.log('\n========================================');
    console.log('🚀 MIGRACIÓN: GRUPOS DE RESERVAS');
    console.log('========================================\n');

    // ============================================================
    // PASO 0: VERIFICAR ESTADO ACTUAL
    // ============================================================
    console.log('📊 PASO 0: Verificando estado actual de la base de datos...\n');

    // Verificar si la migración ya fue ejecutada
    const checkTabla = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'grupos_reservas'
      ) as existe;
    `);

    if (checkTabla.rows[0].existe) {
      console.log('⚠️  La tabla grupos_reservas YA EXISTE');
      console.log('   Esta migración ya fue ejecutada anteriormente.\n');

      const confirmar = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'reservas'
        AND column_name = 'grupo_reserva_id';
      `);

      if (confirmar.rows.length > 0) {
        console.log('✅ La columna grupo_reserva_id también existe en reservas\n');
        console.log('========================================');
        console.log('✅ MIGRACIÓN YA COMPLETADA PREVIAMENTE');
        console.log('========================================\n');
        return;
      }
    }

    // Contar reservas existentes
    const countReservas = await client.query('SELECT COUNT(*) as total FROM reservas');
    console.log(`📋 Reservas actuales en el sistema: ${countReservas.rows[0].total}`);
    console.log('   Estas reservas NO serán afectadas (grupo_reserva_id = NULL)\n');

    // ============================================================
    // PASO 1: INICIAR TRANSACCIÓN
    // ============================================================
    console.log('🔄 PASO 1: Iniciando transacción...');
    await client.query('BEGIN');
    console.log('✅ Transacción iniciada (cualquier error hará ROLLBACK automático)\n');

    // ============================================================
    // PASO 2: CREAR TABLA grupos_reservas
    // ============================================================
    console.log('📝 PASO 2: Creando tabla grupos_reservas...');

    await client.query(`
      CREATE TABLE grupos_reservas (
        id SERIAL PRIMARY KEY,
        codigo_grupo VARCHAR(20) UNIQUE NOT NULL,
        huesped_principal_id INTEGER NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
        fecha_checkin DATE NOT NULL,
        fecha_checkout DATE NOT NULL CHECK (fecha_checkout > fecha_checkin),
        numero_habitaciones INTEGER NOT NULL CHECK (numero_habitaciones > 0),
        precio_total_grupo DECIMAL(10, 2) NOT NULL CHECK (precio_total_grupo >= 0),
        canal_reserva VARCHAR(20) NOT NULL CHECK (canal_reserva IN ('booking', 'whatsapp', 'facebook', 'telefono', 'presencial')),
        notas TEXT,
        creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabla grupos_reservas creada exitosamente\n');

    // ============================================================
    // PASO 3: AGREGAR COMENTARIOS A LA TABLA
    // ============================================================
    console.log('📝 PASO 3: Agregando comentarios descriptivos...');

    await client.query(`
      COMMENT ON TABLE grupos_reservas IS 'Agrupa múltiples reservas de habitaciones para un mismo huésped/familia. Permite gestionar reservas múltiples como una unidad';
    `);

    await client.query(`
      COMMENT ON COLUMN grupos_reservas.codigo_grupo IS 'Código único del grupo. Formato: GRP-YYYY-NNN (ej: GRP-2025-001)';
    `);

    await client.query(`
      COMMENT ON COLUMN grupos_reservas.numero_habitaciones IS 'Cantidad de habitaciones incluidas en este grupo';
    `);

    await client.query(`
      COMMENT ON COLUMN grupos_reservas.precio_total_grupo IS 'Suma total de todas las habitaciones del grupo';
    `);

    console.log('✅ Comentarios agregados\n');

    // ============================================================
    // PASO 4: AGREGAR COLUMNA grupo_reserva_id A TABLA reservas
    // ============================================================
    console.log('📝 PASO 4: Agregando columna grupo_reserva_id a tabla reservas...');

    await client.query(`
      ALTER TABLE reservas
      ADD COLUMN grupo_reserva_id INTEGER REFERENCES grupos_reservas(id) ON DELETE SET NULL;
    `);

    console.log('✅ Columna agregada (valor por defecto: NULL)\n');

    // ============================================================
    // PASO 5: AGREGAR COMENTARIO A LA COLUMNA
    // ============================================================
    console.log('📝 PASO 5: Agregando comentario a nueva columna...');

    await client.query(`
      COMMENT ON COLUMN reservas.grupo_reserva_id IS 'FK a grupos_reservas. NULL = reserva individual (compatibilidad con sistema actual). NOT NULL = parte de un grupo';
    `);

    console.log('✅ Comentario agregado\n');

    // ============================================================
    // PASO 6: CREAR ÍNDICE PARA BÚSQUEDAS RÁPIDAS
    // ============================================================
    console.log('📝 PASO 6: Creando índice para optimizar consultas...');

    await client.query(`
      CREATE INDEX idx_reservas_grupo_reserva ON reservas(grupo_reserva_id) WHERE grupo_reserva_id IS NOT NULL;
    `);

    console.log('✅ Índice creado (solo para reservas con grupo)\n');

    // ============================================================
    // PASO 7: CREAR FUNCIÓN PARA GENERAR CÓDIGO DE GRUPO
    // ============================================================
    console.log('📝 PASO 7: Creando función para generar códigos de grupo...');

    await client.query(`
      CREATE OR REPLACE FUNCTION generar_codigo_grupo()
      RETURNS VARCHAR(20) AS $$
      DECLARE
        v_year VARCHAR(4);
        v_count INTEGER;
        v_codigo VARCHAR(20);
      BEGIN
        v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

        -- Contar grupos del año actual
        SELECT COUNT(*) INTO v_count
        FROM grupos_reservas
        WHERE EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE);

        v_count := v_count + 1;

        -- Formato: GRP-2025-001
        v_codigo := 'GRP-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');

        RETURN v_codigo;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Función generar_codigo_grupo() creada\n');

    // ============================================================
    // PASO 8: VERIFICAR INTEGRIDAD DE LA MIGRACIÓN
    // ============================================================
    console.log('🔍 PASO 8: Verificando integridad de la migración...\n');

    // Verificar tabla grupos_reservas
    const verificarTabla = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'grupos_reservas'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de grupos_reservas:');
    verificarTabla.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    // Verificar columna en reservas
    const verificarColumna = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reservas'
      AND column_name = 'grupo_reserva_id';
    `);

    if (verificarColumna.rows.length === 0) {
      throw new Error('❌ ERROR: La columna grupo_reserva_id no se creó correctamente');
    }

    console.log('✅ Columna grupo_reserva_id en reservas:');
    console.log(`   - Tipo: ${verificarColumna.rows[0].data_type}`);
    console.log(`   - Nullable: ${verificarColumna.rows[0].is_nullable}`);
    console.log('');

    // Verificar que reservas existentes tienen NULL
    const verificarReservas = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(grupo_reserva_id) as con_grupo
      FROM reservas;
    `);

    console.log('📊 Estado de reservas existentes:');
    console.log(`   - Total de reservas: ${verificarReservas.rows[0].total}`);
    console.log(`   - Con grupo asignado: ${verificarReservas.rows[0].con_grupo}`);
    console.log(`   - Individuales (NULL): ${verificarReservas.rows[0].total - verificarReservas.rows[0].con_grupo}`);
    console.log('');

    if (verificarReservas.rows[0].con_grupo > 0) {
      throw new Error('❌ ERROR: Algunas reservas tienen grupo_reserva_id no NULL (inesperado)');
    }

    console.log('✅ Todas las reservas existentes son individuales (grupo_reserva_id = NULL)');
    console.log('✅ Compatibilidad con sistema actual: GARANTIZADA\n');

    // Verificar función
    const verificarFuncion = await client.query(`
      SELECT generar_codigo_grupo() as codigo;
    `);

    console.log('🧪 Prueba de función generar_codigo_grupo():');
    console.log(`   - Código generado: ${verificarFuncion.rows[0].codigo}`);
    console.log('');

    // ============================================================
    // PASO 9: CONFIRMAR TRANSACCIÓN
    // ============================================================
    console.log('💾 PASO 9: Confirmando cambios (COMMIT)...');
    await client.query('COMMIT');
    console.log('✅ Transacción confirmada exitosamente\n');

    // ============================================================
    // PASO 10: VERIFICACIÓN FINAL POST-COMMIT
    // ============================================================
    console.log('🔍 PASO 10: Verificación final post-commit...\n');

    const verificacionFinal = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM grupos_reservas) as grupos_count,
        (SELECT COUNT(*) FROM reservas) as reservas_count,
        (SELECT COUNT(*) FROM reservas WHERE grupo_reserva_id IS NOT NULL) as reservas_con_grupo;
    `);

    const stats = verificacionFinal.rows[0];

    console.log('📊 Estado final de la base de datos:');
    console.log(`   - Grupos existentes: ${stats.grupos_count}`);
    console.log(`   - Reservas totales: ${stats.reservas_count}`);
    console.log(`   - Reservas con grupo: ${stats.reservas_con_grupo}`);
    console.log(`   - Reservas individuales: ${stats.reservas_count - stats.reservas_con_grupo}`);
    console.log('');

    console.log('========================================');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');

    console.log('📋 RESUMEN DE CAMBIOS:');
    console.log('   ✓ Tabla grupos_reservas creada');
    console.log('   ✓ Columna grupo_reserva_id agregada a reservas');
    console.log('   ✓ Índice idx_reservas_grupo_reserva creado');
    console.log('   ✓ Función generar_codigo_grupo() creada');
    console.log('   ✓ Todas las reservas existentes mantienen compatibilidad');
    console.log('');

    console.log('🎯 PRÓXIMOS PASOS:');
    console.log('   1. Actualizar backend con endpoint POST /api/reservas/grupo');
    console.log('   2. Actualizar frontend con selector de múltiples habitaciones');
    console.log('   3. Probar creación de grupos de reservas');
    console.log('');

  } catch (error) {
    // ROLLBACK automático en caso de error
    await client.query('ROLLBACK');

    console.error('\n❌ ========================================');
    console.error('❌ ERROR DURANTE LA MIGRACIÓN');
    console.error('❌ ========================================\n');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code || 'N/A');
    console.error('Detalle:', error.detail || 'N/A');
    console.error('');
    console.error('🔄 ROLLBACK EJECUTADO - Base de datos restaurada al estado anterior');
    console.error('   No se realizó ningún cambio en la base de datos.\n');

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
    console.error('❌ Script de migración falló - base de datos sin cambios');
    process.exit(1);
  });
