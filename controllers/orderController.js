import Cart from "../models/Cart.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";
import productModel from "../models/items.js"; // This is your item.js model

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { items, amount, address } = req.body;

    let verifiedTotal = 0;
    
    for (const item of items) {
      // Ensure we handle both object and string ID formats
      const pId = item.productId._id || item.productId;
      
      // FIX: Changed 'Product' to 'productModel' to match your import
      const product = await productModel.findById(pId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product_Not_Found: ID ${pId} is missing from the archive.` 
        });
      }

      const discount = product.discount || 0;
      const priceAfterDiscount = product.price * (1 - discount / 100);
      
      verifiedTotal += priceAfterDiscount * item.quantity;
    }

    // Integrity Check: Margin of 5 for floating-point precision
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

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.json({ 
      success: true, 
      message: "Order initiated. The Archive has been updated." 
    });

  } catch (error) {
    console.error("Order_Placement_Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
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