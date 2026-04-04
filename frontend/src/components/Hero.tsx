import React from 'react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-amber-400 font-serif italic text-xl md:text-2xl mb-4 tracking-wider">Welcome to ArifRate</h2>
          <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-6">
            Discover Your Perfect <br className="hidden md:block"/> Getaway Experience.
          </h1>
          <p className="text-slate-200 text-lg md:text-xl font-light max-w-2xl mx-auto tracking-wide">
            Immerse yourself in luxury and comfort with our exclusive resort selections, backed by an intelligent dynamic pricing engine.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
