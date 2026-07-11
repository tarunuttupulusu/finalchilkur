import React from 'react';
import prisma from '@/lib/prisma';
import { MessageCircle, CheckCircle, Clock, Calendar, User, Phone, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersDashboard() {
  const orders = await prisma.whatsAppOrder.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/15 px-3 py-1 rounded-full border border-brand-accent/20">
            Realtime Feeds
          </span>
          <h1 className="text-3xl font-display font-black text-brand-dark mt-3">WhatsApp Orders</h1>
          <p className="text-brand-dark/60 font-sans text-sm mt-1">Manage delivery and pickup orders sent via WhatsApp client</p>
        </div>
      </div>

      {/* Grid displays orders as kitchen tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-brand-gold/10 shadow-sm">
            <MessageCircle className="mx-auto text-brand-dark/25 mb-4" size={48} />
            <h3 className="font-bold text-lg text-brand-dark">No Orders Placed Yet</h3>
            <p className="text-brand-dark/50 text-sm mt-1">Orders placed via the digital WhatsApp menu will appear here.</p>
          </div>
        ) : (
          orders.map((order) => {
            const items = (order.items as any[]) || [];
            const formattedTotal = order.total ? order.total.toString() : '0';
            
            return (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl border border-brand-gold/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative group"
              >
                {/* Header Ticket Bar */}
                <div className="bg-brand-dark p-6 text-[#F6EFE3] flex justify-between items-start border-b border-brand-gold/10">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                      Ref: {order.orderRef}
                    </span>
                    <h3 className="font-display font-bold text-lg mt-1 text-white">
                      {order.customerName}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-900/30 text-green-400 text-[10px] font-black uppercase rounded-lg border border-green-800/30">
                    <CheckCircle size={10} /> Logged
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-grow space-y-5 font-sans">
                  {/* Metadata Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-brand-dark/75 border-b border-brand-dark/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-brand-accent" />
                      <a href={`tel:${order.phone}`} className="hover:underline font-semibold">{order.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar size={14} className="text-brand-gold" />
                      <span>{order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Items Breakdown list */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/50 mb-3">
                      Order Checklist
                    </h4>
                    <ul className="space-y-3 bg-[#F6EFE3]/30 p-4 rounded-2xl border border-brand-gold/5 max-h-48 overflow-y-auto">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-lg text-xs">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-brand-dark">{item.name}</span>
                          </div>
                          <span className="text-brand-dark/70 font-semibold font-mono text-xs">
                            ₹{item.price * item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer POS bar */}
                <div className="px-6 py-5 bg-[#F6EFE3]/50 border-t border-brand-gold/10 flex justify-between items-center mt-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/55">
                    Order Total
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-brand-accent">₹</span>
                    <span className="text-xl font-black text-brand-accent font-mono">
                      {formattedTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
