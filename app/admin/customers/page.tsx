"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserCheck, Calendar, DollarSign, Award, FileText,
  Loader2, AlertCircle, RefreshCw, Star, Info, Edit, Save, X
} from 'lucide-react';

export default function CustomersCMS() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [custNotes, setCustNotes] = useState('');
  const [custRating, setCustRating] = useState('REGULAR');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;

    setSavingNotes(true);
    try {
      const res = await fetch('/api/cms/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCust.id,
          notes: custNotes,
          segment: custRating
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingNotes(false);
        // Refresh local items
        loadCustomers();
        setSelectedCust((prev: any) => ({ ...prev, notes: custNotes, segment: custRating }));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const filtered = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.notes && c.notes.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Users size={14} className="text-brand-accent" />
            CRM Database
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Customer Directory
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Track frequent dining guests, total spend, check birthday/anniversary logs, and keep custom guest preference notes.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-brand-dark/10 hover:border-brand-accent text-brand-dark font-bold uppercase tracking-wider text-xs shadow-sm transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh Database</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-lg font-bold text-brand-dark">Syncing customer tables...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* List panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-brand-dark/5 shadow-sm space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#ECE3D4]/20 border border-brand-dark/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-brand-dark/5 divide-y divide-brand-dark/5 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <AlertCircle className="text-brand-dark/30 mb-2" size={32} />
                  <span className="text-xs text-brand-dark/50 font-bold uppercase">No Guests Found</span>
                </div>
              ) : (
                filtered.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => {
                      setSelectedCust(c);
                      setCustNotes(c.notes || '');
                      setCustRating(c.segment || 'REGULAR');
                      setIsEditingNotes(false);
                    }}
                    className={`p-4 cursor-pointer hover:bg-brand-dark/5 rounded-2xl transition-all flex items-center justify-between ${
                      selectedCust?.id === c.id ? 'bg-[#ECE3D4]/45 border border-brand-accent/25' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-accent/15 text-brand-accent flex items-center justify-center font-bold text-xs shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-display font-bold text-brand-dark text-xs truncate">{c.name}</h4>
                        <p className="text-[10px] text-brand-dark/45 font-mono truncate">{c.phone}</p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        c.segment === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.segment || 'REGULAR'}
                      </span>
                      <span className="text-[10px] text-brand-dark/60 font-semibold mt-1">
                        {c.visitsCount} visits
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details viewer */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-brand-dark/5 shadow-sm flex flex-col justify-between min-h-[300px]">
            {selectedCust ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-dark/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent text-[#F6EFE3] rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedCust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-dark text-base">{selectedCust.name}</h3>
                      <span className="text-xs text-brand-dark/50 font-mono block mt-0.5">
                        Email: {selectedCust.email} | Phone: {selectedCust.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI metrics cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-brand-bg border border-brand-dark/5 p-4 rounded-2xl text-center space-y-1">
                    <UserCheck size={16} className="text-brand-accent mx-auto" />
                    <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Total Visits</span>
                    <span className="font-display font-black text-brand-dark text-base">{selectedCust.visitsCount}</span>
                  </div>
                  <div className="bg-brand-bg border border-brand-dark/5 p-4 rounded-2xl text-center space-y-1">
                    <DollarSign size={16} className="text-brand-accent mx-auto" />
                    <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Total Spend</span>
                    <span className="font-display font-black text-brand-dark text-base">₹{selectedCust.totalSpend}</span>
                  </div>
                  <div className="bg-brand-bg border border-brand-dark/5 p-4 rounded-2xl text-center space-y-1">
                    <Award size={16} className="text-brand-accent mx-auto" />
                    <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Segment</span>
                    <span className="font-display font-black text-brand-dark text-base">{selectedCust.segment || 'REGULAR'}</span>
                  </div>
                </div>

                {/* Birthday & Anniversary notifications */}
                {(selectedCust.birthday || selectedCust.anniversary) && (
                  <div className="bg-[#ECE3D4]/30 rounded-xl p-4 border border-brand-dark/5 text-xs text-brand-dark/70 font-sans space-y-1">
                    <span className="block font-bold uppercase tracking-wider text-brand-dark/45 text-[9px]">Important Dates</span>
                    <div className="flex flex-wrap items-center gap-6">
                      {selectedCust.birthday && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Birthday: {new Date(selectedCust.birthday).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedCust.anniversary && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Anniversary: {new Date(selectedCust.anniversary).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Block */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">Guest Preference Notes</span>
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-xs font-bold text-brand-accent flex items-center gap-1"
                      >
                        <Edit size={12} />
                        <span>Edit Preferences</span>
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <form onSubmit={handleSaveNotes} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-brand-dark/45 mb-1">Guest Classification</label>
                          <select
                            value={custRating}
                            onChange={(e) => setCustRating(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="REGULAR">Regular Guest</option>
                            <option value="VIP">VIP Guest</option>
                            <option value="BLACKLISTED">Blacklisted Guest</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        value={custNotes}
                        onChange={(e) => setCustNotes(e.target.value)}
                        placeholder="Add notes about spice levels, seating choice, paneer dishes favorites..."
                        className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl p-4 text-xs font-sans focus:outline-none"
                        rows={3}
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingNotes(false)}
                          className="px-4 py-2 border rounded-xl text-xs font-bold uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingNotes}
                          className="px-4 py-2 bg-brand-accent text-white rounded-xl text-xs font-bold uppercase shadow-md disabled:opacity-50"
                        >
                          {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-[#ECE3D4]/25 p-5 rounded-2xl border border-brand-dark/5 text-xs text-brand-dark/80 font-sans leading-relaxed">
                      {selectedCust.notes || "No preferences logged yet. Click 'Edit Preferences' to add custom dining requests (e.g. less oil, prefers window seats)."}
                    </div>
                  )}
                </div>

                {/* Audit trail / reservation log summary */}
                <div className="space-y-2 pt-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">Reservation History</span>
                  <div className="bg-brand-bg rounded-xl border border-brand-dark/5 max-h-[150px] overflow-y-auto p-4 space-y-2 text-xs font-sans text-brand-dark/65">
                    {selectedCust.bookings && selectedCust.bookings.length > 0 ? (
                      selectedCust.bookings.map((b: any) => (
                        <div key={b.id} className="flex justify-between items-center border-b border-brand-dark/5 pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-bold text-brand-dark">{b.guestsCount} Guests</span>
                            <span className="text-[10px] text-brand-dark/45 block mt-0.5">
                              Status: {b.status}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono">
                            {new Date(b.dateTime).toLocaleDateString()} {new Date(b.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-brand-dark/40 block">No table reservations logged under this number.</span>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                <Users className="text-brand-dark/20 mb-4" size={48} />
                <h4 className="font-display text-base font-bold text-brand-dark">No Customer Selected</h4>
                <p className="text-xs text-brand-dark/50 mt-1 max-w-xs">
                  Click any patron profile on the left sidebar to view spending history, reservations, and preferences logs.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
