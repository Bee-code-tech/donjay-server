// utils/nodemailer.js
import dotenv from "dotenv";
import brevo from "@getbrevo/brevo";

dotenv.config();

// Validate environment variables
console.log('[EMAIL] Environment variables check:');
console.log('[EMAIL] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
console.log('[EMAIL] BREVO_API_KEY length:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 0);
console.log('[EMAIL] BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL || 'NOT SET');

// Check for missing required environment variables
if (!process.env.BREVO_API_KEY) {
  console.error('[EMAIL] ERROR: Missing BREVO_API_KEY environment variable');
  throw new Error('BREVO_API_KEY is required for email functionality');
}

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendOTPEmail = async (email, content, subject) => {
  try {
    // Handle case where subject is not provided (older usage)
    const emailSubject = subject || "Your OTP Code";
    
    // Prepare email content
    const textContent = typeof content === 'string' && emailSubject !== "Your OTP Code" 
      ? content 
      : `Your OTP code is ${content}. It is valid for 10 minutes.`;
    
    const htmlContent = typeof content === 'string' && content.includes('<') 
      ? content 
      : (emailSubject === "Your OTP Code" 
        ? `<p>Your OTP code is <strong>${content}</strong>. It is valid for 10 minutes.</p>` 
        : `<p>${content}</p>`);

    // Create email object
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { 
      email: process.env.BREVO_SENDER_EMAIL || "noreply@donjayautos.com", 
      name: "DonJay Autos" 
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = emailSubject;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.htmlContent = htmlContent;

    console.log(`[EMAIL] Sending OTP email to ${email} from ${sendSmtpEmail.sender.email}`);
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[EMAIL] OTP email sent successfully to ${email}`, result.messageId);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Failed to send OTP email to ${email}:`, {
      status: error.response?.statusCode,
      statusText: error.response?.statusText,
      body: error.response?.body,
      message: error.message,
      code: error.code
    });
    
    // If it's a 401 error, provide more specific guidance
    if (error.response?.statusCode === 401) {
      console.error('[EMAIL] AUTHENTICATION FAILED - Troubleshooting steps:');
      console.error('[EMAIL] 1. Check if BREVO_API_KEY is correct in .env file');
      console.error('[EMAIL] 2. Verify that sender email is verified in Brevo dashboard');
      console.error('[EMAIL] 3. Ensure API key has transactional email permissions');
      console.error('[EMAIL] 4. Check if API key has expired');
    }
    
    throw error;
  }
};

export const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    // Create email object
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { 
      email: process.env.BREVO_SENDER_EMAIL || "noreply@donjayautos.com", 
      name: "DonJay Autos" 
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = "Password Reset";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p><small>The link will expire in 1 hour.</small></p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    sendSmtpEmail.textContent = `You requested to reset your password. Click the link below to reset it: ${resetUrl}

The link will expire in 1 hour.

If you didn't request this, please ignore this email.`;

    console.log(`[EMAIL] Sending password reset email to ${email} from ${sendSmtpEmail.sender.email}`);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[EMAIL] Password reset email sent successfully to ${email}`, result.messageId);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Failed to send password reset email to ${email}:`, {
      status: error.response?.statusCode,
      statusText: error.response?.statusText,
      body: error.response?.body,
      message: error.message,
      code: error.code
    });
    
    // If it's a 401 error, provide more specific guidance
    if (error.response?.statusCode === 401) {
      console.error('[EMAIL] AUTHENTICATION FAILED - Troubleshooting steps:');
      console.error('[EMAIL] 1. Check if BREVO_API_KEY is correct in .env file');
      console.error('[EMAIL] 2. Verify that sender email is verified in Brevo dashboard');
      console.error('[EMAIL] 3. Ensure API key has transactional email permissions');
      console.error('[EMAIL] 4. Check if API key has expired');
    }
    
    throw error;
  }
};