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

  const handleToggleActive = async (offer: any) => {
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
        setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: offer.isActive } : o));
        alert(data.error || 'Failed to update active status on server');
      }
    } catch (e) {
      console.error(e);
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-brand-dark/10 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Sparkles size={12} className="text-brand-accent" />
            Limited Promotions Manager
          </span>
          <h1 className="font-display text-2xl font-black text-brand-dark mt-2">
            Offers & Combos CMS
          </h1>
          <p className="text-xs text-brand-dark/65 mt-1">
            Schedule combo platter discounts, specify active timings, and target specific branch outlets.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-[#FFFFFF] font-bold uppercase tracking-wider text-[10px] shadow-sm border border-brand-accent/30 transition-all"
        >
          <Plus size={12} />
          <span>Create Promotion</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-base font-bold text-brand-dark">Loading restaurant offers schema...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 border border-brand-dark/10 text-center flex flex-col items-center shadow-sm">
              <AlertCircle className="text-brand-dark/30 mb-4" size={48} />
              <h3 className="font-display text-base font-bold text-brand-dark">No Promotions Found</h3>
              <p className="text-xs text-brand-dark/65 mt-1">Create your first limited promotion combo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const parsed = parseDescription(offer.description);
                const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                
                let branchLabel = 'All Branches';
                if (parsed.targetBranches && parsed.targetBranches.length > 0) {
                  const names = parsed.targetBranches.map((id: any) => branches.find((b: any) => b.id === id)?.name || id);
                  branchLabel = names.join(', ');
                } else if (offer.branchId) {
                  branchLabel = branches.find((b: any) => b.id === offer.branchId)?.name || 'Specified Branch';
                }

                return (
                  <div 
                    key={offer.id} 
                    className={`bg-white border border-brand-dark/10 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      !offer.isActive || isExpired ? 'opacity-70 border-dashed bg-brand-bg/20' : ''
                    }`}
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative h-48 bg-brand-dark">
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                        
                        {/* Status badges */}
                        <div className="absolute top-4 left-4 flex gap-1.5">
                          <span className="bg-brand-dark/80 border border-brand-dark/15 text-[#FFFFFF] px-2.5 py-1 rounded text-[8px] font-extrabold uppercase tracking-wider">
                            {offer.badge}
                          </span>
                          
                          <span className={`px-2.5 py-1 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                            isExpired ? 'bg-rose-50 text-rose-800 border border-rose-100' : offer.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-brand-bg text-brand-dark border border-brand-dark/15'
                          }`}>
                            {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>

                        {/* Top-Right priority rating */}
                        <div className="absolute top-4 right-4 bg-black/60 text-[#FFFFFF] text-[8px] font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Star size={10} fill="currentColor" className="text-brand-gold" />
                          <span>Priority {offer.displayPriority}</span>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#FFFFFF]/80 flex items-center gap-1">
                              <MapPin size={10} className="text-brand-accent" />
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
                        <p className="text-xs text-brand-dark/75 font-sans leading-relaxed">
                          {parsed.text || 'No description provided.'}
                        </p>

                        {/* Combo Items tags */}
                        {parsed.comboDishes && parsed.comboDishes.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-dark/45">Included Dishes</span>
                            <div className="flex flex-wrap gap-1">
                              {parsed.comboDishes.map((dishName: any, i: number) => (
                                <span key={i} className="bg-brand-bg/30 border border-brand-dark/10 rounded text-[9px] font-semibold text-brand-dark/85 px-2 py-0.5">
                                  {dishName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Validity Dates */}
                        {(offer.startDate || offer.endDate) && (
                          <div className="bg-brand-bg/25 rounded-xl p-3 border border-brand-dark/10 text-[10px] text-brand-dark/65 font-sans space-y-1">
                            <span className="block font-bold uppercase tracking-wider text-brand-dark/45">Validity Window</span>
                            <div className="flex flex-wrap items-center gap-4">
                              {offer.startDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={11} className="text-brand-accent" />
                                  <span>Starts: {new Date(offer.startDate).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {offer.endDate && (
                                <div className="flex items-center gap-1.5">
                                  <Clock size={11} className="text-brand-accent" />
                                  <span>Expires: {new Date(offer.endDate).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="px-5 py-3 bg-brand-bg/15 border-t border-brand-dark/10 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          disabled={isExpired}
                          onChange={() => handleToggleActive(offer)}
                          className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent disabled:opacity-50"
                        />
                        <span className="text-[9px] font-extrabold uppercase text-brand-dark/50">
                          {offer.isActive ? 'Active live' : 'Deactivated'}
                        </span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(offer)}
                          className="p-1.5 text-brand-dark/50 hover:text-brand-accent hover:bg-brand-bg/40 rounded transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/45 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form onSubmit={handleSaveOffer} className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-brand-dark/10 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3">
              <h3 className="font-display font-black text-lg text-brand-dark">
                {editingOffer ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-brand-dark/45 hover:text-brand-accent">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Promotion Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                    placeholder="e.g. 15% Off Family platters"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Description *</label>
                  <textarea
                    required
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                    placeholder="Provide details about combo discount, coupon terms..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none text-brand-dark"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Discount Value *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 or 150"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                    />
                  </div>
                </div>

                {/* Combo Items */}
                <div className="border border-brand-dark/10 rounded-xl p-3 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65">
                    🍔 Select Combo Dishes
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                    {dishes.length === 0 ? (
                      <span className="text-[10px] text-brand-dark/40 italic">No menu items found</span>
                    ) : (
                      dishes.map((dish) => (
                        <label key={dish.id} className="flex items-center gap-2 text-xs text-brand-dark/75 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comboDishes.includes(dish.name)}
                            onChange={(e) => handleDishCheckboxChange(dish.name, e.target.checked)}
                            className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste unsplash or media URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Display Priority</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65 mb-1.5">Promotion Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /menu"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent text-brand-dark"
                    />
                  </div>
                </div>

                {/* Target Branches */}
                <div className="border border-brand-dark/10 rounded-xl p-3 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65">
                    📍 Target Branches
                  </span>
                  <div className="space-y-2">
                    {branches.map(b => (
                      <label key={b.id} className="flex items-center gap-2 text-xs text-brand-dark/75 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={targetBranches.includes(b.id)}
                          onChange={(e) => handleBranchCheckboxChange(b.id, e.target.checked)}
                          className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date range picker scheduler */}
                <div className="border border-brand-dark/10 rounded-xl p-3 space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/65">
                    🕒 Active Timings
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-brand-dark/45 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-2 py-1.5 text-[10px] focus:outline-none focus:border-brand-accent text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-brand-dark/45 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-2 py-1.5 text-[10px] focus:outline-none focus:border-brand-accent text-brand-dark"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark/75 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnHomepage}
                      onChange={(e) => setShowOnHomepage(e.target.checked)}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Show on Homepage promos card slider</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark/75 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Mark as Activated</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-dark/15 hover:bg-brand-bg/30 text-brand-dark/80 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shadow-sm border border-brand-accent/30"
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
