import Cart from '../models/Cart.js';

/**
 * Sync or Create Cart
 * This is the trigger that creates the 'carts' collection in MongoDB.
 */
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    // Ensure we have a valid userId from the 'protect' middleware
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // findOneAndUpdate with upsert: true is what triggers collection creation
  // --- Inside syncCart in cartController.js ---

const cart = await Cart.findOneAndUpdate(
  { userId },
  { items },
  { 
    upsert: true, 
    returnDocument: 'after', // <--- Change 'new: true' to this
    setDefaultsOnInsert: true 
  }
).populate('items.productId');

    res.status(200).json(cart.items);
  } catch (error) {
    console.error("Cart Sync Error:", error); // Helpful for your terminal logs
    res.status(500).json({ message: "Cart sync failed", error: error.message });
  }
};

/**
 * Fetch User's Cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // We populate the productId to get the full product details (name, price, img)
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(cart.items);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
};