"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, Clock, Search, Filter, Phone, Users, Plus, 
  X, Mail, FileText, Loader2, AlertCircle, Edit, Save, Trash2, Check,
  User, CheckSquare, Square
} from 'lucide-react';

export default function ReservationsClient({ initialReservations }: { initialReservations: any[] }) {
  const [reservations, setReservations] = useState<any[]>(initialReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'arrived'>('all');

  // Modal State for manual entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Manual Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [branchId, setBranchId] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    setLoadingBranches(true);
    try {
      const res = await fetch('/api/cms/branches');
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches || []);
        if (data.branches?.length > 0) {
          setBranchId(data.branches[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBranches(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleClaim = async (id: string, currentClaimed: boolean) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, discountVerified: !currentClaimed })
      });
      const data = await res.json();
      if (data.success) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, discountVerified: !currentClaimed } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !date || !time || !branchId) {
      alert("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          customerName,
          phone,
          email: email || null,
          guests: parseInt(guests),
          date,
          time,
          specialInstructions: specialInstructions || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setReservations(prev => [data.reservation, ...prev]);
        setShowAddModal(false);
        resetForm();
      } else {
        alert(data.error || "Failed to create reservation");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setPhone('');
    setEmail('');
    setGuests('2');
    setDate('');
    setTime('19:00');
    setSpecialInstructions('');
  };

  const filtered = reservations.filter((res) => {
    const matchesSearch = 
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.phone.includes(searchTerm) ||
      res.bookingRef.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'claimed') matchesStatus = res.discountVerified;
    else if (statusFilter === 'pending') matchesStatus = !res.discountVerified;
    else if (statusFilter !== 'all') matchesStatus = res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent bg-brand-accent/15 px-3 py-1 rounded-full border border-brand-accent/20">
            Booking & Reservation Database
          </span>
          <h1 className="text-3xl font-display font-black text-brand-dark mt-3">Reservations Console</h1>
          <p className="text-brand-dark/60 font-sans text-sm mt-1">Manage dinner slots, manual table bookings, and customer discount verifications.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-brand-accent/25 transition-all"
        >
          <Plus size={16} />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={18} />
          <input 
            type="text"
            placeholder="Search by name, phone, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl py-3 pl-12 pr-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all text-xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#ECE3D4]/25 p-1.5 rounded-xl border border-brand-dark/5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {(['all', 'pending', 'claimed', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-brand-dark text-[#F6EFE3] shadow-md'
                  : 'text-brand-dark/60 hover:text-brand-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Database list card */}
      <div className="bg-white rounded-3xl border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-dark/5 text-[10px] font-black uppercase tracking-widest text-brand-dark/50 bg-[#F6EFE3]/10">
                <th className="p-5 pl-6">Ref ID</th>
                <th className="p-5">Customer Details</th>
                <th className="p-5">Date & Time</th>
                <th className="p-5">Size</th>
                <th className="p-5">Discount (10% Off)</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-brand-dark/40 font-medium">No reservations match the filters.</td>
                </tr>
              ) : (
                filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-[#F6EFE3]/15 transition-colors">
                    <td className="p-5 pl-6 font-mono font-bold text-brand-dark">{res.bookingRef}</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-dark">{res.customerName}</div>
                      <div className="text-[10px] text-brand-dark/55 flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-brand-accent" />
                        {res.phone}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1 font-semibold text-brand-dark">
                        <Calendar size={12} className="text-brand-gold" />
                        {new Date(res.date).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-brand-dark/50 mt-0.5">{res.time}</div>
                    </td>
                    <td className="p-5 font-bold text-brand-dark">
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-brand-accent/50" />
                        <span>{res.guests} pax</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleToggleClaim(res.id, res.discountVerified)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border transition-colors ${
                          res.discountVerified
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {res.discountVerified ? (
                          <>
                            <CheckCircle size={10} />
                            <span>Claimed</span>
                          </>
                        ) : (
                          <>
                            <Clock size={10} />
                            <span>Unclaimed</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-5">
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateStatus(res.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border focus:outline-none ${
                          res.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          res.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          res.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          res.status === 'arrived' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="arrived">Arrived</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-5 pr-6 text-right font-sans text-brand-dark/50">
                      {res.specialInstructions ? (
                        <span className="text-[10px] italic border-b border-dashed border-brand-dark/30 cursor-help" title={res.specialInstructions}>
                          Has Notes
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Create Booking Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreateBooking} className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                Manual Booking Entry
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Outlet Branch *</label>
                {loadingBranches ? (
                  <div className="py-2 text-xs text-brand-dark/50 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Loading branches...</span>
                  </div>
                ) : (
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Guest Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balaji"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98494 98681"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. custom@guest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Total Guests *</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                    <option key={n} value={n}>{n} Guests</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Schedule Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Slot Time *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19:30"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Special seating or dining instructions</label>
                <textarea
                  placeholder="Spice levels, extra chairs, near garden, window seat preferences..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                {saving ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
