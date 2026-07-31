import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    getPublicRestaurantProfile,
    getRestaurantProfile,
    updateRestaurantProfile,
    updateSubscriptionPlan,
    getRestaurantAnalytics
} from "../controllers/restaurantController.js";

const router = express.Router();

// Public route for customer menu header
router.get("/public/:id", getPublicRestaurantProfile);

// Protected routes (used by dashboard owner)
router.get("/profile", protect, getRestaurantProfile);
router.put("/profile", protect, updateRestaurantProfile);
router.post("/subscribe", protect, updateSubscriptionPlan);
router.get("/analytics", protect, getRestaurantAnalytics);

export default router;
