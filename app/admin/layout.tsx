"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  QrCode, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  User,
  Home,
  UtensilsCrossed,
  Image,
  Tag,
  MessageSquare,
  Inbox,
  Users,
  ShieldAlert,
  Database
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Reservations', path: '/admin/reservations', icon: Calendar },
    { name: 'WhatsApp Orders', path: '/admin/orders', icon: MessageCircle },
    { name: 'QR Scanner', path: '/admin/scanner', icon: QrCode },
    { name: 'Menu Editor', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Gallery CMS', path: '/admin/gallery', icon: Image },
    { name: 'Homepage CMS', path: '/admin/homepage', icon: Home },
    { name: 'Offers / Promos', path: '/admin/offers', icon: Tag },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Customer Inbox', path: '/admin/messages', icon: Inbox },
    { name: 'Customer DB', path: '/admin/customers', icon: Users },
    { name: 'Audit Trail', path: '/admin/audit', icon: ShieldAlert },
    { name: 'Backups & Seed', path: '/admin/backup', icon: Database },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F6EFE3] overflow-hidden font-sans selection:bg-brand-accent selection:text-[#F6EFE3]">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-brand-dark text-[#F6EFE3] flex flex-col border-r border-brand-gold/10 shadow-2xl z-30 hidden lg:flex">
        {/* Header Branding */}
        <div className="p-8 border-b border-brand-gold/10 flex items-center gap-4">
          <div className="relative p-1 bg-[#F6EFE3] rounded-full border border-brand-gold/20 shadow-lg">
            <img src="/bsd-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <span className="font-display font-black uppercase tracking-wider text-base leading-tight text-brand-gold drop-shadow-sm">
              Balaji Chilkur
            </span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#F6EFE3]/50 mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-8 px-6 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-sans text-sm font-semibold uppercase tracking-wider ${
                  isActive 
                    ? 'bg-brand-gold text-brand-dark shadow-xl shadow-brand-gold/10 transform translate-x-1 border border-brand-gold/20' 
                    : 'text-[#F6EFE3]/70 hover:bg-brand-gold/5 hover:text-brand-gold'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-dark' : 'text-[#F6EFE3]/50 group-hover:text-brand-gold'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Session Footer */}
        <div className="p-6 border-t border-brand-gold/10 bg-black/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition-all duration-300 font-bold uppercase tracking-wider text-xs"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className="lg:hidden w-full bg-brand-dark text-[#F6EFE3] px-6 py-4 flex justify-between items-center border-b border-brand-gold/10 shadow-lg z-30">
          <div className="flex items-center gap-3">
            <img src="/bsd-logo.png" alt="Logo" className="w-10 h-10 object-contain p-0.5 bg-[#F6EFE3] rounded-full" />
            <span className="font-display font-black uppercase text-sm tracking-wider text-brand-gold">
              BSD Admin
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-brand-gold hover:bg-white/5 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10 pb-28 lg:pb-10 relative">
          <div className="absolute inset-0 noise-overlay opacity-[0.015] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Fallback Navigation) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-brand-dark/95 z-40 backdrop-blur-md flex flex-col pt-24 px-6 pb-6">
            <nav className="flex-grow flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold uppercase tracking-wider text-sm ${
                      isActive 
                        ? 'bg-brand-gold text-brand-dark' 
                        : 'text-[#F6EFE3]/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-brand-gold/10 pt-6">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-brand-accent text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-brand-accent/20"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
