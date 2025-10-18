const { Client } = require('pg');

const PASSWORD = 'PPDPdhNo5ourm1ta';

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.tkapgaullvnpzjkssthb',
  password: PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('🔌 Intentando conectar a Supabase...');
console.log('Host: aws-1-us-east-2.pooler.supabase.com');
console.log('Port: 6543');
console.log('User: postgres.tkapgaullvnpzjkssthb');
console.log('Database: postgres');
console.log('');

client.connect()
  .then(() => {
    console.log('✅ CONEXIÓN EXITOSA!');
    return client.query('SELECT NOW() as now, current_database() as db');
  })
  .then(result => {
    console.log('📊 Resultado de la query:');
    console.log('   Database:', result.rows[0].db);
    console.log('   Timestamp:', result.rows[0].now);
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('');
    console.error('Detalles completos:', err);
    client.end();
    process.exit(1);
  });
