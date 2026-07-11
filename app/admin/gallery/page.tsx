"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, FolderPlus, Image, FileText, Upload,
  X, Check, Loader2, Sparkles, AlertCircle, Edit, Star, RefreshCw, ChevronRight
} from 'lucide-react';

export default function GalleryCMS() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // New Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlbum, setUploadAlbum] = useState('General');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadIsFeatured, setUploadIsFeatured] = useState(false);
  const [uploadMenuCategory, setUploadMenuCategory] = useState('');
  const [uploadMenuDish, setUploadMenuDish] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // New Album state
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showAddAlbum, setShowAddAlbum] = useState(false);

  // Detail / Edit modal
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editMenuCategory, setEditMenuCategory] = useState('');
  const [editMenuDish, setEditMenuDish] = useState('');

  // Replacement file state
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  useEffect(() => {
    loadGalleryData();
  }, []);

  async function loadGalleryData() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/gallery');
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos || []);
        setAlbums(['All', ...data.albums]);
      }
    } catch (e) {
      console.error('Failed to fetch gallery photos:', e);
    } finally {
      setLoading(false);
    }
  }

  // Handle image upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      // 1. Upload media buffer to `/api/cms/media`
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', 'gallery');

      const mediaRes = await fetch('/api/cms/media', {
        method: 'POST',
        body: formData
      });
      const mediaData = await mediaRes.json();
      
      if (!mediaData.success) {
        alert(mediaData.error || 'Failed to upload media');
        setIsUploading(false);
        return;
      }

      // 2. Save metadata to database via `/api/cms/gallery` POST
      const dbRes = await fetch('/api/cms/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle || uploadFile.name.split('.')[0],
          altText: uploadAltText || uploadTitle || 'Balaji Chilkur Dining Photo',
          src: mediaData.url,
          albumName: uploadAlbum,
          isFeatured: uploadIsFeatured,
          menuCategory: uploadMenuCategory || null,
          menuDishName: uploadMenuDish || null
        })
      });
      const dbData = await dbRes.json();
      if (dbData.success) {
        // Reset fields
        setUploadFile(null);
        setUploadTitle('');
        setUploadAltText('');
        setUploadIsFeatured(false);
        setUploadMenuCategory('');
        setUploadMenuDish('');
        loadGalleryData();
      } else {
        alert(dbData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading files');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle quick attributes toggling (featured star)
  const handleToggleFeatured = async (photo: any) => {
    try {
      const res = await fetch('/api/cms/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: photo.id,
          title: photo.title,
          altText: photo.altText,
          albumName: photo.albumName,
          isFeatured: !photo.isFeatured
        })
      });
      const data = await res.json();
      if (data.success) {
        loadGalleryData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Edit Metadata / Replace Image
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
      let finalSrc = editingPhoto.src;

      // 1. If replacement image is selected, upload it and overwrite/preserve the same filename
      if (replaceFile) {
        const formData = new FormData();
        formData.append('file', replaceFile);
        formData.append('folder', 'gallery');
        formData.append('replaceUrl', editingPhoto.src); // Tell API to replace existing file

        const mediaRes = await fetch('/api/cms/media', {
          method: 'POST',
          body: formData
        });
        const mediaData = await mediaRes.json();
        if (mediaData.success) {
          finalSrc = mediaData.url;
        } else {
          alert('Failed to replace file buffer: ' + mediaData.error);
          return;
        }
      }

      // 2. Put metadata updates
      const res = await fetch('/api/cms/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPhoto.id,
          title: editTitle,
          altText: editAltText,
          albumName: editAlbum,
          isFeatured: editIsFeatured,
          src: finalSrc,
          menuCategory: editMenuCategory || null,
          menuDishName: editMenuDish || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setEditingPhoto(null);
        setReplaceFile(null);
        loadGalleryData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder photo (index swaps)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = filteredPhotos;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Build batch payload of ID-to-order mapping
    const reorderedList = [...list];
    // Swap elements
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[targetIdx];
    reorderedList[targetIdx] = temp;

    const payload = reorderedList.map((p, idx) => ({
      id: p.id,
      displayOrder: idx + 1
    }));

    try {
      const res = await fetch('/api/cms/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          reorders: payload
        })
      });
      const data = await res.json();
      if (data.success) {
        loadGalleryData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image? This will permanently remove it.')) return;
    try {
      const res = await fetch(`/api/cms/gallery?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadGalleryData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewAlbum = () => {
    if (!newAlbumName) return;
    if (!albums.includes(newAlbumName)) {
      setAlbums([...albums, newAlbumName]);
      setUploadAlbum(newAlbumName);
    }
    setNewAlbumName('');
    setShowAddAlbum(false);
  };

  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedAlbum]);

  const filteredPhotos = selectedAlbum === 'All'
    ? photos
    : photos.filter(p => p.albumName === selectedAlbum);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Sparkles size={14} className="text-brand-gold" />
            Media & Gallery Library
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Gallery Management
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Organize albums, drag-and-drop order, assign tags, feature favorites on home page, and upload WebP images.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Albums/Folders */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-bold text-brand-dark flex items-center gap-2">
              <span>Albums</span>
              <span className="text-xs bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">
                {albums.length - 1}
              </span>
            </h2>
            <button
              onClick={() => setShowAddAlbum(!showAddAlbum)}
              className="p-1.5 text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-all"
              title="Add New Album"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          {showAddAlbum && (
            <div className="bg-white p-4 rounded-3xl border border-brand-dark/5 shadow-sm space-y-3 animate-slideDown">
              <input
                type="text"
                placeholder="Album name..."
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddAlbum(false)}
                  className="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewAlbum}
                  className="px-3 py-1.5 rounded-lg bg-brand-accent text-white text-[10px] font-bold uppercase shadow-sm"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-brand-dark/5 space-y-1">
            {albums.map((album) => (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedAlbum === album
                    ? 'bg-brand-accent/10 text-brand-accent font-black'
                    : 'text-brand-dark hover:bg-brand-dark/5'
                }`}
              >
                <span>{album}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Center/Right Area: Upload File & Grid List */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Upload Panel */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5">
            <h3 className="font-display font-bold text-base text-brand-dark mb-4 flex items-center gap-2">
              <Upload size={18} className="text-brand-accent" />
              <span>Upload New Photo</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* File input */}
                <div className="border-2 border-dashed border-brand-dark/10 hover:border-brand-accent rounded-2xl p-6 text-center transition-all cursor-pointer relative bg-brand-bg">
                  {uploadFile ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <Image className="text-brand-accent" size={32} />
                      <span className="text-xs font-bold text-brand-dark truncate max-w-[200px]">
                        {uploadFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="text-[10px] text-red-500 underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-brand-dark/35" size={32} />
                      <span className="block text-xs font-bold text-brand-dark/65">
                        Drag and drop image file here
                      </span>
                      <span className="block text-[10px] text-brand-dark/45">
                        Supported formats: JPG, PNG, WEBP. Auto-compresses.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-1.5">Photo Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paneer Tikka Platter"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-1.5">Target Album</label>
                    <select
                      value={uploadAlbum}
                      onChange={(e) => setUploadAlbum(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      {albums.filter(a => a !== 'All').map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-1.5">SEO Alt Text (Best practices for search optimization)</label>
                  <input
                    type="text"
                    placeholder="e.g. delicious paneer tikka starters served at Balaji Santosh Family Dhaba Moinabad"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-1.5">Link Category (Menu Jump)</label>
                    <input
                      type="text"
                      placeholder="e.g. Paneer Starters"
                      value={uploadMenuCategory}
                      onChange={(e) => setUploadMenuCategory(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-1.5">Link Dish (Menu Jump)</label>
                    <input
                      type="text"
                      placeholder="e.g. Paneer Butter Masala"
                      value={uploadMenuDish}
                      onChange={(e) => setUploadMenuDish(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadIsFeatured}
                      onChange={(e) => setUploadIsFeatured(e.target.checked)}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Highlight/Feature on Homepage Gallery</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Upload Photo</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Photo List Grid */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-brand-dark px-1 flex items-center justify-between">
              <span>Gallery Grid ({filteredPhotos.length} Items)</span>
            </h3>

            {filteredPhotos.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-brand-dark/5 text-center flex flex-col items-center">
                <AlertCircle className="text-brand-dark/30 mb-4" size={48} />
                <h3 className="font-display text-lg font-bold text-brand-dark">No Photos Found</h3>
                <p className="text-sm text-brand-dark/50 mt-1">Upload a photo to populate this album.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPhotos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="bg-white border border-brand-dark/5 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square bg-brand-dark">
                      <img src={photo.src} alt={photo.altText || photo.title} loading="lazy" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                        <div className="w-full flex justify-between items-end">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                              {photo.albumName}
                            </span>
                            <h4 className="font-display font-bold text-[#F6EFE3] text-sm leading-tight mt-0.5">
                              {photo.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleFeatured(photo)}
                              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                                photo.isFeatured 
                                  ? 'bg-brand-gold text-brand-dark' 
                                  : 'bg-black/55 text-white hover:bg-black/75'
                              }`}
                              title="Feature on Home Page"
                            >
                              <Star size={12} fill={photo.isFeatured ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPhoto(photo);
                                setEditTitle(photo.title);
                                setEditAltText(photo.altText || '');
                                setEditAlbum(photo.albumName);
                                setEditIsFeatured(photo.isFeatured);
                                setEditMenuCategory(photo.menuCategory || '');
                                setEditMenuDish(photo.menuDishName || '');
                              }}
                              className="p-1.5 rounded-lg bg-black/55 text-white hover:bg-black/75 backdrop-blur-md transition-colors"
                              title="Edit Metadata & File"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display Order Position indicator */}
                      <span className="absolute top-4 left-4 bg-black/60 text-[#F6EFE3] text-[9px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        Order #{photo.displayOrder || index + 1}
                      </span>
                    </div>

                    {/* Bottom Order Sorter Bar & Delete */}
                    <div className="px-5 py-3 bg-[#ECE3D4]/25 border-t border-brand-dark/5 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-brand-dark/5 rounded text-brand-dark disabled:opacity-30"
                          title="Move Order Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === filteredPhotos.length - 1}
                          className="p-1 hover:bg-brand-dark/5 rounded text-brand-dark disabled:opacity-30"
                          title="Move Order Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1 hover:text-red-500 rounded transition-colors text-brand-dark/55"
                        title="Delete Image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleCount < filteredPhotos.length && (
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-6 py-3.5 rounded-2xl bg-brand-dark hover:bg-brand-dark/90 text-white font-display font-extrabold uppercase tracking-wider text-[10px] shadow-lg shadow-brand-dark/15 transition-all"
                >
                  Load More Images
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Edit Metadata & Replace Image Modal --- */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form onSubmit={handleSaveMetadata} className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                Edit Image Details
              </h3>
              <button type="button" onClick={() => { setEditingPhoto(null); setReplaceFile(null); }} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-center bg-brand-bg p-4 rounded-2xl border border-brand-dark/5">
                <img src={editingPhoto.src} alt={editingPhoto.title} className="w-24 h-24 object-cover rounded-xl shadow-sm border border-brand-dark/10" />
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/45 block">Replace Image File</span>
                  
                  <label className="cursor-pointer bg-brand-dark hover:bg-brand-dark/95 text-white px-4 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 shadow-md">
                    <RefreshCw size={12} />
                    {replaceFile ? 'Replace selected' : 'Upload New File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {replaceFile && (
                    <span className="text-[9px] text-brand-accent font-bold truncate max-w-[150px] block">
                      Selected: {replaceFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Target Album *</label>
                <select
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                >
                  {albums.filter(a => a !== 'All').map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">SEO Alt Text</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-2">Link Category (Menu Jump)</label>
                  <input
                    type="text"
                    value={editMenuCategory}
                    onChange={(e) => setEditMenuCategory(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-2">Link Dish (Menu Jump)</label>
                  <input
                    type="text"
                    value={editMenuDish}
                    onChange={(e) => setEditMenuDish(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Feature on Homepage Gallery Slider</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => { setEditingPhoto(null); setReplaceFile(null); }}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
