import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// This would interact with the WhatsApp Cloud API in Phase 2
// For Phase 1, it just saves the order to the database

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, items, total } = body;

    if (!phone || !items || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique order reference (e.g., ORD-A9B4C)
    const orderRef = 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create order in database
    const order = await prisma.whatsAppOrder.create({
      data: {
        orderRef,
        customerName,
        phone,
        items,
        total,
        status: 'sent'
      }
    });

    // Here we would trigger the WhatsApp Cloud API message using a pre-approved template
    // e.g., await sendWhatsAppMessage(phone, templateName, variables)

    return NextResponse.json({
      success: true,
      order,
      message: 'WhatsApp order saved successfully!'
    }, { status: 201 });

  } catch (error) {
    console.error('WhatsApp Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
