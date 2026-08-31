// Test Node.js socket connection
const net = require('net');

const socket = net.createConnection({
  host: 'db.kgcliutwnfetaqtfbwpv.supabase.co',
  port: 5432,
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✓ Connected successfully!');
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('✗ Connection error:', {
    code: err.code,
    message: err.message,
    errno: err.errno,
    syscall: err.syscall
  });
  process.exit(1);
});

socket.on('timeout', () => {
  console.error('✗ Connection timeout');
  socket.destroy();
  process.exit(1);
});

console.log('Attempting to connect to db.kgcliutwnfetaqtfbwpv.supabase.co:5432...');
