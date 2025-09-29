// utils/nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    console.log(`[EMAIL] Sending OTP to ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.log(`[EMAIL] Failed to send OTP to ${email}:`, error.message);
    throw error;
  }
};


export const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>The link will expire in 1 hour.</p>
      `,
    };

    console.log(`[EMAIL] Sending password reset to ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.log(`[EMAIL] Failed to send password reset to ${email}:`, error.message);
    throw error;
  }
};

