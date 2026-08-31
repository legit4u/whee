// Test basic Node.js network connectivity
const dns = require('dns').promises;

async function test() {
  console.log('Testing DNS from Node.js...\n');
  
  const hosts = [
    'google.com',
    'github.com',
    '8.8.8.8',
    'db.kgcliutwnfetaqtfbwpv.supabase.co'
  ];
  
  for (const host of hosts) {
    try {
      const addr = await dns.resolve4(host);
      console.log(`✓ ${host} → ${addr[0]}`);
    } catch (err) {
      console.log(`✗ ${host} → Error: ${err.code}`);
    }
  }
}

test().catch(console.error);
