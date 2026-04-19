import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js'; // Adjust path to where your code is
import { getAdminHomeConfig, getPublicHomeConfig, updateHomeConfig } from '../controllers/homeConfigController.js';

// PUBLIC: Anyone can see the home page content
router.get('/public/home-config', getPublicHomeConfig);

// ADMIN ONLY: Only authenticated admins can change the content
// Notice the chain: protect -> admin -> controller
router.get('/admin/home-config', protect, admin, getAdminHomeConfig);
router.put('/admin/home-config', protect, admin, updateHomeConfig);
export default router;