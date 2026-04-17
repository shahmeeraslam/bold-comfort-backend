import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";

export const placeOrder = async (req, res) => {
  try {
    // Middleware 'protect' attaches the user object to the request
    const userId = req.user._id; 
    const { items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD", 
      payment: false,
      status: "Pending Verification",
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear the cart for the user
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ 
      success: true, 
      message: "Order initiated. Our team will contact you shortly." 
    });

  } catch (error) {
    console.error("Order_Placement_Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const allOrders = async (req, res) => {
    try {
        // Fetches EVERY order in the database for the Admin
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};