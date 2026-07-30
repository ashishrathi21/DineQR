import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import User from '../models/userModel.js';
import Restaurant from '../models/restaurantModel.js';
import Category from '../models/categoryModel.js';
import MenuItem from '../models/menuItemModel.js';
import Order from '../models/orderModel.js';

dns.setDefaultResultOrder("ipv4first");
dotenv.config();

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const fallbackUri = "mongodb://127.0.0.1:27017/dineqr";
        
        let connected = false;
        if (mongoUri) {
            try {
                console.log("Attempting database connection to Mongo URL for seeding...");
                await mongoose.connect(mongoUri);
                connected = true;
                console.log("Connected to Mongo Atlas successfully!");
            } catch (err) {
                console.warn("Primary MongoDB connection failed, attempting local fallback...", err.message);
            }
        }

        if (!connected) {
            await mongoose.connect(fallbackUri);
            console.log("Connected to Local MongoDB successfully!");
        }

        // Clear existing demo data if any
        await User.deleteMany({ email: "owner@dineqr.com" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        // Create Demo Owner
        const user = await User.create({
            name: "Chef Rajat Sharma",
            email: "owner@dineqr.com",
            password: hashedPassword,
            role: "owner"
        });

        // Create Demo Restaurant
        const restaurant = await Restaurant.create({
            name: "Royal Spice Bistro",
            location: "Connaught Place, New Delhi",
            phone: "+91 9876543210",
            logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
            ownerId: user._id,
            subscriptionPlan: "Pro",
            subscriptionStatus: "active"
        });

        user.restaurantId = restaurant._id;
        await user.save();

        console.log("Created Demo Owner and Restaurant:", restaurant.name);

        // Create Categories
        const catStarters = await Category.create({ name: "Starters & Appetizers", restaurantId: restaurant._id });
        const catMains = await Category.create({ name: "Main Course", restaurantId: restaurant._id });
        const catBeverages = await Category.create({ name: "Beverages & Mocktails", restaurantId: restaurant._id });
        const catDesserts = await Category.create({ name: "Desserts", restaurantId: restaurant._id });

        // Create Menu Items
        await MenuItem.create([
            {
                name: "Paneer Tikka Angaara",
                price: 340,
                description: "Cottage cheese marinated in clay oven spices, served with mint chutney.",
                image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
                categoryId: catStarters._id,
                restaurantId: restaurant._id,
                isVeg: true,
                isAvailable: true
            },
            {
                name: "Crispy Spring Rolls",
                price: 260,
                description: "Golden fried veggies wrapped in flaky pastry sheets.",
                image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                categoryId: catStarters._id,
                restaurantId: restaurant._id,
                isVeg: true,
                isAvailable: true
            },
            {
                name: "Butter Chicken Special",
                price: 490,
                description: "Tender chicken in rich tomato cashew gravy loaded with butter.",
                image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
                categoryId: catMains._id,
                restaurantId: restaurant._id,
                isVeg: false,
                isAvailable: true
            },
            {
                name: "Dal Makhani Sizzler",
                price: 380,
                description: "Slow-cooked black lentils simmered overnight with cream.",
                image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
                categoryId: catMains._id,
                restaurantId: restaurant._id,
                isVeg: true,
                isAvailable: true
            },
            {
                name: "Fresh Mango Mint Mojito",
                price: 190,
                description: "Refreshing fizzy drink with real Alphonso mango pulp and fresh mint.",
                image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
                categoryId: catBeverages._id,
                restaurantId: restaurant._id,
                isVeg: true,
                isAvailable: true
            },
            {
                name: "Sizzling Chocolate Brownie",
                price: 280,
                description: "Warm fudge brownie topped with vanilla ice cream and hot fudge sauce.",
                image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
                categoryId: catDesserts._id,
                restaurantId: restaurant._id,
                isVeg: true,
                isAvailable: true
            }
        ]);

        console.log("Seeded sample menu items across categories!");

        // Create Sample Orders
        await Order.create([
            {
                restaurantId: restaurant._id,
                tableNumber: 3,
                items: [
                    { name: "Paneer Tikka Angaara", price: 340, quantity: 1 },
                    { name: "Fresh Mango Mint Mojito", price: 190, quantity: 2 }
                ],
                totalAmount: 720,
                status: "pending",
                paymentStatus: "paid",
                paymentMethod: "upi"
            },
            {
                restaurantId: restaurant._id,
                tableNumber: 5,
                items: [
                    { name: "Butter Chicken Special", price: 490, quantity: 1 },
                    { name: "Dal Makhani Sizzler", price: 380, quantity: 1 }
                ],
                totalAmount: 870,
                status: "preparing",
                paymentStatus: "paid",
                paymentMethod: "card"
            }
        ]);

        console.log("Seeded sample live orders!");
        console.log("Seed Completed Successfully 🎉");
        console.log("Login Credentials: Email: owner@dineqr.com | Password: password123");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seedData();
