// Run this to inspect database admin roles
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.adminUserRole.findMany();
  console.log('--- ADMIN ROLES IN DATABASE ---');
  roles.forEach(r => {
    console.log(`Email: ${r.email}, Role: ${r.role}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
