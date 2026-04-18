import mongoose from 'mongoose';

// --- Review Sub-schema ---
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userImg: { type: String }, 
  reviewImage: { type: String } 
}, { timestamps: true });

// --- Image Sub-schema (New Tagged System) ---
const taggedImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  color: { type: String, default: "Neutral" }
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Piece name is required"],
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Clothing", "T-Shirts", "Shoes", "Watches", "Accessories"] 
  },
  price: { 
    type: Number, 
    required: [true, "Archive price is required"],
    set: v => (v === '' || v === null) ? 0 : v 
  },
  // NEW: Seasonal Discount Percentage
  discount: {
    type: Number,
    default: 0,
    min: [0, "Discount cannot be negative"],
    max: [99, "Discount cannot exceed 99%"],
    set: v => (v === '' || v === null) ? 0 : v
  },
  stock: { 
    type: Number, 
    default: 0,
    set: v => (v === '' || v === null) ? 0 : v
  },
  image: { 
    type: [taggedImageSchema],
    default: []
  },
  colors: {
    type: [String],
    default: []
  },
  videoUrl: {
    type: String,
    trim: true,
    set: function(url) {
      if (!url) return url;
      if (url.includes('youtube.com/shorts/')) {
        return url.replace('shorts/', 'watch?v=');
      }
      return url;
    }
  },
  curatorNote: { 
    type: String,
    trim: true
  },
  img: { 
    type: String // Main thumbnail string
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- VIRTUAL: Sale Price Calculation ---
// Access this via product.salePrice in your frontend
productSchema.virtual('salePrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * (this.discount / 100));
  }
  return this.price;
});

// --- UPDATED PRE-SAVE HOOK ---
productSchema.pre('save', async function() {
  // Sync the main thumbnail from the first image object's URL
  if (this.image && this.image.length > 0) {
    this.img = this.image[0].url;
  }

  // Double-check average rating logic
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    const totalRating = this.reviews.reduce((acc, item) => item.rating + acc, 0);
    this.rating = totalRating / this.reviews.length;
  } else {
    this.numReviews = 0;
    this.rating = 0;
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;