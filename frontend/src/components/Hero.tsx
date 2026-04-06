import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onNavigate: (view: 'home' | 'about' | 'help' | 'contact' | 'privacy') => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative h-[95vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Mesh Gradient Background Layer */}
      <div className="absolute inset-0 mesh-gradient opacity-30 animate-pulse-slow z-0" />
      
      {/* Background Image with Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop')" }}
      />

      {/* Decorative Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" 
        />
      </div>

      {/* Dynamic Gradients for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-50 z-1" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <div 
            onClick={() => onNavigate('about')}
            className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-4 cursor-pointer hover:bg-white/10 transition-colors"
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
             </span>
             <span className="text-amber-400 font-medium text-xs uppercase tracking-[0.2em]">Next-Gen Pricing Intelligence</span>
          </div>

          <h1 className="text-white text-6xl md:text-8xl font-serif font-bold leading-[1.1] tracking-tight">
            Elevate Your <br />
            <span className="text-amber-500 italic">Habesha Getaway</span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed mb-10">
              The smartest way to book luxury in Ethiopia. Powered by real-time market data to ensure you always get the <span className="text-white font-medium italic">Arif Rate</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
          >
             {/* Interaction directed to the search section below */}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
