import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

import Restaurant from "../models/restaurantModel.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, restaurantName, location } = req.body;

        if (!name || !email || !password || !restaurantName || !location) {
            return res.status(400).json({ success: false, message: "Please fill in all fields." });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Create the restaurant linked to the user
        const restaurant = await Restaurant.create({
            name: restaurantName,
            location,
            ownerId: user._id
        });

        // Update user with restaurantId
        user.restaurantId = restaurant._id;
        await user.save();

        if (user) {
            const token = generateToken(user._id, res);
            res.status(201).json({
                success: true,
                token,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid user data" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id, res);
            res.status(200).json({
                success: true,
                token,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password").populate("restaurantId");
        if (user) {
            res.status(200).json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { name, email, googleId, avatar } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required for Google login" });
        }

        let user = await User.findOne({ email });

        if (user) {
            // Update Google ID or avatar if not present
            if (!user.googleId) user.googleId = googleId;
            if (!user.avatar) user.avatar = avatar;
            await user.save();

            // Populate restaurant
            user = await User.findById(user._id).populate("restaurantId");
        } else {
            // Create user via Google Auth
            user = await User.create({
                name: name || email.split("@")[0],
                email,
                googleId,
                avatar
            });

            // Auto-create restaurant for new Google user
            const restaurant = await Restaurant.create({
                name: `${user.name}'s Restaurant`,
                location: "Main Branch",
                ownerId: user._id
            });

            user.restaurantId = restaurant._id;
            await user.save();
            user = await User.findById(user._id).populate("restaurantId");
        }

        const token = generateToken(user._id, res);
        res.status(200).json({
            success: true,
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
