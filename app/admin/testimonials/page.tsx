"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, X, Trash2, Star, Edit, Loader2, Sparkles, MessageSquare,
  AlertCircle, ChevronRight, User, ThumbsUp, Eye, EyeOff
} from 'lucide-react';

export default function TestimonialsCMS() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filter
  const [filterMode, setFilterMode] = useState<'All' | 'Approved' | 'Pending'>('All');

  // Form State
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/testimonials');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // 1. ELIMINATE DUPLICATE TESTIMONIAL CARDS
  // Drops duplicate reviews from array map layout using seen ID trackers
  const uniqueTestimonials = useMemo(() => {
    const seen = new Set();
    return testimonials.filter(t => {
      if (!t.id) return false;
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [testimonials]);

  const filtered = useMemo(() => {
    return uniqueTestimonials.filter(t => {
      if (filterMode === 'Approved') return t.isApproved;
      if (filterMode === 'Pending') return !t.isApproved;
      return true;
    });
  }, [uniqueTestimonials, filterMode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const isEdit = !!editingTestimonial?.id;
      const url = '/api/cms/testimonials';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit 
        ? {
            id: editingTestimonial.id,
            data: {
              name: name.trim(),
              role: editingTestimonial.role || 'Patron',
              content: content.trim(),
              rating,
              source: editingTestimonial.source || 'Direct Submission',
              avatar: editingTestimonial.avatar || null,
              date: editingTestimonial.date || 'Just now',
              isApproved,
              order: editingTestimonial.order || 0
            }
          }
        : {
            name: name.trim(),
            role: 'Patron',
            content: content.trim(),
            rating,
            source: 'Direct Submission',
            avatar: null,
            date: 'Just now',
            isApproved,
            order: 0
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setEditingTestimonial(null);
        resetForm();
        loadTestimonials();
      } else {
        alert(data.error || 'Failed to save review');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating database');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setContent('');
    setRating(5);
    setIsApproved(false);
  };

  // 3. APPROVAL STATE OPTIMISTIC UI TOGGLE
  const handleToggleApprove = async (t: any) => {
    // Optimistic UI state switch
    setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, isApproved: !t.isApproved } : item));

    try {
      const res = await fetch('/api/cms/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: t.id,
          data: {
            name: t.name,
            role: t.role,
            content: t.content,
            rating: t.rating,
            source: t.source,
            avatar: t.avatar,
            date: t.date,
            isApproved: !t.isApproved,
            order: t.order
          }
        })
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, isApproved: t.isApproved } : item));
        alert(data.error || 'Failed to toggle approval status on server');
      }
    } catch (e) {
      console.error(e);
      // Rollback
      setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, isApproved: t.isApproved } : item));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadTestimonials();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Header (Desaturated corporate palette layout) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Sparkles size={12} className="text-zinc-400" />
            Social Proof & Reviews CMS
          </span>
          <h1 className="font-display text-2xl font-black text-zinc-800 mt-2">
            Testimonials Editor
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Approve reviews left by dining patrons to show them on the public landing page slider.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTestimonial({ id: null });
            resetForm();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider text-[10px] shadow-sm border border-zinc-700 transition-all"
        >
          <span>Add Patron Review</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-zinc-500 mb-4" size={48} />
          <p className="font-display text-base font-bold text-zinc-700">Loading review list...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters Bar (Soft Zinc border bar layout) */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex gap-2 shadow-sm">
            {(['All', 'Approved', 'Pending'] as const).map(mode => {
              const count = uniqueTestimonials.filter(t => mode === 'All' ? true : mode === 'Approved' ? t.isApproved : !t.isApproved).length;
              return (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    filterMode === mode
                      ? 'bg-zinc-800 text-white'
                      : 'bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {mode} <span className="text-[10px] opacity-75 font-mono ml-1">({count})</span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            /* Empty State Container */
            <div className="bg-white rounded-2xl p-16 border border-zinc-200 text-center flex flex-col items-center shadow-sm">
              <AlertCircle className="text-zinc-400 mb-4" size={48} />
              <h3 className="font-display text-base font-bold text-zinc-700">No Testimonials Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Create or approve reviews to show on landing page.</p>
            </div>
          ) : (
            /* Listing Cards Grid (Thin border cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((t) => (
                <div 
                  key={t.id} 
                  className={`bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all ${
                    !t.isApproved ? 'border-dashed bg-zinc-50/50' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Author + Rating */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 text-zinc-700 border border-zinc-250 rounded-full flex items-center justify-center font-bold text-xs">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-zinc-800 text-xs">{t.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                            Created: {new Date(t.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < t.rating ? "currentColor" : "none"} 
                            className={i < t.rating ? "text-zinc-500" : "text-zinc-300"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed italic">
                      "{t.content}"
                    </p>
                  </div>

                  {/* Actions bar (Muted tactile toggle button) */}
                  <div className="pt-4 mt-4 border-t border-zinc-150 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleApprove(t)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${
                        t.isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100/70'
                          : 'bg-zinc-105 text-zinc-650 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      {t.isApproved ? <Check size={10} /> : <X size={10} />}
                      <span>{t.isApproved ? 'Approved (Shown)' : 'Approve Review'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setName(t.name);
                          setContent(t.content);
                          setRating(t.rating);
                          setIsApproved(t.isApproved);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors"
                        title="Edit Review"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Review Form Modal --- */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-250 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-display font-black text-lg text-zinc-800">
                {editingTestimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button type="button" onClick={() => setEditingTestimonial(null)} className="p-1 text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Patron Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Review Content *</label>
                <textarea
                  required
                  placeholder="Paste review feedback or comment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 text-zinc-800"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Patron Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-800"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-start pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="rounded text-zinc-800 focus:ring-zinc-850"
                    />
                    <span>Approve & Show Live</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm border border-zinc-750"
              >
                {saving ? 'Saving...' : editingTestimonial.id ? 'Save Changes' : 'Publish Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
