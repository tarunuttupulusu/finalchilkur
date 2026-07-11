"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, Clock, MapPin, Tag, Star, 
  X, Check, Loader2, Sparkles, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export default function OffersCMS() {
  const [offers, setOffers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  // Offer fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('Limited Time');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/menu');
  const [priority, setPriority] = useState(1);
  
  // Custom structured fields (serialized inside description)
  const [descriptionText, setDescriptionText] = useState('');
  const [comboDishes, setComboDishes] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [targetBranches, setTargetBranches] = useState<string[]>([]); // Array of branch IDs

  // Scheduling & expire states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Toggles
  const [isActive, setIsActive] = useState(true);
  const [showOnHomepage, setShowOnHomepage] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [offersRes, branchesRes, menuRes] = await Promise.all([
        fetch('/api/cms/offers'),
        fetch('/api/cms/branches'),
        fetch('/api/cms/menu')
      ]);
      const offersData = await offersRes.json();
      const branchesData = await branchesRes.json();
      const menuData = await menuRes.json();
      
      if (offersData.success) setOffers(offersData.offers);
      if (branchesData.success) setBranches(branchesData.branches);
      if (menuData.success && Array.isArray(menuData.categories)) {
        const list: any[] = [];
        menuData.categories.forEach((cat: any) => {
          if (Array.isArray(cat.dishes)) {
            cat.dishes.forEach((d: any) => {
              list.push(d);
            });
          }
        });
        setDishes(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Parse structured description helper
  const parseDescription = (desc: string) => {
    try {
      if (desc && desc.trim().startsWith('{')) {
        const parsed = JSON.parse(desc);
        return {
          comboDishes: Array.isArray(parsed.comboDishes) ? parsed.comboDishes : [],
          discountType: parsed.discountType || 'percentage',
          discountValue: parsed.discountValue || '',
          targetBranches: Array.isArray(parsed.targetBranches) ? parsed.targetBranches : [],
          text: parsed.text || ''
        };
      }
    } catch (e) {
      // Fail silently
    }
    return {
      comboDishes: [],
      discountType: 'percentage',
      discountValue: '',
      targetBranches: [],
      text: desc || ''
    };
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Promotion Name is required.');
      return;
    }
    if (!discountValue.trim()) {
      alert('Discount value is required.');
      return;
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      alert('Invalid timing block: Start Date must be before End Date.');
      return;
    }

    setSaving(true);
    try {
      const isEditing = !!editingOffer;
      const method = isEditing ? 'PUT' : 'POST';

      // Serialize custom configuration fields directly inside description
      const serializedDescription = JSON.stringify({
        comboDishes,
        discountType,
        discountValue,
        targetBranches,
        text: descriptionText.trim()
      });

      // Automatically format price tag based on discount type
      const formattedPrice = discountType === 'percentage' 
        ? `-${discountValue}% OFF` 
        : `₹${discountValue} OFF`;

      const payload: any = {
        title: title.trim(),
        description: serializedDescription,
        price: formattedPrice,
        badge: badge.trim() || (discountType === 'percentage' ? `${discountValue}% Off` : 'Special Discount'),
        image: image.trim() || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop',
        link: link.trim() || '/menu',
        displayPriority: Number(priority),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive,
        showOnHomepage,
        branchId: targetBranches.length === 1 ? targetBranches[0] : null // Single branch link if exactly one, else global
      };

      const res = await fetch('/api/cms/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isEditing 
          ? JSON.stringify({ id: editingOffer.id, data: payload }) 
          : JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        resetForm();
        loadData();
      } else {
        alert(data.error || 'Failed to save promotion');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setTitle('');
    setDescriptionText('');
    setPrice('');
    setBadge('Limited Time');
    setImage('');
    setLink('/menu');
    setPriority(1);
    setStartDate('');
    setEndDate('');
    setComboDishes([]);
    setDiscountType('percentage');
    setDiscountValue('');
    setTargetBranches([]);
    setIsActive(true);
    setShowOnHomepage(true);
  };

  const handleEditClick = (offer: any) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setBadge(offer.badge || 'Limited Time');
    setImage(offer.image || '');
    setLink(offer.link || '/menu');
    setPriority(offer.displayPriority || 1);
    setStartDate(offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : '');
    setEndDate(offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : '');
    setIsActive(offer.isActive);
    setShowOnHomepage(offer.showOnHomepage);

    const parsed = parseDescription(offer.description);
    setDescriptionText(parsed.text);
    setComboDishes(parsed.comboDishes);
    setDiscountType(parsed.discountType as any);
    setDiscountValue(parsed.discountValue);
    setTargetBranches(parsed.targetBranches.length > 0 
      ? parsed.targetBranches 
      : (offer.branchId ? [offer.branchId] : [])
    );

    setIsModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This action is permanent.')) return;
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

  // Optimistic UI updates
  const handleToggleActive = async (offer: any) => {
    // 1. Optimistic update
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o));

    try {
      const res = await fetch('/api/cms/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer.id,
          data: {
            title: offer.title,
            description: offer.description,
            price: offer.price,
            image: offer.image,
            badge: offer.badge,
            cta: offer.cta,
            link: offer.link,
            isActive: !offer.isActive,
            startDate: offer.startDate,
            endDate: offer.endDate,
            showOnHomepage: offer.showOnHomepage,
            displayPriority: offer.displayPriority,
            branchId: offer.branchId
          }
        })
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: offer.isActive } : o));
        alert(data.error || 'Failed to update active status on server');
      }
    } catch (e) {
      console.error(e);
      // Rollback
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: offer.isActive } : o));
    }
  };

  const handleBranchCheckboxChange = (branchId: string, checked: boolean) => {
    if (checked) {
      setTargetBranches(prev => [...prev, branchId]);
    } else {
      setTargetBranches(prev => prev.filter(id => id !== branchId));
    }
  };

  const handleDishCheckboxChange = (dishName: string, checked: boolean) => {
    if (checked) {
      setComboDishes(prev => [...prev, dishName]);
    } else {
      setComboDishes(prev => prev.filter(name => name !== dishName));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Header (Desaturated corporate palette styling) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Sparkles size={12} className="text-zinc-400" />
            Limited Promotions Manager
          </span>
          <h1 className="font-display text-2xl font-black text-zinc-800 mt-2">
            Offers & Combos CMS
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Schedule combo platter discounts, specify active timings, and target specific branch outlets.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider text-[10px] shadow-sm border border-zinc-700 transition-all"
        >
          <Plus size={12} />
          <span>Create Promotion</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-zinc-500 mb-4" size={48} />
          <p className="font-display text-base font-bold text-zinc-700">Loading restaurant offers schema...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.length === 0 ? (
            /* Empty State Container */
            <div className="bg-white rounded-2xl p-16 border border-zinc-200 text-center flex flex-col items-center shadow-sm">
              <AlertCircle className="text-zinc-400 mb-4" size={48} />
              <h3 className="font-display text-base font-bold text-zinc-700">No Promotions Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Create your first limited promotion combo.</p>
            </div>
          ) : (
            /* Dynamic Grid rendering */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const parsed = parseDescription(offer.description);
                const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                
                // Get human readable branch targets
                let branchLabel = 'All Branches';
                if (parsed.targetBranches && parsed.targetBranches.length > 0) {
                  const names = parsed.targetBranches.map(id => branches.find(b => b.id === id)?.name || id);
                  branchLabel = names.join(', ');
                } else if (offer.branchId) {
                  branchLabel = branches.find(b => b.id === offer.branchId)?.name || 'Specified Branch';
                }

                return (
                  <div 
                    key={offer.id} 
                    className={`bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      !offer.isActive || isExpired ? 'opacity-70 border-dashed bg-zinc-50' : ''
                    }`}
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative h-48 bg-zinc-950">
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                        
                        {/* Status badges */}
                        <div className="absolute top-4 left-4 flex gap-1.5">
                          <span className="bg-zinc-900/80 border border-zinc-800 text-white px-2.5 py-1 rounded text-[8px] font-extrabold uppercase tracking-wider">
                            {offer.badge}
                          </span>
                          
                          <span className={`px-2.5 py-1 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                            isExpired ? 'bg-rose-50 text-rose-800 border border-rose-100' : offer.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}>
                            {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>

                        {/* Top-Right priority rating */}
                        <div className="absolute top-4 right-4 bg-black/60 text-zinc-300 text-[8px] font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Star size={10} fill="currentColor" className="text-zinc-400" />
                          <span>Priority {offer.displayPriority}</span>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-1">
                              <MapPin size={10} />
                              {branchLabel}
                            </span>
                            <h3 className="font-display font-black text-white text-lg mt-1 leading-tight">{offer.title}</h3>
                          </div>
                          
                          <span className="font-display font-black text-white text-xl">
                            {offer.price}
                          </span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                          {parsed.text || 'No description provided.'}
                        </p>

                        {/* Combo Items tags */}
                        {parsed.comboDishes && parsed.comboDishes.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Included Dishes</span>
                            <div className="flex flex-wrap gap-1">
                              {parsed.comboDishes.map((dishName, i) => (
                                <span key={i} className="bg-zinc-50 border border-zinc-200 rounded text-[9px] font-semibold text-zinc-600 px-2 py-0.5">
                                  {dishName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Validity Dates */}
                        {(offer.startDate || offer.endDate) && (
                          <div className="bg-zinc-50/50 rounded-xl p-3 border border-zinc-200 text-[10px] text-zinc-500 font-sans space-y-1">
                            <span className="block font-bold uppercase tracking-wider text-zinc-400">Validity Window</span>
                            <div className="flex flex-wrap items-center gap-4">
                              {offer.startDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={11} className="text-zinc-400" />
                                  <span>Starts: {new Date(offer.startDate).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {offer.endDate && (
                                <div className="flex items-center gap-1.5">
                                  <Clock size={11} className="text-zinc-400" />
                                  <span>Expires: {new Date(offer.endDate).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          disabled={isExpired}
                          onChange={() => handleToggleActive(offer)}
                          className="rounded text-zinc-800 border-zinc-300 focus:ring-zinc-850 disabled:opacity-50"
                        />
                        <span className="text-[9px] font-extrabold uppercase text-zinc-500">
                          {offer.isActive ? 'Active live' : 'Deactivated'}
                        </span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(offer)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded transition-colors"
                          title="Edit Offer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form onSubmit={handleSaveOffer} className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-250 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-display font-black text-lg text-zinc-800">
                {editingOffer ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Promotion Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                    placeholder="e.g. 15% Off Family platters"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Description *</label>
                  <textarea
                    required
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                    placeholder="Provide details about combo discount, coupon terms..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-800"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Discount Value *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 or 150"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                    />
                  </div>
                </div>

                {/* Combo Items (Dishes Multi-Select Checkbox grid) */}
                <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    🍔 Select Combo Dishes
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                    {dishes.length === 0 ? (
                      <span className="text-[10px] text-zinc-400 italic">No menu items found</span>
                    ) : (
                      dishes.map((dish) => (
                        <label key={dish.id} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comboDishes.includes(dish.name)}
                            onChange={(e) => handleDishCheckboxChange(dish.name, e.target.checked)}
                            className="rounded text-zinc-800 border-zinc-300 focus:ring-zinc-800"
                          />
                          <span>{dish.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste unsplash or media URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Display Priority</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Promotion Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /menu"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                    />
                  </div>
                </div>

                {/* Target Branches (Checkbox group) */}
                <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    📍 Target Branches
                  </span>
                  <div className="space-y-2">
                    {branches.map(b => (
                      <label key={b.id} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={targetBranches.includes(b.id)}
                          onChange={(e) => handleBranchCheckboxChange(b.id, e.target.checked)}
                          className="rounded text-zinc-800 border-zinc-300 focus:ring-zinc-800"
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date range picker scheduler */}
                <div className="border border-zinc-200 rounded-xl p-3 space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    🕒 Active Timings
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1.5 text-[10px] focus:outline-none focus:border-zinc-400 text-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1.5 text-[10px] focus:outline-none focus:border-zinc-400 text-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnHomepage}
                      onChange={(e) => setShowOnHomepage(e.target.checked)}
                      className="rounded text-zinc-800 focus:ring-zinc-800"
                    />
                    <span>Show on Homepage promos card slider</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-zinc-800 focus:ring-zinc-800"
                    />
                    <span>Mark as Activated</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm border border-zinc-750"
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
