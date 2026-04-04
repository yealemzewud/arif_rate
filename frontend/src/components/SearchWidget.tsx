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
      transition={{ delay: 0.2, duration: 0.8 }}
      className="max-w-6xl mx-auto -mt-32 relative z-20 px-4 mb-20"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Check-in */}
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" /> Check In
            </label>
            <input
              type="date"
              className="w-full pb-2 border-b-2 border-slate-100 focus:border-amber-500 focus:outline-none transition-colors text-slate-800 font-medium bg-transparent"
              value={searchForm.chk_in}
              onChange={(e) => setSearchForm({ ...searchForm, chk_in: e.target.value })}
            />
          </div>

          {/* Check-out */}
          <div className="flex flex-col relative before:absolute before:left-0 before:-ml-3 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-8 before:bg-slate-200 lg:before:block before:hidden">
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" /> Check Out
            </label>
            <input
              type="date"
              className="w-full pb-2 border-b-2 border-slate-100 focus:border-amber-500 focus:outline-none transition-colors text-slate-800 font-medium bg-transparent"
              value={searchForm.chk_out}
              onChange={(e) => setSearchForm({ ...searchForm, chk_out: e.target.value })}
            />
          </div>

          {/* Room Type */}
          <div className="flex flex-col relative before:absolute before:left-0 before:-ml-3 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-8 before:bg-slate-200 lg:before:block before:hidden">
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <ChevronDown size={14} className="text-amber-500" /> Room Type
            </label>
            <select
              className="w-full pb-2 border-b-2 border-slate-100 focus:border-amber-500 focus:outline-none transition-colors text-slate-800 font-medium bg-transparent appearance-none cursor-pointer"
              value={searchForm.room_type}
              onChange={(e) => setSearchForm({ ...searchForm, room_type: e.target.value })}
            >
              {roomTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>

          {/* Guests */}
          <div className="flex flex-col relative before:absolute before:left-0 before:-ml-3 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-8 before:bg-slate-200 lg:before:block before:hidden">
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <Users size={14} className="text-amber-500" /> Adults
            </label>
            <div className="flex items-center gap-4 pb-2 border-b-2 border-slate-100">
              <button 
                onClick={handleRemoveAdult}
                className="text-slate-400 hover:text-amber-500 transition-colors"
                type="button"
              >
                <Minus size={16} />
              </button>
              <span className="font-medium text-slate-800 w-4 text-center">{searchForm.no_of_adults || 2}</span>
              <button 
                onClick={handleAddAdult}
                className="text-slate-400 hover:text-amber-500 transition-colors"
                type="button"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Options Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex flex-wrap gap-4 md:gap-6 items-center w-full">
              
              <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">Currency</span>
                <select
                  className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  value={searchForm.currency || 'USD'}
                  onChange={(e) => setSearchForm({ ...searchForm, currency: e.target.value })}
                >
                  {['USD', 'EUR', 'GBP', 'ETB', 'AED', 'KES'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <UserPlus size={16} className="text-amber-500" /> Children Ages ({searchForm.childrens?.length || 0})
              </span>
              {searchForm.childrens?.map((child, i) => (
                <div key={i} className="flex items-center bg-slate-50 rounded-full px-3 py-1 border border-slate-200">
                  <input
                    type="number"
                    min="0"
                    max="17"
                    className="w-8 text-center bg-transparent focus:outline-none text-sm font-medium text-slate-700"
                    value={child.age_of_children}
                    onChange={(e) => updateChild(i, parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs text-slate-400 mr-2">yrs</span>
                  <button onClick={() => removeChild(i)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={addChild}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
              >
                + Add Child
              </button>
            </div>

            <button
              onClick={onSearch}
              disabled={isLoading || !searchForm.chk_in || !searchForm.chk_out}
              className="w-full md:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <ChevronDown className="animate-spin" size={20} />
                </motion.div>
              ) : (
                <>Check Availability</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
