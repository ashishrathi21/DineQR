import React from 'react';
import { QrCode, LayoutDashboard, UtensilsCrossed, Navigation, Zap, BarChart3 } from 'lucide-react';

const featuresList = [
  { title: "QR Code Ordering", description: "Customers scan a QR code at the table to instantly access the digital menu.", icon: <QrCode className="w-6 h-6 text-orange-500" /> },
  { title: "Real-Time Dashboard", description: "Restaurant owners can manage incoming orders in real time with instant alerts.", icon: <LayoutDashboard className="w-6 h-6 text-orange-500" /> },
  { title: "Menu Management", description: "Add, edit, or remove menu items anytime from your cloud dashboard.", icon: <UtensilsCrossed className="w-6 h-6 text-orange-500" /> },
  { title: "Table-Based Logic", description: "Orders are automatically assigned to specific tables via unique QR identifiers.", icon: <Navigation className="w-6 h-6 text-orange-500" /> },
  { title: "Mobile Optimized", description: "A smooth web experience designed for every smartphone. No apps required.", icon: <Zap className="w-6 h-6 text-orange-500" /> },
  { title: "Advanced Analytics", description: "Track revenue and popular dishes with built-in reporting tools.", icon: <BarChart3 className="w-6 h-6 text-orange-500" /> },
];

const Features = () => {
  return (
    <section id='features' className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-3">Premium Features</h2>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Everything to grow your restaurant</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">{f.icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;