import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js'; // Cloudinary/Multer config
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductById,
  createReview 
} from '../controllers/productController.js';

// --- PUBLIC ROUTES ---
// Access for viewing the archive and specific units
router.get('/', getProducts);
router.get('/:id', getProductById);

// --- USER ROUTES ---
/**
 * CREATE REVIEW:
 * Still uses 'upload.single' because reviews typically send raw 
 * binary files (multipart/form-data) from a simple file input.
 */
router.post('/:id/reviews', protect, upload.single('image'), createReview);

// --- ADMIN ROUTES ---
/**
 * CREATE & UPDATE PRODUCT:
 * IMPORTANT: Removed 'upload.array' because the Tagged Color System 
 * sends a complex JSON object { image: [{ url, color }] }. 
 * * If you are sending Base64 or pre-uploaded Cloudinary links from 
 * the React frontend, these MUST be handled as standard JSON 
 * (express.json()) rather than multipart/form-data.
 */
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);

/**
 * DELETE PRODUCT:
 * Purges the unit record from the database.
 */
router.delete('/:id', protect, admin, deleteProduct);

export default router;