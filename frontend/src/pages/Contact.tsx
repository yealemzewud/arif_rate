import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Zap } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2/3 h-1/2 mesh-gradient opacity-10 animate-pulse-slow pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-500 font-bold tracking-[0.3em] text-[10px] uppercase block mb-4"
          >
            Connect with us
          </motion.span>
          <h1 className="text-5xl font-serif text-slate-900 mb-6">Get in Touch</h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-8" />
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Have questions about our neural pricing engine or need assistance with a booking? Our team of hospitality experts and data scientists is here.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                    <Mail size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Email</p>
                    <p className="font-bold text-slate-900">support@arifrate.com</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                    <Phone size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Phone</p>
                    <p className="font-bold text-slate-900">+251 911 234 567</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                    <MapPin size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Address</p>
                    <p className="font-bold text-slate-900">Bole Road, Addis Ababa, ET</p>
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden"
            >
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-amber-400">
                     <Zap size={20} />
                     <span className="text-xs font-black uppercase tracking-widest">Rapid Response</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-light mb-6">
                    Our team typically responds within <span className="text-white font-bold">2 business hours</span> for urgent booking calibrations.
                  </p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-[2.5rem]"
            >
              <form className="grid sm:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Your Identity</label>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Email Vector</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                 </div>
                 <div className="sm:col-span-2 space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">How can we help?</label>
                    <textarea 
                      placeholder="Your message..." 
                      rows={5}
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                 </div>
                 <div className="sm:col-span-2">
                    <button className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-amber-600 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2">
                       Establish Connection <Send size={14} />
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
