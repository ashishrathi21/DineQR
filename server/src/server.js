import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import databaseConnection from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import menuRoutes from "./routes/menuRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import restaurantRoutes from "./routes/restaurantRoutes.js"

dotenv.config();

// Ensure Mongo URI fallback works
if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// Expose io instance to express controllers
app.set("io", io);

app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(cookieParser())

app.use(
    cors({
        origin: ["http://localhost:5173", "https://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is Live and Running! 🚀" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/restaurant", restaurantRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("Client connected to WebSocket:", socket.id);

  socket.on("joinRestaurant", (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
  });

  socket.on("joinOrder", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  databaseConnection();
  console.log(`Server started on port ${PORT}`);
});