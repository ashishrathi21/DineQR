import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
axios.defaults.withCredentials = true;

const Overview = () => {
  const [data, setData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customerCount: 0,
    avgPrepTime: "15m",
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/restaurant/analytics`);
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium mt-2">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingBag size={24} />} label="Total Orders" value={data.totalOrders} trend="+10%" color="bg-orange-500" />
        <StatCard icon={<TrendingUp size={24} />} label="Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} trend="+15%" color="bg-emerald-500" />
        <StatCard icon={<Users size={24} />} label="Customers" value={data.customerCount} trend="+5%" color="bg-blue-500" />
        <StatCard icon={<Clock size={24} />} label="Avg. Prep Time" value={data.avgPrepTime} trend="-1m" color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1">
            View Live Board <ArrowRight size={16} />
          </Link>
        </div>

        {data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-4">Table</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Time Placed</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recentOrders.map((order) => {
                  const date = new Date(order.createdAt);
                  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors text-sm font-medium text-slate-700">
                      <td className="py-4 px-4 font-bold text-slate-900">Table {order.tableNumber}</td>
                      <td className="py-4 px-4 truncate max-w-xs">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </td>
                      <td className="py-4 px-4 text-slate-500">{time}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">₹{order.totalAmount}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          order.status === 'pending' ? 'bg-red-50 text-red-500 border border-red-100' :
                          order.status === 'preparing' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                          order.status === 'ready' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <ShoppingBag className="text-slate-400" size={24} />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">No orders yet today</h3>
            <p className="text-slate-500 text-sm font-medium">Orders will appear here as soon as customers start scanning your QR code.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start justify-between group hover:border-orange-200 transition-colors">
    <div>
      <p className="text-slate-500 font-bold text-sm mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1">
        {trend} <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
      </p>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${color} shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

export default Overview;
