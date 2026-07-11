"use client";
import React, { useState, useEffect } from 'react';
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    setSaving(true);
    try {
      const isEdit = !!editingTestimonial?.id;
      const url = '/api/cms/testimonials';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit 
        ? {
            id: editingTestimonial.id,
            data: {
              name,
              role: editingTestimonial.role || 'Patron',
              content,
              rating,
              source: editingTestimonial.source || 'Direct Submission',
              avatar: editingTestimonial.avatar || null,
              date: editingTestimonial.date || 'Just now',
              isApproved,
              order: editingTestimonial.order || 0
            }
          }
        : {
            name,
            role: 'Patron',
            content,
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
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
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

  const handleToggleApprove = async (t: any) => {
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
      if (data.success) loadTestimonials();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadTestimonials();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = testimonials.filter(t => {
    if (filterMode === 'Approved') return t.isApproved;
    if (filterMode === 'Pending') return !t.isApproved;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Sparkles size={14} className="text-brand-gold animate-pulse" />
            Social Proof & Reviews CMS
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Testimonials Editor
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Approve reviews left by dining patrons to show them on the public landing page slider.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTestimonial({ id: null });
            resetForm();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-brand-accent/20 transition-all"
        >
          <span>Add Patron Review</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-lg font-bold text-brand-dark">Loading review list...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-dark/5 flex gap-2">
            {(['All', 'Approved', 'Pending'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  filterMode === mode
                    ? 'bg-brand-dark text-[#F6EFE3]'
                    : 'bg-white hover:bg-brand-dark/5 text-brand-dark/70'
                }`}
              >
                {mode} ({testimonials.filter(t => mode === 'All' ? true : mode === 'Approved' ? t.isApproved : !t.isApproved).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-brand-dark/5 text-center flex flex-col items-center">
              <AlertCircle className="text-brand-dark/30 mb-4" size={48} />
              <h3 className="font-display text-lg font-bold text-brand-dark">No Testimonials Found</h3>
              <p className="text-sm text-brand-dark/50 mt-1">Create or approve reviews to show on landing page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((t) => (
                <div 
                  key={t.id} 
                  className={`bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                    !t.isApproved ? 'border-dashed opacity-75' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Author + Rating */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-accent/15 text-brand-accent rounded-full flex items-center justify-center font-bold">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-brand-dark text-sm">{t.name}</h4>
                          <span className="text-[9px] font-mono text-brand-dark/40 block mt-0.5">
                            Created: {new Date(t.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-0.5 text-brand-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < t.rating ? "currentColor" : "none"} 
                            className="stroke-brand-gold"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-brand-dark/75 font-sans leading-relaxed italic">
                      "{t.content}"
                    </p>
                  </div>

                  {/* Actions bar */}
                  <div className="pt-4 mt-4 border-t border-brand-dark/5 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleApprove(t)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 border transition-colors ${
                        t.isApproved
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
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
                        className="p-2 text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                        title="Edit Review"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSave} className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                {editingTestimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button type="button" onClick={() => setEditingTestimonial(null)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Patron Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Review Content *</label>
                <textarea
                  required
                  placeholder="Paste review feedback or comment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Patron Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-start pb-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Approve & Show Live</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
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
