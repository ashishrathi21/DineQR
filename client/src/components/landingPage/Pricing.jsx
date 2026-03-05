import React from 'react';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "499",
    description: "Perfect for small cafes and food stalls.",
    features: ["QR Code Menu", "Basic Menu Management", "Up to 10 Tables", "Order Dashboard", "Email Support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "999",
    description: "Ideal for growing restaurants.",
    features: ["Everything in Starter", "Unlimited Tables", "Advanced Analytics", "Priority Support", "Custom Branding"],
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: "1999",
    description: "For large restaurant chains.",
    features: ["Everything in Pro", "Multi-Branch Support", "API Access", "Dedicated Manager", "24/7 Support"],
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <section id='pricing' className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-3">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Simple Pricing for Restaurants
          </h1>
          <p className="text-lg text-slate-600 font-normal">
            Choose the perfect plan to digitize your restaurant with DineQR.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-[2.5rem] transition-all duration-300 hover:shadow-xl ${
                plan.highlight 
                ? "bg-slate-950 text-white border-2 border-orange-500 scale-105 z-10" 
                : "bg-white text-slate-900 border border-slate-200 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? "text-orange-400" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className={`ml-2 text-sm font-medium ${plan.highlight ? "text-slate-500" : "text-slate-400"}`}>
                  /month
                </span>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-sm font-medium">
                    <Check size={16} className="text-orange-500 mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                plan.highlight 
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20" 
                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}>
                Get Started
                {plan.highlight && <Zap size={14} className="fill-current" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;