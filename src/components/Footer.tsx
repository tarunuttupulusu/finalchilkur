import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-[#F6EFE3]/80 border-t border-brand-gold/15 py-16 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative luxury gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Brand Info */}
        <div className="flex flex-col space-y-6">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
            <img 
              src="/bsd-logo.png" 
              alt="Balaji Chilkur Family Dhaba Logo" 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-contain bg-black/25 border border-brand-gold/30 shadow-md group-hover:border-brand-gold transition-colors"
            />
            <span className="font-display text-sm md:text-base font-bold tracking-wider uppercase text-brand-bg group-hover:text-brand-gold transition-colors duration-300">
              BALAJI CHILKUR FAMILY DHABA
            </span>
          </Link>
          <p className="font-sans text-sm leading-relaxed text-[#F6EFE3]/60">
            Serving the finest vegetarian culinary delights in Moinabad. Famous for our Butter Naan, Paneer Butter Masala, and welcoming atmosphere.
          </p>
          <div className="flex space-x-4">
            <a 
              href="tel:+919849498681" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0084FF] hover:scale-110 shadow-md transition-all duration-300" 
              aria-label="Call Balaji Restaurant"
            >
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.62 4c0-.55-.45-1-1-1H4.11c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z" />
              </svg>
            </a>
            <a 
              href="https://wa.me/919849498681?text=Hi%20Balaji%20Chilkur%20Family%20Dhaba!%20I'd%20like%20to%20make%20an%20inquiry." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366] hover:scale-110 shadow-md transition-all duration-300" 
              aria-label="WhatsApp Balaji Restaurant"
            >
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.793 1.49 5.485.002 9.953-4.462 9.956-9.943.002-2.656-1.03-5.153-2.905-7.03C16.61 1.83 14.117.794 11.46.794 5.976.794 1.508 5.26 1.505 10.744c-.001 1.624.425 3.208 1.232 4.606l-.997 3.639 3.731-.978c1.378.75 2.766 1.145 3.576.743zm11.306-6.85c-.279-.14-1.647-.812-1.9-.904-.253-.092-.438-.138-.621.14-.183.279-.708.904-.868 1.088-.16.184-.32.207-.6.066-.279-.14-1.18-.435-2.247-1.388-.83-.74-1.39-1.653-1.553-1.93-.163-.279-.018-.43.12-.569.127-.123.279-.323.418-.484.14-.16.187-.274.28-.458.093-.184.047-.346-.023-.485-.07-.14-.621-1.498-.85-2.05-.224-.54-.447-.466-.621-.475-.16-.008-.344-.01-.528-.01s-.484.068-.737.346c-.253.279-.966.945-.966 2.302 0 1.358.989 2.668 1.127 2.852.138.184 1.944 2.97 4.71 4.164.658.284 1.172.454 1.572.58.66.21 1.26.18 1.733.11.528-.078 1.647-.674 1.88-1.325.233-.65.233-1.21.164-1.325-.07-.11-.253-.18-.532-.32z"/>
              </svg>
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:scale-110 shadow-md transition-all duration-300"
              style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
              aria-label="Instagram Balaji Restaurant"
            >
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF0000] hover:scale-110 shadow-md transition-all duration-300" 
              aria-label="YouTube Balaji Restaurant"
            >
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-lg font-bold tracking-wider text-brand-bg border-b border-brand-gold/15 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-3 font-sans text-sm">
            <li>
              <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-brand-gold transition-colors">Interactive Menu</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand-gold transition-colors">Our Heritage</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-brand-gold transition-colors">Photo Gallery</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand-gold transition-colors">Find Us & Contact</Link>
            </li>
          </ul>
        </div>

        {/* Operating Hours & Services */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-lg font-bold tracking-wider text-brand-bg border-b border-brand-gold/15 pb-2">
            Opening Hours
          </h4>
          <ul className="space-y-3 font-sans text-sm text-[#F6EFE3]/70">
            <li className="flex items-start space-x-3">
              <Clock size={16} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-brand-bg">Daily Operation</p>
                <p className="text-xs text-[#F6EFE3]/50">11:00 AM – 11:00 PM</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Compass size={16} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-brand-bg">Services Available</p>
                <p className="text-xs text-[#F6EFE3]/50">Dine In • Takeaway • Delivery</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact details */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-lg font-bold tracking-wider text-brand-bg border-b border-brand-gold/15 pb-2">
            Our Branches
          </h4>
          <ul className="space-y-4 font-sans text-[#F6EFE3]/70">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-gold shrink-0 mt-0.5" />
              <a 
                href="https://www.google.com/maps/search/?api=1&query=1+2nd+floor,+HMT+Rd,+above+The+kakatiya+co-operative+Bank.LTD,+beside+Ridge+Towers,+Chinthal,+Quthbullapur,+Hyderabad,+Telangana+500037"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-gold transition-colors block text-left"
              >
                <p className="font-bold text-[#F6EFE3] text-sm">Chinthal Branch</p>
                <p className="text-xs mt-0.5 text-[#F6EFE3]/60">2nd floor, HMT Rd, above Kakatiya Bank, Hyderabad</p>
              </a>
            </li>
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-gold shrink-0 mt-0.5" />
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Balaji+Santosh+Family+Dhaba+Aziz+Nagar+Himayat+Sagar+Rd+Moinabad+Telangana"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-gold transition-colors block text-left"
              >
                <p className="font-bold text-[#F6EFE3] text-sm">Aziz Nagar Branch</p>
                <p className="text-xs mt-0.5 text-[#F6EFE3]/60">Aziz Nagar, Himayat Sagar Rd, Moinabad</p>
              </a>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={16} className="text-brand-gold shrink-0" />
              <a href="tel:+919032292421" className="hover:text-brand-gold text-sm font-semibold transition-colors">+91 90322 92421</a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#F6EFE3]/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#F6EFE3]/40 font-sans">
        <p>© {currentYear} Balaji Chilkur Family Dhaba. All Rights Reserved.</p>
        <p className="mt-2 sm:mt-0">Designed and Developed to Perfection.</p>
      </div>
    </footer>
  );
};
