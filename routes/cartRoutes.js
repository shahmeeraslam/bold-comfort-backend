import express from 'express';
import { syncCart, getCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * --- PROTECTED CART ROUTES ---
 * The 'protect' middleware ensures req.user is populated before 
 * we attempt to fetch or sync a specific user's cart.
 */

// GET /api/cart -> Retrieves the current user's cart items
router.get('/', protect, getCart);

// PUT /api/cart/sync -> Saves the current frontend cart state to the database
router.put('/sync', protect, syncCart);

export default router;