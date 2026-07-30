import Restaurant from "../models/restaurantModel.js";
import Order from "../models/orderModel.js";

// @desc    Get restaurant profile
// @route   GET /api/restaurant/profile
// @access  Private
export const getRestaurantProfile = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update restaurant profile
// @route   PUT /api/restaurant/profile
// @access  Private
export const updateRestaurantProfile = async (req, res) => {
    try {
        const { name, location, phone, logo } = req.body;
        
        const restaurant = await Restaurant.findOneAndUpdate(
            { ownerId: req.user._id },
            { name, location, phone, logo },
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Simulate subscription update
// @route   POST /api/restaurant/subscribe
// @access  Private
export const updateSubscriptionPlan = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!["Starter", "Pro", "Business"].includes(plan)) {
            return res.status(400).json({ success: false, message: "Invalid subscription plan" });
        }

        const restaurant = await Restaurant.findOneAndUpdate(
            { ownerId: req.user._id },
            { subscriptionPlan: plan, subscriptionStatus: "active" },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        res.status(200).json({ success: true, message: `Successfully subscribed to ${plan} plan`, restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/restaurant/analytics
// @access  Private
export const getRestaurantAnalytics = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        // Fetch all orders for analytics calculation
        const orders = await Order.find({ restaurantId });

        // KPIs Calculations
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Count distinct tables that placed orders
        const uniqueTables = new Set(orders.map(o => o.tableNumber));
        const customerCount = uniqueTables.size;

        // Calculate average prep time for ready/completed orders (in minutes)
        const completedOrders = orders.filter(o => ["ready", "completed"].includes(o.status));
        let totalPrepMinutes = 0;
        let completedCount = 0;

        completedOrders.forEach(o => {
            const diffMs = new Date(o.updatedAt) - new Date(o.createdAt);
            const diffMins = Math.round(diffMs / (1000 * 60));
            totalPrepMinutes += diffMins;
            completedCount++;
        });

        const avgPrepTime = completedCount > 0 ? Math.round(totalPrepMinutes / completedCount) : 15; // default to 15m if no completed orders yet

        // Fetch top 5 recent orders
        const recentOrders = await Order.find({ restaurantId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            analytics: {
                totalOrders,
                totalRevenue,
                customerCount,
                avgPrepTime: `${avgPrepTime}m`,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
