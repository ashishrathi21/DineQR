import express from "express";
import { loginUser, logoutUser, registerUser, getMe, googleAuth } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);

export default router;
