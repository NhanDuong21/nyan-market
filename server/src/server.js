// server/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

// ===== KHỞI TẠO APP =====
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001"
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Nyan Market API",
    timestamp: new Date().toISOString(),
  });
});

// ===== ROUTES =====
const authRoutes = require("./routes/auth.routes");
const shopRoutes = require("./routes/shop.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/admin", adminRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error",
  });
});

// ===== KẾT NỐI DB & KHỞI ĐỘNG SERVER =====
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✓ Nyan Market API running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
