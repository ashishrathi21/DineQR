import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import { ShoppingBag, Plus, Minus, CheckCircle, UtensilsCrossed, CreditCard, Landmark, Check } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CustomerMenu = () => {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  
  // Payment Modal and Processing States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState("all"); // "all", "veg", "non-veg"

  const { cart, tableNumber, setTableNumber, addToCart, removeFromCart, getCartTotal, clearCart } = useCartStore();

  // Read table parameter from URL if present
  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, [tableParam, setTableNumber]);

  // Fetch menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/menu/categories?restaurantId=${restaurantId}`);
        const itemRes = await axios.get(`${API_URL}/menu/items?restaurantId=${restaurantId}`);
        setCategories(catRes.data.categories);
        setMenuItems(itemRes.data.menuItems);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        toast.error("Failed to load digital menu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  // Connect to Socket.io to track order status updates
  useEffect(() => {
    if (!orderPlaced?._id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        withCredentials: true
    });

    socket.on("connect", () => {
        console.log("Customer joined order status tracking:", orderPlaced._id);
        socket.emit("joinOrder", orderPlaced._id);
    });

    socket.on("orderStatusUpdated", (updatedOrder) => {
        setOrderPlaced(updatedOrder);
        
        let statusMsg = "Your order is being prepared! 🍳";
        if (updatedOrder.status === 'ready') statusMsg = "Your order is ready and being served! 🍽️";
        if (updatedOrder.status === 'completed') statusMsg = "Order completed. Thank you! 😊";

        toast.success(statusMsg, {
            duration: 6000,
            style: {
                background: '#f97316',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '16px',
            }
        });
    });

    return () => {
        socket.disconnect();
    };
  }, [orderPlaced?._id]);

  const handleCheckoutClick = () => {
      if(!tableNumber) return toast.error("Please select or enter your table number.");
      if(cart.length === 0) return toast.error("Your cart is empty.");
      setShowPaymentModal(true);
  };

  const handlePaymentAndCheckout = async () => {
      setPaymentProcessing(true);
      
      // Simulate Payment Delay
      setTimeout(async () => {
          try {
              const orderData = {
                  restaurantId,
                  tableNumber: parseInt(tableNumber),
                  items: cart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity })),
                  totalAmount: getCartTotal(),
                  paymentMethod: paymentMethod,
                  paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid'
              };
              const res = await axios.post(`${API_URL}/order`, orderData);
              setOrderPlaced(res.data.order);
              clearCart();
              setShowPaymentModal(false);
              toast.success("Order Placed Successfully! 🎉");
          } catch (error) {
              console.error(error);
              toast.error(error.response?.data?.message || "Failed to place order.");
          } finally {
              setPaymentProcessing(false);
          }
      }, 1500);
  };

  const filteredItems = menuItems.filter(item => {
      const matchCat = activeCategory === "All" || item.categoryId?._id === activeCategory || item.categoryId === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchVeg = vegFilter === "all" ? true : vegFilter === "veg" ? item.isVeg !== false : item.isVeg === false;
      return matchCat && matchSearch && matchVeg;
  });

  if (isLoading) {
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  if (orderPlaced) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
              <Toaster position="top-center" />
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle size={48} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Order Confirmed!</h1>
              <p className="text-slate-500 font-medium mb-8">Your food is being prepared. It will be brought to Table {orderPlaced.tableNumber}.</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full max-w-sm mb-8 text-left">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-200/60 pb-3">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>
                     <span className="bg-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                         {orderPlaced.status}
                     </span>
                 </div>
                 <div className="space-y-3 mb-4">
                     {orderPlaced.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm font-medium text-slate-700">
                             <span>{item.quantity}x {item.name}</span>
                             <span>₹{item.price * item.quantity}</span>
                         </div>
                     ))}
                 </div>
                 <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                     <span className="font-bold text-slate-900">Total Paid</span>
                     <span className="font-black text-orange-500 text-xl">₹{orderPlaced.totalAmount}</span>
                 </div>
              </div>
              <button onClick={() => setOrderPlaced(null)} className="text-orange-500 font-bold hover:underline">Place another order</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
       <Toaster position="top-center" />
       {/* Header */}
       <header className="bg-white px-6 py-6 border-b border-slate-200 shadow-sm sticky top-0 z-10 flex justify-between items-center">
           <div>
               <p className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-0.5">Welcome to</p>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Digital Menu</h1>
           </div>
           {tableNumber && (
               <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-2xl font-black text-sm border border-orange-200">
                   Table {tableNumber}
               </div>
           )}
       </header>

       {/* Categories */}
       <div className="px-6 py-6 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-3">
           <button 
             onClick={() => setActiveCategory("All")}
             className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === "All" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
           >
               All Items
           </button>
           {categories.map(c => (
               <button 
                 key={c._id}
                 onClick={() => setActiveCategory(c._id)}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === c._id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
               >
                   {c.name}
               </button>
           ))}
       </div>

       {/* Menu List */}
       <div className="px-6 space-y-4">
           {filteredItems.map(item => {
               const cartItem = cart.find(c => c._id === item._id);
               return (
                   <div key={item._id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 relative">
                           {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><UtensilsCrossed size={24}/></div>}
                       </div>
                       <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                               <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                               {item.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                           </div>
                           <div className="flex items-center justify-between mt-2">
                               <p className="font-black text-slate-900">₹{item.price}</p>
                               {cartItem ? (
                                   <div className="flex items-center gap-3 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100">
                                       <button onClick={() => removeFromCart(item._id)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-sm hover:text-red-500 transition-colors"><Minus size={14}/></button>
                                       <span className="font-bold text-sm w-4 text-center">{cartItem.quantity}</span>
                                       <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm hover:bg-orange-600 transition-colors"><Plus size={14}/></button>
                                   </div>
                               ) : (
                                   <button onClick={() => addToCart(item)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform">
                                       Add
                                    </button>
                               )}
                           </div>
                       </div>
                   </div>
               )
           })}
           {filteredItems.length === 0 && (
               <div className="text-center py-12">
                   <p className="text-slate-400 font-medium">No items found in this category.</p>
               </div>
           )}
       </div>

       {/* Floating Cart Bar */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
           <div className="max-w-md mx-auto space-y-4">
               {/* Show Table Input if not in URL */}
               {!tableParam && (
                   <div className="flex items-center gap-3 px-2">
                       <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Table Number:</label>
                       <input 
                         type="number" 
                         value={tableNumber} 
                         onChange={(e) => setTableNumber(e.target.value)}
                         placeholder="e.g. 5" 
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 text-center font-bold text-slate-900" 
                       />
                   </div>
               )}
               {cart.length > 0 ? (
                   <button 
                       onClick={handleCheckoutClick} 
                       className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-between px-6 active:scale-[0.98]"
                   >
                       <div className="flex items-center gap-2">
                           <ShoppingBag size={20} />
                           <span>Checkout • {cart.reduce((a,c)=>a+c.quantity, 0)} Items</span>
                       </div>
                       <span>₹{getCartTotal()}</span>
                   </button>
               ) : (
                   <div className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl text-center text-sm">
                       Select items to start ordering
                   </div>
               )}
           </div>
       </div>

       {/* Payment Mockup Modal Overlay */}
       {showPaymentModal && (
           <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
               <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
                   {paymentProcessing ? (
                       /* Processing State */
                       <div className="py-12 flex flex-col items-center justify-center text-center">
                           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-6"></div>
                           <h3 className="text-xl font-black text-slate-900">Processing Payment...</h3>
                           <p className="text-slate-500 text-sm mt-2 font-medium">Please do not refresh or close this tab.</p>
                       </div>
                   ) : (
                       /* Selection State */
                       <div className="space-y-6">
                           <div>
                               <h3 className="text-xl font-black text-slate-900 tracking-tight">Choose Payment Method</h3>
                               <p className="text-sm text-slate-500 font-medium mt-1">Select an option to complete checkout instantly.</p>
                           </div>

                           {/* Cart details */}
                           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-sm font-bold text-slate-700">
                               <span>Order total for Table {tableNumber}</span>
                               <span className="text-lg font-black text-orange-500">₹{getCartTotal()}</span>
                           </div>

                           <div className="space-y-3">
                               <button 
                                 onClick={() => setPaymentMethod("upi")}
                                 className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50/25' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                               >
                                   <div className="flex items-center gap-3">
                                       <Landmark size={20} className="text-orange-500" />
                                       <div>
                                           <p className="font-bold text-slate-900 text-sm">UPI Payment</p>
                                           <p className="text-xs text-slate-500 font-medium">Pay via Google Pay, PhonePe, UPI apps</p>
                                       </div>
                                   </div>
                                   {paymentMethod === 'upi' && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white"><Check size={12}/></div>}
                               </button>

                               <button 
                                 onClick={() => setPaymentMethod("card")}
                                 className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/25' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                               >
                                   <div className="flex items-center gap-3">
                                       <CreditCard size={20} className="text-orange-500" />
                                       <div>
                                           <p className="font-bold text-slate-900 text-sm">Credit / Debit Card</p>
                                           <p className="text-xs text-slate-500 font-medium">Pay securely with Visa, Mastercard, RuPay</p>
                                       </div>
                                   </div>
                                   {paymentMethod === 'card' && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white"><Check size={12}/></div>}
                               </button>

                               <button 
                                 onClick={() => setPaymentMethod("cash")}
                                 className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50/25' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                               >
                                   <div className="flex items-center gap-3">
                                       <UtensilsCrossed size={20} className="text-orange-500" />
                                       <div>
                                           <p className="font-bold text-slate-900 text-sm">Pay at Counter</p>
                                           <p className="text-xs text-slate-500 font-medium">Pay cash or card to server at counter</p>
                                       </div>
                                   </div>
                                   {paymentMethod === 'cash' && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white"><Check size={12}/></div>}
                               </button>
                           </div>

                           <div className="flex gap-3">
                               <button 
                                 onClick={() => setShowPaymentModal(false)}
                                 className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-all"
                               >
                                   Cancel
                               </button>
                               <button 
                                 onClick={handlePaymentAndCheckout}
                                 className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                               >
                                   Pay & Place Order
                               </button>
                           </div>
                       </div>
                   )}
               </div>
           </div>
       )}

       <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
       `}</style>
    </div>
  );
};

export default CustomerMenu;
