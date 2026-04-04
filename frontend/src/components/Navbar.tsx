import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}
          >
            Arif<span className="text-amber-500 font-serif italic">Rate</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className={`text-sm tracking-wide font-medium transition-colors hover:text-amber-400 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>Destinations</a>
            <a href="#" className={`text-sm tracking-wide font-medium transition-colors hover:text-amber-400 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>Experiences</a>
            <a href="#" className={`text-sm tracking-wide font-medium transition-colors hover:text-amber-400 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>Offers</a>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isScrolled ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'border-white text-white hover:bg-white/10'}`}>
              <User size={16} />
              <span className="text-sm font-medium">Log In</span>
            </button>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isScrolled ? 'text-slate-900' : 'text-white'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-4 flex flex-col items-center space-y-4"
        >
          <a href="#" className="text-slate-800 font-medium w-full text-center py-2 hover:bg-slate-50">Destinations</a>
          <a href="#" className="text-slate-800 font-medium w-full text-center py-2 hover:bg-slate-50">Experiences</a>
          <a href="#" className="text-slate-800 font-medium w-full text-center py-2 hover:bg-slate-50">Offers</a>
          <button className="text-amber-600 font-medium w-full text-center py-2 flex items-center justify-center gap-2">
            <User size={18} />
            Log In
          </button>
        </motion.div>
      )}
    </nav>
  );
};
