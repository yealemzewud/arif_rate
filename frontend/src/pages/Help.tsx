import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, HelpCircle, Zap, ShieldCheck, Globe } from 'lucide-react';

const FAQS = [
  {
    q: "How does the ML engine know about timelines?",
    a: "Our neural engine aggregates multi-year seasonal data, local event calendars (including major Ethiopian holidays and festivals), and real-time competitor occupancy across 4+ data sources to forecast precise demand curves."
  },
  {
    q: "Why do prices fluctuate in real-time?",
    a: "Our 'Live Feed' integration monitors regional supply and demand shifts every 60 seconds. This ensures that the rate you see reflects the absolute latest market condition, protecting you from paying more than necessary during low-demand windows."
  },
  {
    q: "Can I lock-in a rate without immediate payment?",
    a: "Yes. ArifRate offers a 24-hour 'Calibration Lock' for selected stays. This allows our ML engine to reserve the specific rate for you while you finalize your travel logistics."
  },
  {
    q: "Is my data encrypted during the booking process?",
    a: "Security is our baseline. We utilize bank-grade AES-256 encryption for all data transmissions. Your payment metadata is never stored on our servers and is processed exclusively through PCI-compliant gateways."
  },
  {
    q: "Do you offer corporate rates for Ethiopian businesses?",
    a: "Absolutely. We offer a 'Habesha Business' tier designed for local enterprises. This includes fixed-rate stability for high-frequency travel and consolidated billing and analytics for your finance team."
  }
];

export const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setAiResponse(null);

    // Mock AI Neural Response Logic
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      let response = null;

      if (query.includes('ml') || query.includes('ai') || query.includes('intelligence')) {
        response = "ArifRate utilizes advanced ML Random Regression modeling to analyze multi-source resort data. It specifically identifies demand spikes and pricing anomalies in the East African hospitality market using the best-performing regression algorithms to protect user value.";
      } else if (query.includes('price') || query.includes('rate') || query.includes('cost')) {
        response = "Our pricing logic is purely regression-driven. By aggregating 'Live Feed' market anchors, we eliminate the 'Tourist Premium' and ensure you are booked at the exact market equilibrium point predicted by our ML models.";
      } else if (query.includes('secure') || query.includes('safe') || query.includes('data')) {
        response = "ArifRate employs a zero-trust architecture. All sensitive payloads are handled securely before transmission to our application nodes, ensuring zero visibility into your personal financial vectors.";
      } else if (query.includes('ethiopia') || query.includes('habesha') || query.includes('kuriftu')) {
        response = "ArifRate is optimized specifically for the unique timelines of Ethiopian travel, including the specific seasonal demand surges observed across luxury Habesha retreats.";
      } else if (filteredFaqs.length === 0) {
        response = "I couldn't find a direct match in our active cache, but our Regression logic suggests this relates to our 'Value Optimization' protocols. Please contact our hospitality architects for a detailed brief.";
      }

      setAiResponse(response);
      setIsSearching(false);
    }, 800);
  };

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
            ArifRate Knowledge Base
          </motion.span>
          <h1 className="text-5xl font-serif text-slate-900 mb-6">How can we help?</h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-8" />
          
          <div className="max-w-2xl mx-auto relative group">
             <div className="absolute inset-0 bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
             <div className="relative glass p-2 rounded-2xl flex items-center gap-4">
                <Search size={22} className="text-slate-400 ml-4" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask any question about our intelligence..." 
                  className="w-full bg-transparent p-4 focus:outline-none text-slate-900 font-medium placeholder:text-slate-300"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-colors shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                   {isSearching ? 'Analyzing...' : 'Search'}
                </button>
             </div>
          </div>
        </div>

        {/* Neural AI Response Area */}
        {(isSearching || aiResponse) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-20"
          >
             <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-3 text-amber-400 mb-6 font-black uppercase tracking-widest text-[10px]">
                   <Zap size={16} /> Regression Insights
                </div>
                {isSearching ? (
                  <div className="flex gap-2 items-center text-slate-400 italic font-light">
                     <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                     <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                     Synthesizing response...
                  </div>
                ) : (
                  <p className="text-lg font-light leading-relaxed text-slate-200">
                    {aiResponse}
                  </p>
                )}
             </div>
          </motion.div>
        )}

        {/* Categories (Hide during search results perhaps? No, keep them but maybe dim) */}
        {!aiResponse && (
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { 
                icon: Zap, 
                title: "Dynamic Pricing", 
                desc: "Learn how our ML models calculate the 'Arif Rate' using market timelines.",
                color: "amber"
              },
              { 
                icon: ShieldCheck, 
                title: "Booking Security", 
                desc: "Details on reservation guarantees, cancellations, and payment processing.",
                color: "emerald"
              },
              { 
                icon: Globe, 
                title: "International Guests", 
                desc: "Information on currency conversion, visas, and transfer services.",
                color: "indigo"
              }
            ].map((cat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass p-10 rounded-[2.5rem] bg-white group hover:bg-slate-50 transition-colors cursor-pointer shadow-lg shadow-slate-200/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-${cat.color}-500/10 flex items-center justify-center text-${cat.color}-600 mb-8`}>
                   <cat.icon size={24} />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 mb-4">{cat.title}</h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">{cat.desc}</p>
                <div className="flex items-center gap-2 text-amber-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   Browse Category <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-3xl font-serif text-slate-900 mb-10 flex items-center gap-3">
                 <HelpCircle className="text-amber-500" size={28} /> {searchQuery && filteredFaqs.length > 0 ? 'Search Results' : 'Intelligence FAQ'}
              </h2>
              <div className="space-y-4">
                 {filteredFaqs.length > 0 ? (
                   filteredFaqs.map((faq, i) => (
                     <FAQItem key={i} question={faq.q} answer={faq.a} />
                   ))
                 ) : (
                   <div className="text-center py-10">
                      <p className="text-slate-400 font-light italic">No matching FAQ entries found. Try searching for "ML" or "Pricing".</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      className={`border border-slate-100 rounded-3xl transition-all duration-300 overflow-hidden ${isOpen ? 'bg-slate-50 border-amber-200' : 'bg-white hover:border-slate-300'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className={`font-bold transition-colors ${isOpen ? 'text-amber-600' : 'text-slate-900'}`}>{question}</span>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           transition={{ duration: 0.3 }}
        >
           <ChevronRight size={20} className={isOpen ? 'text-amber-500' : 'text-slate-300'} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-slate-500 text-sm font-light leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  );
};
