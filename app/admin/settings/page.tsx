import React from 'react';
import prisma from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: 'asc' }
  });

  // Load website settings for booking badge
  const websiteSettingsRow = await prisma.siteSettings.findUnique({
    where: { key: 'website_settings' }
  });

  const websiteSettings = websiteSettingsRow ? JSON.parse(websiteSettingsRow.value) : {
    bookingBadgeText: 'Special Offer',
    bookingBadgeActive: true,
    bookingBadgeColor: '#D35400'
  };

  return <SettingsClient branches={branches} websiteSettings={websiteSettings} />;
}
