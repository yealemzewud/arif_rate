import React from 'react';
import { motion } from 'framer-motion';
import { Booking } from '../types';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface BookingFormProps {
  bookingForm: Booking;
  setBookingForm: React.Dispatch<React.SetStateAction<Booking>>;
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ bookingForm, setBookingForm, onConfirm, onBack }) => {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
      <button onClick={onBack} className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="transition-transform group-hover:-translate-x-1" size={16} /> 
        Modify Selection
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row"
      >
        {/* Left Side Info */}
        <div className="bg-slate-900 text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-serif text-3xl mb-8">Secure Your Reservation</h2>
            <div className="space-y-6">
              <div>
                <span className="text-amber-400 text-sm block mb-1">Accommodation</span>
                <p className="font-medium text-lg">{bookingForm.advice.room_type || 'Deluxe Suite'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Check-in</span>
                  <p className="font-medium">{bookingForm.advice.chk_in}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Check-out</span>
                  <p className="font-medium">{bookingForm.advice.chk_out}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 relative z-10 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-slate-300">Free Cancellation</span>
            </div>
            <div className="mt-4 flex items-center gap-3 opacity-50">
              <span className="text-xs uppercase tracking-widest text-white">No payment required now</span>
            </div>
          </div>

          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-24 -right-12 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 md:p-12 md:w-3/5">
          <h3 className="font-serif text-2xl mb-6 text-slate-800">Guest Details</h3>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                placeholder="Jane Doe"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                placeholder="jane@example.com"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                placeholder="+1 (555) 000-0000"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-amber-600 text-white py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Confirm Reservation
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              By confirming this booking, you agree to ArifRate's Terms and Conditions and Privacy Policy.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
