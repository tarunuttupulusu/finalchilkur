import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, logAdminAction } from '@/lib/auth';

// GET /api/cms/messages
// Protected (admin/staff only)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cms/messages
// Public (submit contact message)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields (name, email, phone, message)' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const msg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject: subject || null,
        message
      }
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully', data: msg });
  } catch (error: any) {
    console.error('Error creating contact message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/cms/messages (to mark as read/unread)
// Protected (admin/staff only)
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isRead } = body;

    if (!id || isRead === undefined) {
      return NextResponse.json({ success: false, error: 'Missing message ID or status' }, { status: 400 });
    }

    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { isRead }
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cms/messages
// Protected (admin/staff only)
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing message ID' }, { status: 400 });
    }

    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    await prisma.contactMessage.delete({ where: { id } });

    await logAdminAction(user.id, user.email, 'DELETE_CONTACT_MESSAGE', `From: ${msg.name} (${msg.email})`, msg, null);

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
