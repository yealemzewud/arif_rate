import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-2/3 h-1/2 mesh-gradient opacity-10 animate-pulse-slow pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md border border-white px-4 py-2 rounded-full mb-6">
               <span className="text-amber-600 font-black tracking-[0.2em] text-[10px] uppercase">Our Thesis</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-serif text-slate-900 leading-[1.1] mb-8">
              Predicting the <br /> 
              <span className="text-amber-500 italic">Perfect Moment</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-xl">
              ArifRate was born at the intersection of Ethiopian hospitality and <span className="text-slate-900 font-medium italic">ML Random Regression</span>. We don't just find rooms; we analyze the entire market timeline using the best-performing regression models to ensure you're booking at the optimal instant.
            </p>
            
            <div className="flex flex-wrap gap-4">
               <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20">
                  Our Mission
               </div>
               <div className="bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold text-slate-600">
                  The Tech Stack
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-[3rem] p-4 bg-white/30 relative">
               <img 
                 src="/resort.png" 
                 alt="ArifRate Luxury Sanctuary" 
                 className="rounded-[2.5rem] w-full h-[500px] object-cover shadow-2xl" 
               />
               
               {/* Floating Overlay Card */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                 className="absolute bottom-10 -left-10 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl max-w-[280px]"
               >
                  <Sparkles className="text-amber-400 mb-4" />
                  <p className="text-sm font-light leading-relaxed">
                    "Our ML Regression models predict demand timelines with <span className="text-amber-400 font-bold">98% accuracy</span>, saving travelers thousands of Birr."
                  </p>
               </motion.div>
            </div>
          </motion.div>
        </div>

        {/* The Three Pillars */}
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { 
              icon: TrendingUp, 
              title: "Regression Engine", 
              desc: "Optimized Random Forest models that understand the nuances of seasonal fluctuations across Ethiopia's core resorts.",
              color: "text-indigo-500" 
            },
            { 
              icon: ShieldCheck, 
              title: "Transparency", 
              desc: "We justify every price recommendation with a clear 'Thesis', built on data, not guesses.",
              color: "text-emerald-500" 
            },
            { 
              icon: Zap, 
              title: "Direct Action", 
              desc: "Seamless synchronization with hotel inventory management for zero-latency reservations.",
              color: "text-amber-500" 
            }
          ].map((pillar, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-10 rounded-[2.5rem] bg-white/60 hover:bg-white transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 ${pillar.color}`}>
                 <pillar.icon size={24} />
              </div>
              <h3 className="font-serif text-2xl text-slate-900 mb-4">{pillar.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
