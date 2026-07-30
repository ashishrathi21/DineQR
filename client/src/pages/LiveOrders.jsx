import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import { Clock, CheckCircle, ChefHat, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/order";
axios.defaults.withCredentials = true;

const LiveOrders = () => {
    const { user } = useAuthStore();
    const restaurantId = user?.restaurantId?._id || user?.restaurantId;
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(API_URL);
            setOrders(res.data.orders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchOrders();

        if (!restaurantId) return;

        // Establish Socket.io connection
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log("WebSocket connected. Joining restaurant channel:", restaurantId);
            socket.emit("joinRestaurant", restaurantId);
        });

        socket.on("newOrder", (order) => {
            // Check if order already exists to prevent duplicate renders
            setOrders(prev => {
                if (prev.some(o => o._id === order._id)) return prev;
                return [order, ...prev];
            });

            // Display premium soundless notification
            toast.success(`New Order Received! Table ${order.tableNumber} • ₹${order.totalAmount} 🎉`, {
                duration: 6000,
                position: 'top-right',
                style: {
                    background: '#0f172a',
                    color: '#fff',
                    borderRadius: '16px',
                    padding: '16px',
                }
            });
        });

        socket.on("orderUpdated", (updatedOrder) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        });

        return () => {
            socket.disconnect();
            console.log("WebSocket disconnected from kitchen");
        };
    }, [restaurantId]);

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`${API_URL}/${orderId}`, { status });
            // Optimistic update
            setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
            toast.success(`Order status updated to ${status}.`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update order status.");
        }
    };

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-transparent">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const completedOrders = orders.filter(o => o.status === 'ready' || o.status === 'completed');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full">
            <Toaster position="top-right" />
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Orders Board</h1>
                <p className="text-slate-500 font-medium mt-2">Kitchen operations updating in real-time via websockets.</p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
                
                {/* Pending Column */}
                <div className="flex-1 min-w-[320px] bg-slate-100/50 rounded-3xl p-6 border border-slate-200/50 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                        <h2 className="text-lg font-bold text-slate-900">New / Pending</h2>
                        <span className="ml-auto bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100">{pendingOrders.length}</span>
                    </div>
                    <div className="space-y-4">
                        {pendingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextAction={() => updateStatus(order._id, 'preparing')} actionText="Accept & Cook" actionIcon={<ChefHat size={16} />} actionColor="bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm">No pending orders.</div>
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="flex-1 min-w-[320px] bg-slate-100/50 rounded-3xl p-6 border border-slate-200/50 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                        <h2 className="text-lg font-bold text-slate-900">Preparing</h2>
                        <span className="ml-auto bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100">{preparingOrders.length}</span>
                    </div>
                    <div className="space-y-4">
                        {preparingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextAction={() => updateStatus(order._id, 'ready')} actionText="Mark Ready" actionIcon={<Check size={16} />} actionColor="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" />
                        ))}
                        {preparingOrders.length === 0 && (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm">No orders currently cooking.</div>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="flex-1 min-w-[320px] bg-slate-100/50 rounded-3xl p-6 border border-slate-200/50 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <h2 className="text-lg font-bold text-slate-900">Ready / Completed</h2>
                        <span className="ml-auto bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100">{completedOrders.length}</span>
                    </div>
                    <div className="space-y-4 opacity-85">
                        {completedOrders.map(order => (
                            <OrderCard key={order._id} order={order} completed={true} />
                        ))}
                        {completedOrders.length === 0 && (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm">No completed orders today.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const OrderCard = ({ order, nextAction, actionText, actionIcon, actionColor, completed }) => {
    const date = new Date(order.createdAt);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-900 font-bold mb-1">Table {order.tableNumber}</h3>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {time}</p>
                </div>
                <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 font-black text-slate-900 text-sm">₹{order.totalAmount}</div>
            </div>
            
            <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-medium">
                        <span className="text-slate-700"><span className="text-slate-400 font-bold mr-2">{item.quantity}x</span>{item.name}</span>
                    </div>
                ))}
            </div>

            {!completed ? (
                <button 
                  onClick={nextAction}
                  className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${actionColor}`}
                >
                  {actionIcon} {actionText}
                </button>
            ) : (
                <div className="w-full py-3 bg-slate-50 text-emerald-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-100">
                    <CheckCircle size={16} /> Ready & Served
                </div>
            )}
        </div>
    )
}

export default LiveOrders;
