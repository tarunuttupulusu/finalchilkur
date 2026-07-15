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
  const [badgeText, setBadgeText] = useState('Special Offer');
  const [badgeActive, setBadgeActive] = useState(true);
  const [badgeColor, setBadgeColor] = useState('#1E4D2B');
  const [activeHash, setActiveHash] = useState('');

  const isHomepage = pathname === '/';
  const showScrolledStyle = isScrolled || !isHomepage;

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

          // Fetch dynamic website configuration for booking badge
          const webSettings = data.settings.website_settings || {};
          setBadgeText(webSettings.bookingBadgeText || 'Special Offer');
          setBadgeActive(webSettings.bookingBadgeActive !== false);
          setBadgeColor(webSettings.bookingBadgeColor || '#1E4D2B');
        }
      } catch (err) {
        console.error("Failed to load navbar announcement:", err);
      }
    }
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = isHomepage ? window.innerHeight - 96 : 50;
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // If we scroll back to the top of the homepage, clear the reviews hash highlight
      if (window.scrollY < 200 && pathname === '/') {
        setActiveHash('');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    handleHashChange(); // initial check
    window.addEventListener('hashchange', handleHashChange);

    let observer: IntersectionObserver | null = null;
    const reviewsEl = document.getElementById('reviews');

    if (pathname === '/') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHash('#reviews');
            } else {
              setActiveHash((prev) => (prev === '#reviews' ? '' : prev));
            }
          });
        },
        { threshold: 0.2, rootMargin: '-10% 0px -10% 0px' }
      );

      if (reviewsEl) observer.observe(reviewsEl);
    } else {
      setActiveHash('');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (observer && reviewsEl) observer.unobserve(reviewsEl);
    };
  }, [pathname]);

  const isLinkActive = (path: string) => {
    if (path.includes('#')) {
      const parts = path.split('#');
      const route = parts[0] || '/';
      const hash = '#' + parts[1];
      return pathname === route && activeHash === hash;
    }
    if (path === '/') {
      return pathname === '/' && !activeHash;
    }
    return pathname === path;
  };

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
      const hash = '#' + path.split('#')[1];
      setActiveHash(hash);
      const elementId = path.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setActiveHash('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          showScrolledStyle 
            ? 'glass-panel shadow-md bg-brand-bg/90 backdrop-blur-md' 
            : 'bg-transparent'
        }`}
      >


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
              showScrolledStyle ? 'text-brand-dark' : 'text-white'
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
                  isLinkActive(link.path) 
                    ? 'text-brand-gold' 
                    : showScrolledStyle 
                      ? 'text-brand-dark hover:text-brand-accent'
                      : 'text-white/90 hover:text-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
                }`}
              >
                {link.name}
                {isLinkActive(link.path) && (
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
              href="tel:+919347104569" 
              className={`p-2.5 rounded-full border transition-colors flex items-center justify-center ${
                showScrolledStyle
                  ? 'border-brand-dark/15 text-brand-dark hover:text-brand-accent hover:border-brand-accent'
                  : 'border-white/30 text-white hover:text-brand-gold hover:border-brand-gold'
              }`}
            >
              <Phone size={16} />
            </a>
            
            {/* Premium CTA Button with Floating Badge */}
            <div className="relative group">
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
                showScrolledStyle
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
                    isLinkActive(link.path) ? 'text-brand-accent' : 'text-brand-dark'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-4 mb-8">
              <a 
                href="tel:+919347104569" 
                className="w-full flex justify-center items-center space-x-2 text-brand-dark border border-brand-dark/30 py-3.5 rounded-full font-bold uppercase tracking-wider"
              >
                <Phone size={16} className="text-brand-accent" />
                <span>Call +91 93471 04569</span>
              </a>
              
                <Link 
                  href="/reserve" 
                  onClick={() => setIsOpen(false)}
                  className="w-full flex justify-center items-center space-x-2 bg-brand-gold text-brand-dark py-4 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-brand-gold/20"
                >
                  <Calendar size={16} />
                  <span>Book a Table</span>
                </Link>

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
