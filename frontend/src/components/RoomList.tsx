import React from 'react';
import { motion } from 'framer-motion';
import { AdviceRequest } from '../types';
import { ArrowRight, Info, Check, Star, AlertTriangle } from 'lucide-react';

interface RoomListProps {
  advice: any;
  searchForm: AdviceRequest;
  onBook: () => void;
  onBack: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({ advice, searchForm, onBook, onBack }) => {

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
      <button onClick={onBack} className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={16} /> 
        Back to search
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col - Info */}
        <motion.div initial="hidden" animate="visible" variants={variants} transition={{ duration: 0.5 }} className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-serif text-2xl mb-4">Your Search</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Check In</span>
                <span className="font-medium text-slate-900">{searchForm.chk_in}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Check Out</span>
                <span className="font-medium text-slate-900">{searchForm.chk_out}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Guests</span>
                <span className="font-medium text-slate-900">
                  {searchForm.no_of_adults} Adults
                  {searchForm.childrens && searchForm.childrens.length > 0 && `, ${searchForm.childrens.length} Children`}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 text-sm">Room Preference</span>
                <span className="font-medium text-slate-900 text-right">{searchForm.room_type || 'Any Room'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <Info className="text-amber-400 shrink-0 mt-1" size={20} />
              <p className="text-sm text-slate-300 leading-relaxed">
                With our Dynamic Pricing engine, locking in your booking now ensures the best possible rate. Prices fluctuate based on live demand.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Col - Results */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-3xl mb-6">Available Options</h2>

          <motion.div initial="hidden" animate="visible" variants={variants} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl p-0 shadow-sm border border-slate-100 overflow-hidden relative">
            
            <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
              <Star size={12} fill="currentColor" /> Premium Pick
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 h-64 md:h-auto overflow-hidden bg-slate-200 relative">
                <img 
                  src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop" 
                  alt="Room View" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl mb-2">{searchForm.room_type || "Deluxe Suite"}</h3>
                  <p className="text-slate-500 flex items-center gap-1 text-sm mb-4">
                    Breakfast included <span className="mx-2 text-slate-300">•</span> Free cancellation
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-3 mb-6">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Ocean View</span>
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Spa Access</span>
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> King Bed</span>
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Mini Bar</span>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-100 pt-6">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Dynamic Rate / Night</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-serif">
                        {advice?.final_pricing?.advised_nightly_price 
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: advice.input.currency }).format(advice.final_pricing.advised_nightly_price)
                          : '$245.00'}
                      </span>
                    </div>
                    {advice?.final_pricing?.total_stay_price && (
                      <span className="text-xs text-slate-500 mt-1 block">
                        Total for {advice.stay_nights} nights: {new Intl.NumberFormat('en-US', { style: 'currency', currency: advice.input.currency }).format(advice.final_pricing.total_stay_price)}
                      </span>
                    )}
                  </div>
                  <button onClick={onBook} className="bg-slate-900 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-md">
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>

            {/* Warnings Display */}
            {advice?.warnings && advice.warnings.length > 0 && (
              <div className="bg-red-50/50 border-t border-red-100 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-2">Notice</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {advice.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* AI Pricing Insights */}
            {advice?.final_pricing?.reason && (
              <div className="bg-slate-50 p-6 border-t border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                 <Star size={16} className="text-amber-500" /> AI Pricing Insights
                </h4>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  {advice.final_pricing.reason.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <span className="leading-relaxed">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
