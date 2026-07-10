import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GALLERY_PHOTOS } from '../utils/menuData';

export const GalleryPage: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % GALLERY_PHOTOS.length);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
    }
  };

  const goToMenuItem = (photo: typeof GALLERY_PHOTOS[0]) => {
    closeLightbox();
    const categoryId = `cat-${photo.menuCategory.replace(/\s+/g, '-').toLowerCase()}`;
    navigate(`/menu?category=${encodeURIComponent(photo.menuCategory)}&dish=${encodeURIComponent(photo.menuDishName)}`);
    // Scroll to category section after navigation settles
    setTimeout(() => {
      const el = document.getElementById(categoryId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  return (
    <div className="pt-32 pb-24 bg-brand-bg noise-overlay min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Visual Archives</span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-brand-dark mt-3">
            The Gallery
          </h1>
          <p className="text-brand-dark/70 font-sans text-sm md:text-base mt-4">
            Click any dish to jump directly to it on our interactive menu and place an order.
          </p>
        </div>

        {/* Masonry Layout Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY_PHOTOS.map((photo, index) => (
            <motion.div
              key={photo.id}
              onClick={() => openLightbox(index)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.8) }}
              className="break-inside-avoid relative overflow-hidden rounded-2xl bg-brand-dark cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-1">{photo.menuCategory}</p>
                <p className="font-display font-bold text-[#F6EFE3] text-base leading-tight">{photo.title}</p>
                <span className="mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-gold/80">
                  View on Menu <ArrowRight size={10} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhotoIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 text-brand-bg hover:text-brand-accent p-2 transition-colors z-[55]"
              >
                <X size={32} />
              </button>

              {/* Prev */}
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 md:left-6 text-brand-bg hover:text-brand-accent p-2 transition-colors z-[55]"
              >
                <ChevronLeft size={40} />
              </button>

              {/* Next */}
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 md:right-6 text-brand-bg hover:text-brand-accent p-2 transition-colors z-[55]"
              >
                <ChevronRight size={40} />
              </button>

              {/* Image + CTA */}
              <div
                className="max-w-4xl w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={selectedPhotoIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={GALLERY_PHOTOS[selectedPhotoIndex].src}
                  alt={GALLERY_PHOTOS[selectedPhotoIndex].title}
                  className="max-w-full max-h-[60vh] rounded-2xl object-contain shadow-2xl"
                />
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-1">
                    {GALLERY_PHOTOS[selectedPhotoIndex].menuCategory}
                  </p>
                  <p className="font-display text-[#F6EFE3] text-xl md:text-2xl font-black">
                    {GALLERY_PHOTOS[selectedPhotoIndex].title}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => goToMenuItem(GALLERY_PHOTOS[selectedPhotoIndex])}
                    className="mt-5 flex items-center gap-2 mx-auto bg-brand-accent hover:bg-brand-gold text-[#F6EFE3] font-bold text-xs uppercase tracking-widest px-7 py-3 rounded-full shadow-lg transition-colors"
                  >
                    View on Menu <ArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
