import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the token string
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret from your .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Extract the User ID
      // Your generateToken helper uses { id: user._id }, so we look for decoded.id
      const userId = decoded.id || decoded._id;
      
      if (!userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      // 4. Attach user to the request object (excluding password)
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Account not found or has been disabled" });
      }

      // Optional: Prevent unverified users from accessing protected data
      if (!req.user.isVerified) {
        return res.status(403).json({ message: "Please verify your email to access this resource" });
      }

      // Move to the next middleware or controller
      next();
    } catch (error) {
      console.error("Token Verification Error:", error.message);
      
      const message = error.name === 'TokenExpiredError' 
        ? "Session expired, please login again" 
        : "Not authorized, token failed";
        
      return res.status(401).json({ message });
    }
  }

  // 5. If no token was found in the headers
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

/**
 * Admin Middleware
 * Restricts access to users with the 'admin' role.
 * MUST be used after 'protect' middleware.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Administrative privileges required" });
  }
};