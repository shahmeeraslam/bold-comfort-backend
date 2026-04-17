import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Each user has exactly one cart document
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      quantity: { 
        type: Number, 
        default: 1,
        min: [1, "Quantity cannot be less than 1"]
      },
      size: { type: String },
      color: { type: String }
    }
  ]
}, { 
  timestamps: true // Tracks when the cart was created/updated
});

// The model name 'Cart' results in a collection named 'carts' in MongoDB
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;