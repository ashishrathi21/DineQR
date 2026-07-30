# DineQR - Smart Restaurant SaaS Platform 🚀

A production-ready Multi-Tenant Smart Restaurant SaaS Platform built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io real-time order flow, Zustand state management, and Tailwind CSS.

---

## 🌟 Key Features

### 👨‍🍳 Restaurant Owner Dashboard
- **Secure Authentication**: JWT with HTTP-Only Cookies & Bearer Token fallback.
- **Subscription Tiers**: Starter (Up to 10 tables), Pro (Up to 30 tables), and Business (Unlimited tables).
- **Live Kitchen Order Display (KDS)**: Real-time WebSocket order tracking with soundless/sound alerts and status transitions (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Completed`).
- **Menu Management**: Categorized menu management, item availability toggles, Veg/Non-Veg indicators, custom pricing, and images.
- **Dynamic QR Code Studio**: High-res downloadable table-specific QR codes with custom restaurant branding.
- **Analytics Overview**: Revenue charts, daily order counts, table turnover rate, and average prep time metrics.

### 📱 Customer Mobile Ordering Experience
- **Instant Access**: No app install needed. Simply scan a table QR code or visit `/restaurant/:id/menu?table=4`.
- **Responsive Menu UI**: Search bar, category filters, veg/non-veg dietary pills, and image preview.
- **Cart & Fast Checkout**: Table number selection, instant checkout drawer, and payment simulation (UPI, Cards, Pay at counter).
- **Real-Time Order Tracking**: Bi-directional Socket.io timeline updates directly on customer screens.

---

## ⚙️ Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm run seed   # (Optional) Seed demo data with owner@dineqr.com / password123
npm run dev    # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev    # Starts React Vite app on http://localhost:5173
```

---

## ☁️ Deployment on Render

This project includes a pre-configured Blueprint file (`render.yaml`).

1. Connect your repository to [Render.com](https://render.com).
2. Create a new **Blueprint** service using `render.yaml`.
3. Provide your `MONGO_URI` environment variable in the Render Dashboard.
4. Deploy with zero configuration!

---

## 🔑 Demo Credentials

- **Email**: `owner@dineqr.com`
- **Password**: `password123`
