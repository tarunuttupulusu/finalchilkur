// Run this to inspect database contents
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.$queryRawUnsafe(
    'SELECT id, admin_email, LENGTH(photo_base64) as photo_len, photo_base64, latitude, longitude FROM admin_login_sessions ORDER BY created_at DESC'
  );
  console.log('--- DB ADMIN LOGIN SESSIONS ---');
  sessions.forEach(s => {
    console.log(`Email: ${s.admin_email}`);
    console.log(`Photo length: ${s.photo_len}`);
    console.log(`Photo substring: ${s.photo_base64 ? s.photo_base64.substring(0, 50) + '...' : 'NULL'}`);
    console.log(`Coords: ${s.latitude}, ${s.longitude}`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
