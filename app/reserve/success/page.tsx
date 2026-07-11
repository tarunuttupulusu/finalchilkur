"use client";
import React, { Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingRef = searchParams.get('ref');
  const token = searchParams.get('token');

  if (!bookingRef || !token) {
    return (
      <div className="text-center space-y-6">
        <AlertTriangle size={64} className="mx-auto text-brand-accent opacity-50" />
        <h2 className="text-2xl font-display font-bold text-brand-dark">Invalid Booking</h2>
        <p className="text-brand-dark/70 font-sans">No booking reference or token found.</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-full">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-dark/10">
      <div className="bg-green-600 p-8 text-center text-white relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-white/80 font-sans text-sm">We look forward to serving you.</p>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-dark/50 font-bold mb-1">Booking Reference</p>
          <p className="font-mono text-3xl font-bold text-brand-dark tracking-wider">{bookingRef}</p>
        </div>

        <div className="bg-[#F6EFE3] p-6 rounded-2xl w-full border border-brand-gold/30 relative overflow-hidden flex flex-col items-center shadow-inner">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-gold rounded-full opacity-20" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-brand-accent rounded-full opacity-10" />
          
          <div className="flex items-center gap-2 mb-4 text-brand-dark font-bold uppercase tracking-widest text-sm z-10">
            <Ticket size={18} className="text-brand-accent" />
            <span>10% Discount Offer</span>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md z-10 mb-4 border border-brand-dark/5">
            <QRCodeSVG 
              value={token} 
              size={200}
              level="H"
              fgColor="#1A1C19"
              bgColor="#FFFFFF"
            />
          </div>
          
          <p className="text-xs text-center font-sans text-brand-dark/60 z-10 max-w-[200px]">
            Show this secure QR code at the billing counter to claim your online booking discount.
          </p>
        </div>

        <Link 
          href="/"
          className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark/70 hover:text-brand-accent transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 min-h-screen relative overflow-hidden flex items-center justify-center bg-[#F6EFE3]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full z-10"
      >
        <Suspense fallback={<div className="text-center font-bold font-sans">Loading details...</div>}>
          <SuccessContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
