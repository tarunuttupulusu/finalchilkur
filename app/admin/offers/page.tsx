"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, Clock, MapPin, Tag, Star, 
  X, Check, Loader2, Sparkles, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export default function OffersCMS() {
  const [offers, setOffers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  // Offer fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('Limited Time');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/menu');
  const [priority, setPriority] = useState(1);
  
  // Scheduling & expire states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Toggles
  const [isActive, setIsActive] = useState(true);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  
  // Branch target mapping
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [offersRes, branchesRes] = await Promise.all([
        fetch('/api/cms/offers'),
        fetch('/api/cms/branches')
      ]);
      const offersData = await offersRes.json();
      const branchesData = await branchesRes.json();
      
      if (offersData.success) setOffers(offersData.offers);
      if (branchesData.success) setBranches(branchesData.branches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSaving(true);
    try {
      const method = editingOffer ? 'PUT' : 'POST';
      const body = {
        id: editingOffer?.id,
        title,
        description,
        price,
        badge,
        image: image || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop',
        link,
        priority: Number(priority),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive,
        showOnHomepage,
        branchId: selectedBranchId === 'All' ? null : selectedBranchId
      };

      const res = await fetch('/api/cms/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        resetForm();
        loadData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setBadge('Limited Time');
    setImage('');
    setLink('/menu');
    setPriority(1);
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setShowOnHomepage(true);
    setSelectedBranchId('All');
  };

  const handleEditClick = (offer: any) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description || '');
    setPrice(offer.price || '');
    setBadge(offer.badge || 'Limited Time');
    setImage(offer.image || '');
    setLink(offer.link || '/menu');
    setPriority(offer.priority || 1);
    setStartDate(offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : '');
    setEndDate(offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : '');
    setIsActive(offer.isActive);
    setShowOnHomepage(offer.showOnHomepage);
    setSelectedBranchId(offer.branchId || 'All');
    setIsModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/cms/offers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (offer: any) => {
    try {
      const res = await fetch('/api/cms/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offer,
          isActive: !offer.isActive
        })
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Sparkles size={14} className="text-brand-gold animate-pulse" />
            Limited Promotions Manager
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Offers & Combos CMS
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Schedule combo platter discounts, specify active timings, and target specific branch outlets.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-brand-accent/20 transition-all"
        >
          <Plus size={14} />
          <span>Create Promotion</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-lg font-bold text-brand-dark">Loading restaurant offers schema...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-brand-dark/5 text-center flex flex-col items-center">
              <AlertCircle className="text-brand-dark/30 mb-4" size={48} />
              <h3 className="font-display text-lg font-bold text-brand-dark">No Promotions Found</h3>
              <p className="text-sm text-brand-dark/50 mt-1">Create your first limited promotion combo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const targetBranchName = branches.find(b => b.id === offer.branchId)?.name || 'All Branches';
                const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                
                return (
                  <div 
                    key={offer.id} 
                    className={`bg-white border border-brand-dark/5 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      !offer.isActive || isExpired ? 'opacity-70 border-dashed bg-brand-dark/5' : ''
                    }`}
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative h-48 bg-brand-dark">
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                        
                        {/* Status badges */}
                        <div className="absolute top-4 left-4 flex gap-1.5">
                          <span className="bg-brand-accent text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                            {offer.badge}
                          </span>
                          
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                            isExpired ? 'bg-red-100 text-red-800' : offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>

                        {/* Top-Right Star priority rating */}
                        <div className="absolute top-4 right-4 bg-black/60 text-brand-gold text-[9px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                          <Star size={10} fill="currentColor" />
                          <span>Priority {offer.priority}</span>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F6EFE3]/60 flex items-center gap-1">
                              <MapPin size={10} />
                              {targetBranchName}
                            </span>
                            <h3 className="font-display font-black text-[#F6EFE3] text-xl mt-1 leading-tight">{offer.title}</h3>
                          </div>
                          
                          <span className="font-display font-black text-brand-gold text-2xl">
                            {offer.price}
                          </span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-6 space-y-4">
                        <p className="text-xs text-brand-dark/70 font-sans leading-relaxed">
                          {offer.description || 'No description provided.'}
                        </p>

                        {/* Validity Dates */}
                        {(offer.startDate || offer.endDate) && (
                          <div className="bg-[#ECE3D4]/30 rounded-xl p-3 border border-brand-dark/5 text-[10px] text-brand-dark/60 font-sans space-y-1">
                            <span className="block font-bold uppercase tracking-wider text-brand-dark/45">Validity Window</span>
                            <div className="flex flex-wrap items-center gap-4">
                              {offer.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>Starts: {new Date(offer.startDate).toLocaleString()}</span>
                                </div>
                              )}
                              {offer.endDate && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>Expires: {new Date(offer.endDate).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="px-6 py-4 bg-[#ECE3D4]/25 border-t border-brand-dark/5 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          disabled={isExpired}
                          onChange={() => handleToggleActive(offer)}
                          className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent disabled:opacity-50"
                        />
                        <span className="text-[10px] font-bold uppercase text-brand-dark/60">
                          {offer.isActive ? 'Active live' : 'Deactivated'}
                        </span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(offer)}
                          className="p-2 text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                          title="Edit Offer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Offer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Offer form Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form onSubmit={handleSaveOffer} className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                {editingOffer ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    placeholder="e.g. 15% Off Family platters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    placeholder="Provide details about menu item, billing terms, skipping queues..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Discount/Price tag</label>
                    <input
                      type="text"
                      placeholder="e.g. -15% or ₹1499"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Limited Offer"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste unspash or media URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-[#ECE3D4]/20 border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Display Priority</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-[#ECE3D4]/20 border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Target Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    >
                      <option value="All">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-brand-dark/10 rounded-2xl p-4 space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65">
                    🕒 Scheduler & Expiry
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-brand-dark/50 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-2.5 py-2 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-brand-dark/50 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-2.5 py-2 text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnHomepage}
                      onChange={(e) => setShowOnHomepage(e.target.checked)}
                      className="rounded text-brand-accent"
                    />
                    <span>Show on Homepage promos card slider</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-brand-accent"
                    />
                    <span>Mark as Activated</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                {saving ? 'Saving...' : editingOffer ? 'Save Promotion' : 'Publish Promotion'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
