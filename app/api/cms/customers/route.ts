import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, logAdminAction } from '@/lib/auth';

// GET /api/cms/customers
// Protected (admin/staff only)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Fetch all reservations and WhatsApp orders to aggregate
    const [reservations, orders, metaSetting] = await Promise.all([
      prisma.reservation.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.whatsAppOrder.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.siteSettings.findUnique({
        where: { key: 'customer_metadata' }
      })
    ]);

    const metadataMap = metaSetting ? JSON.parse(metaSetting.value) : {};

    const customersMap: any = {};

    // 1. Process reservations
    reservations.forEach((r: any) => {
      const phone = r.phone.replace(/\s+/g, '').slice(-10); // Standardize phone
      if (!phone) return;

      if (!customersMap[phone]) {
        customersMap[phone] = {
          name: r.customerName,
          phone: r.phone,
          email: r.email || '',
          visits: 0,
          orders: 0,
          spending: 0,
          reservations: [],
          orderHistory: [],
          birthday: metadataMap[phone]?.birthday || '',
          anniversary: metadataMap[phone]?.anniversary || '',
          notes: metadataMap[phone]?.notes || '',
        };
      }

      customersMap[phone].reservations.push({
        id: r.id,
        bookingRef: r.bookingRef,
        date: r.date,
        time: r.time,
        guests: r.guests,
        status: r.status
      });

      if (r.status === 'completed' || r.status === 'arrived') {
        customersMap[phone].visits += 1;
      }
    });

    // 2. Process orders
    orders.forEach((o: any) => {
      const phone = o.phone.replace(/\s+/g, '').slice(-10);
      if (!phone) return;

      if (!customersMap[phone]) {
        customersMap[phone] = {
          name: o.customerName || 'WhatsApp Customer',
          phone: o.phone,
          email: '',
          visits: 0,
          orders: 0,
          spending: 0,
          reservations: [],
          orderHistory: [],
          birthday: metadataMap[phone]?.birthday || '',
          anniversary: metadataMap[phone]?.anniversary || '',
          notes: metadataMap[phone]?.notes || '',
        };
      }

      const totalNum = Number(o.total) || 0;
      customersMap[phone].orders += 1;
      customersMap[phone].spending += totalNum;

      customersMap[phone].orderHistory.push({
        id: o.id,
        orderRef: o.orderRef,
        total: totalNum,
        status: o.status,
        createdAt: o.createdAt
      });
    });

    // Convert map to list and apply search filters
    let customersList = Object.values(customersMap).map((c: any) => {
      // Calculate loyalty points: 10 points per visit, 1 point per 10 rupees spent
      const loyaltyPoints = (c.visits * 10) + Math.floor(c.spending / 10);
      return {
        ...c,
        loyaltyPoints
      };
    });

    if (search) {
      const lower = search.toLowerCase();
      customersList = customersList.filter((c: any) => 
        c.name.toLowerCase().includes(lower) ||
        c.phone.includes(lower) ||
        c.email.toLowerCase().includes(lower)
      );
    }

    return NextResponse.json({ success: true, customers: customersList });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cms/customers
// To update birthday, anniversary, loyalty details or customer notes.
// Protected.
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, birthday, anniversary, notes } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Missing phone number' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, '').slice(-10);

    const metaSetting = await prisma.siteSettings.findUnique({
      where: { key: 'customer_metadata' }
    });

    const metadataMap = metaSetting ? JSON.parse(metaSetting.value) : {};

    metadataMap[cleanPhone] = {
      ...metadataMap[cleanPhone],
      birthday: birthday !== undefined ? birthday : metadataMap[cleanPhone]?.birthday || '',
      anniversary: anniversary !== undefined ? anniversary : metadataMap[cleanPhone]?.anniversary || '',
      notes: notes !== undefined ? notes : metadataMap[cleanPhone]?.notes || '',
    };

    await prisma.siteSettings.upsert({
      where: { key: 'customer_metadata' },
      update: { value: JSON.stringify(metadataMap) },
      create: { key: 'customer_metadata', value: JSON.stringify(metadataMap) }
    });

    return NextResponse.json({ success: true, customer: metadataMap[cleanPhone] });
  } catch (error: any) {
    console.error('Error updating customer metadata:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
