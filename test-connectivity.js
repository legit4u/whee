const net = require('net');

function testConnection(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout });
    
    socket.on('connect', () => {
      console.log(`✓ Connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.log(`✗ ${host}:${port} - ${err.code}`);
      resolve(false);
    });
    
    socket.on('timeout', () => {
      console.log(`✗ ${host}:${port} - TIMEOUT`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('Testing external connectivity from Node.js...\n');
  
  const tests = [
    ['8.8.8.8', 53],           // Google DNS
    ['1.1.1.1', 53],           // Cloudflare DNS
    ['google.com', 80],        // HTTP
    ['github.com', 443],       // HTTPS
    ['db.kgcliutwnfetaqtfbwpv.supabase.co', 5432], // Our database
  ];
  
  for (const [host, port] of tests) {
    await testConnection(host, port, 5000);
  }
}

main();
