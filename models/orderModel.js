import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    name: String,
    quantity: Number,
    size: String,
    color: String,
    price: Number,
    image: Array,   // Storing the full array snapshot
    category: String, // ADDED: To fix the category issue
    img: String     // ADDED: Fallback for components looking for .img
  }],
  amount: { type: Number, required: true },
  address: { type: Object, required: true }, 
  status: { type: String, default: "Pending Verification" },
  paymentMethod: { type: String, required: true, default: "COD" },
  payment: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
},
 { timestamps: true 
});

// Better practice for Next.js/Vite environments to prevent model re-compilation
const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;