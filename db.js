import mongoose from 'mongoose';

/** * GLOBAL CACHE: 
 * In serverless (Vercel), variables outside the function scope 
 * stay in memory during the "warm" phase.
 */
let cachedConnection = null;

const connectDB = async () => {
  // 1. Check if we have an active, healthy connection (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If we are currently connecting (readyState 2), wait for it instead of starting a new one
// If we are currently connecting (readyState 2), wait for it
  if (mongoose.connection.readyState === 2) {
    console.log("⏳ Connection_In_Progress... Standing by.");
    // Wait for 500ms to see if it finishes, so the middleware doesn't fail
    await new Promise(resolve => setTimeout(resolve, 500));
    return mongoose.connection; 
  }
  if (!process.env.MONGO_URI) {
    console.error("❌ REGISTRY_CRITICAL_FAILURE: MONGO_URI_MISSING");
    throw new Error("MONGO_URI is missing");
  }

  try {
    console.log("🛰️ Initiating_Database_Handshake...");

    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
     bufferCommands: false,         // Fail fast if DB is slow (prevents 10s hangs)
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000,        // Close idle sockets
      maxPoolSize: 5,                // Optimized for Vercel Hobby limits
    });

    console.log("✔️ New_Database_Handshake_Complete");
    return cachedConnection;
  } catch (error) {
    console.error("❌ DB_Handshake_Failure:", error.message);
    
    // Reset cache on failure so the next request can try again fresh
    cachedConnection = null;
    throw error;
  }
};

// Handle connection errors after the initial handshake
mongoose.connection.on('error', (err) => {
  console.error('📡 Lost_Sync_With_Archive:', err);
});

export default connectDB;