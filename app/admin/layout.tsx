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
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans selection:bg-zinc-700 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800/80 shadow-md z-30 hidden lg:flex font-sans">
        {/* Header Branding */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center gap-4">
          <div className="relative p-1 bg-zinc-800 rounded-full border border-zinc-700 shadow-md">
            <img src="/bsd-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <span className="font-display font-black uppercase tracking-wider text-sm leading-tight text-white drop-shadow-sm">
              Balaji Chilkur
            </span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-sans text-[11px] font-bold uppercase tracking-wider border ${
                  isActive 
                    ? 'bg-zinc-800 text-white shadow-sm border-zinc-700' 
                    : 'text-zinc-400 border-transparent hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Session Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200 transition-all duration-200 font-bold uppercase tracking-wider text-[10px]"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className="lg:hidden w-full bg-zinc-950 text-zinc-100 px-6 py-4 flex justify-between items-center border-b border-zinc-800 z-30">
          <div className="flex items-center gap-3">
            <img src="/bsd-logo.png" alt="Logo" className="w-8 h-8 object-contain p-0.5 bg-zinc-800 rounded-full border border-zinc-700" />
            <span className="font-display font-black uppercase text-xs tracking-wider text-white">
              BSD Admin
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10 pb-28 lg:pb-10 relative">
          <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Fallback Navigation) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-zinc-950/95 z-40 backdrop-blur-md flex flex-col pt-24 px-6 pb-6">
            <nav className="flex-grow flex flex-col gap-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold uppercase tracking-wider text-xs border ${
                      isActive 
                        ? 'bg-zinc-800 text-white border-zinc-700' 
                        : 'text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-zinc-800 pt-6">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold uppercase tracking-widest text-xs"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
