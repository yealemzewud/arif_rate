import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Zap, Database } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-2/3 h-1/2 mesh-gradient opacity-10 animate-pulse-slow pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-500 font-bold tracking-[0.3em] text-[10px] uppercase block mb-4"
          >
            Data Trust Protocol
          </motion.span>
          <h1 className="text-5xl font-serif text-slate-900 mb-6">Privacy & AI Transparency</h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-8" />
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            How we handle your data in the age of neural pricing.
          </p>
        </div>

        {/* Content Section */}
        <div className="glass p-12 rounded-[3rem] bg-white space-y-12 shadow-2xl relative overflow-hidden">
           <section className="space-y-4">
              <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                 <ShieldCheck className="text-amber-500" size={24} /> 1. Data Collection & ML
              </h2>
              <p className="text-slate-500 leading-relaxed font-light">
                 ArifRate collects minimal personal data required for booking. Our ML models process <span className="text-slate-900 font-medium">anonymized search patterns</span> to calculate market timelines. We do not sell your personal data to third parties.
              </p>
           </section>

           <div className="h-px bg-slate-100" />

           <section className="space-y-4">
              <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                 <Lock className="text-amber-500" size={24} /> 2. Security Infrastructure
              </h2>
              <p className="text-slate-500 leading-relaxed font-light">
                 All booking transmissions are encrypted via SSL/TLS. Payment tokens are never stored on our neural engine's servers, ensuring your financial information remains under bank-grade protection.
              </p>
           </section>

           <div className="h-px bg-slate-100" />

           <section className="space-y-4">
              <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                 <Zap className="text-amber-500" size={24} /> 3. Dynamic Pricing AI
              </h2>
              <p className="text-slate-500 leading-relaxed font-light">
                 Our pricing engine uses publicly available market anchors and resort inventory logs. Your individual browsing history <span className="text-slate-900 font-medium">does not negatively impact the price</span> you see; the AI seeks the absolute best market moment for every user.
              </p>
           </section>

           <div className="h-px bg-slate-100" />

           <section className="space-y-4">
              <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                 <Eye className="text-amber-500" size={24} /> 4. Your Rights
              </h2>
              <p className="text-slate-500 leading-relaxed font-light">
                 You have the right to request a full transcript of the data we hold, or to request the immediate purging of your booking history from our active neural caches.
              </p>
           </section>

           <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <Database className="text-slate-400 mt-1" size={20} />
              <div className="text-xs text-slate-400 leading-relaxed font-light">
                 Last Updated: April 06, 2026. This policy is governed by the laws of the Federal Democratic Republic of Ethiopia and international data standards.
              </div>
           </div>
        </div>

        <div className="text-center mt-12">
           <button className="text-amber-600 text-sm font-black uppercase tracking-widest border-b border-amber-600 pb-1 hover:text-amber-700 hover:border-amber-700 transition-colors">
              Download Full Protocol (PDF)
           </button>
        </div>
      </div>
    </div>
  );
};
