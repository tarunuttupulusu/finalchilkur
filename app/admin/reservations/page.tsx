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

  return <ReservationsClient initialReservations={reservations} />;
}
