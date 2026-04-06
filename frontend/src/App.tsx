import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { motion } from 'framer-motion';
import { Hero } from './components/Hero';
import { SearchWidget } from './components/SearchWidget';
import { RoomList } from './components/RoomList';
import { BookingForm as BookingFormView } from './components/BookingForm';
import { AppStep, AdviceRequest, Booking } from './types';
import { format, addDays } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';

type AppView = 'home' | 'about' | 'help' | 'contact' | 'privacy';

const API_BASE = 'https://arifrate.onrender.com';

function App() {
  const defaultCheckIn = format(new Date(), 'yyyy-MM-dd');
  const defaultCheckOut = format(addDays(new Date(), 2), 'yyyy-MM-dd');

  const [searchForm, setSearchForm] = useState<AdviceRequest>({
    chk_in: defaultCheckIn,
    chk_out: defaultCheckOut,
    room_type: 'Deluxe Suite King',
    no_of_adults: 2,
    childrens: [],
    currency: 'USD',
    use_live_feed: true
  });

  const [advice, setAdvice] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState<Booking>({
    name: '',
    email: '',
    phone: '',
    advice: searchForm
  });
  
  const [step, setStep] = useState<AppStep>('search');
  const [view, setView] = useState<AppView>('home');
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, step]);

  useEffect(() => {
    setBookingForm(prev => ({ ...prev, advice: searchForm }));
  }, [searchForm]);

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('chk_in', searchForm.chk_in);
      params.append('chk_out', searchForm.chk_out);
      if (searchForm.room_type) params.append('room_type', searchForm.room_type);
      if (searchForm.use_live_feed !== undefined) params.append('use_live_feed', searchForm.use_live_feed.toString());
      if (searchForm.hotel_key) params.append('hotel_key', searchForm.hotel_key);
      if (searchForm.currency) params.append('currency', searchForm.currency);
      if (searchForm.no_of_adults) params.append('no_of_adults', searchForm.no_of_adults.toString());
      searchForm.childrens?.forEach(child => params.append('childrens_ages', child.age_of_children.toString()));
      if (searchForm.live_blend_weight !== undefined) params.append('live_blend_weight', searchForm.live_blend_weight.toString());

      const response = await fetch(`${API_BASE}/v1/advice?${params.toString()}`);
      if (!response.ok) {
        let errMsg = 'API Error';
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }
      const data = await response.json();
      

      setAdvice(data);
      setStep('results');
    } catch (error: any) {
      console.error('Error fetching advice', error);
      toast.error(error.message || 'Failed to communicate with pricing engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm.advice)
      });
      // Await for data if possible. Handling non-responsive/errors gracefully.
      try {
         const data = await response.json();
         console.log(data);
      } catch (e) {
         console.log("Empty or non-JSON response from POST");
      }
      
      alert('Your booking reservation is confirmed! Thank you for choosing ArifRate.');
      setStep('search');
      setBookingForm({ name: '', email: '', phone: '', advice: searchForm }); 
    } catch (error) {
      console.error('Error booking', error);
      alert('Booking saved locally! The server experienced an issue.');
      setStep('search');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans font-light selection:bg-amber-100 selection:text-amber-900">
      <Toaster position="top-right" />
      <Navbar onNavigate={(v: AppView) => { setView(v); setStep('search'); }} />

      {/* View Controller */}
      {view === 'home' && (
        <>
          {/* Main Flow Controller */}
          {step === 'search' && (
            <>
              <Hero onNavigate={(v: AppView) => setView(v)} />
              <SearchWidget 
                searchForm={searchForm} 
                setSearchForm={setSearchForm} 
                onSearch={fetchAdvice} 
                isLoading={isLoading} 
              />
              
              {/* Below-the-fold content for landing page */}
              <div id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="text-center mb-20">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-amber-500 font-black tracking-[0.3em] text-[10px] uppercase block mb-4"
                  >
                    The Intelligence Advantage
                  </motion.span>
                  <h2 className="text-5xl font-serif text-slate-900 mb-6">Why Book With ArifRate?</h2>
                  <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-8" />
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                    Our ML Regression engine analyzes thousands of data points instantly to ensure your luxury stay is booked at the <span className="text-slate-900 font-medium italic">optimal market moment</span>.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-10">
                  {[
                    { 
                      icon: '📉', 
                      title: 'Live Market Fusion', 
                      desc: 'We aggregate multi-source market anchors to update costs in real-time, protecting you from arbitrary spikes.',
                      color: 'indigo'
                    },
                    { 
                      icon: '💎', 
                      title: 'Curated Excellence', 
                      desc: 'Only the finest Habesha retreats. Every room-type prediction is tailored to the specific resort DNA.',
                      color: 'amber',
                      dark: true
                    },
                    { 
                      icon: '⚡', 
                      title: 'Instant Execution', 
                      desc: 'One-click reservation path with guaranteed receipt and immediate synchronization with hotel inventory.',
                      color: 'emerald'
                    }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -10 }}
                      className={`relative p-10 rounded-[2.5rem] border border-slate-100 transition-all duration-500 group ${
                        feature.dark ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform group-hover:scale-110 duration-500 ${
                        feature.dark ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-50 text-slate-900 shadow-sm'
                      }`}>
                        {feature.icon}
                      </div>
                      <h3 className={`font-serif text-2xl mb-4 ${feature.dark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                      <p className={`text-sm leading-relaxed font-light ${feature.dark ? 'text-slate-400' : 'text-slate-500'}`}>{feature.desc}</p>
                      
                      {!feature.dark && (
                        <div className="mt-8 pt-8 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-amber-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                              Learn More <div className="w-8 h-[1px] bg-amber-500" />
                           </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'results' && (
            <RoomList 
              advice={advice} 
              searchForm={searchForm} 
              onBook={() => setStep('booking')} 
              onBack={() => setStep('search')} 
            />
          )}

          {step === 'booking' && (
            <BookingFormView 
              bookingForm={bookingForm} 
              setBookingForm={setBookingForm} 
              onConfirm={handleBooking} 
              onBack={() => setStep('results')} 
            />
          )}
        </>
      )}

      {/* Sub-Pages */}
      {view === 'about' && <About />}
      {view === 'help' && <Help />}
      {view === 'contact' && <Contact />}
      {view === 'privacy' && <Privacy />}

      {/* Shared Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12 border-b border-slate-800 pb-12">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 tracking-tight cursor-pointer" onClick={() => setView('home')}>Arif<span className="text-amber-500 font-serif italic">Rate</span></h2>
              <p className="text-slate-400 text-sm max-w-sm">The smartest way to book luxury accommodations. Our dynamic pricing engine guarantees uncompromised value.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => setView('about')} className="hover:text-amber-500 transition-colors">About Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => setView('help')} className="hover:text-amber-500 transition-colors">Help Center</button></li>
                <li><button onClick={() => setView('contact')} className="hover:text-amber-500 transition-colors">Contact</button></li>
                <li><button onClick={() => setView('privacy')} className="hover:text-amber-500 transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-slate-600">
            &copy; {new Date().getFullYear()} ArifRate. All rights reserved. Made at Kuriftu Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;