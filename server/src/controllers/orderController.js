import Order from "../models/orderModel.js";
import Restaurant from "../models/restaurantModel.js";

// @route   POST /api/order
// @desc    Create a new order (Public Customer Route)
export const createOrder = async (req, res) => {
    try {
        const { restaurantId, tableNumber, items, totalAmount, paymentMethod, paymentStatus } = req.body;

        if (!restaurantId || !tableNumber || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({ success: false, message: "Missing required order details" });
        }

        // Check subscription limits
        const restaurant = await Restaurant.findById(restaurantId);
        if (restaurant && restaurant.subscriptionPlan === "Starter" && parseInt(tableNumber) > 10) {
            return res.status(400).json({ 
                success: false, 
                message: "This restaurant is on the Starter Plan, which limits service up to table number 10. Please choose a table from 1-10 or contact staff." 
            });
        }

        const order = await Order.create({
            restaurantId,
            tableNumber,
            items,
            totalAmount,
            paymentMethod: paymentMethod || "upi",
            paymentStatus: paymentStatus || "paid"
        });

        // Emit real-time update to restaurant room
        const io = req.app.get("io");
        if (io) {
            io.to(`restaurant_${restaurantId}`).emit("newOrder", order);
        }

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/order
// @desc    Get all orders for the logged-in owner's restaurant
export const getOrders = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PUT /api/order/:id
// @desc    Update order status or payment status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;
        const restaurantId = req.user.restaurantId;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findOneAndUpdate(
            { _id: id, restaurantId },
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Emit real-time status update to specific order room and restaurant room
        const io = req.app.get("io");
        if (io) {
            io.to(`order_${id}`).emit("orderStatusUpdated", order);
            io.to(`restaurant_${restaurantId}`).emit("orderUpdated", order);
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
