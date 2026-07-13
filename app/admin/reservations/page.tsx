import React from 'react';
import prisma from '@/lib/prisma';
import ReservationsClient from './ReservationsClient';

export const dynamic = 'force-dynamic';

export default async function ReservationsManagementPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: [
      { date: 'desc' },
      { time: 'desc' }
    ]
  });

  // Serialize Prisma DateTime objects to plain primitives for the Client Component
  const serialized = reservations.map((r) => {
    // For @db.Date fields, Prisma returns a Date at midnight UTC.
    // Use UTC getters so the date is always the correct calendar date.
    let dateStr = '';
    if (r.date instanceof Date) {
      const y = r.date.getUTCFullYear();
      const m = String(r.date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(r.date.getUTCDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;   // e.g. "2026-07-13"
    } else {
      dateStr = String(r.date);
    }

    return {
      ...r,
      date: dateStr,
      createdAt: r.createdAt.toISOString(),
      qrScannedAt: r.qrScannedAt ? r.qrScannedAt.toISOString() : null,
    };
  });


  return <ReservationsClient initialReservations={serialized} />;
}
