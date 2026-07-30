import React from 'react';
import QRCode from "react-qr-code";
import { Zap, ChevronRight } from 'lucide-react';
import DineQR_Logo from '../../assets/DineQR_Logo.png';
import Pizza from '../../assets/pizza.png';
import Momos from '../../assets/momos.png';
import Burger from '../../assets/burger.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div id='hero' className="scroll-mt-24 relative overflow-hidden bg-white flex items-center min-h-[calc(100vh-80px)] py-12 lg:py-0">

      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-20 -left-10 w-80 h-80 bg-orange-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse delay-700"></div>
      <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          {/* Left Side: Content */}
          <div className="text-center lg:text-left lg:col-span-6 z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-orange-50 text-orange-600 mb-6 border border-orange-100 shadow-sm uppercase">
              <Zap size={14} className="mr-2 fill-orange-500" />
              <span>Smart QR System</span>
            </div>

            {/* Adjusted Headline: Added leading-tight for proper multi-line spacing */}
            <h1 className="relative text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Transform Your <br />
              <span className="text-orange-500">Dining Experience</span><br />
              <span className="inline-block mt-1">With QR Ordering</span>
            </h1>

            {/* Paragraph: mt-6 adjusted to maintain visual balance with the longer headline */}
            <p className="mt-6 text-base text-slate-600 sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Eliminate wait times. Let your customers <span className="text-slate-900 font-semibold underline decoration-orange-400 decoration-2 italic">scan, browse, and pay</span> in seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link to='/auth'>
                <button className="group flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-2xl text-white bg-slate-950 hover:bg-orange-600 transition-all duration-300 shadow-xl">
                  Get Started Free
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button> </Link>
            </div>
          </div>

          {/* Right Side: Mockup (Remains Exactly Same) */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 relative flex justify-center scale-[0.85] lg:scale-90 xl:scale-100 origin-center">

            <div className="absolute -top-10 left-0 md:-left-12 bg-white/80 backdrop-blur-md p-3 rounded-[1.5rem] shadow-2xl animate-[bounce_4s_ease-in-out_infinite] z-30 border border-white/50">
              <img src={Pizza} alt="Pizza" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <div className="absolute top-1/4 -right-8 md:-right-12 bg-white/80 backdrop-blur-md p-3 rounded-[1.5rem] shadow-2xl animate-[bounce_5s_ease-in-out_infinite] z-30 border border-white/50">
              <img src={Momos} alt="Momos" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <div className="absolute -bottom-6 left-10 bg-white/80 backdrop-blur-md p-3 rounded-[1.5rem] shadow-2xl animate-[bounce_6s_ease-in-out_infinite] z-30 border border-white/50">
              <img src={Burger} alt="Burger" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>

            <div className="relative w-[280px] h-[540px] bg-slate-950 rounded-[3rem] border-[10px] border-slate-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden outline outline-1 outline-slate-800">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-3xl z-50"></div>

              <div className="relative h-full w-full bg-[#0a0a0a] flex flex-col pt-14 px-5 text-center">
                <span className="text-[9px] text-orange-500/80 font-bold tracking-[0.3em] uppercase mb-4">DineQR System</span>

                <div className="relative flex-grow flex items-center justify-center">
                  <div className="absolute inset-0 m-2 border-2 border-transparent">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
                  </div>

                  <div className="absolute left-4 right-4 h-[2px] bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] z-10 animate-scan-slow"></div>

                  <div className="bg-white p-4 rounded-2xl relative z-20 shadow-2xl">
                    <QRCode value="https://dineqr.vercel.app/demo" size={150} level="H" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-lg">
                      <img src={DineQR_Logo} alt="logo" className="w-7 h-7 object-contain" />
                    </div>
                  </div>
                </div>

                <div className="mt-auto mb-10">
                  <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800">
                    <p className="text-white text-xs font-bold">Table #05 Detected</p>
                    <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;