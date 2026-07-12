import React from 'react';
import prisma from '@/lib/prisma';
import { Save, MapPin, Phone, Store, Percent } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const branch = await prisma.branch.findFirst();

  // Load website settings for booking badge
  const websiteSettingsRow = await prisma.siteSettings.findUnique({
    where: { key: 'website_settings' }
  });

  const websiteSettings = websiteSettingsRow ? JSON.parse(websiteSettingsRow.value) : {
    bookingBadgeText: 'Special Offer',
    bookingBadgeActive: true,
    bookingBadgeColor: '#D35400'
  };

  // Server Action 1: Update Branch settings
  async function updateSettings(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (branch) {
      await prisma.branch.update({
        where: { id: branch.id },
        data: { name, phone, address }
      });
      revalidatePath('/admin/settings');
      revalidatePath('/');
    }
  }

  // Server Action 2: Update Campaign Badge settings
  async function updateCampaignSettings(formData: FormData) {
    'use server';
    const badgeText = formData.get('bookingBadgeText') as string;
    const badgeActive = formData.get('bookingBadgeActive') === 'on';
    const badgeColor = formData.get('bookingBadgeColor') as string;

    await prisma.siteSettings.upsert({
      where: { key: 'website_settings' },
      update: {
        value: JSON.stringify({
          bookingBadgeText: badgeText || 'Special Offer',
          bookingBadgeActive: badgeActive,
          bookingBadgeColor: badgeColor || '#D35400'
        })
      },
      create: {
        key: 'website_settings',
        value: JSON.stringify({
          bookingBadgeText: badgeText || 'Special Offer',
          bookingBadgeActive: badgeActive,
          bookingBadgeColor: badgeColor || '#D35400'
        })
      }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/');
  }

  return (
    <div className="space-y-10 max-w-4xl font-sans">
      {/* Title */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/15 px-3 py-1 rounded-full border border-brand-accent/20">
          Core Config
        </span>
        <h1 className="text-3xl font-display font-black text-brand-dark mt-3">Branch Settings</h1>
        <p className="text-brand-dark/60 font-sans text-sm mt-1">Manage public branch addresses, phone lines, and discount banners.</p>
      </div>

      {/* Card 1: Restaurant Metadata */}
      <div className="bg-white rounded-3xl border border-brand-gold/10 shadow-md overflow-hidden">
        <div className="p-6 md:p-8 border-b border-brand-dark/5 bg-[#F6EFE3]/25 flex items-center gap-3">
          <Store className="text-brand-accent" size={22} />
          <div>
            <h2 className="font-display font-bold text-lg text-brand-dark">Restaurant Metadata</h2>
            <p className="text-xs text-brand-dark/50 font-sans">These values update public contact cards dynamically</p>
          </div>
        </div>

        <form action={updateSettings} className="p-6 md:p-8 space-y-6 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/60 ml-1">
                Branch Display Name
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/35" size={16} />
                <input 
                  name="name"
                  type="text"
                  required
                  defaultValue={branch?.name || ''}
                  className="w-full bg-[#F6EFE3]/25 border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/60 ml-1">
                Support Line
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/35" size={16} />
                <input 
                  name="phone"
                  type="text"
                  required
                  defaultValue={branch?.phone || ''}
                  className="w-full bg-[#F6EFE3]/25 border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/60 ml-1">
              Physical Location & Maps Coordinates
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-brand-dark/35" size={16} />
              <textarea 
                name="address"
                required
                defaultValue={branch?.address || ''}
                rows={3}
                className="w-full bg-[#F6EFE3]/25 border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-brand-dark/5 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3.5 bg-brand-dark text-white font-bold uppercase tracking-widest rounded-xl hover:bg-brand-accent transition-colors flex items-center gap-2 text-xs shadow-md"
            >
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Card 2: Campaign Configuration */}
      <div className="bg-white rounded-3xl border border-brand-gold/10 shadow-md overflow-hidden">
        <div className="p-6 md:p-8 border-b border-brand-dark/5 bg-brand-gold/5 flex items-center gap-3">
          <Percent className="text-brand-gold" size={22} />
          <div>
            <h2 className="font-display font-bold text-lg text-brand-dark">Active Campaigns & Booking Badges</h2>
            <p className="text-xs text-brand-dark/50 font-sans">Customize the promotional badge text and styles shown on the reservation button.</p>
          </div>
        </div>
        
        <form action={updateCampaignSettings} className="p-6 md:p-8 space-y-6 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/60 ml-1">
                Booking Badge Promo Text
              </label>
              <input 
                name="bookingBadgeText"
                type="text"
                defaultValue={websiteSettings.bookingBadgeText || 'Special Offer'}
                placeholder="e.g. Special Offer, Book & Save, 10% OFF"
                className="w-full bg-[#F6EFE3]/25 border border-brand-dark/10 rounded-xl py-3 px-4 text-brand-dark font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
              />
              <span className="text-[10px] text-brand-dark/40 block ml-1">Fallback is "Special Offer" if left empty.</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/60 ml-1">
                Badge Color Hex Accent
              </label>
              <div className="flex gap-3 items-center">
                <input 
                  name="bookingBadgeColor"
                  type="color"
                  defaultValue={websiteSettings.bookingBadgeColor || '#D35400'}
                  className="w-12 h-12 border border-brand-dark/10 rounded-xl cursor-pointer p-1 bg-white"
                />
                <input 
                  type="text"
                  value={websiteSettings.bookingBadgeColor || '#D35400'}
                  readOnly
                  className="bg-zinc-50 border border-brand-dark/10 rounded-xl py-3 px-4 text-brand-dark font-mono text-xs w-28 text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#FAF6EE] p-4 rounded-2xl border border-brand-dark/5">
            <input 
              name="bookingBadgeActive"
              type="checkbox"
              id="bookingBadgeActive"
              defaultChecked={websiteSettings.bookingBadgeActive !== false}
              className="w-4 h-4 text-brand-accent border-brand-dark/10 rounded focus:ring-brand-accent accent-[#D35400]"
            />
            <label htmlFor="bookingBadgeActive" className="text-xs font-bold uppercase tracking-wider text-brand-dark/80 cursor-pointer select-none">
              Display Booking Promotion Badge on Public Website
            </label>
          </div>

          <div className="pt-6 border-t border-brand-dark/5 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3.5 bg-brand-dark text-white font-bold uppercase tracking-widest rounded-xl hover:bg-brand-accent transition-colors flex items-center gap-2 text-xs shadow-md"
            >
              <Save size={16} />
              <span>Save Campaign Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
