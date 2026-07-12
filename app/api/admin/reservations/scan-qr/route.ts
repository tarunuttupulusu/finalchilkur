import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'fallback-dev-secret-key-12345';

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Authentication (Supabase)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Uncomment in production once auth is fully integrated
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { qrToken, bookingRef, isVoucher, voucherToken, billNo, rewardAmt, discountPercent, expiry } = body;

    // Handle Checkout Loyalty Voucher QR Verification
    if (isVoucher) {
      const tokenToVerify = voucherToken || bookingRef; // Fallback if input via bookingRef
      
      if (!tokenToVerify) {
        return NextResponse.json({ error: 'Voucher Token is required' }, { status: 400 });
      }

      // Find coupon setting in SiteSettings
      const setting = await prisma.siteSettings.findUnique({
        where: { key: `coupon:${tokenToVerify}` }
      });

      if (!setting) {
        return NextResponse.json({ error: 'Invalid Voucher Token (Not found in ledger)' }, { status: 400 });
      }

      const coupon = JSON.parse(setting.value);

      // Verify Status (Cancelled)
      if (coupon.isCancelled) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Voucher has been cancelled)' }, { status: 400 });
      }

      // Verify Status (Already Redeemed)
      if (coupon.isUsed) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Voucher has already been redeemed)' }, { status: 400 });
      }

      // Verify Expiry Date
      if (coupon.expiryEpoch && Date.now() > coupon.expiryEpoch) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Voucher has expired)' }, { status: 400 });
      }

      // Verify Tamper/Modification of URL parameters
      if (billNo && coupon.billNo !== billNo) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Bill reference mismatch - URL tampered)' }, { status: 400 });
      }
      if (rewardAmt && Number(coupon.discountValue) !== Number(rewardAmt)) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Discount amount mismatch - URL tampered)' }, { status: 400 });
      }
      if (discountPercent && Number(coupon.discountPercent) !== Number(discountPercent)) {
        return NextResponse.json({ error: 'Voucher status: REJECTED (Discount rate percentage mismatch - URL tampered)' }, { status: 400 });
      }
      if (expiry) {
        const storedExpiryDateStr = new Date(coupon.expiryEpoch).toISOString().split('T')[0];
        if (storedExpiryDateStr !== expiry) {
          return NextResponse.json({ error: 'Voucher status: REJECTED (Expiry date mismatch - URL tampered)' }, { status: 400 });
        }
      }

      // Mark voucher as redeemed once checks pass
      coupon.isUsed = true;
      coupon.usedAt = new Date().toISOString();
      if (user && user.email) {
        coupon.redeemedBy = user.email;
      }

      await prisma.siteSettings.update({
        where: { key: `coupon:${tokenToVerify}` },
        data: {
          value: JSON.stringify(coupon)
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Voucher verified & marked redeemed successfully!',
        isVoucher: true,
        voucher: coupon
      });
    }

    // Default Booking Reservation Ticket QR Verification
    let bookingRefToFind = '';

    if (bookingRef) {
      bookingRefToFind = bookingRef;
    } else {
      if (!qrToken) {
        return NextResponse.json({ error: 'QR Token or Booking Reference is required' }, { status: 400 });
      }

      // Validate HMAC Signature
      const [payloadBase64, signature] = qrToken.split('.');
      if (!payloadBase64 || !signature) {
        return NextResponse.json({ error: 'Invalid QR token format' }, { status: 400 });
      }

      const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const expectedSignature = crypto.createHmac('sha256', QR_SECRET_KEY).update(payloadString).digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid or tampered QR code signature' }, { status: 403 });
      }

      const payload = JSON.parse(payloadString);
      bookingRefToFind = payload.bookingRef;
    }

    // Find Reservation
    const reservation = await prisma.reservation.findUnique({
      where: { bookingRef: bookingRefToFind }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.discountVerified) {
      return NextResponse.json({ error: 'Discount already claimed for this reservation' }, { status: 400 });
    }

    // Update Reservation
    const updatedReservation = await prisma.reservation.update({
      where: { bookingRef: bookingRefToFind },
      data: {
        discountVerified: true,
        qrScannedAt: new Date(),
        status: 'arrived'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'QR Code verified! 10% Discount applied.',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('QR Scan Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
