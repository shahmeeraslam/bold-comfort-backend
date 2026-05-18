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
  updateShippingAddress, // 1. Added the import
  forgotPassword,
  resetPassword
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
router.post('/forgot-password', forgotPassword); // Bound securely
router.post('/reset-password', resetPassword);   // Bound securely
/**
 * --- PROTECTED ROUTES ---
 */

// Profile Management
router.put('/update-image', protect, updateProfileImage);
router.put('/update-profile', protect, updateProfileData);
router.put("/change-password", protect, changePassword);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "EMAIL_NODE_REQUIRED" });
    }
    
    // TODO: Connect this to your database verification and email sender utility loop
    console.log(`Reset initialized for target node: ${email}`);
    
    return res.status(200).json({ 
      success: true, 
      message: "RECOVERY_TELEMETRY_DISPATCHED: CHECK MAIL" 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Added the Shipping Address Route
router.put("/update-address", protect, updateShippingAddress);

// Get Current User (Returns profile data only)
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

export default router;