"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, X, Phone, ShoppingBag, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch('/api/cms/homepage');
        const data = await res.json();
        if (data.success && data.settings) {
          const sections = data.settings.homepage_sections || {};
          const bar = data.settings.announcement_bar || {};
          if (sections.announcement && bar.isActive && bar.text) {
            setAnnouncement(bar.text);
          } else {
            setAnnouncement(null);
          }
        }
      } catch (err) {
        console.error("Failed to load navbar announcement:", err);
      }
    }
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/#reviews' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleLinkClick = (path: string) => {
    setIsOpen(false);
    if (path.includes('#')) {
      const elementId = path.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-panel shadow-md bg-brand-bg/90 backdrop-blur-md' 
            : 'bg-black/20 backdrop-blur-sm'
        }`}
      >
        {/* Top Announcement Bar - Visible only when not scrolled */}
        <AnimatePresence>
          {!isScrolled && announcement && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-brand-dark text-brand-gold py-2 px-4 text-center text-[10px] font-bold tracking-widest uppercase border-b border-brand-gold/10 hidden sm:flex items-center justify-center gap-2"
            >
              <span>{announcement}</span>
              <Link href="/reserve" className="underline hover:text-white transition-colors ml-1 font-extrabold">
                Reserve Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full px-6 flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}>
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <img 
              src="/bsd-logo.png" 
              alt="Balaji Chilkur Family Dhaba Logo" 
              className="w-16 h-16 md:w-[72px] md:h-[72px] object-contain"
            />
            <span className={`font-display text-xs sm:text-sm md:text-base font-bold tracking-wider uppercase transition-colors duration-300 group-hover:text-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] ${
              isScrolled ? 'text-brand-dark' : 'text-white'
            }`}>
              BALAJI CHILUKUR FAMILY DHABA
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`relative font-sans text-sm font-medium tracking-wide uppercase transition-colors duration-300 py-1 ${
                  pathname === link.path 
                    ? 'text-brand-gold' 
                    : isScrolled 
                      ? 'text-brand-dark hover:text-brand-accent'
                      : 'text-white/90 hover:text-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
                }`}
              >
                {link.name}
                {pathname === link.path && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-5">
            <a 
              href="tel:+919849498681" 
              className={`p-2.5 rounded-full border transition-colors flex items-center justify-center ${
                isScrolled
                  ? 'border-brand-dark/15 text-brand-dark hover:text-brand-accent hover:border-brand-accent'
                  : 'border-white/30 text-white hover:text-brand-gold hover:border-brand-gold'
              }`}
            >
              <Phone size={16} />
            </a>
            
            {/* Premium CTA Button with Floating Badge */}
            <div className="relative group">
              <span className="absolute -top-3 right-4 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md z-10 border border-brand-bg select-none scale-90 group-hover:scale-95 transition-transform duration-300">
                10% OFF
              </span>
              <Link 
                href="/reserve" 
                className="flex items-center space-x-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark transition-all duration-300 text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-lg shadow-brand-gold/30 hover:scale-[1.02]"
              >
                <Calendar size={14} className="animate-pulse" />
                <span>Book a Table</span>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="relative">
              <span className="absolute -top-2.5 right-1 bg-brand-accent text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow z-10 scale-90 select-none">
                10% OFF
              </span>
              <Link 
                href="/reserve" 
                className="flex items-center space-x-1 bg-brand-gold text-brand-dark transition-colors duration-300 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg"
              >
                <Calendar size={12} />
                <span>Book</span>
              </Link>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-colors ${
                isScrolled
                  ? 'text-brand-dark hover:text-brand-accent'
                  : 'text-white hover:text-brand-gold'
              }`}
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[70px] z-40 bg-brand-bg/95 backdrop-blur-xl lg:hidden flex flex-col justify-between p-8"
          >
            <div className="flex flex-col space-y-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`font-display text-2xl font-bold tracking-wide transition-colors ${
                    pathname === link.path ? 'text-brand-accent' : 'text-brand-dark'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-4 mb-8">
              <a 
                href="tel:+919849498681" 
                className="w-full flex justify-center items-center space-x-2 text-brand-dark border border-brand-dark/30 py-3.5 rounded-full font-bold uppercase tracking-wider"
              >
                <Phone size={16} className="text-brand-accent" />
                <span>Call 098494 98681</span>
              </a>
              
              <div className="relative w-full">
                <span className="absolute -top-2.5 right-6 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md z-10 border border-brand-bg select-none">
                  10% OFF
                </span>
                <Link 
                  href="/reserve" 
                  onClick={() => setIsOpen(false)}
                  className="w-full flex justify-center items-center space-x-2 bg-brand-gold text-brand-dark py-4 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-brand-gold/20"
                >
                  <Calendar size={16} />
                  <span>Book a Table</span>
                </Link>
              </div>

              <Link 
                href="/menu" 
                onClick={() => setIsOpen(false)}
                className="w-full flex justify-center items-center space-x-2 bg-brand-accent text-brand-bg py-4 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-brand-accent/20"
              >
                <ShoppingBag size={16} />
                <span>Order Online</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
