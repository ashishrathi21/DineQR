import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        phone: String,

        logo: String,

        subscriptionPlan: {
            type: String,
            enum: ["Starter", "Pro", "Business"],
            default: "Starter"
        },

        subscriptionStatus: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);