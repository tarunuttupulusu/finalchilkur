import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastSeenOrders = searchParams.get('lastSeen_orders');
    const lastSeenReservations = searchParams.get('lastSeen_reservations');
    const lastSeenQueries = searchParams.get('lastSeen_queries');

    // 1. WhatsApp Orders: status = 'sent' AND createdAt > lastSeenOrders (if provided)
    const whatsappOrders = await prisma.whatsAppOrder.count({
      where: {
        status: 'sent',
        ...(lastSeenOrders ? { createdAt: { gt: new Date(lastSeenOrders) } } : {})
      }
    });

    // 2. Reservations: status = 'pending' AND createdAt > lastSeenReservations (if provided)
    const reservations = await prisma.reservation.count({
      where: {
        status: 'pending',
        ...(lastSeenReservations ? { createdAt: { gt: new Date(lastSeenReservations) } } : {})
      }
    });

    // 3. Testimonials: unapproved (isApproved = false)
    const testimonials = await prisma.testimonial.count({
      where: { isApproved: false }
    });

    // 4. Contact messages / Queries: isRead = false AND createdAt > lastSeenQueries (if provided)
    const queries = await prisma.contactMessage.count({
      where: {
        isRead: false,
        ...(lastSeenQueries ? { createdAt: { gt: new Date(lastSeenQueries) } } : {})
      }
    });

    return NextResponse.json({
      success: true,
      counts: {
        whatsapp_orders: whatsappOrders,
        reservations,
        testimonials,
        queries
      }
    });
  } catch (error: any) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
