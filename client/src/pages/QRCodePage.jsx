import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Grid, Layers, ShieldCheck } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const QRCodePage = () => {
  const { user } = useAuthStore();
  const [selectedTable, setSelectedTable] = useState("1");
  
  const [customHost, setCustomHost] = useState(window.location.origin);

  // Safe extraction of restaurant fields (handling populated vs non-populated schema)
  const restaurantId = user?.restaurantId?._id || (typeof user?.restaurantId === 'string' ? user?.restaurantId : undefined);
  const restaurantName = user?.restaurantId?.name || "Our Restaurant";
  const subscriptionPlan = user?.restaurantId?.subscriptionPlan || "Starter";

  // Enforce table limits based on subscription plan
  const maxStarterTables = 10;
  const isStarter = subscriptionPlan === "Starter";

  // URL pointing to the customer-facing menu (pre-populated with table number)
  const baseUrl = customHost.trim() || window.location.origin;
  const menuUrl = `${baseUrl}/restaurant/${restaurantId}/menu${selectedTable ? `?table=${selectedTable}` : ''}`;

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
        canvas.height = img.height + 150;
        
        // Draw background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR Code
        ctx.drawImage(img, 50, 50);
        
        // Draw Text
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(restaurantName, canvas.width / 2, img.height + 80);
        
        ctx.fillStyle = "#f97316";
        ctx.font = "black 32px Inter, sans-serif";
        ctx.fillText(`TABLE ${selectedTable || 'N/A'}`, canvas.width / 2, img.height + 125);
        
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">QR Code Generator & Studio</h1>
        <p className="text-slate-500 font-medium mt-2">Generate, test, and print high-quality QR codes for your tables. Customers scan them to view menu and order directly.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* QR Code Frame */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center w-full md:w-auto min-w-[350px]">
            <div 
              onClick={() => window.open(menuUrl, '_blank')}
              title="Click to test customer menu in new tab"
              className="p-4 bg-white rounded-2xl shadow-xl shadow-orange-500/10 border border-slate-50 mb-6 cursor-pointer hover:scale-105 transition-transform group relative"
            >
               <QRCodeSVG 
                 id="qr-code-svg"
                 value={menuUrl} 
                 size={240}
                 level={"H"}
                 includeMargin={true}
                 fgColor={"#0f172a"}
                 bgColor={"#ffffff"}
               />
               <div className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                 <span>Click to Open Menu</span> ↗
               </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">{restaurantName}</h2>
            <div className="mt-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-lg font-black tracking-wider uppercase">
                TABLE {selectedTable || 'N/A'}
            </div>
            
            <a 
              href={menuUrl} 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md"
            >
              🚀 Test Customer View (Table {selectedTable})
            </a>
            <p className="text-slate-400 font-bold mt-4 tracking-widest text-[10px] uppercase">Powered by DineQR</p>
        </div>

        {/* Configurations Panel */}
        <div className="flex-1 space-y-6 w-full">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">QR Code Settings</h3>
                  <p className="text-sm text-slate-500 font-medium">Select a table number to embed. The printed QR will contain the table detail automatically.</p>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex justify-between">
                          <span>Enter Table Number</span>
                          {isStarter && (
                              <span className="text-orange-500 text-xs font-bold">Starter limit: max 10</span>
                          )}
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max={isStarter ? maxStarterTables : undefined}
                        value={selectedTable}
                        onChange={(e) => handleTableChange(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 flex justify-between">
                          <span>Base Host URL (For Mobile Testing)</span>
                          <span className="text-slate-400 font-normal">Change if scanning from phone via Wi-Fi IP</span>
                      </label>
                      <input 
                        type="text"
                        value={customHost}
                        onChange={(e) => setCustomHost(e.target.value)}
                        placeholder="http://192.168.1.5:5173"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-700"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                    <button onClick={downloadQR} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                        <Download size={20} /> Download Printable QR (PNG)
                    </button>
                    <button onClick={() => {
                      navigator.clipboard.writeText(menuUrl);
                      toast.success("Menu link copied to clipboard! 📋");
                    }} className="w-full py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <Share2 size={20} /> Copy Customer Link
                    </button>
                </div>
            </div>

            {/* Subscription Alert Card */}
            <div className={`rounded-3xl p-6 border flex gap-4 ${
                isStarter 
                ? "bg-amber-50 border-amber-100 text-amber-900" 
                : "bg-emerald-50 border-emerald-100 text-emerald-950"
            }`}>
                <ShieldCheck size={24} className="shrink-0 text-orange-500" />
                <div>
                    <h4 className="font-bold text-sm">Subscription Tier Details</h4>
                    <p className="text-xs font-medium mt-1 leading-relaxed">
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
