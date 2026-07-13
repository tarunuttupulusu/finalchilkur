// Run this to simulate the login flow, submit a selfie/location, and verify DB entry
// Usage: node prisma/test-login-flow.cjs

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- STARTING LOGIN FLOW INTEGRATION TEST ---');
  
  // 1. Simulate POST request data
  const testEmail = 'trial-admin@balajichilkur.com';
  const testPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const testLat = 17.3850;
  const testLng = 78.4867;

  console.log('1. Submitting test snapshot to /api/cms/admin-logins...');
  try {
    const res = await fetch('http://localhost:3000/api/cms/admin-logins', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
      },
      body: JSON.stringify({
        adminEmail: testEmail,
        photoBase64: testPhoto,
        latitude: testLat,
        longitude: testLng
      })
    });
    
    const data = await res.json();
    if (data.success) {
      console.log('✅ POST request succeeded!');
    } else {
      console.error('❌ POST request failed:', data.error);
    }
  } catch (e) {
    console.error('❌ Network request error:', e.message);
  }

  // 2. Query the database using Prisma to check if record exists
  console.log('\n2. Verifying database record via Prisma...');
  try {
    const sessions = await prisma.$queryRawUnsafe(
      'SELECT id, admin_email, latitude, longitude, ip_address, user_agent, created_at FROM admin_login_sessions WHERE admin_email = $1 ORDER BY created_at DESC LIMIT 1',
      testEmail
    );

    if (sessions && sessions.length > 0) {
      const s = sessions[0];
      console.log('✅ DB Record Verified successfully!');
      console.log('   - ID:', s.id);
      console.log('   - Email:', s.admin_email);
      console.log('   - Coordinates:', `${s.latitude}, ${s.longitude}`);
      console.log('   - IP Address:', s.ip_address);
      console.log('   - Device:', s.user_agent);
      console.log('   - Created At:', s.created_at);
    } else {
      console.error('❌ No database record found for email:', testEmail);
    }
  } catch (e) {
    console.error('❌ Database verification error:', e.message);
  }

  // 3. Query GET route to see if API responds with correct normalized json
  console.log('\n3. Verifying GET /api/cms/admin-logins response...');
  try {
    const res = await fetch('http://localhost:3000/api/cms/admin-logins?limit=1');
    const data = await res.json();
    if (data.success && data.sessions.length > 0) {
      const s = data.sessions[0];
      console.log('✅ GET request returned latest record correctly!');
      console.log('   - Normalized Email:', s.adminEmail);
      console.log('   - Photo Base64 string length:', s.photoBase64 ? s.photoBase64.length : 0);
    } else {
      console.error('❌ GET request verification failed or empty.');
    }
  } catch (e) {
    console.error('❌ GET request error:', e.message);
  }

  console.log('\n--- TEST COMPLETE ---');
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
