import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ChevronDown, UserPlus, Minus, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdviceRequest } from '../types';

interface SearchWidgetProps {
  searchForm: AdviceRequest;
  setSearchForm: React.Dispatch<React.SetStateAction<AdviceRequest>>;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({ searchForm, setSearchForm, onSearch, isLoading }) => {
  const roomTypes = [
    'Presidential Suite', 'Junior Suite King', 'Deluxe Suite King', 
    'Water Park Suites King', 'Water Park Suites Twin', 'Water Park Suites Loft Family',
    'Deluxe Standards King', 'Deluxe Standards Twin', 'Deluxe Standards Family',
    'Deluxe Suite Twin', 'Deluxe Suite Family'
  ];

  const MAX_ADULTS = 10;
  const MAX_CHILDREN = 5;

  const handleAddAdult = () => {
    if ((searchForm.no_of_adults || 2) >= MAX_ADULTS) {
      toast.error(`Maximum of ${MAX_ADULTS} adults allowed.`);
      return;
    }
    setSearchForm({ ...searchForm, no_of_adults: (searchForm.no_of_adults || 2) + 1 });
  };

  const handleRemoveAdult = () => {
    if ((searchForm.no_of_adults || 2) <= 1) {
      toast.error('Minimum of 1 adult is required.');
      return;
    }
    setSearchForm({ ...searchForm, no_of_adults: (searchForm.no_of_adults || 2) - 1 });
  };

  const addChild = () => {
    if ((searchForm.childrens?.length || 0) >= MAX_CHILDREN) {
      toast.error(`Maximum of ${MAX_CHILDREN} children allowed.`);
      return;
    }
    setSearchForm(prev => ({ 
      ...prev, 
      childrens: [...(prev.childrens || []), { age_of_children: 0 }] 
    }));
  };

  const removeChild = (index: number) => {
    setSearchForm(prev => {
      const newChildrens = [...(prev.childrens || [])];
      newChildrens.splice(index, 1);
      return { ...prev, childrens: newChildrens };
    });
  }

  const updateChild = (index: number, age: number) => {
    setSearchForm(prev => {
      const newChildrens = [...(prev.childrens || [])];
      newChildrens[index] = { age_of_children: age };
      return { ...prev, childrens: newChildrens };
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
      className="max-w-6xl mx-auto -mt-28 relative z-20 px-4 mb-32"
      id="search-section"
    >
      <div className="glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
          
          {/* Check-in */}
          <div className="flex flex-col space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" /> Check In
            </label>
            <input
              type="date"
              className="w-full pb-3 border-b border-slate-200 focus:border-amber-500 focus:outline-none transition-all text-slate-900 font-bold text-lg bg-transparent cursor-pointer hover:border-slate-400"
              value={searchForm.chk_in}
              onChange={(e) => setSearchForm({ ...searchForm, chk_in: e.target.value })}
            />
          </div>

          {/* Check-out */}
          <div className="flex flex-col space-y-3 relative before:hidden lg:before:block before:absolute before:-left-5 before:top-4 before:bottom-0 before:w-px before:bg-slate-100">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" /> Check Out
            </label>
            <input
              type="date"
              className="w-full pb-3 border-b border-slate-200 focus:border-amber-500 focus:outline-none transition-all text-slate-900 font-bold text-lg bg-transparent cursor-pointer hover:border-slate-400"
              value={searchForm.chk_out}
              onChange={(e) => setSearchForm({ ...searchForm, chk_out: e.target.value })}
            />
          </div>

          {/* Room Type */}
          <div className="flex flex-col space-y-3 relative before:hidden lg:before:block before:absolute before:-left-5 before:top-4 before:bottom-0 before:w-px before:bg-slate-100">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
              <ChevronDown size={14} className="text-amber-500" /> Stay Category
            </label>
            <select
              className="w-full pb-3 border-b border-slate-200 focus:border-amber-500 focus:outline-none transition-all text-slate-900 font-bold text-lg bg-transparent appearance-none cursor-pointer hover:border-slate-400"
              value={searchForm.room_type}
              onChange={(e) => setSearchForm({ ...searchForm, room_type: e.target.value })}
            >
              {roomTypes.map(rt => <option key={rt} value={rt} className="text-slate-900 font-sans font-medium">{rt}</option>)}
            </select>
          </div>

          {/* Guests */}
          <div className="flex flex-col space-y-3 relative before:hidden lg:before:block before:absolute before:-left-5 before:top-4 before:bottom-0 before:w-px before:bg-slate-100">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
              <Users size={14} className="text-amber-500" /> Occupancy
            </label>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 hover:border-slate-400 transition-colors">
              <button 
                onClick={handleRemoveAdult}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                type="button"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-slate-900 text-lg w-12 text-center tracking-tighter">{searchForm.no_of_adults || 2} <span className="text-xs text-slate-400 font-medium">ADL</span></span>
              <button 
                onClick={handleAddAdult}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                type="button"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Extra Personalization */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1 flex flex-wrap gap-6 items-center">
              
              <div className="flex flex-col space-y-2">
                 <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Preferred Currency</span>
                 <div className="relative inline-block">
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer appearance-none pr-8"
                      value={searchForm.currency || 'USD'}
                      onChange={(e) => setSearchForm({ ...searchForm, currency: e.target.value })}
                    >
                      {['USD', 'EUR', 'GBP', 'ETB', 'AED', 'KES'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                 </div>
              </div>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                 <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                    <UserPlus size={14} className="text-amber-500" /> Young Guests ({searchForm.childrens?.length || 0})
                 </span>
                 <div className="flex flex-wrap gap-3">
                    {searchForm.childrens?.map((child, i) => (
                      <div key={i} className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-3 py-1.5 border border-amber-500/20 group/child">
                        <input
                          type="number"
                          min="0"
                          max="17"
                          className="w-6 text-center bg-transparent focus:outline-none text-sm font-black text-amber-700"
                          value={child.age_of_children}
                          onChange={(e) => updateChild(i, parseInt(e.target.value) || 0)}
                        />
                        <span className="text-[10px] uppercase font-black text-amber-600/60">YRS</span>
                        <button onClick={() => removeChild(i)} className="text-amber-400 hover:text-amber-600 ml-1"><X size={12} /></button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addChild}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 border-dashed hover:border-slate-900"
                    >
                      + Register Child
                    </button>
                 </div>
              </div>
            </div>

            <button
              onClick={onSearch}
              disabled={isLoading || !searchForm.chk_in || !searchForm.chk_out}
              className="lg:w-64 px-10 py-5 bg-slate-900 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>Analyzing</span>
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                   Calibrate Live Rates
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
