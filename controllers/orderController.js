import Cart from "../models/Cart.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";

export const placeOrder = async (req, res) => {
  try {
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

    /**
     * FIX: Use the Cart model to clear the items array.
     * We use findOneAndUpdate({ userId }) because we are searching 
     * by the field 'userId' inside the Cart document.
     */
    await Cart.findOneAndUpdate({ userId }, { items: [] });

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

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing_Parameters: Order ID and Status are required." 
            });
        }

        // UPDATE: Replaced { new: true } with { returnDocument: 'after' }
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