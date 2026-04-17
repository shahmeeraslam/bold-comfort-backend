import express from 'express';
import { 
  googleLogin, 
  registerUser, 
  loginUser, 
  verifyOTP,           
  resendOTP,           
  updateProfileImage, 
  updateProfileData,   
  changePassword,
  updateShippingAddress // 1. Added the import
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * --- PUBLIC ROUTES ---
 */
router.post('/google', googleLogin);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP); 
router.post('/resend-otp', resendOTP);

/**
 * --- PROTECTED ROUTES ---
 */

// Profile Management
router.put('/update-image', protect, updateProfileImage);
router.put('/update-profile', protect, updateProfileData);
router.put("/change-password", protect, changePassword);

// 2. Added the Shipping Address Route
router.put("/update-address", protect, updateShippingAddress);

// Get Current User (Returns profile data only)
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

export default router;