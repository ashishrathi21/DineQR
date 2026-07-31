import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import { ShoppingBag, Plus, Minus, CheckCircle, UtensilsCrossed, Check, Search, Building2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CustomerMenu = () => {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");

  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(null);
  
  // Payment Modal and Processing States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const { cart, tableNumber, setTableNumber, addToCart, removeFromCart, getCartTotal, clearCart } = useCartStore();

  // Read table parameter from URL if present
  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, [tableParam, setTableNumber]);

  // Fetch restaurant profile from database & menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParam = restaurantId && restaurantId !== 'undefined' ? `?restaurantId=${restaurantId}` : '';
        const [catRes, itemRes] = await Promise.all([
          axios.get(`${API_URL}/menu/categories${queryParam}`).catch(() => ({ data: { categories: [] } })),
          axios.get(`${API_URL}/menu/items${queryParam}`).catch(() => ({ data: { menuItems: [] } }))
        ]);

        const fetchedCategories = catRes.data?.categories || [];
        const fetchedItems = itemRes.data?.menuItems || [];

        setCategories(fetchedCategories);
        setMenuItems(fetchedItems);

        // Find target restaurant ObjectId from items/categories DB records or URL param
        let targetId = restaurantId;
        if (fetchedItems.length > 0 && fetchedItems[0].restaurantId) {
          targetId = fetchedItems[0].restaurantId;
        } else if (fetchedCategories.length > 0 && fetchedCategories[0].restaurantId) {
          targetId = fetchedCategories[0].restaurantId;
        }

        // Fetch restaurantName, logo, location from DB
        const targetQuery = targetId && targetId !== 'undefined' ? targetId : 'default';
        const restRes = await axios.get(`${API_URL}/restaurant/public/${targetQuery}`).catch(() => null);
        
        if (restRes?.data) {
          setRestaurantInfo({
            name: restRes.data.restaurantName || restRes.data.restaurant?.name,
            logo: restRes.data.logo || restRes.data.restaurant?.logo,
            location: restRes.data.location || restRes.data.restaurant?.location
          });
        }
      } catch (error) {
        console.error("Error fetching customer menu:", error);
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
          background: '#ea580c',
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
    if (!tableNumber) return toast.error("Please select or enter your table number.");
    if (cart.length === 0) return toast.error("Your cart is empty.");
    setShowPaymentModal(true);
  };

  const handlePaymentAndCheckout = async () => {
    setPaymentProcessing(true);
    
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
    }, 1200);
  };

  const getItemCountForCat = (catId) => {
    return menuItems.filter(item => {
      const itemCat = item.categoryId?._id || item.categoryId;
      return itemCat === catId;
    }).length;
  };

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === "All" || item.categoryId?._id === activeCategory || item.categoryId === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <Toaster position="top-center" />
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Order Confirmed!</h1>
        <p className="text-slate-500 text-xs font-medium mb-6">
          Your food is being prepared. It will be served to Table {orderPlaced.tableNumber}.
        </p>
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 w-full max-w-sm mb-6 text-left shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Status</span>
            <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {orderPlaced.status}
            </span>
          </div>
          
          <div className="space-y-2.5">
            {orderPlaced.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-medium text-slate-700">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900 block text-xs">Total Amount</span>
              <span className="text-[10px] text-slate-400 font-medium">Pay at Counter / Server</span>
            </div>
            <span className="font-bold text-orange-600 text-lg">₹{orderPlaced.totalAmount}</span>
          </div>
        </div>

        <button 
          onClick={() => {
            if (orderPlaced?.tableNumber) {
              setTableNumber(String(orderPlaced.tableNumber));
            }
            setOrderPlaced(null);
          }} 
          className="text-orange-600 font-semibold text-xs hover:underline py-2 px-4 rounded-xl hover:bg-orange-50 transition-colors"
        >
          + Add more items for Table {orderPlaced.tableNumber}
        </button>
      </div>
    );
  }

  const restaurantName = restaurantInfo?.name || "Restaurant Menu";
  const restaurantLocation = restaurantInfo?.location || "Digital Table Order";
  const restaurantLogo = restaurantInfo?.logo;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-36 font-sans">
      <Toaster position="top-center" />

      {/* Header with Restaurant Name and Logo directly from Database query */}
      <header className="bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200/80 shadow-2xs sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {restaurantLogo ? (
            <img 
              src={restaurantLogo} 
              alt={restaurantName} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              {restaurantName ? restaurantName.charAt(0).toUpperCase() : <Building2 size={20} />}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none truncate">
              {restaurantName}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {restaurantLocation}
            </p>
          </div>
        </div>

        {tableNumber ? (
          <div className="bg-orange-50 text-orange-700 px-6 py-1.5 rounded-lg text-xs font-bold border border-orange-200/60 shadow-2xs shrink-0">
            Table {tableNumber}
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium shrink-0">Scan Table QR</span>
        )}
      </header>

      {/* Search Input Controls */}
      <div className="px-4 sm:px-6 pt-3.5 pb-1 space-y-3 max-w-6xl mx-auto">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish or beverage..." 
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200/80 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-4 sm:px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 max-w-6xl mx-auto">
        <button 
          onClick={() => setActiveCategory("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === "All" 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map(c => {
          const count = getItemCountForCat(c._id);
          const isActive = activeCategory === c._id;
          return (
            <button 
              key={c._id}
              onClick={() => setActiveCategory(c._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-xs' 
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE RESPONSIVE 2-CARDS GRID */}
      <div className="px-4 sm:px-6 pt-2 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map(item => {
            const cartItem = cart.find(c => c._id === item._id);
            return (
              <div 
                key={item._id} 
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Floating Price Badge */}
                  <div className="h-32 sm:h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full items-center justify-center text-slate-400 bg-slate-100"
                      style={{ display: item.image ? 'none' : 'flex' }}
                    >
                      <UtensilsCrossed size={22} className="opacity-40" />
                    </div>

                    {/* Floating Price Badge */}
                    <div className="absolute top-2 right-2 bg-orange-600 text-white backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] sm:text-sm font-semibold shadow-md">
                      ₹{item.price}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-2.5 sm:p-3.5 space-y-0.5">
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-orange-600 truncate">
                      {item.categoryId?.name || 'Category'}
                    </p>
                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium line-clamp-2 leading-tight sm:leading-relaxed min-h-[26px] sm:min-h-[32px]">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Cart Action */}
                <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden xs:inline">
                    Visible on QR
                  </span>

                  {cartItem ? (
                    <div className="flex items-center gap-1.5 bg-orange-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-orange-200/80 shadow-2xs w-full xs:w-auto justify-between">
                      <button 
                        onClick={() => removeFromCart(item._id)} 
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white text-orange-600 flex items-center justify-center font-bold shadow-2xs hover:bg-orange-100 transition-colors"
                      >
                        <Minus size={12}/>
                      </button>
                      <span className="font-bold text-xs text-orange-900 px-1">
                        {cartItem.quantity}
                      </span>
                      <button 
                        onClick={() => addToCart(item)} 
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-orange-500 text-white flex items-center justify-center font-bold shadow-2xs hover:bg-orange-600 transition-colors"
                      >
                        <Plus size={12}/>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)} 
                      className="w-full xs:w-auto px-3 py-1.5 bg-slate-900 text-white text-[11px] sm:text-xs font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
            <UtensilsCrossed size={28} className="mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No dishes found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-2xl z-40">
        <div className="max-w-md mx-auto space-y-2.5">
          
          {/* Table Input */}
          {!tableParam && (
            <div className="flex items-center gap-2 px-1">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Table Number:</label>
              <input 
                type="number" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 4" 
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 text-center font-bold text-xs text-slate-900" 
              />
            </div>
          )}

          {cart.length > 0 ? (
            <button 
              onClick={handleCheckoutClick} 
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-xs rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-500/20 flex items-center justify-between px-4 sm:px-5 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span>Checkout • {cart.reduce((a, c) => a + c.quantity, 0)} Items</span>
              </div>
              <span className="text-sm font-semibold">₹{getCartTotal()} →</span>
            </button>
          ) : (
            <div className="w-full py-2.5 bg-slate-100 text-slate-400 font-medium rounded-xl text-center text-xs">
              Select dishes to start your order
            </div>
          )}
        </div>
      </div>

      {/* Payment / Checkout Modal Overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in duration-200">
            {paymentProcessing ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <h3 className="text-base font-bold text-slate-900">Sending Order to Kitchen...</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Please wait a moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Confirm Your Order</h2>
                  <p className="text-xs text-slate-500 font-medium">Order will be sent directly to your table</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Total Amount (Table {tableNumber})</span>
                  <span className="text-sm font-semibold text-orange-600">₹{getCartTotal()}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/30 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed size={18} className="text-orange-600" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">Pay at Counter / Server</p>
                      <p className="text-[11px] text-slate-500">Pay when food arrives at your table</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                    <Check size={12}/>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePaymentAndCheckout}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-orange-500/20 text-xs"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CustomerMenu;
