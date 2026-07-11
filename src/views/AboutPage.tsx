"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-brand-bg noise-overlay min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Editorial Page Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Our Journey</span>
          <h1 className="font-display text-4xl md:text-7xl font-black text-brand-dark mt-4 leading-tight">
            Pure Vegetarian <br/>
            Indian Hospitality
          </h1>
        </div>

        {/* First split story layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-brand-dark mb-6">
              Flavor, Quality, & Pure Vegetarian Ethics
            </h2>
            <div className="space-y-6 text-sm md:text-base text-brand-dark/75 font-sans leading-relaxed">
              <p>
                Founded on the values of traditional Indian hospitality, Balaji Chilkur Family Dhaba was established to serve high-quality, pure vegetarian cuisine to families and visitors in Aziz Nagar, Himayat Sagar Road, and the Chilkur locality.
              </p>
              <p>
                We believe that great vegetarian food starts with freshness. From our signature Paneer Butter Masala to our hot, tandoor-baked Butter Naan, we prepare our dishes daily using premium ingredients and direct farm-sourced vegetables.
              </p>
              <div className="border-l-4 border-brand-accent pl-6 py-2 my-8">
                <p className="font-display italic text-brand-dark/90 font-medium">
                  "Awesome food taste, friendly staff, and owner is very good and down to earth. Visited with my family, and loved the experience. There is plenty of parking space."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 order-1 lg:order-2 rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
          >
            <img 
              src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" 
              alt="Balaji Santosh Family Dhaba cooking process" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>

        {/* Second split story layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
          >
            <img 
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" 
              alt="Premium spices and ingredients at Balaji Santosh Family Dhaba" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-brand-dark mb-6">
              Our Culinary Philosophy
            </h2>
            <div className="space-y-6 text-sm md:text-base text-brand-dark/75 font-sans leading-relaxed">
              <p>
                To maintain authentic tastes, our kitchen focuses on freshly ground spices, rich gravies, and hygienic preparations. From our comforting Daal Tadka to our sizzling Paneer 65, every dish is crafted to deliver a homely yet festive dining experience.
              </p>
              <p>
                Our dedication extends beyond taste; we prioritize direct sourcing from local farmers, maintaining clean kitchen layouts, and ensuring an inviting, peaceful atmosphere located just 10 minutes from the Outer Ring Road (ORR).
              </p>
              <div className="border-l-4 border-brand-accent pl-6 py-2 my-8">
                <p className="font-display italic text-brand-dark/90 font-medium">
                  "Good family restaurant near Chilkur. All vegetarian dishes available here, serving high-quality food with generous portions."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Brand values / stats */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-brand-dark text-[#F6EFE3] p-12 rounded-2xl"
        >
          <div className="text-center">
            <p className="font-display text-4xl md:text-5xl font-black text-brand-gold">4.8 ★</p>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#F6EFE3]/50 mt-2">Google Rating</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl md:text-5xl font-black text-brand-gold">1,110+</p>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#F6EFE3]/50 mt-2">Happy Reviews</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl md:text-5xl font-black text-brand-gold">100%</p>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#F6EFE3]/50 mt-2">Authentic Spices</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl md:text-5xl font-black text-brand-gold">Moinabad</p>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#F6EFE3]/50 mt-2">Flagship Location</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
