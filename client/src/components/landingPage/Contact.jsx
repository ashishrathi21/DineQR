import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id='contact' className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-3">
            Contact Us
          </h2>
          <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 font-normal">
            Want to digitize your restaurant with DineQR? Fill out the form below.
          </p>
        </div>

        {/* Form Container - No Border, No Shadow */}
        <div className="max-w-4xl mx-auto">
          {!submitted ? (
            <div className="bg-transparent px-2 md:px-0">
              <form onSubmit={handleSubmit} className="space-y-7">
                
                {/* Name & Email Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                    />
                  </div>
                </div>

                {/* Phone & Restaurant Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="+91 00000 00000" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Restaurant Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="The Grand Cafe" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Location</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Mumbai, Maharashtra" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                  <textarea 
                    required 
                    rows="5" 
                    placeholder="Tell us about your requirements..." 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium resize-none shadow-sm"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-start">
                    <button 
                      type="submit"
                      className="w-full md:w-1/3 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                      Send Message
                    </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-orange-500/20">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h3>
              <p className="text-slate-600 font-medium">Message sent. We'll be in touch soon.</p>
              <button onClick={() => setSubmitted(false)} className="mt-8 text-orange-500 font-bold hover:underline">Send another message</button>
            </div>
          )}
        </div>

        {/* Quick Contact Info */}
        <div className="mt-24 flex flex-wrap justify-center gap-10 md:gap-20 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                <Mail size={14} className="text-orange-500" />
                <span>support@dineqr.com</span>
            </div>
            <div className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                <Phone size={14} className="text-orange-500" />
                <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                <MapPin size={14} className="text-orange-500" />
                <span>Mumbai, India</span>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;