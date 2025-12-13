import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendOTPEmail } from "../utils/nodemailer.js";

// Generate username from email - FIXED VERSION
const generateUsername = (email) => {
  // Extract the part before @ symbol
  const usernamePart = email.split('@')[0];
  return `admin@${usernamePart}`;
};

// Invite new admin user
export const inviteAdmin = async (req, res) => {
  try {
    console.log(`[INVITE-ADMIN] Request from admin: ${req.user._id}`);
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Generate username from email
    const username = generateUsername(email);

    // Check if username already exists
    const existingUsername = await User.findOne({ name: username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Default password
    const defaultPassword = "password@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Generate profile picture
    const profilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;

    // Create new admin user
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      profilePic,
      role: "admin",
      isVerified: true // Admin users are auto-verified
    });

    await newUser.save();

    // Send invitation email
    const frontendUrl = process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://donjayautoswebsite.netlify.app"; // Update with actual frontend URL
    
    const loginUrl = `${frontendUrl}/auth/login`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Welcome to DonJay Autos Platform</h2>
        <p>Hello,</p>
        <p>You have been invited to join DonJay Autos platform as an administrator.</p>
        <p>Your login credentials are:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Password:</strong> ${defaultPassword}</li>
        </ul>
        <p>
          <a href="${loginUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Dashboard
          </a>
        </p>
        <p>
          For security reasons, we recommend changing your password after your first login.
        </p>
        <p>Best regards,<br>DonJay Autos Team</p>
      </div>
    `;

    try {
      await sendOTPEmail(email, emailHtml, "You've been invited to DonJay Autos as Admin");
      console.log(`[INVITE-ADMIN] Invitation email sent to ${email}`);
    } catch (emailError) {
      console.log(`[INVITE-ADMIN] Failed to send invitation email to ${email}:`, emailError.message);
      // Don't fail the request if email fails, just log it
    }

    console.log(`[INVITE-ADMIN] Success - Admin user created: ${newUser._id}`);
    res.status(201).json({
      message: "Admin user invited successfully. Invitation email sent.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.log(`[INVITE-ADMIN] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};