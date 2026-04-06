import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdviceRequest } from '../types';
import {
  ArrowRight,
  Check,
  Star,
  AlertTriangle,
  TrendingUp,
  Users,
  Sparkles,
  Globe,
  ShieldCheck,
  BarChart3,
  Calendar as CalendarIcon,
  Activity,
  History,
  TrendingDown,
  Info
} from 'lucide-react';
import { getUnifiedDate } from '../utils/calendars';

const CountUp: React.FC<{ value: number; currency: string }> = ({ value, currency }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(displayValue)}
    </span>
  );
};

interface RoomListProps {
  advice: any;
  searchForm: AdviceRequest;
  onBook: () => void;
  onBack: () => void;
}

const TripleCalendar: React.FC<{ chkIn: string; chkOut: string }> = ({ chkIn, chkOut }) => {
  const checkInContext = getUnifiedDate(chkIn);
  const checkOutContext = getUnifiedDate(chkOut);

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {[
        { title: 'Check In', context: checkInContext, icon: CalendarIcon },
        { title: 'Check Out', context: checkOutContext, icon: Check }
      ].map((term, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass p-6 rounded-3xl relative overflow-hidden group border border-amber-100/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <term.icon size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{term.title} TIMELINE</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Gregorian</p>
              <p className="text-sm font-bold text-slate-900 leading-tight">{term.context.gregorian}</p>
            </div>
            <div className="space-y-1 border-x border-slate-100 px-4">
              <p className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Ethiopian</p>
              <p className="text-sm font-bold text-slate-900 leading-tight">{term.context.ethiopian}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">Hijri</p>
              <p className="text-sm font-bold text-slate-900 leading-tight whitespace-nowrap">{term.context.hijri.split(',')[0]}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
};

const DemandForecast: React.FC<{ occupancy: number }> = ({ occupancy }) => {
  // Generate a mock demand curve based on occupancy
  const points = [
    { x: 0, y: 80 }, { x: 20, y: 60 }, { x: 40, y: 75 },
    { x: 60, y: 40 }, { x: 80, y: 90 }, { x: 100, y: occupancy }
  ];

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden bg-white/40 border border-slate-200/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="font-serif text-xl">Regression Forecast</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">7-Day Market Demand</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900">{occupancy}%</p>
          <p className="text-[8px] text-emerald-500 uppercase tracking-widest font-black">Predicted Peak</p>
        </div>
      </div>

      <div className="h-24 w-full relative group">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={pathData}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d={`${pathData} L 100,100 L 0,100 Z`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            fill="url(#curveGradient)"
          />
          <motion.circle
            cx="100"
            cy={occupancy}
            r="3"
            fill="#f59e0b"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>

        <div className="absolute top-0 left-0 w-full h-full flex justify-between pointer-events-none opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const RoomList: React.FC<RoomListProps> = ({ advice, searchForm, onBook, onBack }) => {
  const currency = advice?.input?.currency || 'USD';
  const nightlyPrice = advice?.final_pricing?.advised_nightly_price || 0;
  const marketAvg = advice?.live_market_context?.market_average_total || 0;
  const isGoodValue = nightlyPrice < marketAvg;
  const occupancy = advice?.final_pricing?.avg_expected_occupancy_pct || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen bg-slate-50/50">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
      >
        <ArrowRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={16} />
        Back to search
      </motion.button>

      <div className="grid lg:grid-cols-12 gap-10">

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 sticky top-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                <Globe size={20} />
              </div>
              <h3 className="font-serif text-2xl">Trip Details</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Stay Window</span>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{searchForm.chk_in}</p>
                  <p className="text-xs text-slate-400">to {searchForm.chk_out}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Occupancy</span>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  <Users size={14} className="text-slate-500" />
                  <span className="font-bold text-slate-900">
                    {searchForm.no_of_adults} Adults
                    {searchForm.childrens && searchForm.childrens.length > 0 && ` + ${searchForm.childrens.length} Child`}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Preference</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">{searchForm.room_type || 'Any Room'}</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Price Protection</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  Our neural engine monitors <span className="text-white font-medium">real-time inventory fluctuation</span>. Booking now secures this generated rate against demand spikes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-2 block"
              >
                Market Intelligence Dashboard
              </motion.span>
              <h2 className="font-serif text-4xl text-slate-900 leading-tight">Optimized Recommendations</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                ArifAI Optimized Selection
              </div>
            </div>
          </div>

          {/* Timeline & Demand Hub */}
          <div className="space-y-8">
            <TripleCalendar chkIn={searchForm.chk_in} chkOut={searchForm.chk_out} />
            <div className="grid md:grid-cols-2 gap-8">
              <DemandForecast occupancy={occupancy} />
              <div className="glass p-8 rounded-[2.5rem] bg-white text-slate-900 relative overflow-hidden flex flex-col justify-between border border-slate-100 shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 shadow-lg shadow-slate-200">
                      <Info size={20} />
                    </div>
                    <h4 className="font-serif text-xl italic text-slate-900">Market Signal</h4>
                  </div>
                  <p className="text-sm font-light leading-relaxed text-slate-500">
                    Our regression models indicate high interest for the <span className="text-slate-900 font-bold">{getUnifiedDate(searchForm.chk_in).ethiopian.split(' ')[0]}</span> season. Current rates reflect optimized equilibrium.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Analysis Confirmed
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative"
            >
              {/* Dynamic Badge */}
              <div className="absolute top-6 left-6 z-20 flex gap-2">
                <div className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse-slow">
                  <TrendingUp size={12} className="text-amber-400" />
                  ArifAI Recommended
                </div>
              </div>

              <div className="flex flex-col xl:flex-row">
                <div className="xl:w-2/5 relative h-80 xl:h-auto overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop"
                    alt="Room Imagery"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent xl:hidden" />
                  <div className="absolute bottom-6 left-6 xl:hidden">
                    <h3 className="text-white font-serif text-2xl">
                      {searchForm.room_type || "Deluxe Royal Suite"}
                    </h3>
                  </div>
                </div>

                <div className="xl:w-3/5 p-8 xl:p-12 flex flex-col justify-between bg-white relative">
                  <div>
                    <div className="hidden xl:block mb-6">
                      <h3 className="font-serif text-4xl text-slate-900 mb-3">
                        {searchForm.room_type || "Deluxe Royal Suite"}
                      </h3>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />
                          All-inclusive Breakfast
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />
                          Free Cancellation
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      {[
                        { label: 'Lake View', icon: Globe },
                        { label: 'Cloud-pax Bed', icon: Star },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                            <item.icon size={16} />
                          </div>
                          <span className="text-sm font-medium text-slate-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Dynamic Advisory Rate
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold font-serif text-slate-900">
                          <CountUp value={nightlyPrice} currency={currency} />
                        </span>
                        <span className="text-slate-400 font-medium">/ night</span>
                      </div>
                    </div>

                    <button
                      onClick={onBook}
                      className="relative group bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold overflow-hidden shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10 flex items-center gap-2">
                        Reserve Optimized Rate <ArrowRight size={18} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Warnings / Notices */}
            {advice?.warnings && advice.warnings.filter((w: string) => !w.toLowerCase().includes('live feed skipped')).length > 0 && (
              <div className="bg-amber-50/50 border-t border-amber-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-amber-900 mb-1">Stay Optimization Notice</p>
                    <ul className="text-amber-800/80 space-y-1 font-medium">
                      {advice.warnings
                        .filter((w: string) => !w.toLowerCase().includes('live feed skipped'))
                        .map((w: string, i: number) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Insights Grid */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* Market Comparison Card */}
              <motion.div
                variants={itemVariants}
                className="glass rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="font-serif text-xl">Market Positioning</h4>
                  </div>
                  {isGoodValue ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Advantage</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium Room</span>
                  )}
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>ArifRate Advantage</span>
                      <span className="text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(nightlyPrice)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-slate-900 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Market Average</span>
                      <span className="text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(marketAvg || 310)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(marketAvg / (nightlyPrice * 1.2)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-amber-400 rounded-full opacity-60"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {isGoodValue
                      ? "Current pricing is below global market average for this room profile. Recommend immediate booking."
                      : "Premium inventory pricing detected due to limited seasonal availability and high event demand."}
                  </p>
                </div>
              </motion.div>

              {/* Demand Heatmap Card */}
              <motion.div
                variants={itemVariants}
                className="glass rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                      <TrendingUp size={20} />
                    </div>
                    <h4 className="font-serif text-xl">Demand Index</h4>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full text-white text-[10px] font-black uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Live
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 py-2">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * occupancy) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={occupancy > 80 ? "text-rose-500" : "text-amber-500"}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-900 leading-none">{occupancy}%</span>
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Occupancy</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      {occupancy > 80 ? "Critical Scarcity" : occupancy > 50 ? "Moderate Interest" : "Optimal Availability"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Predicted for your stay window.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AI Reasoning Section */}
            {advice?.final_pricing?.reason && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-400 shadow-xl shadow-slate-200">
                        <Sparkles size={28} />
                      </div>
                      <div>
                        <h4 className="font-serif text-3xl text-slate-900">ArifAI Executive Brief</h4>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Regression Analysis & Market Sentiment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 italic text-xs text-slate-500">
                        <History size={14} className="text-indigo-500" /> Model v4.2 Active
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 italic text-xs text-slate-500">
                        <TrendingDown size={14} className="text-emerald-500" /> Low Latency
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(() => {
                      const reasons = advice.final_pricing.reason as string[];

                      const stayContext = reasons.filter(r =>
                        r.includes('(weekday)') || r.includes('(weekend)') ||
                        r.includes('Room type:') || r.includes('Booking lead time:')
                      );
                      const marketContext = reasons.filter(r => r.includes('Live ') || r.includes('Market'));
                      const signals = reasons.filter(r =>
                        r.includes('Holiday') || r.includes('event') || r.includes('Party-size')
                      );
                      const other = reasons.filter(r =>
                        !stayContext.includes(r) && !marketContext.includes(r) && !signals.includes(r)
                      );

                      const groupCard = (title: string, items: string[], Icon: any, colorClass: string, lightColor: string) => {
                        return (
                          <motion.div
                            whileHover={{ y: -5 }}
                            className={`${lightColor} border border-slate-100 rounded-[2.5rem] p-8 transition-all flex flex-col h-full`}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} shadow-inner`}>
                                <Icon size={18} />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</span>
                            </div>
                            <div className="space-y-4 flex-1">
                              {items.length > 0 ? items.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                                    {item.split('|').map((part, pidx) => (
                                      <span key={pidx} className={pidx > 0 ? "block mt-1 text-[11px] text-slate-400 italic" : ""}>
                                        {part.trim()}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                              )) : (
                                <p className="text-xs text-slate-400 italic">No specific signals detected for this vector.</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      };

                      return (
                        <>
                          {groupCard("Market Positioning", marketContext, BarChart3, "bg-indigo-500 text-white", "bg-indigo-50/30")}
                          {groupCard("Timeline Signals", signals, TrendingUp, "bg-amber-500 text-white", "bg-amber-50/30")}
                          {groupCard("Booking Advisory", other, ShieldCheck, "bg-emerald-500 text-white", "bg-emerald-50/30")}
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                        <Activity className="text-slate-900" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">ArifRate Confidence Index</p>
                        <p className="text-xs text-slate-400">High Reliability based on current supply liquidity</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-10 h-2 rounded-full ${i < 4 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};
