"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Copy, ArrowUpDown, Download, Upload, Search, 
  Check, X, Loader2, Sparkles, AlertCircle, Eye, EyeOff, Calendar, Clock,
  ChevronRight, RefreshCw, FileText
} from 'lucide-react';

export default function MenuCMS() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [vegFilter, setVegFilter] = useState<'All' | 'Veg' | 'NonVeg'>('All');

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);
  
  // Dish Form Fields
  const [dishName, setDishName] = useState('');
  const [dishTeluguName, setDishTeluguName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState(0);
  const [dishCategoryId, setDishCategoryId] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [dishIsVegetarian, setDishIsVegetarian] = useState(true);
  const [dishIsBestseller, setDishIsBestseller] = useState(false);
  const [dishIsChefSpecial, setDishIsChefSpecial] = useState(false);
  const [dishIsSeasonal, setDishIsSeasonal] = useState(false);
  const [dishIsOutOfStock, setDishIsOutOfStock] = useState(false);
  const [dishIsHidden, setDishIsHidden] = useState(false);
  const [dishIsRecommended, setDishIsRecommended] = useState(false);
  
  // Scheduling fields
  const [dishScheduleDays, setDishScheduleDays] = useState<string[]>([]);
  const [dishScheduleTimings, setDishScheduleTimings] = useState('');

  // Bulk import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  useEffect(() => {
    loadMenuData();
  }, []);

  async function loadMenuData() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/menu');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to load menu');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching menu');
    } finally {
      setLoading(false);
    }
  }

  // --- Category Actions ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    try {
      const url = editingCategory ? '/api/cms/menu' : '/api/cms/menu';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { action: 'category', id: editingCategory.id, name: categoryName, description: categoryDescription }
        : { action: 'category', name: categoryName, description: categoryDescription };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        loadMenuData();
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All its dishes will be deleted!')) return;
    try {
      const res = await fetch(`/api/cms/menu?action=category&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadMenuData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Dish Actions ---
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishCategoryId) return;

    try {
      const method = editingDish ? 'PUT' : 'POST';
      const body = {
        action: 'dish',
        id: editingDish?.id,
        name: dishName,
        teluguName: dishTeluguName || null,
        description: dishDescription || '',
        price: Number(dishPrice),
        categoryId: dishCategoryId,
        image: dishImage || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVegetarian: dishIsVegetarian,
        isBestseller: dishIsBestseller,
        isChefSpecial: dishIsChefSpecial,
        isSeasonal: dishIsSeasonal,
        isOutOfStock: dishIsOutOfStock,
        isHidden: dishIsHidden,
        isRecommended: dishIsRecommended,
        scheduleDays: dishScheduleDays,
        scheduleTimings: dishScheduleTimings || null
      };

      const res = await fetch('/api/cms/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setIsDishModalOpen(false);
        resetDishForm();
        loadMenuData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetDishForm = () => {
    setEditingDish(null);
    setDishName('');
    setDishTeluguName('');
    setDishDescription('');
    setDishPrice(0);
    setDishCategoryId('');
    setDishImage('');
    setDishIsVegetarian(true);
    setDishIsBestseller(false);
    setDishIsChefSpecial(false);
    setDishIsSeasonal(false);
    setDishIsOutOfStock(false);
    setDishIsHidden(false);
    setDishIsRecommended(false);
    setDishScheduleDays([]);
    setDishScheduleTimings('');
  };

  const handleEditDishClick = (dish: any) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishTeluguName(dish.teluguName || '');
    setDishDescription(dish.description || '');
    setDishPrice(dish.price);
    setDishCategoryId(dish.categoryId);
    setDishImage(dish.image || '');
    setDishIsVegetarian(dish.isVegetarian);
    setDishIsBestseller(dish.isBestseller);
    setDishIsChefSpecial(dish.isChefSpecial);
    setDishIsSeasonal(dish.isSeasonal);
    setDishIsOutOfStock(dish.isOutOfStock);
    setDishIsHidden(dish.isHidden);
    setDishIsRecommended(dish.isRecommended || false);
    setDishScheduleDays(dish.scheduleDays || []);
    setDishScheduleTimings(dish.scheduleTimings || '');
    setIsDishModalOpen(true);
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      const res = await fetch(`/api/cms/menu?action=dish&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadMenuData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateDish = async (dish: any) => {
    if (!confirm(`Duplicate "${dish.name}"?`)) return;
    try {
      const res = await fetch('/api/cms/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dish',
          name: `${dish.name} (Copy)`,
          teluguName: dish.teluguName,
          description: dish.description,
          price: dish.price,
          categoryId: dish.categoryId,
          image: dish.image,
          isVegetarian: dish.isVegetarian,
          isBestseller: dish.isBestseller,
          isChefSpecial: dish.isChefSpecial,
          isSeasonal: dish.isSeasonal,
          isOutOfStock: dish.isOutOfStock,
          isHidden: true, // Hide by default
          scheduleDays: dish.scheduleDays,
          scheduleTimings: dish.scheduleTimings
        })
      });
      const data = await res.json();
      if (data.success) {
        loadMenuData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle quick badges
  const handleToggleStock = async (dish: any) => {
    try {
      const res = await fetch('/api/cms/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dish',
          id: dish.id,
          name: dish.name,
          price: dish.price,
          categoryId: dish.categoryId,
          isOutOfStock: !dish.isOutOfStock
        })
      });
      const data = await res.json();
      if (data.success) {
        loadMenuData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHide = async (dish: any) => {
    try {
      const res = await fetch('/api/cms/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dish',
          id: dish.id,
          name: dish.name,
          price: dish.price,
          categoryId: dish.categoryId,
          isHidden: !dish.isHidden
        })
      });
      const data = await res.json();
      if (data.success) {
        loadMenuData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // File Upload Helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'menu');

    try {
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setDishImage(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    }
  };

  // --- Bulk Export / Import CSV ---
  const handleExportCSV = () => {
    const headers = 'Name,Telugu Name,Category,Price,Vegetarian (TRUE/FALSE),Bestseller (TRUE/FALSE),Chef Special (TRUE/FALSE),Seasonal (TRUE/FALSE),OutOfStock (TRUE/FALSE),Hidden (TRUE/FALSE),Description,Image\n';
    let rows = '';
    categories.forEach(cat => {
      cat.dishes.forEach((d: any) => {
        rows += `"${d.name.replace(/"/g, '""')}","${(d.teluguName || '').replace(/"/g, '""')}","${cat.name.replace(/"/g, '""')}",${d.price},${d.isVegetarian},${d.isBestseller},${d.isChefSpecial},${d.isSeasonal},${d.isOutOfStock},${d.isHidden},"${(d.description || '').replace(/"/g, '""')}","${d.image || ''}"\n`;
      });
    });

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'restaurant_menu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText) return;

    try {
      const res = await fetch('/api/cms/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_csv',
          csvText
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsImportModalOpen(false);
        setCsvText('');
        alert(`Successfully imported menu items!`);
        loadMenuData();
      } else {
        alert(data.error || 'Failed to import CSV');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing CSV');
    }
  };

  // Flattened Dishes list for current filters
  const allDishes = React.useMemo(() => {
    const list: any[] = [];
    categories.forEach(cat => {
      cat.dishes.forEach((d: any) => {
        list.push({ ...d, categoryName: cat.name });
      });
    });
    return list.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.teluguName && d.teluguName.includes(searchTerm)) || 
        d.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'All' || d.categoryName === selectedCategoryFilter;
      const matchesVeg = vegFilter === 'All' || 
        (vegFilter === 'Veg' && d.isVegetarian) || 
        (vegFilter === 'NonVeg' && !d.isVegetarian);
      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [categories, searchTerm, selectedCategoryFilter, vegFilter]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (dishScheduleDays.includes(day)) {
      setDishScheduleDays(dishScheduleDays.filter(d => d !== day));
    } else {
      setDishScheduleDays([...dishScheduleDays, day]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Sparkles size={14} className="text-brand-gold animate-pulse" />
            Premium Restaurant CMS
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Menu Management
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Configure dishes, categories, dynamic schedules, pricing, and vegetarian badges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-brand-dark/10 hover:border-brand-accent text-brand-dark font-bold uppercase tracking-wider text-xs shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-brand-dark/10 hover:border-brand-accent text-brand-dark font-bold uppercase tracking-wider text-xs shadow-sm transition-all"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryName('');
              setCategoryDescription('');
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-dark hover:bg-brand-dark/95 text-white font-bold uppercase tracking-wider text-xs shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              resetDishForm();
              if (categories.length > 0) setDishCategoryId(categories[0].id);
              setIsDishModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-brand-accent/20 transition-all"
          >
            <Plus size={14} />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-lg font-bold text-brand-dark">Fetching live menu schema...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Categories Sidebar List */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-display text-lg font-bold text-brand-dark flex items-center gap-2 px-1">
              <span>Categories</span>
              <span className="text-xs bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">
                {categories.length}
              </span>
            </h2>
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-brand-dark/5 space-y-1">
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategoryFilter === 'All'
                    ? 'bg-brand-accent/10 text-brand-accent font-black'
                    : 'text-brand-dark hover:bg-brand-dark/5'
                }`}
              >
                <span>All Categories</span>
                <ChevronRight size={14} />
              </button>

              {categories.map((cat) => (
                <div key={cat.id} className="group relative">
                  <button
                    onClick={() => setSelectedCategoryFilter(cat.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all pr-12 ${
                      selectedCategoryFilter === cat.name
                        ? 'bg-brand-accent/10 text-brand-accent font-black'
                        : 'text-brand-dark hover:bg-brand-dark/5'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-brand-dark/40 font-mono">({cat.dishes?.length || 0})</span>
                  </button>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setCategoryDescription(cat.description || '');
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1 hover:text-brand-accent transition-colors"
                      title="Edit Category"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 hover:text-red-500 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dishes Table Card */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Bar & Badge Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={16} />
                <input
                  type="text"
                  placeholder="Search food by name, code, telugu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#ECE3D4]/20 border border-brand-dark/10 rounded-2xl pl-10 pr-4 py-3 text-xs font-sans focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setVegFilter('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    vegFilter === 'All'
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-dark border-brand-dark/10 hover:border-brand-dark/20'
                  }`}
                >
                  All Food
                </button>
                <button
                  onClick={() => setVegFilter('Veg')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                    vegFilter === 'Veg'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-600 border-brand-dark/10 hover:border-brand-dark/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block border border-white" />
                  Veg Only
                </button>
              </div>
            </div>

            {/* Dishes list grid */}
            {allDishes.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-brand-dark/5 text-center flex flex-col items-center">
                <AlertCircle className="text-brand-dark/30 mb-4" size={48} />
                <h3 className="font-display text-lg font-bold text-brand-dark">No Food Items Found</h3>
                <p className="text-sm text-brand-dark/50 mt-1">Try resetting your filters or add a new menu item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allDishes.map((dish) => (
                  <div 
                    key={dish.id} 
                    className={`bg-white rounded-3xl border border-brand-dark/5 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      dish.isHidden ? 'opacity-65 border-dashed' : ''
                    }`}
                  >
                    <div>
                      {/* Dish Image header */}
                      <div className="relative h-40 bg-brand-dark">
                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Badges on Image */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border tracking-wider flex items-center gap-1 bg-white ${
                            dish.isVegetarian ? 'text-green-600 border-green-600/30' : 'text-red-600 border-red-600/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dish.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                            {dish.isVegetarian ? 'Veg' : 'Egg/NonVeg'}
                          </span>

                          {dish.isBestseller && (
                            <span className="bg-brand-gold text-brand-dark border border-brand-gold/30 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                              🔥 Bestseller
                            </span>
                          )}
                          {dish.isChefSpecial && (
                            <span className="bg-brand-accent text-white border border-brand-accent/30 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                              👨‍🍳 Chef Special
                            </span>
                          )}
                        </div>

                        {/* Top-Right Quick Toggle Indicators */}
                        <div className="absolute top-4 right-4 flex gap-1">
                          <button
                            onClick={() => handleToggleHide(dish)}
                            className="p-2 rounded-lg bg-black/50 text-[#F6EFE3] hover:bg-black/75 transition-colors"
                            title={dish.isHidden ? 'Show on Public Site' : 'Hide from Public Site'}
                          >
                            {dish.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>

                        {/* Bottom Category/Price tag */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                            {dish.categoryName}
                          </span>
                          <span className="font-display font-black text-brand-gold text-lg">
                            ₹{dish.price}
                          </span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-display font-bold text-brand-dark text-base">{dish.name}</h3>
                            {dish.teluguName && (
                              <p className="text-xs font-semibold text-brand-dark/40 font-sans mt-0.5">{dish.teluguName}</p>
                            )}
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            dish.isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {dish.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                          </span>
                        </div>

                        <p className="text-xs text-brand-dark/60 font-sans line-clamp-2">
                          {dish.description || 'No description provided.'}
                        </p>

                        {/* Scheduling Information */}
                        {(dish.scheduleDays?.length > 0 || dish.scheduleTimings) && (
                          <div className="pt-2 border-t border-brand-dark/5 flex items-center gap-3 text-[10px] text-brand-dark/50">
                            {dish.scheduleDays?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{dish.scheduleDays.length} Days</span>
                              </div>
                            )}
                            {dish.scheduleTimings && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{dish.scheduleTimings}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="px-6 py-4 bg-[#ECE3D4]/25 border-t border-brand-dark/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-brand-dark/40 font-sans">
                        <span>Last edit: {new Date(dish.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStock(dish)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-colors ${
                            dish.isOutOfStock
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {dish.isOutOfStock ? 'Set In Stock' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => handleDuplicateDish(dish)}
                          className="p-2 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 rounded-lg transition-all"
                          title="Duplicate Dish"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleEditDishClick(dish)}
                          className="p-2 text-brand-accent hover:text-brand-accent/90 hover:bg-brand-accent/5 rounded-lg transition-all"
                          title="Edit Food Item"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Food Item"
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
        </div>
      )}

      {/* --- Category Modal --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="e.g. Tandoori Starters"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Description</label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Describe this category items (e.g. freshly baked in clay oven)"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Dish Modal --- */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form onSubmit={handleSaveDish} className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                {editingDish ? 'Edit Food Item' : 'Add Food Item'}
              </h3>
              <button type="button" onClick={() => setIsDishModalOpen(false)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                    placeholder="e.g. Paneer Butter Masala"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Telugu Name (Optional)</label>
                  <input
                    type="text"
                    value={dishTeluguName}
                    onChange={(e) => setDishTeluguName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                    placeholder="e.g. పనీర్ బటర్ మసాలా"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={dishPrice}
                      onChange={(e) => setDishPrice(Number(e.target.value))}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Category *</label>
                    <select
                      required
                      value={dishCategoryId}
                      onChange={(e) => setDishCategoryId(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Description</label>
                  <textarea
                    value={dishDescription}
                    onChange={(e) => setDishDescription(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                    placeholder="Describe taste, allergens, portion sizes..."
                    rows={3}
                  />
                </div>

                {/* Features Checklist */}
                <div className="space-y-2 pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65">Attributes & Badges</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsVegetarian}
                        onChange={(e) => setDishIsVegetarian(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Vegetarian Item</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsBestseller}
                        onChange={(e) => setDishIsBestseller(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Bestseller badge</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsChefSpecial}
                        onChange={(e) => setDishIsChefSpecial(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Chef's Special</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsSeasonal}
                        onChange={(e) => setDishIsSeasonal(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Seasonal Badge</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsRecommended}
                        onChange={(e) => setDishIsRecommended(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Recommended Dish</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsOutOfStock}
                        onChange={(e) => setDishIsOutOfStock(e.target.checked)}
                        className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                      />
                      <span>Mark Out of Stock</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Upload & Scheduling */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65 mb-2">Food Image</label>
                  <div className="space-y-3">
                    {dishImage && (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-dark">
                        <img src={dishImage} alt="Dish Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setDishImage('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-[#F6EFE3] rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={dishImage}
                        onChange={(e) => setDishImage(e.target.value)}
                        className="flex-grow bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
                      />
                      <label className="cursor-pointer bg-brand-dark hover:bg-brand-dark/95 text-white px-4 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider flex items-center justify-center shadow-md">
                        <Upload size={14} className="mr-1" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Scheduling controls */}
                <div className="border border-brand-dark/10 rounded-2xl p-4 space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-brand-dark/65">
                    ⚙️ Day & Timing Scheduling
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-2">Display Days (Leave empty to show everyday)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {daysOfWeek.map(d => {
                        const isSelected = dishScheduleDays.includes(d);
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() => toggleDay(d)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                              isSelected
                                ? 'bg-brand-accent text-white border-brand-accent'
                                : 'bg-[#ECE3D4]/20 text-brand-dark/70 border-brand-dark/10'
                            }`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 mb-2">Timing Hours (e.g. 11:00-16:00)</label>
                    <input
                      type="text"
                      placeholder="HH:MM-HH:MM (24-hour style)"
                      value={dishScheduleTimings}
                      onChange={(e) => setDishScheduleTimings(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={dishIsHidden}
                      onChange={(e) => setDishIsHidden(e.target.checked)}
                      className="rounded text-brand-accent border-brand-dark/15 focus:ring-brand-accent"
                    />
                    <div>
                      <span className="font-bold">Draft / Hide from site</span>
                      <p className="text-[10px] text-brand-dark/50 mt-0.5">Use this to edit this item as a draft before publishing.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setIsDishModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                {editingDish ? 'Save Changes' : 'Publish Dish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Import CSV Modal --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleImportCSV} className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-brand-dark/5 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-4">
              <h3 className="font-display font-black text-xl text-brand-dark">
                Bulk Import Menu Items (CSV)
              </h3>
              <button type="button" onClick={() => setIsImportModalOpen(false)} className="p-1 text-brand-dark/45 hover:text-brand-dark">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-dark/60 leading-relaxed">
                Paste raw CSV contents matching the columns: <br />
                <code className="bg-[#ECE3D4]/50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                  Name,Telugu Name,Category,Price,Vegetarian,Bestseller,ChefSpecial,Seasonal,OutOfStock,Hidden,Description,Image
                </code>
              </p>

              <textarea
                required
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder='e.g. "Paneer Masala","పనీర్","Curries",220,true,false,false,false,false,false,"Creamy dish",""'
                className="w-full bg-brand-bg border border-brand-dark/10 rounded-2xl px-4 py-3 font-mono text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/5">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Import Items
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
