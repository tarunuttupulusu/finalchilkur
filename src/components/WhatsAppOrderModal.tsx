"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Phone, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onSuccess: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  cart,
  cartTotal,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/whatsapp/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          phone: formData.phone,
          items: cart,
          total: cartTotal
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send order');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess(); // Clear cart in parent
      }, 3000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#F7E7CE] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {success ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-brand-dark">Order Sent!</h3>
              <p className="text-brand-dark/70 font-sans mt-2">
                We've received your order and will confirm via WhatsApp shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-green-600 p-6 text-white relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-full">
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">WhatsApp Order</h3>
                </div>
                <p className="text-white/80 font-sans text-sm">
                  Complete your details to send this order securely to our kitchen via WhatsApp.
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-brand-dark/5">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-brand-dark/50 mb-3 border-b border-brand-dark/10 pb-2">Order Summary</h4>
                  <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm font-sans font-medium text-brand-dark">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center font-bold text-brand-dark pt-3 border-t border-brand-dark/10">
                    <span>Total Amount</span>
                    <span className="text-brand-accent text-lg">₹{cartTotal}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
                      {error}
                    </div>
                  )}

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={18} />
                    <input 
                      required 
                      type="text" 
                      placeholder="Your Full Name"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-white border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={18} />
                    <input 
                      required 
                      type="tel" 
                      placeholder="WhatsApp Number (e.g. +91...)"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full py-4 mt-2 bg-green-600 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_6px_0_0_#166534] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#166534] active:translate-y-[6px] active:shadow-[0_0px_0_0_#166534] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Place Order via WhatsApp</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
