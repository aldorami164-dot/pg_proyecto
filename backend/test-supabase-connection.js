#!/usr/bin/env node

/**
 * Script de Diagnóstico de Conexión a Supabase
 *
 * Ejecutar: node test-supabase-connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const dns = require('dns').promises;
const https = require('https');

console.log('\n🔍 === DIAGNÓSTICO DE CONEXIÓN A SUPABASE ===\n');

// 1. Verificar variables de entorno
console.log('📋 1. Verificando variables de entorno...');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('   ❌ SUPABASE_URL no está definida en .env');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('   ❌ SUPABASE_SERVICE_KEY no está definida en .env');
  process.exit(1);
}

console.log(`   ✅ SUPABASE_URL: ${supabaseUrl}`);
console.log(`   ✅ SUPABASE_SERVICE_KEY: ${supabaseKey.substring(0, 20)}...`);

// 2. Extraer hostname de la URL
let hostname;
try {
  const url = new URL(supabaseUrl);
  hostname = url.hostname;
  console.log(`\n📡 2. Hostname extraído: ${hostname}`);
} catch (error) {
  console.error(`\n   ❌ URL inválida: ${error.message}`);
  process.exit(1);
}

// 3. Verificar DNS
console.log('\n🌐 3. Verificando DNS...');
dns.lookup(hostname)
  .then(({ address, family }) => {
    console.log(`   ✅ DNS resuelto correctamente`);
    console.log(`   📍 IP: ${address} (IPv${family})`);

    // 4. Verificar conectividad HTTPS
    console.log('\n🔗 4. Verificando conectividad HTTPS...');

    return new Promise((resolve, reject) => {
      const req = https.get(`${supabaseUrl}/rest/v1/`, (res) => {
        console.log(`   ✅ Conexión HTTPS exitosa`);
        console.log(`   📊 Status Code: ${res.statusCode}`);

        if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 403) {
          resolve();
        } else {
          reject(new Error(`Status inesperado: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout: No se pudo conectar en 5 segundos'));
      });
    });
  })
  .then(() => {
    // 5. Probar cliente de Supabase
    console.log('\n📦 5. Probando cliente de Supabase...');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });

    console.log('   ✅ Cliente de Supabase creado exitosamente');

    // 6. Listar buckets de Storage
    console.log('\n🗂️  6. Listando buckets de Storage...');

    return supabase.storage.listBuckets();
  })
  .then(({ data: buckets, error }) => {
    if (error) {
      console.error(`   ❌ Error al listar buckets: ${error.message}`);
      throw error;
    }

    console.log(`   ✅ Buckets encontrados: ${buckets.length}`);

    if (buckets.length === 0) {
      console.log('\n   ⚠️  No hay buckets creados');
      console.log('   💡 Necesitas crear el bucket "galeria" en Supabase Dashboard');
    } else {
      buckets.forEach(bucket => {
        const status = bucket.name === 'galeria' ? '✅' : '📁';
        const publicity = bucket.public ? '(Público)' : '(Privado)';
        console.log(`   ${status} ${bucket.name} ${publicity}`);
      });

      const galeriaExists = buckets.some(b => b.name === 'galeria');

      if (!galeriaExists) {
        console.log('\n   ⚠️  El bucket "galeria" NO existe');
        console.log('   💡 Necesitas crear el bucket "galeria" en Supabase Dashboard');
      } else {
        console.log('\n   ✅ El bucket "galeria" existe correctamente');
      }
    }

    console.log('\n✅ === DIAGNÓSTICO COMPLETADO EXITOSAMENTE ===\n');
    console.log('Tu conexión a Supabase está funcionando correctamente.\n');

    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ === ERROR DE CONEXIÓN ===\n`);
    console.error(`Tipo: ${error.code || error.name}`);
    console.error(`Mensaje: ${error.message}\n`);

    if (error.code === 'ENOTFOUND') {
      console.error('🔴 DIAGNÓSTICO:');
      console.error('   El dominio de Supabase no existe o no se puede resolver.');
      console.error('\n📋 ACCIONES NECESARIAS:');
      console.error('   1. Ve a https://supabase.com/dashboard');
      console.error('   2. Verifica que tu proyecto existe y está activo');
      console.error('   3. Copia la URL correcta desde Settings → API → Project URL');
      console.error('   4. Actualiza SUPABASE_URL en tu archivo .env');
      console.error('   5. Reinicia el servidor\n');
      console.error('📖 Lee el archivo VERIFICAR_SUPABASE.md para más detalles.\n');
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('Timeout')) {
      console.error('🔴 DIAGNÓSTICO:');
      console.error('   No se pudo conectar al servidor de Supabase (timeout).');
      console.error('\n📋 POSIBLES CAUSAS:');
      console.error('   - Problemas de red/firewall');
      console.error('   - Proyecto pausado en Supabase');
      console.error('   - URL incorrecta en .env\n');
    } else {
      console.error('🔴 DIAGNÓSTICO:');
      console.error('   Error desconocido al conectar con Supabase.');
      console.error('\n📋 ACCIONES SUGERIDAS:');
      console.error('   - Verifica que SUPABASE_URL y SUPABASE_SERVICE_KEY sean correctos');
      console.error('   - Revisa el archivo VERIFICAR_SUPABASE.md para más ayuda\n');
    }

    process.exit(1);
  });
