import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import { Clock, CheckCircle, ChefHat, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = rawApiUrl.endsWith("/order") ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/order`;
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-full">
            <Toaster position="top-right" />
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Orders Board</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Real-time kitchen order stream powered by WebSockets.</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-170px)]">
                
                {/* Pending Column */}
                <div className="flex-1 min-w-[300px] max-w-sm bg-slate-100/60 rounded-xl p-4 border border-slate-200/80 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <h2 className="text-sm font-semibold text-slate-900">New Orders</h2>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-600 border border-slate-200/80 shadow-xs">{pendingOrders.length}</span>
                    </div>
                    <div className="space-y-3">
                        {pendingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextAction={() => updateStatus(order._id, 'preparing')} actionText="Accept & Start Cooking" actionIcon={<ChefHat size={14} />} actionColor="bg-orange-500 hover:bg-orange-600 text-white shadow-xs" />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-lg">No pending orders</div>
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="flex-1 min-w-[300px] max-w-sm bg-slate-100/60 rounded-xl p-4 border border-slate-200/80 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <h2 className="text-sm font-semibold text-slate-900">Preparing</h2>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-600 border border-slate-200/80 shadow-xs">{preparingOrders.length}</span>
                    </div>
                    <div className="space-y-3">
                        {preparingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextAction={() => updateStatus(order._id, 'ready')} actionText="Mark as Ready" actionIcon={<Check size={14} />} actionColor="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" />
                        ))}
                        {preparingOrders.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-lg">No orders cooking</div>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="flex-1 min-w-[300px] max-w-sm bg-slate-100/60 rounded-xl p-4 border border-slate-200/80 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <h2 className="text-sm font-semibold text-slate-900">Ready & Completed</h2>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-600 border border-slate-200/80 shadow-xs">{completedOrders.length}</span>
                    </div>
                    <div className="space-y-3 opacity-90">
                        {completedOrders.map(order => (
                            <OrderCard key={order._id} order={order} completed={true} />
                        ))}
                        {completedOrders.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-lg">No completed orders</div>
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
        <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-xs transition-all hover:border-slate-300">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-slate-900 font-semibold text-sm">Table {order.tableNumber}</h3>
                    <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={12}/> {time}</p>
                </div>
                <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80 font-bold text-slate-900 text-xs">₹{order.totalAmount}</div>
            </div>
            
            <div className="space-y-1.5 mb-4 border-t border-slate-100 pt-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium text-slate-700">
                        <span><span className="text-slate-400 font-semibold mr-1.5">{item.quantity}x</span>{item.name}</span>
                    </div>
                ))}
            </div>

            {!completed ? (
                <button 
                  onClick={nextAction}
                  className={`w-full py-2 font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 ${actionColor}`}
                >
                  {actionIcon} {actionText}
                </button>
            ) : (
                <div className="w-full py-1.5 bg-emerald-50/60 text-emerald-700 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 border border-emerald-200/60">
                    <CheckCircle size={14} /> Ready & Served
                </div>
            )}
        </div>
    )
}

export default LiveOrders;
