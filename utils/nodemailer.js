// utils/nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};


export const sendResetPasswordEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Example with Gmail, configure based on your SMTP server
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

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

  await transporter.sendMail(mailOptions);
};

