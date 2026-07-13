// Run this to fix the user's role to 'admin' in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emailToFix = 'tarunuttupulusu@gmail.com';
  console.log(`Fixing role for ${emailToFix}...`);
  
  const updated = await prisma.adminUserRole.upsert({
    where: { email: emailToFix },
    update: { role: 'admin' },
    create: { email: emailToFix, role: 'admin' }
  });

  console.log(`✅ Success! User role is now: ${updated.role}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
