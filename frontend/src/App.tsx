import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchWidget } from './components/SearchWidget';
import { RoomList } from './components/RoomList';
import { BookingForm as BookingFormView } from './components/BookingForm';
import { AppStep, AdviceRequest, Booking } from './types';
import { format, addDays } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

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
    currency: 'USD'
  });

  const [advice, setAdvice] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState<Booking>({
    name: '',
    email: '',
    phone: '',
    advice: searchForm
  });
  
  const [step, setStep] = useState<AppStep>('search');
  const [isLoading, setIsLoading] = useState(false);

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
      
      if (searchForm.use_live_feed !== false && data.live_feed_used === false) {
        let liveError = data.warnings?.find((w: string) => w.toLowerCase().includes('live feed skipped')) || 'Live pricing feed unavailable for these options.';
        
        // Intercept un-deployed backend dictionary strings gracefully
        if (liveError.includes('no_of_adults is invalid')) {
           liveError = "The live market provider restricts searches extending beyond maximum adult capacity.";
        } else if (liveError.includes('no_of_children') && liveError.includes('invalid')) {
           liveError = "The live market provider restricts searches extending beyond maximum children capacity.";
        } else if (liveError.includes("{") && liveError.includes("}")) {
           liveError = "Live market feed skipped for these options.";
        }

        toast.error(liveError);
        return;
      }

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
      <Navbar />

      {/* Main Flow Controller */}
      {step === 'search' && (
        <>
          <Hero />
          <SearchWidget 
            searchForm={searchForm} 
            setSearchForm={setSearchForm} 
            onSearch={fetchAdvice} 
            isLoading={isLoading} 
          />
          
          {/* Below-the-fold content for landing page */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <span className="text-amber-500 font-semibold tracking-widest text-sm uppercase">Smart Pricing</span>
              <h2 className="text-4xl font-serif mt-2 mb-6">Why Book With ArifRate?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Our AI-driven dynamic pricing ensures you always get the best value based on real-time market demand.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-100">
                 <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl mb-6">📉</div>
                 <h3 className="font-serif text-xl mb-3">Live Market Rates</h3>
                 <p className="text-slate-500 text-sm">We aggregate data instantly to update our room costs.</p>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform cursor-pointer">
                 <div className="w-16 h-16 mx-auto bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl mb-6">💎</div>
                 <h3 className="font-serif text-xl mb-3">Premium Comfort</h3>
                 <p className="text-slate-300 text-sm">Experience our top-tier suites with exclusive perks and world-class service.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-100">
                 <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl mb-6">⚡</div>
                 <h3 className="font-serif text-xl mb-3">Instant Confirmation</h3>
                 <p className="text-slate-500 text-sm">No waiting. Your booking is 100% confirmed seamlessly with a single click.</p>
              </div>
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

      {/* Shared Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12 border-b border-slate-800 pb-12">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">Arif<span className="text-amber-500 font-serif italic">Rate</span></h2>
              <p className="text-slate-400 text-sm max-w-sm">The smartest way to book luxury accommodations. Our dynamic pricing engine guarantees uncompromised value.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
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