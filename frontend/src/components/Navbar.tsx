import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onNavigate: (view: 'home' | 'about' | 'help' | 'contact' | 'privacy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Glowing Logo Mark */}
            <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-amber-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
               <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/20 transition-all">
                  <span className="text-amber-500 font-serif italic text-xl font-bold">A</span>
               </div>
            </div>
            {/* Logo Text */}
            <span className={`text-2xl font-serif font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              Arif<span className="text-amber-500 italic">Rate</span>
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
             <button 
               onClick={() => onNavigate('about')}
               className={`text-sm font-medium tracking-wide transition-colors text-amber-500 hover:text-amber-600`}
             >
               About Us
             </button>
             <button 
               onClick={() => onNavigate('help')}
               className={`text-sm font-medium tracking-wide transition-colors text-amber-500 hover:text-amber-600`}
             >
               Help Center
             </button>
             <button 
               onClick={() => onNavigate('contact')}
               className={`text-sm font-medium tracking-wide transition-colors text-amber-500 hover:text-amber-600`}
             >
               Contact
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
