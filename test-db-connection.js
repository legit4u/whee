// Test database connection directly
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

const DB_URL = process.env.DATABASE_URL;
console.log('DATABASE_URL loaded:', DB_URL ? 'YES' : 'NO');

if (!DB_URL) {
  console.error('DATABASE_URL not set!');
  process.exit(1);
}

try {
  const parsed = parse(DB_URL);
  console.log('Parsed connection config:');
  console.log('  host:', parsed.host);
  console.log('  port:', parsed.port);
  console.log('  database:', parsed.database);
  console.log('  user:', parsed.user);
  console.log('  ssl:', parsed.ssl);
} catch (e) {
  console.error('Failed to parse connection string:', e.message);
  process.exit(1);
}

const pool = new Pool({
  connectionString: DB_URL,
  max: 1,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  statementTimeoutMillis: 30000,
  application_name: 'whee_test'
});

console.log('Attempting to connect...');

pool.connect((err, client, release) => {
  if (err) {
    console.error('Connection error:', {
      code: err.code,
      message: err.message,
      detail: err.detail,
      syscall: err.syscall,
      hostname: err.hostname
    });
    process.exit(1);
  }

  console.log('✓ Connected successfully!');
  
  client.query('SELECT 1', (err, result) => {
    release();
    
    if (err) {
      console.error('Query error:', err);
      process.exit(1);
    }
    
    console.log('✓ Query successful!');
    pool.end(() => {
      console.log('✓ Connection closed');
      process.exit(0);
    });
  });
});

