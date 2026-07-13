// Script to inspect database connectivity and table structures for all models in the schema.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING ALL-TABLE DATABASE INTEGRATION CHECK ---');

  const modelsToCheck = [
    { name: 'Branch', query: () => prisma.branch.count() },
    { name: 'Category', query: () => prisma.category.count() },
    { name: 'Dish', query: () => prisma.dish.count() },
    { name: 'Testimonial', query: () => prisma.testimonial.count() },
    { name: 'GalleryPhoto', query: () => prisma.galleryPhoto.count() },
    { name: 'Offer', query: () => prisma.offer.count() },
    { name: 'SiteSettings', query: () => prisma.siteSettings.count() },
    { name: 'WhatsAppOrder', query: () => prisma.whatsAppOrder.count() },
    { name: 'Reservation', query: () => prisma.reservation.count() },
    { name: 'ContactMessage', query: () => prisma.contactMessage.count() },
    { name: 'AuditLog', query: () => prisma.auditLog.count() }
  ];

  // 1. Check Prisma Client standard models
  for (const model of modelsToCheck) {
    try {
      const count = await model.query();
      console.log(`✅ Table [${model.name}] connected successfully! Count: ${count} rows`);
    } catch (e) {
      console.error(`❌ Table [${model.name}] check failed:`, e.message);
    }
  }

  // 2. Check Custom SQL boot-strapped table (admin_login_sessions)
  console.log('\nChecking custom admin_login_sessions table...');
  try {
    const sessions = await prisma.$queryRawUnsafe('SELECT COUNT(*)::integer as count FROM admin_login_sessions');
    console.log(`✅ Table [admin_login_sessions] connected successfully! Count: ${sessions[0].count} rows`);
  } catch (e) {
    console.error('❌ Table [admin_login_sessions] check failed:', e.message);
  }

  console.log('\n--- ALL DATABASE TABLE CHECKS COMPLETED ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
