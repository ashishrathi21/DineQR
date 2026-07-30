import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        description: String,

        image: String,

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        isVeg: {
            type: Boolean,
            default: true
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);