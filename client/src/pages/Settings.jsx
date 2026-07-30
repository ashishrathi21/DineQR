import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Store, Phone, MapPin, Image as ImageIcon, CreditCard, Shield, Zap, Sparkles, Check, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
axios.defaults.withCredentials = true;

const Settings = () => {
    const { verifyAuth, deleteAccount } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [restaurant, setRestaurant] = useState({
        name: "",
        location: "",
        phone: "",
        logo: "",
        subscriptionPlan: "Starter",
        subscriptionStatus: "active"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Fetch Restaurant Profile
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/restaurant/profile`);
            if (res.data.success && res.data.restaurant) {
                setRestaurant(res.data.restaurant);
            }
        } catch (error) {
            console.error("Failed to load restaurant profile:", error);
            toast.error("Error loading restaurant details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle Profile Form Submit
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put(`${API_URL}/restaurant/profile`, {
                name: restaurant.name,
                location: restaurant.location,
                phone: restaurant.phone,
                logo: restaurant.logo
            });
            if (res.data.success) {
                setRestaurant(res.data.restaurant);
                toast.success("Restaurant settings updated successfully! 🎉");
                verifyAuth(); // Refresh user details in auth store
            }
        } catch (error) {
            console.error("Update profile failed:", error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    // Handle Account Deletion
    const handleConfirmDelete = async () => {
        setDeletingAccount(true);
        try {
            const success = await deleteAccount();
            if (success) {
                toast.success("Account and all restaurant data permanently deleted.");
                setShowDeleteModal(false);
                navigate('/auth');
            }
        } catch (err) {
            console.error("Delete account error:", err);
            toast.error("Failed to delete account. Please try again.");
        } finally {
            setDeletingAccount(false);
        }
    };

    // Handle Mock Subscription Upgrade
    const handleUpgradeSubscription = async (planName) => {
        if (restaurant.subscriptionPlan === planName) {
            toast.error(`You are already subscribed to the ${planName} plan.`);
            return;
        }

        const resolveUpgrade = async () => {
            const res = await axios.post(`${API_URL}/restaurant/subscribe`, { plan: planName });
            if (res.data.success) {
                setRestaurant(res.data.restaurant);
                verifyAuth();
                return `Successfully updated plan to ${planName}! 🚀`;
            }
            throw new Error("Subscription failed");
        };

        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)).then(() => resolveUpgrade()),
            {
                loading: `Processing payment for ${planName} Plan... 💳`,
                success: (data) => data,
                error: "Upgrade failed. Please try again."
            }
        );
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-transparent">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const plans = [
        {
            name: "Starter",
            price: "499",
            description: "Perfect for small cafes and food stalls.",
            features: ["QR Code Menu", "Basic Menu Management", "Up to 10 Tables limit", "Order Dashboard", "Email Support"],
            icon: <Store className="text-orange-500" size={24} />,
            color: "border-slate-200 bg-white text-slate-900"
        },
        {
            name: "Pro",
            price: "999",
            description: "Ideal for growing restaurants.",
            features: ["Everything in Starter", "Unlimited Tables", "Advanced Analytics Dashboard", "Priority Support", "Custom branding control"],
            icon: <Zap className="text-orange-500" size={24} />,
            color: "border-orange-500 bg-slate-950 text-white shadow-xl shadow-orange-500/10",
            highlight: true
        },
        {
            name: "Business",
            price: "1999",
            description: "For large chains and fine dining.",
            features: ["Everything in Pro", "Multi-Branch Management", "API access keys", "Dedicated Account Manager", "24/7 Phone support"],
            icon: <Sparkles className="text-orange-500" size={24} />,
            color: "border-slate-200 bg-white text-slate-900"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl pb-16">
            <Toaster position="top-right" />
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Restaurant Settings</h1>
                <p className="text-slate-500 font-medium mt-2">Manage your restaurant identity, logo, and active subscriptions.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-px">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 px-2 font-bold text-sm border-b-2 transition-all ${activeTab === "profile" ? "border-orange-500 text-orange-500 font-black" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                    Restaurant Profile
                </button>
                <button
                    onClick={() => setActiveTab("subscription")}
                    className={`pb-4 px-2 font-bold text-sm border-b-2 transition-all ${activeTab === "subscription" ? "border-orange-500 text-orange-500 font-black" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                    Plan & Subscription
                </button>
            </div>

            {activeTab === "profile" ? (
                /* Profile Tab */
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                                <Store size={20} className="text-orange-500" /> Restaurant Profile
                            </h2>
                            
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Restaurant Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={restaurant.name}
                                        onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium text-slate-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Location Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            value={restaurant.location}
                                            onChange={(e) => setRestaurant({ ...restaurant, location: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Phone Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={restaurant.phone || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                                                placeholder="e.g. +91 98765 43210"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Logo Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={restaurant.logo || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, logo: e.target.value })}
                                                placeholder="e.g. https://domain.com/logo.png"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </form>
                        </div>

                        {/* Logo Preview Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-fit">
                            <div className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-6 shadow-sm">
                                {restaurant.logo ? (
                                    <img src={restaurant.logo} alt="Restaurant Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Store className="text-slate-300" size={48} />
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">{restaurant.name || "Restaurant Logo"}</h3>
                            <p className="text-xs font-bold text-orange-500 mt-1 uppercase tracking-widest">{restaurant.subscriptionPlan} Plan</p>
                            <p className="text-slate-500 text-sm mt-3 font-medium px-4">{restaurant.location || "Setup your restaurant identity"}</p>
                        </div>
                    </div>

                    {/* DANGER ZONE - DELETE ACCOUNT */}
                    <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Danger Zone — Delete Account</h3>
                                <p className="text-xs font-medium text-slate-500 mt-1">Permanently delete your account, restaurant, menu categories, dishes, and order history from the database.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-red-500/20 text-xs shrink-0 flex items-center gap-2 active:scale-95"
                        >
                            <Trash2 size={16} /> Delete Account
                        </button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                                    <Trash2 size={28} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">Permanently Delete Account?</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                        This action **cannot be undone**. Your user profile, restaurant settings, categories, menu items, and order history will be deleted forever from MongoDB.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        disabled={deletingAccount}
                                        className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-red-500/20 disabled:opacity-50"
                                    >
                                        {deletingAccount ? "Deleting..." : "Yes, Delete Everything"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Subscriptions Tab */
                <div className="space-y-8">
                    {/* Active Subscription Banner */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="space-y-2 z-10">
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Active Subscription
                            </span>
                            <h2 className="text-3xl font-black tracking-tight">{restaurant.subscriptionPlan} Plan</h2>
                            <p className="text-slate-400 text-sm font-medium">Status: <span className="text-emerald-400 font-bold capitalize">{restaurant.subscriptionStatus}</span>. Billing renews monthly.</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 z-10">
                            <Shield className="text-orange-400" size={24} />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Table Capacity</p>
                                <p className="text-lg font-black text-white">{restaurant.subscriptionPlan === "Starter" ? "Up to 10 Tables" : "Unlimited Tables"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Choose Plan Cards */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Available Subscription Plans</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((p, idx) => {
                                const isActivePlan = restaurant.subscriptionPlan === p.name;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                                            isActivePlan
                                                ? "border-orange-500 bg-orange-50/20 text-slate-900 scale-[1.02] z-10 shadow-lg shadow-orange-500/5"
                                                : "border-slate-200 bg-white text-slate-900 hover:shadow-md"
                                        }`}
                                    >
                                        {isActivePlan && (
                                            <span className="absolute -top-3 left-6 bg-orange-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Current Plan
                                            </span>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                                    {p.icon}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-xs font-medium mb-4">{p.description}</p>
                                            
                                            <div className="flex items-baseline mb-6">
                                                <span className="text-3xl font-black text-slate-900">₹{p.price}</span>
                                                <span className="text-slate-400 text-xs font-bold ml-1">/month</span>
                                            </div>

                                            <ul className="space-y-3 mb-8">
                                                {p.features.map((feat, fIdx) => (
                                                    <li key={fIdx} className="flex items-center text-xs font-bold text-slate-700">
                                                        <Check size={14} className="text-orange-500 mr-2 shrink-0" />
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => handleUpgradeSubscription(p.name)}
                                            disabled={isActivePlan}
                                            className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                                                isActivePlan
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10"
                                            }`}
                                        >
                                            {isActivePlan ? "Current Active Plan" : `Upgrade to ${p.name}`}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
