import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// 1. Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoute.js';
import homeRoutes from './routes/homeConfigRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- DEBUG CHECK ---
console.log("--- Archive_System_v2.4_Boot ---");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("MONGO_STATUS:", MONGO_URI ? "READY" : "OFFLINE");
console.log("------------------------------");

// 2. Global Middleware & CORS Optimization
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173", // Added for faster local DNS resolution
  "https://timelesspk-frontend.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS_BLOCK: Request from unauthorized origin: ${origin}`);
      callback(new Error("Registry_Access_Denied: CORS_Violation"));
    }
  },
  credentials: true,
}));

// Payload limits for Base64 image processing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Security Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRouter);
app.use('/api', homeRoutes);

app.get('/', (req, res) => {
  res.send("Bold_Comfort_Terminal_v2.4_Active");
});

// Health check for Vercel/Production monitoring
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
  res.status(200).json({ status: "ACTIVE", database: dbStatus });
});

// 5. Global Error Handling
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: "Payload_Excessive: Registry cannot store objects of this size." });
  }
  console.error("Internal_Terminal_Error:", err.stack);
  res.status(500).json({ message: "Internal_Server_Sync_Failure" });
});

// 6. Optimized Startup Logic
if (!MONGO_URI) {
  console.error("❌ FATAL: MONGO_URI_MISSING");
  process.exit(1);
}

// Start the server immediately so it doesn't "time out" while waiting for DB
app.listen(PORT, () => {
  console.log(`🚀 Terminal_Running_On_Port_${PORT}`);
  
  // Background Database Connection with Pooling for high-latency regions (Karachi)
  mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,             // Maintain up to 10 active connections
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    socketTimeoutMS: 45000,      // Close inactive sockets to save resources
  })
  .then(() => console.log("✔️ Archive_Database_Connected"))
  .catch(err => console.error("❌ DATABASE_CONNECTION_FAILED:", err.message));
});

export default app;