import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    console.log(`[SIGNUP] Request from ${req.body.email}`);
    const { name, email, password, confirmPassword, phoneNumber, address} = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(name)) {
      return res.status(400).json({ error: "Name can't be in email format" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (name.length < 5) {
      return res.status(400).json({ error: "Name must be at least 5 characters and less than 8 characters" });
    }

    const userExists = await User.findOne({ name });

    if (userExists) {
      return res.status(400).json({ error: "Name already exists" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Generate profile picture using Iran.liara service
    const profilePic = `https://avatar.iran.liara.run/public/boy?username=${name}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Try to send email first with timeout
    const emailPromise = sendOTPEmail(email, otp);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email timeout')), 15000)
    );

    try {
      await Promise.race([emailPromise, timeoutPromise]);
      console.log(`[SIGNUP] OTP sent successfully to ${email}`);

      // Only create user if email was sent successfully
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        profilePic,
        phoneNumber,
        address,
        otp,
        otpExpiry,
      });

      await newUser.save();
      console.log(`[SIGNUP] User created: ${newUser._id}`);

      res.status(200).json({
        message: "OTP sent to your email, please verify to complete registration.",
        userId: newUser._id
      });
    } catch (emailError) {
      console.log(`[SIGNUP] Email failed: ${emailError.message}`);
      res.status(400).json({
        error: "Failed to send verification email. Please check your email address and try again.",
        details: emailError.message
      });
    }
  } catch (error) {
    console.log(`[SIGNUP] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    console.log(`[VERIFY] Request from ${req.body.email}`);
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

    console.log(`[VERIFY] Success - User verified: ${user._id}`);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      profilePic: user.profilePic,
      email: user.email,
      role: user.role,
      address: user.address,
      token,
      message: "User verified successfully",
    });
  } catch (error) {
    console.log(`[VERIFY] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log(`[LOGIN] Request from ${req.body.email}`);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateTokenAndSetCookie(user._id);

    console.log(`[LOGIN] Success - User logged in: ${user._id}`);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      profilePic: user.profilePic,
      email: user.email,
      role: user.role,
      address: user.address,
      token: token,
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    console.log(`[LOGIN] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePass = async (req, res) => {
  try {
    console.log(`[UPDATE-PASS] Request from user: ${req.user._id}`);
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
    console.log(`[UPDATE-PASS] Success - Password updated for: ${user._id}`);
    res.status(200).json({ success: true, message: "Password Changed successfully" });
  } catch (error) {
    console.log(`[UPDATE-PASS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    console.log(`[LOGOUT] Request received`);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(`[LOGOUT] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    console.log(`[FORGOT-PASSWORD] Request from ${req.body.email}`);
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

    console.log(`[FORGOT-PASSWORD] Success - Reset link sent to: ${email}`);
    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.log(`[FORGOT-PASSWORD] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log(`[RESET-PASSWORD] Request received`);
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

    // Find the user by ID from the token payload
    const user = await User.findById(decoded._id);
    if (!user) {
      console.error("User not found with ID:", decoded._id);
      return res.status(404).json({ error: "User not found." });
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Check if new password is different from the old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from the old password." });
    }

    user.password = hashedNewPassword;
    await user.save();

    console.log(`[RESET-PASSWORD] Success - Password reset for user: ${user._id}`);
    res.status(200).json({ message: "Password has been reset successfully.", success: true });
  } catch (error) {
    console.log(`[RESET-PASSWORD] Error:`, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Reset token has expired." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};