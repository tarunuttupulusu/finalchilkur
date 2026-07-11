import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, logAdminAction } from '@/lib/auth';

// GET /api/cms/users
// Protected (admin only)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin role required' }, { status: 403 });
    }

    const userRoles = await prisma.adminUserRole.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, users: userRoles });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cms/users
// Protected (admin only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'Missing email or role' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const updatedUserRole = await prisma.adminUserRole.upsert({
      where: { email },
      update: { role },
      create: { email, role }
    });

    await logAdminAction(user.id, user.email, 'ASSIGN_USER_ROLE', `Assigned ${role} to ${email}`, null, updatedUserRole);

    return NextResponse.json({ success: true, user: updatedUserRole });
  } catch (error: any) {
    console.error('Error assigning role:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cms/users
// Protected (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing role record ID' }, { status: 400 });
    }

    const record = await prisma.adminUserRole.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    if (record.email === 'admin@restaurant.com' || record.email === user.email) {
      return NextResponse.json({ success: false, error: 'Cannot delete primary admin or own account' }, { status: 400 });
    }

    await prisma.adminUserRole.delete({ where: { id } });

    await logAdminAction(user.id, user.email, 'REMOVE_USER_ROLE', `Removed role for: ${record.email}`, record, null);

    return NextResponse.json({ success: true, message: 'User role removed successfully' });
  } catch (error: any) {
    console.error('Error removing role:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
