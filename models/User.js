import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"] 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String 
    // Optional because Google OAuth users won't have a password
  },
  img: { 
    type: String,
    default: "" 
  },      
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  // --- SHIPPING ADDRESS SECTION ---
  shippingAddress: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  // --- SECURITY & AUTH FIELDS ---
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;