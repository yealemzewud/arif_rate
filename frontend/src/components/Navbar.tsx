import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-start items-center">
          <motion.div 
            initial={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-4 cursor-pointer group"
          >
            {/* Glowing Logo Mark */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-400/40 transition-shadow duration-500">
               <span className="text-white font-black text-xl tracking-tighter absolute z-10">A</span>
               <div className="absolute inset-0 bg-white/20 rounded-xl blur-[2px] border border-white/30 z-0"></div>
            </div>
            {/* Logo Text */}
            <span className={`text-2xl font-black tracking-widest uppercase ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              Arif<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Rate</span>
            </span>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};
