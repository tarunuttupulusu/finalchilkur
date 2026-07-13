// Run this once to create the admin_login_sessions table
// Usage: npx ts-node --compiler-options "{\"module\":\"commonjs\"}" prisma/create-login-sessions.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS admin_login_sessions (
      id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      admin_email  TEXT NOT NULL,
      login_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      photo_base64 TEXT,
      latitude     DOUBLE PRECISION,
      longitude    DOUBLE PRECISION,
      ip_address   TEXT,
      user_agent   TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ admin_login_sessions table created (or already exists)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
