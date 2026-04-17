import dotenv from 'dotenv';
dotenv.config(); // MUST stay at the very top

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// --- DEBUG CHECK: Terminal Status ---
console.log("--- Archive_System_v2.4_Boot ---");
console.log("MONGO_STATUS:", process.env.MONGO_URI ? "READY" : "OFFLINE");
console.log("CLOUDINARY_LINK:", process.env.CLOUDINARY_API_KEY ? "SYNCHRONIZED" : "TERMINAL_FAILURE");
console.log("------------------------------");

// 1. Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
const app = express();

// 2. Global Middleware
const allowedOrigins = [
  "http://localhost:5173", // Local Vite dev
  "https://timelesspk-frontend.vercel.app", // Production Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) 
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// CRITICAL for Tagged Color System: Higher limits for Base64 image strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Security & Browser Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
  res.send("Bold_Comfort_Terminal_v2.4_Active");
});

// 5. Global Error Handling (Payload/Parser Errors)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: "Payload_Excessive: Image size too large for archive." });
  }
  console.error("Internal_Terminal_Error:", err.stack);
  res.status(500).json({ message: "Internal_Server_Sync_Failure" });
});

// 6. Database & Server Start
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI_MISSING_IN_ENVIRONMENT");
  process.exit(1);
}

// Connection logic with modern Mongoose defaults
mongoose.connect(MONGO_URI)
.then(() => {
  console.log("✔️ Archive_Database_Connected");
    app.listen(PORT, () => console.log(`🚀 Terminal_Running_On_Port_${PORT}`));
  })
  .catch(err => {
    console.error("❌ CONNECTION_FATAL:", err.message);
  });
  export default app;