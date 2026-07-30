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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Real-time restaurant performance metrics and recent customer activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag size={20} />} label="Total Orders" value={data.totalOrders} trend="+10%" color="bg-orange-50 text-orange-600 border border-orange-100" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} trend="+15%" color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatCard icon={<Users size={20} />} label="Customers Served" value={data.customerCount} trend="+5%" color="bg-blue-50 text-blue-600 border border-blue-100" />
        <StatCard icon={<Clock size={20} />} label="Avg. Prep Time" value={data.avgPrepTime} trend="-1m" color="bg-purple-50 text-purple-600 border border-purple-100" />
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Latest live orders received from table QR codes</p>
          </div>
          <Link to="/dashboard/orders" className="text-orange-600 hover:text-orange-700 font-semibold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 hover:bg-orange-100/60 transition-all">
            <span>View Live Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 rounded-l-md">Table</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right rounded-r-md">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => {
                  const date = new Date(order.createdAt);
                  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors text-xs font-medium text-slate-700">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">Table {order.tableNumber}</td>
                      <td className="py-3.5 px-4 truncate max-w-xs text-slate-600">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{time}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">₹{order.totalAmount}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' :
                          order.status === 'preparing' ? 'bg-orange-50 text-orange-700 border border-orange-200/80' :
                          order.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' :
                          'bg-slate-100 text-slate-600 border border-slate-200/80'
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
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-400 mb-3">
              <ShoppingBag size={20} />
            </div>
            <h3 className="text-slate-900 font-semibold text-sm mb-1">No orders yet today</h3>
            <p className="text-slate-500 text-xs font-medium">Orders will appear here automatically when customers scan your QR code.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-start justify-between">
    <div>
      <p className="text-slate-500 font-semibold text-xs mb-1 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      <p className="text-emerald-600 text-[11px] font-semibold mt-2 flex items-center gap-1">
        {trend} <span className="text-slate-400 font-normal ml-0.5">vs yesterday</span>
      </p>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} shrink-0`}>
      {icon}
    </div>
  </div>
);

export default Overview;

