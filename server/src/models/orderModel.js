import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        tableNumber: {
            type: Number,
            required: true
        },

        items: [
            {
                name: String,
                price: Number,
                quantity: Number
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "preparing", "ready", "completed"],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "cash", "card"],
            default: "upi"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);