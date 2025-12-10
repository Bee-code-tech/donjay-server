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
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Test connection on startup 
transporter.verify((error, success) => {
  if (error) {
    console.log('[EMAIL] SMTP Connection Error:', error.message);
  } else {
    console.log('[EMAIL] SMTP Connection: Ready to send emails');
  }
});

export const sendOTPEmail = async (email, content, subject) => {
  try {
    // Handle case where subject is not provided (older usage)
    const emailSubject = subject || "Your OTP Code";
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: emailSubject,
      text: typeof content === 'string' && emailSubject !== "Your OTP Code" 
        ? content 
        : `Your OTP code is ${content}. It is valid for 10 minutes.`,
      html: typeof content === 'string' && content.includes('<') 
        ? content 
        : undefined
    };

    // If subject is the default OTP subject and content is a simple string, treat as OTP
    if (emailSubject === "Your OTP Code" && typeof content === 'string' && !content.includes('<')) {
      mailOptions.text = `Your OTP code is ${content}. It is valid for 10 minutes.`;
      mailOptions.html = undefined;
    }

    console.log(`[EMAIL] Sending email to ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Email sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.log(`[EMAIL] Failed to send email to ${email}:`, error.message);
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

