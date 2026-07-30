import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: function() { return !this.googleId; }
        },

        googleId: {
            type: String
        },

        avatar: {
            type: String
        },

        role: {
            type: String,
            default: "owner"
        },

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant"
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);