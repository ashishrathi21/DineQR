import React from 'react';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Github, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import DineQR_Logo from '../../assets/dashboard_logo.png';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-20 px-4 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={DineQR_Logo} alt="DineQR Logo" className="h-9 w-auto brightness-110" />
            </div>
            <p className="text-sm leading-relaxed font-normal max-w-xs">
              "Scan. Order. Enjoy." <br />
              DineQR helps restaurants digitize their ordering system using simple, secure, and lightning-fast QR codes.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3">
              <a href="#" className="hover:text-orange-500 transition-all p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-orange-500/50">
                <Twitter size={16} />
              </a>
              <a href="#" className="hover:text-orange-500 transition-all p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-orange-500/50">
                <Linkedin size={16} />
              </a>
              <a href="#" className="hover:text-orange-500 transition-all p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-orange-500/50">
                <Instagram size={16} />
              </a>
              <a href="#" className="hover:text-orange-500 transition-all p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-orange-500/50">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-7">Product</h3>
            <ul className="space-y-4">
              <li><a href="#features" className="text-sm hover:text-orange-500 transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm hover:text-orange-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Live Demo</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-7">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & Info */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-7">Contact Us</h3>
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <Mail size={14} className="text-orange-500" />
              </div>
              <span className="text-sm hover:text-white transition-colors">support@dineqr.com</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <Phone size={14} className="text-orange-500" />
              </div>
              <span className="text-sm hover:text-white transition-colors">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <MapPin size={14} className="text-orange-500" />
              </div>
              <span className="text-sm hover:text-white transition-colors">Mumbai, India</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Divider & Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-normal text-slate-500 tracking-wide">
            © {new Date().getFullYear()} DineQR. All rights reserved.
          </p>

          <p className="text-xs font-normal text-slate-400 tracking-wide">
            Designed & Developed by <span className="text-orange-500 font-semibold">Ashish Rathi</span>
          </p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-normal text-slate-500 uppercase tracking-widest">
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;