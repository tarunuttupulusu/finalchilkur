"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Mail, CheckCircle2, Loader2 } from 'lucide-react';

const STATIC_BRANCHES = [
  {
    name: "Moinabad Branch",
    address: "4-15/2part, Aziz Nagar, Himayat Sagar Rd, Moinabad, Telangana 500075",
    phone: "098494 98681",
    mapEmbedUrl: "https://maps.google.com/maps?q=Balaji%20Santosh%20Family%20Dhaba%20Aziz%20Nagar%20Himayat%20Sagar%20Rd%20Moinabad%20Telangana&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapNavUrl: "https://www.google.com/maps/search/?api=1&query=Balaji+Santosh+Family+Dhaba+Aziz+Nagar+Himayat+Sagar+Rd+Moinabad+Telangana",
    rating: "4.1 ★ (63 reviews)",
    openingTime: "11:00",
    closingTime: "23:00"
  },
  {
    name: "PRAGATHI NAGAR BRANCH",
    address: "1 2nd floor, HMT Rd, above The Kakatiya Co-operative Bank, Chinthal, Quthbullapur, Hyderabad, Telangana 500037",
    phone: "098494 98681",
    mapEmbedUrl: "https://maps.google.com/maps?q=1%202nd%20floor,%20HMT%20Rd,%20above%20The%20kakatiya%20co-operative%20Bank.LTD,%20beside%20Ridge%20Towers,%20Chinthal,%20Quthbullapur,%20Hyderabad,%20Telangana%20500037&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapNavUrl: "https://maps.app.goo.gl/dt45g7WKVFb1gq8K8",
    rating: "4.3 ★ (19 reviews)",
    openingTime: "11:00",
    closingTime: "23:00"
  }
];

export const ContactPage: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: 'Catering', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch('/api/cms/branches');
        const data = await res.json();
        if (data.success && data.branches.length > 0) {
          setBranches(data.branches.map((b: any) => ({
            name: b.name,
            address: b.address,
            phone: b.phone,
            mapEmbedUrl: b.id === '52ae6a0f-daee-40f5-aa0e-ac44e17d325e' 
              ? "https://maps.google.com/maps?q=Balaji%20Santosh%20Family%20Dhaba%20Aziz%20Nagar%20Himayat%20Sagar%20Rd%20Moinabad%20Telangana&t=&z=15&ie=UTF8&iwloc=&output=embed"
              : "https://maps.google.com/maps?q=1%202nd%20floor,%20HMT%20Rd,%20above%20The%20kakatiya%20co-operative%20Bank.LTD,%20beside%20Ridge%20Towers,%20Chinthal,%20Quthbullapur,%20Hyderabad,%20Telangana%20500037&t=&z=15&ie=UTF8&iwloc=&output=embed",
            mapNavUrl: b.id === '52ae6a0f-daee-40f5-aa0e-ac44e17d325e'
              ? "https://www.google.com/maps/search/?api=1&query=Balaji+Santosh+Dhaba+Aziz+Nagar+Himayat+Sagar+Rd+Moinabad+Telangana"
              : "https://www.google.com/maps/search/?api=1&query=1+2nd+floor,+HMT+Rd,+above+The+kakatiya+co-operative+Bank.LTD,+beside+Ridge+Towers,+Chinthal,+Quthbullapur,+Hyderabad,+Telangana+500037",
            rating: b.id === '52ae6a0f-daee-40f5-aa0e-ac44e17d325e' ? "4.1 ★ (63 reviews)" : "4.3 ★ (19 reviews)",
            openingTime: b.openingTime,
            closingTime: b.closingTime
          })));
        }
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBranches();
  }, []);

  const displayBranches = branches.length > 0 ? branches : STATIC_BRANCHES;
  const branch = displayBranches[activeBranch] || displayBranches[0] || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cms/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: `Contact Inquiry: ${formData.interest}`,
          message: formData.message || `No message. Interest: ${formData.interest}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', interest: 'Catering', message: '' });
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to send contact inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 bg-brand-bg noise-overlay min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
        <p className="font-display text-xl font-bold text-brand-dark">Loading Contact Details...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-brand-bg noise-overlay min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Get in Touch</span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-brand-dark mt-3">
            Contact & Reservations
          </h1>
          <p className="text-brand-dark/70 font-sans text-sm md:text-base mt-4">
            Have questions about catering, private dining, or food recommendations? Our team is delighted to assist you.
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg justify-center px-4">
            {displayBranches.map((b, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBranch(idx)}
                className={`flex-1 px-6 py-3.5 rounded-2xl font-display font-extrabold text-sm transition-all duration-300 border shadow-sm ${
                  activeBranch === idx
                    ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-md scale-[1.02]'
                    : 'bg-[#ECE3D4]/40 hover:bg-[#ECE3D4]/70 text-brand-dark border-brand-dark/10 hover:border-brand-dark/20'
                }`}
              >
                📍 {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-stretch">
          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-brand-dark text-[#F6EFE3] p-8 md:p-12 rounded-2xl transition-all duration-500">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Direct Lines</span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold mt-3 mb-8">
                {branch.name}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-brand-gold mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F6EFE3]/50">Address</h4>
                    <p className="text-sm mt-1 leading-relaxed">{branch.address}</p>
                  </div>
                </div>

                {branch.phone && (
                  <div className="flex items-start space-x-4">
                    <Phone className="text-brand-gold mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#F6EFE3]/50">Phone</h4>
                      <a href={`tel:${branch.phone.replace(/\s+/g, '')}`} className="text-sm font-semibold hover:text-brand-gold mt-1 block">
                        {branch.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <Clock className="text-brand-gold mt-1 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F6EFE3]/50">Hours of Operation</h4>
                    <p className="text-sm mt-1">Daily: {branch.openingTime || '11:00'} AM – {branch.closingTime || '23:00'} PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="text-brand-gold mt-1 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F6EFE3]/50">Email Support</h4>
                    <p className="text-sm mt-1">contact@balajisantoshdhaba.com</p>
                  </div>
                </div>
              </div>
            </div>

            {branch.rating && (
              <div className="pt-8 border-t border-[#F6EFE3]/15">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Google Rating</h4>
                <p className="font-display text-2xl font-black text-[#F6EFE3] mt-1">{branch.rating}</p>
              </div>
            )}
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 bg-[#ECE3D4]/40 p-8 md:p-12 rounded-2xl border border-brand-dark/5 flex flex-col justify-center">
            {isSubmitted ? (
              <div className="text-center py-12 flex flex-col items-center">
                <CheckCircle2 size={56} className="text-green-600 mb-4" />
                <h3 className="font-display text-2xl font-bold text-brand-dark">Message Received Successfully!</h3>
                <p className="text-sm font-sans text-brand-dark/75 mt-2 max-w-sm">
                  Thank you for contacting Balaji Chilkur Family Dhaba. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-brand-dark/65 mb-2">Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/15 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-brand-dark/65 mb-2">Email *</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-dark/15 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-brand-dark/65 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-dark/15 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-xs font-bold uppercase tracking-widest text-brand-dark/65 mb-2">Inquiry Type</label>
                  <select 
                    id="interest"
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/15 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent transition-colors"
                  >
                    <option value="Catering">Bulk Catering Inquiry</option>
                    <option value="TableBooking">Special Occasion Dining</option>
                    <option value="Feedback">Feedback / Suggestions</option>
                    <option value="General">Other Queries</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-brand-dark/65 mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/15 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-bg font-bold uppercase tracking-wider text-xs py-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <span>Send Inquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Embedded styled Map */}
        {branch.mapEmbedUrl && (
          <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-brand-dark/10 shadow-md transition-all duration-500">
            <iframe 
              title={`${branch.name} Location Map`}
              src={branch.mapEmbedUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
            />
          </div>
        )}

      </div>
    </div>
  );
};
