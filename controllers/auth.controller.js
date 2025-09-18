import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate a unique profile code 
const generateProfileCode = async () => {
  let profileCode;
  let isUnique = false;

  while (!isUnique) {
    profileCode = `USER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const existingUser = await User.findOne({ profileCode });
    if (!existingUser) {
      isUnique = true;
    }
  }
``
  return profileCode;
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, country, code } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(username)) {
      return res.status(400).json({ error: "Username can't be in email format" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    if (username.length < 5) {
      return res.status(400).json({ error: "Username must be at least 5 characters and less than 8 characters" });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // random avatart for future use 
    // `https://avatar.iran.liara.run/public/boy?username=${username}`

    // Send OTP email
    await sendOTPEmail(email, otp);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const profileCode = await generateProfileCode();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePic: ``,
      profileCode,
      otp,
      otpExpiry,
      country,
      code
    });

    await newUser.save();

    res.status(200).json({
      message: "OTP sent to your email, please verify to complete registration.",
    });
  } catch (error) {
    console.log("🚀 ~ signup ~ error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify OTP 
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or OTP" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP is invalid or expired" });
    }

    user.isVerified = true; 
    user.otp = undefined; 
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token after verification
    const token = generateTokenAndSetCookie(user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      email: user.email,
      profileCode: user.profileCode,
      country: user.country,
      profileCode: user.profileCode,
     token,
      message: "User verified successfully",
    });
  } catch (error) {
    console.log("🚀 ~ verifyOTP ~ error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateTokenAndSetCookie(user._id); 

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
      token: token,
      notifications: user.notifications,
      country: user.country,
      profileCode: user.profileCode
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePass = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const user = await User.findById(loggedInUser._id);
    const hashedPasswordFromDB = user.password;
    const isOldPasswordValid = await bcrypt.compare(
      req.body.oldPassword,
      hashedPasswordFromDB
    );

    if (!isOldPasswordValid) {
      return res
        .status(401)
        .json({ success: false, msg: "Your Old Password did not matched" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();
    
    res.clearCookie("jwt");
    res
      .status(200)
      .json({ success: true, message: "Password Changed successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email." });
    }

    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", 
    });

    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://mern-chat-frontend-azure.vercel.app';

    const resetUrl = `${frontendUrl}/reset?token=${resetToken}`;

    await sendResetPasswordEmail(user.email, resetUrl);

    // Send response
    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("🚀 ~ forgotPassword ~ error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Please provide both passwords." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Verify the token and extract user ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    console.log("Decoded token:", decoded);

    // Find the user by ID from the token payload
    const user = await User.findById(decoded._id);
    if (!user) {
      console.error("User not found with ID:", decoded._id);
      return res.status(404).json({ error: "User not found." });
    }

    console.log("password before new", user.password);

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    console.log("Hashed new password:", hashedNewPassword);

    // Check if new password is different from the old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from the old password." });
    }

    user.password = hashedNewPassword;
    await user.save();

    // Re-fetch the user to confirm password update
    const updatedUser = await User.findById(decoded._id);
    console.log("Updated User Password (Post-save):", updatedUser.password);

    res.status(200).json({ message: "Password has been reset successfully.", success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Reset token has expired." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};


 
