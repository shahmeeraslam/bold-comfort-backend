import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './db.js'; // Import the db.js we optimized

// 1. Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoute.js';
import homeRoutes from './routes/homeConfigRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- DATABASE MIDDLEWARE (The Vercel Fix) ---
app.use(async (req, res, next) => {
  try {
    // This calls the logic in db.js that checks cachedConnection and readyState
    await connectDB();
    
    // Safety check: Ensure connection is fully established before proceeding
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Archive_Syncing... Please retry." });
    }
    next();
  } catch (err) {
    console.error("Database_Middleware_Error:", err.message);
    res.status(500).json({ message: "Internal_Server_Sync_Failure" });
  }
});

// 2. Global Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://timelesspk-frontend.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Registry_Access_Denied: CORS_Violation"));
    }
  },
  credentials: true,
}));

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

// 5. Global Error Handling
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: "Payload_Excessive" });
  }
  res.status(500).json({ message: "Internal_Terminal_Error" });
});

// 6. Startup
app.listen(PORT, () => {
  console.log(`🚀 Terminal_Running_On_Port_${PORT}`);
});

export default app;