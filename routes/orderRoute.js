import express from 'express';
import { allOrders, placeOrder, updateStatus, userOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// This MUST match exactly: /api/orders/userorders
orderRouter.get('/userorders', protect, userOrders);
orderRouter.post('/place', protect, placeOrder);
orderRouter.get('/list' , protect , allOrders)
orderRouter.post('/status', protect, updateStatus);
export default orderRouter;