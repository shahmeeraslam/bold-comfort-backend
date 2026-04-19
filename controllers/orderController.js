import Cart from "../models/Cart.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";
import productModel from "../models/items.js";
import { sendOrderEmail } from "../utils/mailer.js"; // Ensure you create this utility

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { items, amount, address } = req.body;

    let verifiedTotal = 0;
    
    for (const item of items) {
      const pId = item.productId._id || item.productId;
      const product = await productModel.findById(pId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product_Not_Found: ID ${pId} is missing.` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Inventory_Conflict: ${product.name} only has ${product.stock} units remaining.`
        });
      }

      const discount = product.discount || 0;
      const priceAfterDiscount = product.price * (1 - discount / 100);
      
      verifiedTotal += priceAfterDiscount * item.quantity;
    }

    if (Math.abs(verifiedTotal - amount) > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Integrity_Check_Failure: Price mismatch detected." 
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount: Math.round(verifiedTotal),
      paymentMethod: "COD", 
      payment: false,
      status: "Pending Verification",
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // --- AUTOMATED NOTIFICATION DISPATCH ---
    try {
      // req.user must contain the email from your auth middleware
      await sendOrderEmail(req.user.email, newOrder);
    } catch (mailError) {
      console.error("Email_System_Offline:", mailError);
      // Logic continues so user isn't blocked by mail server issues
    }

    const stockUpdates = items.map((item) => {
      const pId = item.productId._id || item.productId;
      return productModel.findByIdAndUpdate(pId, {
        $inc: { stock: -item.quantity }
      });
    });
    await Promise.all(stockUpdates);

    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.json({ 
      success: true, 
      message: "Order_Manifest_Logged. Verification protocol initiated via email." 
    });

  } catch (error) {
    console.error("Order_Placement_Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        // Add .populate('items.productId') to link the product data back to the order
        const orders = await orderModel.find({ userId })
            .populate('items.productId') 
            .sort({ createdAt: -1 });
            
        res.json({ success: true, orders });
    } catch (error) {
        console.error("User_Orders_Fetch_Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Admin_Orders_Fetch_Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing_Parameters: Order ID and Status are required." 
            });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { status }, 
            { returnDocument: 'after' } 
        );

        if (!updatedOrder) {
            return res.status(404).json({ 
                success: false, 
                message: "Order_Not_Found: Record does not exist in archive." 
            });
        }

        res.json({ 
            success: true, 
            message: "Archive_Status_Updated", 
            order: updatedOrder 
        });

    } catch (error) {
        console.error("Status_Update_Sync_Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal_Server_Error_During_Status_Transition" 
        });
    }
};