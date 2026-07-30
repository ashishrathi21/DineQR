import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

// Public route for customers
router.post("/", createOrder);

// Protected routes for restaurant owners
router.get("/", protect, getOrders);
router.put("/:id", protect, updateOrderStatus);

export default router;
