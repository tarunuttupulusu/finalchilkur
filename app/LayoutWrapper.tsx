"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '../src/components/Navbar';
import { Footer } from '../src/components/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
