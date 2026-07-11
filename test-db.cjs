const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Database Connection...');
  
  // Create a branch if it doesn't exist
  let branch = await prisma.branch.findFirst();
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Test Branch',
        address: '123 Test St',
        phone: '1234567890',
        totalTables: 10,
        openingTime: '09:00',
        closingTime: '22:00'
      }
    });
    console.log('Created test branch:', branch.id);
  } else {
    console.log('Found existing branch:', branch.id);
  }

  // Count tables
  const tables = await prisma.table.count();
  console.log(`Tables count: ${tables}`);

  console.log('Database connection and models verified successfully!');
}

main()
  .catch(e => {
    console.error('Database connection failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
