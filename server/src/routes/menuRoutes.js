import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
    createCategory, 
    getCategories, 
    deleteCategory,
    createMenuItem, 
    getMenuItems, 
    updateMenuItem, 
    deleteMenuItem 
} from "../controllers/menuController.js";

const router = express.Router();

// Public routes (used by customer QR scanning)
router.get("/categories", getCategories);
router.get("/items", getMenuItems);

// Protected routes (used by dashboard)
router.post("/categories", protect, createCategory);
router.delete("/categories/:id", protect, deleteCategory);

router.post("/items", protect, createMenuItem);
router.put("/items/:id", protect, updateMenuItem);
router.delete("/items/:id", protect, deleteMenuItem);

export default router;
