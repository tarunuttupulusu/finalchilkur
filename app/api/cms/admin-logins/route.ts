import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

// Self-bootstrapping: create table if it doesn't exist yet
async function ensureTable() {
  try {
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
      )
    `);
  } catch (e) {
    // Table probably already exists or schema engine busy — ignore
    console.warn('[admin-logins] ensureTable warning:', e);
  }
}

// GET — fetch all admin login sessions, newest first
export async function GET(req: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Use raw SQL so we don't need Prisma client re-generation
    const sessions: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, admin_email, login_at, photo_base64, latitude, longitude, ip_address, user_agent, created_at
      FROM admin_login_sessions
      ORDER BY login_at DESC
      LIMIT $1
    `, limit);

    // Normalize column names to camelCase for the frontend
    const normalized = sessions.map((s: any) => ({
      id: s.id,
      adminEmail: s.admin_email,
      loginAt: s.login_at,
      photoBase64: s.photo_base64,
      latitude: s.latitude,
      longitude: s.longitude,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      createdAt: s.created_at,
    }));

    return NextResponse.json({ success: true, sessions: normalized });
  } catch (error: any) {
    console.error('[admin-logins GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — record a new admin login snapshot
export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const body = await req.json();
    const { adminEmail, photoBase64, latitude, longitude } = body;

    if (!adminEmail) {
      return NextResponse.json({ success: false, error: 'adminEmail is required' }, { status: 400 });
    }

    // Get IP from request headers
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      '127.0.0.1';

    const userAgent = headersList.get('user-agent') || '';

    await prisma.$executeRawUnsafe(`
      INSERT INTO admin_login_sessions (admin_email, photo_base64, latitude, longitude, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      adminEmail,
      photoBase64 ?? null,
      latitude ?? null,
      longitude ?? null,
      ip,
      userAgent
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin-logins POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
