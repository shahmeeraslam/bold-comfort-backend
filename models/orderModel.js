import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Changed to ObjectId for better indexing and population logic
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true }, 
  /**
   * Updated default to match your controller's logic 
   * ("Pending Verification" for COD orders)
   */
  status: { 
    type: String, 
    default: "Pending Verification" 
  },
  paymentMethod: { type: String, required: true, default: "COD" },
  payment: { type: Boolean, default: false },
  // Using Date type for easier querying by month/year later
  date: { type: Date, default: Date.now }
}, {
  // Adds createdAt and updatedAt automatically
  timestamps: true 
});

// Better practice for Next.js/Vite environments to prevent model re-compilation
const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;