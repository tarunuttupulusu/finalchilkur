import React from 'react';
import prisma from '@/lib/prisma';
import { Settings, Save, MapPin, Phone, Store, Percent } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const branch = await prisma.branch.findFirst();

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
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Title */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/15 px-3 py-1 rounded-full border border-brand-accent/20">
          Core Config
        </span>
        <h1 className="text-3xl font-display font-black text-brand-dark mt-3">Branch Settings</h1>
        <p className="text-brand-dark/60 font-sans text-sm mt-1">Manage public branch addresses, phone lines, and discount banners.</p>
      </div>

      {/* Main Form container */}
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
      
      {/* Discount config cards */}
      <div className="bg-white rounded-3xl border border-brand-gold/10 shadow-md overflow-hidden opacity-80">
        <div className="p-6 md:p-8 border-b border-brand-dark/5 bg-brand-gold/5 flex items-center gap-3">
          <Percent className="text-brand-gold" size={22} />
          <div>
            <h2 className="font-display font-bold text-lg text-brand-dark">Active Campaigns</h2>
            <p className="text-xs text-brand-dark/50 font-sans">Campaign triggers and automated discounts</p>
          </div>
        </div>
        <div className="p-6 md:p-8 font-sans">
          <div className="bg-[#F6EFE3]/40 border border-brand-gold/20 p-5 rounded-2xl">
            <p className="text-sm font-semibold text-brand-dark leading-relaxed">
              🏷️ <span className="font-black text-brand-accent uppercase">Online Booking Campaign (10% Off)</span> is currently active system-wide. Customers completing reservations on the frontend are auto-issued cryptographic QR tokens claiming this discount at scanning.
            </p>
            <p className="text-xs text-brand-dark/40 mt-3 font-semibold">
              Advanced toggle switches, start-end timelines, and custom discount rate adjustments will roll out in Phase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
