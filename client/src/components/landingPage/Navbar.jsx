import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DineQR_Logo from '../../assets/DineQR_Logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        <div className="flex justify-between items-center h-15"> {/* Height badha di taaki bada logo fit ho sake */}
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center">
              {/* h-20 (80px) use kiya hai, agar aur bada chahiye toh h-[100px] likh sakte ho */}
              <img 
                src={DineQR_Logo} 
                alt="DineQR Logo" 
                className="h-15 w-auto object-contain transition-transform duration-300 hover:scale-105" 
              />
            </a>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#hero" className="text-gray-600 font-semibold hover:text-orange-500 transition duration-300 cursor-pointer">Home</a>
            <a href="#features" className="text-gray-600 font-semibold hover:text-orange-500 transition duration-300 cursor-pointer">Features</a>
            <a href="#pricing" className="text-gray-600 font-semibold hover:text-orange-500 transition duration-300 cursor-pointer">Pricing</a>
            <Link to="/auth" className="text-orange-500 font-semibold hover:text-orange-600 transition duration-300 cursor-pointer">Register Restaurent</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-orange-500 focus:outline-none"
            >
              <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-white border-t border-gray-100`}>
        <div className="px-4 pt-2 pb-6 space-y-1">
          <a href="#hero" className="block py-3 text-base font-medium text-gray-700 hover:text-orange-500">Home</a>
          <a href="#features" className="block py-3 text-base font-medium text-gray-700 hover:text-orange-500">Features</a>
          <a href="#pricing" className="block py-3 text-base font-medium text-gray-700 hover:text-orange-500">Pricing</a>
          <Link to="/auth" className="text-orange-500 font-semibold hover:text-orange-600 transition duration-300 cursor-pointer">Register Restaurent</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;