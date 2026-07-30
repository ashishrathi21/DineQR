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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl pb-16">
            <Toaster position="top-right" />
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Manage your restaurant identity, preferences, and subscription tier.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200/80 pb-px">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-all ${activeTab === "profile" ? "border-orange-500 text-orange-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                    Restaurant Profile
                </button>
                <button
                    onClick={() => setActiveTab("subscription")}
                    className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-all ${activeTab === "subscription" ? "border-orange-500 text-orange-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                    Plan & Subscription
                </button>
            </div>

            {activeTab === "profile" ? (
                /* Profile Tab */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <Store size={18} className="text-orange-500" /> Restaurant Profile
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Basic details displayed on customer QR menus</p>
                            </div>
                            
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Restaurant Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={restaurant.name}
                                        onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Location Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={restaurant.location}
                                            onChange={(e) => setRestaurant({ ...restaurant, location: e.target.value })}
                                            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Phone Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={restaurant.phone || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                                                placeholder="e.g. +91 98765 43210"
                                                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Logo Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={restaurant.logo || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, logo: e.target.value })}
                                                placeholder="e.g. https://domain.com/logo.png"
                                                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-xs text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </form>
                        </div>

                        {/* Logo Preview Card */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center h-fit">
                            <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center overflow-hidden mb-4 shadow-xs">
                                {restaurant.logo ? (
                                    <img src={restaurant.logo} alt="Restaurant Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Store className="text-slate-400" size={36} />
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{restaurant.name || "Restaurant Logo"}</h3>
                            <p className="text-[11px] font-semibold text-orange-600 mt-0.5 uppercase tracking-wider">{restaurant.subscriptionPlan} Plan</p>
                            <p className="text-slate-500 text-xs mt-2 font-medium px-2">{restaurant.location || "Setup your restaurant identity"}</p>
                        </div>
                    </div>

                    {/* DANGER ZONE - DELETE ACCOUNT */}
                    <div className="bg-red-50/50 rounded-xl p-5 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Danger Zone — Delete Account</h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Permanently delete your account, restaurant, categories, dishes, and orders from database.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-xs shrink-0 flex items-center gap-1.5 active:scale-95"
                        >
                            <Trash2 size={14} /> Delete Account
                        </button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200/80">
                                <div className="w-11 h-11 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                                    <Trash2 size={22} />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-base font-bold text-slate-900">Permanently Delete Account?</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                        This action cannot be undone. All restaurant settings, menu items, and order records will be wiped forever.
                                    </p>
                                </div>

                                <div className="flex gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        disabled={deletingAccount}
                                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50"
                                    >
                                        {deletingAccount ? "Deleting..." : "Confirm Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Subscriptions Tab */
                <div className="space-y-6">
                    {/* Active Subscription Banner */}
                    <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1 z-10">
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                Active Plan
                            </span>
                            <h2 className="text-2xl font-bold tracking-tight">{restaurant.subscriptionPlan} Tier</h2>
                            <p className="text-slate-400 text-xs font-medium">Status: <span className="text-emerald-400 font-semibold capitalize">{restaurant.subscriptionStatus}</span></p>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-white/5 rounded-lg border border-white/10 z-10">
                            <Shield className="text-orange-400" size={20} />
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Capacity</p>
                                <p className="text-sm font-bold text-white">{restaurant.subscriptionPlan === "Starter" ? "Up to 10 Tables" : "Unlimited Tables"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Choose Plan Cards */}
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Available Subscription Plans</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((p, idx) => {
                                const isActivePlan = restaurant.subscriptionPlan === p.name;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative p-5 rounded-xl border transition-all flex flex-col justify-between ${
                                            isActivePlan
                                                ? "border-orange-500 bg-orange-50/20 text-slate-900 shadow-xs"
                                                : "border-slate-200/80 bg-white text-slate-900 hover:border-slate-300"
                                        }`}
                                    >
                                        {isActivePlan && (
                                            <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                Current Plan
                                            </span>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    {p.icon}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-xs font-medium mb-3">{p.description}</p>
                                            
                                            <div className="flex items-baseline mb-4">
                                                <span className="text-2xl font-bold text-slate-900">₹{p.price}</span>
                                                <span className="text-slate-400 text-xs font-medium ml-1">/month</span>
                                            </div>

                                            <ul className="space-y-2 mb-6">
                                                {p.features.map((feat, fIdx) => (
                                                    <li key={fIdx} className="flex items-center text-xs font-medium text-slate-700">
                                                        <Check size={14} className="text-orange-500 mr-2 shrink-0" />
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => handleUpgradeSubscription(p.name)}
                                            disabled={isActivePlan}
                                            className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-all ${
                                                isActivePlan
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60"
                                                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                                            }`}
                                        >
                                            {isActivePlan ? "Active Plan" : `Upgrade to ${p.name}`}
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
