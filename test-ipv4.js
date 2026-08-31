// Test IPv4 and IPv6 connectivity
const { resolve4, resolve6 } = require('dns').promises;
const net = require('net');

async function testConnection(host, port) {
  console.log(`\nTesting connection to ${host}:${port}...`);
  
  try {
    // Try IPv4
    console.log(`  Resolving IPv4...`);
    const ips4 = await resolve4(host).catch(() => null);
    if (ips4) {
      console.log(`  → IPv4: ${ips4[0]}`);
      
      return new Promise((resolve) => {
        const socket = net.createConnection({ host: ips4[0], port, family: 4, timeout: 5000 });
        socket.on('connect', () => {
          console.log(`  ✓ IPv4 connection successful`);
          socket.destroy();
          resolve(true);
        });
        socket.on('error', (err) => {
          console.log(`  ✗ IPv4 error: ${err.code}`);
          resolve(false);
        });
      });
    } else {
      console.log(`  → IPv4: not available`);
    }
  } catch (err) {
    console.log(`  IPv4 error: ${err.message}`);
  }
}

testConnection('db.kgcliutwnfetaqtfbwpv.supabase.co', 5432)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
