import Product from '../models/items.js';

/**
 * Universal Sanitizer: 
 * If it's Cloudinary, leave it alone.
 * If it's YouTube, extract the ID and clean it.
 */
const sanitizeVideoUrl = (url) => {
  if (!url) return "";
  if (url.includes('cloudinary.com')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/watch?v=${match[2]}`;
  }
  return url;
};

// --- Create Review ---
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment, name, userImg } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Archive record not found" });
    }

    if (req.user) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user && r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        return res.status(400).json({ message: "Impression already recorded for this archive" });
      }
    }

    const review = {
      name: name || (req.user ? req.user.name : "Anonymous Collector"),
      rating: Number(rating) || 5,
      comment: comment || "No commentary provided.",
      user: req.user ? req.user._id : null,
      userImg: userImg || (req.user ? req.user.img : ""), 
      reviewImage: req.file ? req.file.path : "" 
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    res.status(201).json({ 
      message: "Impression recorded", 
      review: product.reviews[product.reviews.length - 1],
      averageRating: product.rating
    });

  } catch (error) {
    console.error("Review Error:", error);
    res.status(400).json({ message: "Archive update failed: " + error.message });
  }
};

// --- GET All Products ---
export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET Single Product ---
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Archive record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN: Create Product ---
export const createProduct = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Security Violation: Admin role required." });
    }
    const data = req.body;
    
    // Convert numerical values
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    
    // NEW: Handle Discount Logic
    if (data.discount !== undefined) {
      data.discount = Math.min(Math.max(Number(data.discount), 0), 99);
    } else {
      data.discount = 0;
    }

    if (data.videoUrl) data.videoUrl = sanitizeVideoUrl(data.videoUrl);
    
    if (data.image && data.image.length > 0) {
      data.img = data.image[0].url; 
    }
    
    if (!data.colors) data.colors = [];

    const newProduct = new Product(data);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Failed to archive piece: " + error.message });
  }
};

// --- ADMIN: Update Product ---
export const updateProduct = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Security Violation: Admin role required." });
    }
    const data = req.body;
    
    // Process Numerical Data
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.discount !== undefined) {
      data.discount = Math.min(Math.max(Number(data.discount), 0), 99);
    }
    
    // Sanitize Video & Images
    if (data.videoUrl) data.videoUrl = sanitizeVideoUrl(data.videoUrl);
    if (data.image && data.image.length > 0) {
      data.img = data.image[0].url;
    }

    // FIXED: Swapped 'new: true' for 'returnDocument: after'
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      data, 
      { 
        returnDocument: 'after', // This replaces 'new: true'
        runValidators: true, 
        context: 'query' 
      } 
    );
    
    if (!updatedProduct) return res.status(404).json({ message: "Piece not found" });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Update failed: " + error.message });
  }
};

// --- ADMIN: Delete Product ---
export const deleteProduct = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Security Violation: Admin role required." });
    }
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Piece already removed" });
    res.status(200).json({ message: "Piece successfully purged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};