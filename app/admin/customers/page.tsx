"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, UserCheck, Calendar, DollarSign, Award, FileText,
  Loader2, AlertCircle, RefreshCw, Star, Info, Edit, Save, X, Activity, Check
} from 'lucide-react';

export default function CustomersCMS() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Edit custom fields (autosaved)
  const [custNotes, setCustNotes] = useState('');
  const [custBirthday, setCustBirthday] = useState('');
  const [custAnniversary, setCustAnniversary] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers(isRefreshing = false) {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await fetch('/api/cms/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        if (data.customers && data.customers.length > 0 && !selectedPhone) {
          const firstCust = data.customers[0];
          setSelectedPhone(firstCust.phone);
          setCustNotes(firstCust.notes || '');
          setCustBirthday(firstCust.birthday || '');
          setCustAnniversary(firstCust.anniversary || '');
        }
      }
    } catch (e) {
      console.error('Failed to load guest list:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      c.phone.includes(term) ||
      (c.notes && c.notes.toLowerCase().includes(term))
    );
  }, [customers, debouncedSearch]);

  const selectedCust = useMemo(() => {
    return customers.find(c => c.phone === selectedPhone) || null;
  }, [customers, selectedPhone]);

  useEffect(() => {
    if (!selectedCust) return;

    const hasNotesChanged = custNotes !== (selectedCust.notes || '');
    const hasBdayChanged = custBirthday !== (selectedCust.birthday || '');
    const hasAnnivChanged = custAnniversary !== (selectedCust.anniversary || '');

    if (!hasNotesChanged && !hasBdayChanged && !hasAnnivChanged) {
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch('/api/cms/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: selectedCust.phone,
            notes: custNotes,
            birthday: custBirthday || '',
            anniversary: custAnniversary || ''
          })
        });
        const data = await res.json();
        if (data.success) {
          setSaveStatus('saved');
          setCustomers(prev => prev.map(c => 
            c.phone === selectedCust.phone 
              ? { ...c, notes: custNotes, birthday: custBirthday, anniversary: custAnniversary } 
              : c
          ));
          setTimeout(() => setSaveStatus('idle'), 1500);
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [custNotes, custBirthday, custAnniversary]);

  const lastVisitedTime = useMemo(() => {
    if (!selectedCust) return 'Never';
    const dates: number[] = [];
    if (Array.isArray(selectedCust.reservations)) {
      selectedCust.reservations.forEach((r: any) => {
        if (r.date) dates.push(Date.parse(r.date));
      });
    }
    if (Array.isArray(selectedCust.orderHistory)) {
      selectedCust.orderHistory.forEach((o: any) => {
        if (o.createdAt) dates.push(Date.parse(o.createdAt));
      });
    }
    if (dates.length === 0) return 'Never';
    const maxDate = Math.max(...dates);
    return new Date(maxDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, [selectedCust]);

  const getSegmentTag = (cust: any) => {
    const points = cust.loyaltyPoints || 0;
    if (points >= 150 || cust.visits >= 10) return { label: 'VIP GUEST', style: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (points >= 50 || cust.visits >= 3) return { label: 'REGULAR', style: 'bg-brand-bg border-brand-dark/10 text-brand-dark/80' };
    return { label: 'NEW GUEST', style: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-brand-dark/10 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Users size={12} className="text-brand-accent" />
            CRM Database
          </span>
          <h1 className="font-display text-2xl font-black text-brand-dark mt-2">
            Customer Directory
          </h1>
          <p className="text-xs text-brand-dark/65 mt-1">
            Track frequent dining guests, loyalty points, anniversaries, and manage detailed guest preference notes.
          </p>
        </div>

        <button
          onClick={() => loadCustomers(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand-dark/15 hover:border-brand-accent text-brand-dark hover:text-brand-accent text-[10px] font-bold uppercase transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin text-brand-accent' : 'text-brand-accent'} />
          <span>Refresh Database</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-brand-dark/10 shadow-sm">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-base font-bold text-brand-dark">Syncing customer tables...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* List panel */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="bg-white p-4 rounded-xl border border-brand-dark/10 shadow-sm">
              <div className="relative flex items-center bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2">
                <Search className="text-brand-dark/45 mr-2" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-brand-dark focus:outline-none placeholder-brand-dark/40"
                />
              </div>
            </div>

            {/* Customers preview list */}
            <div className="bg-white rounded-xl p-3 border border-brand-dark/10 divide-y divide-brand-dark/5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar shadow-sm">
              {filtered.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <AlertCircle className="text-brand-dark/30 mb-2" size={32} />
                  <span className="text-xs text-brand-dark/45 font-bold uppercase">No Guests Found</span>
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = selectedPhone === c.phone;
                  const tag = getSegmentTag(c);
                  
                  return (
                    <div 
                      key={c.phone}
                      onClick={() => {
                        setSelectedPhone(c.phone);
                        setCustNotes(c.notes || '');
                        setCustBirthday(c.birthday || '');
                        setCustAnniversary(c.anniversary || '');
                        setSaveStatus('idle');
                      }}
                      className={`p-4 cursor-pointer rounded-xl transition-all flex items-center justify-between my-0.5 border ${
                        isSelected 
                          ? 'bg-brand-accent text-[#F6EFE3] border-brand-accent/50 shadow-sm' 
                          : 'hover:bg-brand-bg/40 border-transparent text-brand-dark'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-brand-dark/20 text-[#F6EFE3] border border-brand-dark/30' : 'bg-brand-bg text-brand-dark/80'
                        }`}>
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-xs truncate">{c.name}</h4>
                          <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-[#F6EFE3]/80' : 'text-brand-dark/45'}`}>
                            {c.phone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                          isSelected ? 'bg-brand-dark/20 text-[#F6EFE3] border-brand-dark/30' : tag.style
                        }`}>
                          {tag.label}
                        </span>
                        <span className={`text-[10px] font-semibold mt-1 ${isSelected ? 'text-[#F6EFE3]/85' : 'text-brand-dark/50'}`}>
                          {c.visits} visits
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details viewer */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-brand-dark/10 shadow-sm flex flex-col min-h-[400px]">
            {selectedCust ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-dark/5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-accent text-[#F6EFE3] rounded-full flex items-center justify-center font-bold text-lg border border-brand-accent/20 shadow-sm">
                        {selectedCust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-brand-dark text-base">{selectedCust.name}</h3>
                        <span className="text-xs text-brand-dark/50 font-mono block mt-0.5">
                          Email: {selectedCust.email || 'N/A'} | Phone: {selectedCust.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded border text-[9px] font-extrabold uppercase tracking-wider ${getSegmentTag(selectedCust).style}`}>
                        {getSegmentTag(selectedCust).label}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Spend, Visits & Loyalty KPI cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-brand-bg/40 border border-brand-dark/10 p-4 rounded-xl text-center space-y-1">
                      <UserCheck size={16} className="text-brand-accent mx-auto" />
                      <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Total Visits</span>
                      <span className="font-display font-black text-brand-dark text-base">{selectedCust.visits}</span>
                    </div>
                    
                    <div className="bg-brand-bg/40 border border-brand-dark/10 p-4 rounded-xl text-center space-y-1">
                      <DollarSign size={16} className="text-brand-accent mx-auto" />
                      <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Lifetime Spend</span>
                      <span className="font-display font-black text-brand-dark text-base">₹{selectedCust.spending}</span>
                    </div>

                    <div className="bg-brand-bg/40 border border-brand-dark/10 p-4 rounded-xl text-center space-y-1">
                      <Award size={16} className="text-brand-accent mx-auto" />
                      <span className="block text-[9px] font-bold uppercase text-brand-dark/45">Loyalty Points</span>
                      <span className="font-display font-black text-brand-dark text-base">{selectedCust.loyaltyPoints || 0}</span>
                    </div>
                  </div>

                  {/* Profile metadata inputs with auto-save trackers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-brand-bg/30 border border-brand-dark/10 p-4 rounded-xl space-y-3">
                      <span className="block font-extrabold uppercase tracking-wider text-brand-accent text-[9px] flex items-center gap-1.5">
                        <Calendar size={11} /> Birthday Calendar
                      </span>
                      <input
                        type="date"
                        value={custBirthday}
                        onChange={(e) => setCustBirthday(e.target.value)}
                        className="w-full bg-white border border-brand-dark/15 rounded-lg px-2.5 py-1.5 text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div className="bg-brand-bg/30 border border-brand-dark/10 p-4 rounded-xl space-y-3">
                      <span className="block font-extrabold uppercase tracking-wider text-brand-accent text-[9px] flex items-center gap-1.5">
                        <Calendar size={11} /> Anniversary Calendar
                      </span>
                      <input
                        type="date"
                        value={custAnniversary}
                        onChange={(e) => setCustAnniversary(e.target.value)}
                        className="w-full bg-white border border-brand-dark/15 rounded-lg px-2.5 py-1.5 text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>

                  {/* Dynamic Detail layout metadata: last visited */}
                  <div className="bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-4 py-3 text-[10px] text-brand-dark/75 flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-brand-dark/45">Last Visited Timestamp</span>
                    <span className="font-mono font-bold text-brand-dark">{lastVisitedTime}</span>
                  </div>

                  {/* Interactive Preference Notes custom text area (Autosaved) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">Guest Preference Notes</span>
                      
                      {/* Autosave status indicator */}
                      <span className="text-[9px] font-semibold flex items-center gap-1">
                        {saveStatus === 'saving' && (
                          <span className="text-brand-dark/50 flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin text-brand-accent" /> Saving changes...
                          </span>
                        )}
                        {saveStatus === 'saved' && (
                          <span className="text-emerald-700 flex items-center gap-1 font-bold">
                            <Check size={10} /> Saved to CRM
                          </span>
                        )}
                        {saveStatus === 'error' && (
                          <span className="text-rose-600 font-bold">Failed to save</span>
                        )}
                      </span>
                    </div>

                    <textarea
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      placeholder="Add notes about spice levels, seating choice, paneer dishes favorites... (Auto-saves automatically)"
                      className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl p-4 text-xs font-sans focus:outline-none focus:border-brand-accent text-brand-dark placeholder-brand-dark/40"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Reservation history summary log */}
                <div className="space-y-2 pt-4 border-t border-brand-dark/10">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">Reservation History</span>
                  <div className="bg-brand-bg/30 rounded-xl border border-brand-dark/10 max-h-[140px] overflow-y-auto p-4 space-y-2 text-xs font-sans text-brand-dark/75 no-scrollbar">
                    {selectedCust.reservations && selectedCust.reservations.length > 0 ? (
                      selectedCust.reservations.map((b: any) => (
                        <div key={b.id} className="flex justify-between items-center border-b border-brand-dark/5 pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-bold text-brand-dark">{b.guests || b.guestsCount || 1} Guests</span>
                            <span className="text-[10px] text-brand-dark/50 block mt-0.5 capitalize">
                              Status: {b.status}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono">
                            {new Date(b.date).toLocaleDateString('en-IN')} {b.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-brand-dark/40 italic block">No table reservations logged under this number.</span>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                <Users className="text-brand-dark/20 mb-4" size={48} />
                <h4 className="font-display text-base font-bold text-brand-dark">No Customer Selected</h4>
                <p className="text-xs text-brand-dark/55 mt-1 max-w-xs leading-relaxed">
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
