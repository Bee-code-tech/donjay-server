// utils/nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error('[EMAIL] Missing GMAIL_USER or GMAIL_PASS environment variables');
}

console.log('[EMAIL] Gmail User:', process.env.GMAIL_USER ? process.env.GMAIL_USER : 'NOT SET');
console.log('[EMAIL] Gmail Pass:', process.env.GMAIL_PASS ? '***SET***' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: false,
  logger: false,
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('[EMAIL] SMTP Connection Error:', error.message);
  } else {
    console.log('[EMAIL] SMTP Connection: Ready to send emails');
  }
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

