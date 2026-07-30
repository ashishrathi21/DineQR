import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Auth verification error:", error.message);
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};