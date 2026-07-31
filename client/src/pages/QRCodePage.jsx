import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ShieldCheck } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const QRCodePage = () => {
  const { user } = useAuthStore();
  const [selectedTable, setSelectedTable] = useState("1");

  // Safe extraction of restaurant fields
  const restaurantId = user?.restaurantId?._id || (typeof user?.restaurantId === 'string' ? user?.restaurantId : undefined);
  const restaurantName = user?.restaurantId?.name || "Our Restaurant";
  const subscriptionPlan = user?.restaurantId?.subscriptionPlan || "Starter";

  // Enforce table limits based on subscription plan
  const maxStarterTables = 10;
  const isStarter = subscriptionPlan === "Starter";

  // URL pointing to the customer-facing menu
  const menuUrl = `${window.location.origin}/restaurant/${restaurantId}/menu${selectedTable ? `?table=${selectedTable}` : ''}`;

  const downloadQR = () => {
    try {
      const svg = document.getElementById("qr-code-svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width + 100;
        canvas.height = img.height + 200;
        
        // Draw background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Header Text above QR Code
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 20px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Scan To See Our Menu", canvas.width / 2, 45);
        
        // Draw QR Code
        ctx.drawImage(img, 50, 65);
        
        // Draw Restaurant Name & Table Text below QR Code
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(restaurantName, canvas.width / 2, img.height + 115);
        
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 32px Inter, sans-serif";
        ctx.fillText(`TABLE ${selectedTable || 'N/A'}`, canvas.width / 2, img.height + 165);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${restaurantName.replace(/\s+/g, '_')}_Table_${selectedTable}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        URL.revokeObjectURL(url);
        toast.success(`Table ${selectedTable} QR Code downloaded! 📥`);
      };
      img.src = url;
    } catch (err) {
      console.error("QR Download Error:", err);
      toast.error("Failed to generate QR code download.");
    }
  };

  const handleTableChange = (value) => {
    const val = parseInt(value);
    if (isStarter && val > maxStarterTables) {
      setSelectedTable(maxStarterTables.toString());
    } else if (val < 1) {
      setSelectedTable("1");
    } else {
      setSelectedTable(value);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Code Studio</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Generate and download high-resolution QR codes for your restaurant tables.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* QR Code Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center w-full md:w-auto min-w-[320px]">
        <h2 className="text-md font-semibold text-slate-900 tracking-tight text-center pb-5">Scan To See Our Menu :</h2>
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 mb-5 shadow-xs">
               <QRCodeSVG 
                 id="qr-code-svg"
                 value={menuUrl} 
                 size={200}
                 level={"H"}
                 includeMargin={true}
                 fgColor={"#0f172a"}
                 bgColor={"#ffffff"}
               />
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center">{restaurantName}</h2>
            <div className="mt-1.5 bg-orange-50 text-orange-700 border border-orange-200/80 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase">
                TABLE {selectedTable || 'N/A'}
            </div>
            
            <p className="text-slate-400 font-semibold mt-5 tracking-wider text-[10px] uppercase">Powered by DineQR</p>
        </div>

        {/* Configurations Panel */}
        <div className="flex-1 space-y-5 w-full">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Table Settings</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Select a table number to generate its custom QR code.</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex justify-between">
                      <span>Table Number</span>
                      {isStarter && (
                          <span className="text-orange-600 text-xs font-semibold">Starter limit: max 10</span>
                      )}
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max={isStarter ? maxStarterTables : undefined}
                    value={selectedTable}
                    onChange={(e) => handleTableChange(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                    <button onClick={downloadQR} className="w-full py-2.5 bg-orange-500 text-white font-semibold text-xs rounded-lg hover:bg-orange-600 transition-all shadow-xs flex items-center justify-center gap-1.5">
                        <Download size={16} /> Download Printable QR (PNG)
                    </button>
                    <button onClick={() => {
                      navigator.clipboard.writeText(menuUrl);
                      toast.success("Menu link copied to clipboard! 📋");
                    }} className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200/80 transition-all flex items-center justify-center gap-1.5 border border-slate-200/60">
                        <Share2 size={16} /> Copy Customer Link
                    </button>
                </div>
            </div>

            {/* Subscription Alert Card */}
            <div className={`rounded-xl p-4 border flex gap-3 ${
                isStarter 
                ? "bg-amber-50/60 border-amber-200/80 text-amber-900" 
                : "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
            }`}>
                <ShieldCheck size={20} className="shrink-0 text-orange-600 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-xs">Subscription Tier Details</h4>
                    <p className="text-[11px] font-medium mt-0.5 leading-relaxed">
                        {isStarter 
                            ? "Your current Starter Plan limits you to generating QR codes for tables 1 through 10. Upgrade to Pro/Business to configure unlimited tables and unlock custom branding tags on downloads."
                            : `You are on the ${subscriptionPlan} Plan. You have unlimited table configurations. Feel free to input any table code.`
                        }
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
