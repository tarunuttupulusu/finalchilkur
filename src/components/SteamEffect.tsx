import React from 'react';

export const SteamEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 flex justify-center items-end pointer-events-none overflow-hidden">
      <div className="relative w-64 h-64 flex justify-around items-end">
        {/* Steam line 1 */}
        <div 
          className="steam-particle w-3 h-24 bg-white/20 blur-md rounded-full"
          style={{ animationDelay: '0s', animationDuration: '5s' }}
        />
        {/* Steam line 2 */}
        <div 
          className="steam-particle w-4 h-32 bg-white/15 blur-lg rounded-full"
          style={{ animationDelay: '1.5s', animationDuration: '6s' }}
        />
        {/* Steam line 3 */}
        <div 
          className="steam-particle w-2 h-20 bg-white/25 blur-sm rounded-full"
          style={{ animationDelay: '3s', animationDuration: '4s' }}
        />
        {/* Steam line 4 */}
        <div 
          className="steam-particle w-3 h-28 bg-white/10 blur-xl rounded-full"
          style={{ animationDelay: '4.5s', animationDuration: '5.5s' }}
        />
      </div>
    </div>
  );
};

export const FloatingSpices: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Floating Cardamom */}
      <div className="absolute top-[25%] left-[10%] animate-float opacity-80" style={{ animationDelay: '0s' }}>
        <span className="text-2xl">🌱</span>
      </div>
      {/* Floating Star Anise */}
      <div className="absolute top-[40%] right-[15%] animate-float opacity-70" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
        <span className="text-3xl">⭐️</span>
      </div>
      {/* Floating Clove */}
      <div className="absolute bottom-[30%] left-[20%] animate-float opacity-60" style={{ animationDelay: '3s', animationDuration: '7s' }}>
        <span className="text-xl">🍂</span>
      </div>
      {/* Floating Cinnamon Stick */}
      <div className="absolute top-[70%] right-[10%] animate-float opacity-70" style={{ animationDelay: '0.5s', animationDuration: '9s' }}>
        <span className="text-2xl">🪵</span>
      </div>
      {/* Floating Saffron petal */}
      <div className="absolute bottom-[20%] right-[30%] animate-float opacity-90" style={{ animationDelay: '2s', animationDuration: '5s' }}>
        <span className="text-lg text-brand-gold">✨</span>
      </div>
    </div>
  );
};
