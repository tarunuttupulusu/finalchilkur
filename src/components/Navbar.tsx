import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, X, Phone, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
            ? 'glass-panel py-4 shadow-md bg-brand-bg/90 backdrop-blur-md' 
            : 'bg-black/20 backdrop-blur-sm py-6'
        }`}
      >
        <div className="w-full px-6 flex justify-between items-center">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
            <img 
              src="/bsd-logo.png" 
              alt="Balaji Chilkur Family Dhaba Logo" 
              className="w-16 h-16 md:w-[72px] md:h-[72px] object-contain"
            />
            <span className={`font-display text-xs sm:text-sm md:text-base font-bold tracking-wider uppercase transition-colors duration-300 group-hover:text-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] ${
              isScrolled ? 'text-brand-dark' : 'text-white'
            }`}>
              BALAJI CHILKUR FAMILY DHABA
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`relative font-sans text-sm font-medium tracking-wide uppercase transition-colors duration-300 py-1 ${
                  location.pathname === link.path 
                    ? 'text-brand-gold' 
                    : isScrolled 
                      ? 'text-brand-dark hover:text-brand-accent'
                      : 'text-white/90 hover:text-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a 
              href="tel:+919849498681" 
              className={`flex items-center space-x-2 transition-colors duration-300 text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full border ${
                isScrolled
                  ? 'text-brand-dark hover:text-brand-accent border-brand-dark/20 hover:border-brand-accent'
                  : 'text-white hover:text-brand-gold border-white/30 hover:border-brand-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
              }`}
            >
              <Phone size={14} className="text-brand-gold" />
              <span>Call Now</span>
            </a>
            <Link 
              to="/menu" 
              className="flex items-center space-x-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark transition-colors duration-300 text-sm font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg shadow-brand-gold/30"
            >
              <ShoppingBag size={14} />
              <span>Order Online</span>
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden flex items-center space-x-4">
            <a 
              href="tel:+919849498681" 
              className={`p-2 rounded-full border transition-colors ${
                isScrolled
                  ? 'border-brand-dark/15 text-brand-dark hover:text-brand-accent'
                  : 'border-white/30 text-white hover:text-brand-gold'
              }`}
            >
              <Phone size={16} />
            </a>
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
                  to={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`font-display text-2xl font-bold tracking-wide transition-colors ${
                    location.pathname === link.path ? 'text-brand-accent' : 'text-brand-dark'
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
              <Link 
                to="/menu" 
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
