import Cart from "../models/Cart.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";
import productModel from "../models/items.js"; // Ensures the "product" schema is registered
import { sendOrderEmail, sendAdminOrderEmail } from "../utils/emailUtils.js";

// --- CREATE ORDER ---
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, amount, address } = req.body;

    let verifiedTotal = 0;

    // 1. Inventory & Price Verification
    for (const item of items) {
      const pId = item.productId._id || item.productId;
      const product = await productModel.findById(pId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product_Not_Found: ${pId}` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Stock_Conflict: ${product.name}` });
      }

      const discount = product.discount || 0;
      const priceAfterDiscount = product.price * (1 - discount / 100);
      verifiedTotal += priceAfterDiscount * item.quantity;
    }

    // 2. Integrity Check
    if (Math.abs(verifiedTotal - amount) > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Integrity_Check_Failure" });
    }

    // 3. Save Order
    const orderData = {
      userId,
      items,
      address,
      amount: Math.round(verifiedTotal),
      paymentMethod: "COD",
      payment: false,
      status: "Pending Verification",
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // 4. Update Inventory & Clear Cart
    const stockUpdates = items.map((item) => {
      const pId = item.productId._id || item.productId;
      return productModel.findByIdAndUpdate(pId, {
        $inc: { stock: -item.quantity },
      });
    });
    await Promise.all(stockUpdates);
    await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { returnDocument: "after" },
    );
    // 5. Trigger Notifications (Non-blocking)
    sendOrderEmail(req.user.email, newOrder).catch((e) =>
      console.error("User_Mail_Fail:", e),
    );
    sendAdminOrderEmail(newOrder).catch((e) =>
      console.error("Admin_Mail_Fail:", e),
    );

    return res.json({
      success: true,
      message: "Order_Manifest_Logged. Verification protocol initiated.",
    });
  } catch (error) {
    console.error("Order_Placement_Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

// --- FETCH USER ORDERS ---
// --- FETCH USER ORDERS ---
export const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    // REMOVED .populate() because the data is already in the 'items' array
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- FETCH ALL ORDERS (ADMIN) ---
export const allOrders = async (req, res) => {
  try {
    // REMOVED .populate()
    const orders = await orderModel.find({}).sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// --- UPDATE STATUS ---
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { returnDocument: "after" },
    );
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order_Not_Found" });
    }

    return res.json({
      success: true,
      message: "Status_Updated",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
