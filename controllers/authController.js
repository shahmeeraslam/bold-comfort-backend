import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// --- HELPERS ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });
};

const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"Bold Comfort Security" <security@boldcomfort.com>',
    to: email,
    subject: "Your Verification Code",
    html: `<div style="font-family: serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #1a1a1a;">Verification Code</h2>
            <p style="font-size: 16px;">Your 6-digit security code is:</p>
            <h1 style="letter-spacing: 10px; color: #bc9c22;">${otp}</h1>
            <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
           </div>`,
  });
};

// --- GOOGLE LOGIN ---
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const googleUser = await googleResponse.json();
    if (!googleUser.email) return res.status(400).json({ message: "Invalid Google Token" });

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      const isFirstUser = (await User.countDocuments({})) === 0;
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        img: googleUser.picture,
        isVerified: true, 
        role: isFirstUser ? "admin" : "user",
      });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        img: user.img || "",
        shippingAddress: user.shippingAddress || {} // Added for frontend sync
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Google Auth failed" });
  }
};

// --- REGISTER ---
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (userExists && !userExists.isVerified) {
        userExists.name = name;
        userExists.password = hashedPassword;
        userExists.otp = otp;
        userExists.otpExpires = otpExpires;
        await userExists.save();
    } else {
        const isFirstUser = (await User.countDocuments({})) === 0;
        await User.create({
          name, email, password: hashedPassword,
          role: isFirstUser ? "admin" : "user",
          otp, otpExpires
        });
    }

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email", email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN ---
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (user && !user.password) {
      return res.status(400).json({ message: "Account created with Google. Please use Google Sign-in." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      await sendOTPEmail(email, otp);
      res.json({ requiresVerification: true, email, message: "Verification code sent" });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- VERIFY OTP ---
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        img: user.img || "",
        shippingAddress: user.shippingAddress || {} // Added for frontend sync
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// --- RESEND OTP ---
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "New code sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend code" });
  }
};

// --- UPDATE PROFILE DATA ---
export const updateProfileData = async (req, res) => {
  try {
    const { name, img } = req.body;
    const userId = req.user.id || req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, img },
      { returnDocument: 'after', runValidators: true },
    ).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// --- UPDATE IMAGE ---
export const updateProfileImage = async (req, res) => {
  try {
    const { imgUrl } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { img: imgUrl },
      { returnDocument: 'after' },
    ).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Image update failed" });
  }
};

// --- CHANGE PASSWORD ---
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password) return res.status(400).json({ message: "Google Auth users don't have a password." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { returnDocument: 'after' });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

// --- NEW: UPDATE SHIPPING ADDRESS ---
export const updateShippingAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.id || req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { shippingAddress: address },
      { returnDocument: 'after', runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update address", error: error.message });
  }
};