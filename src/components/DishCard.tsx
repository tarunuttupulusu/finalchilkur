import React from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Dish {
  id: string;
  name: string;
  teluguName?: string;
  description: string;
  price: string;
  category: string;
  image: string;
  rating?: number;
  isPopular?: boolean;
  isVegetarian?: boolean;
}

interface DishCardProps {
  dish: Dish;
  onOrderClick?: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onOrderClick }) => {
  const navigate = useNavigate();

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrderClick) {
      onOrderClick(dish);
    } else {
      // Navigate to Menu page with category and dish pre-selected
      navigate(`/menu?category=${encodeURIComponent(dish.category)}&dish=${encodeURIComponent(dish.name)}`);
    }
  };

  return (
    <motion.div
      onClick={handleOrder}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group relative bg-[#F6EFE3] rounded-2xl overflow-hidden border border-brand-dark/10 shadow-sm transition-shadow hover:shadow-xl flex flex-col h-full cursor-pointer"
    >
      {/* Popular / Veg badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {dish.isPopular && (
          <span className="flex items-center space-x-1 bg-brand-accent text-[#F6EFE3] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            <Flame size={10} className="fill-current" />
            <span>Popular</span>
          </span>
        )}
        {dish.isVegetarian !== undefined && (
          <span className={`w-5 h-5 flex items-center justify-center rounded-md border-2 bg-white ${dish.isVegetarian ? 'border-green-600' : 'border-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${dish.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
        )}
      </div>

      {/* Image container with luxury reveal */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark/5">
        <img 
          src={dish.image} 
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-brand-dark/20 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Rating and Category */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-olive font-sans">
            {dish.category}
          </span>
          {dish.rating && (
            <div className="flex items-center space-x-1 text-brand-gold">
              <Star size={12} className="fill-current" />
              <span className="text-xs font-semibold text-brand-dark">{dish.rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-2">
          <h3 className="font-display text-xl font-extrabold text-brand-dark group-hover:text-brand-accent transition-colors duration-300">
            {dish.name}
          </h3>
          {dish.teluguName && (
            <p className="font-telugu text-sm text-brand-accent/80 font-medium">
              {dish.teluguName}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-sans text-brand-dark/70 leading-relaxed mb-6 flex-grow">
          {dish.description}
        </p>

        {/* Price & Action */}
        <div className="flex justify-between items-center pt-4 border-t border-brand-dark/5 mt-auto">
          <span className="font-display text-lg font-bold text-brand-dark">
            {dish.price}
          </span>
          <button 
            onClick={handleOrder}
            className="relative px-5 py-2.5 bg-brand-accent text-[#F6EFE3] font-bold text-[10px] tracking-widest uppercase rounded-xl border border-brand-accent/50 shadow-[0_4px_0_0_#903008] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#903008] active:translate-y-[4px] active:shadow-[0_0px_0_0_#903008] transition-all flex items-center gap-1.5 select-none"
          >
            <ShoppingBag size={12} />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
