// Test email script
import dotenv from "dotenv";
import brevo from "@getbrevo/brevo";

dotenv.config();

console.log('Testing Brevo API connection...');
console.log('API Key exists:', !!process.env.BREVO_API_KEY);
console.log('API Key length:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 0);
console.log('Sender Email:', process.env.BREVO_SENDER_EMAIL);

const sendTestEmail = async () => {
  try {
    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    
    // Create email object
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { 
      email: process.env.BREVO_SENDER_EMAIL, 
      name: "DonJay Autos Test" 
    };
    sendSmtpEmail.to = [{ email: "babawalealameen64@gmail.com" }]; // Change to your test email
    sendSmtpEmail.subject = "Test Email from DonJay Autos";
    sendSmtpEmail.textContent = "This is a test email to verify Brevo integration.";
    sendSmtpEmail.htmlContent = "<p>This is a <strong>test email</strong> to verify Brevo integration.</p>";

    console.log('Sending test email...');
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully!', result);
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error.response) {
      console.error('Response data:', error.response.body);
    }
  }
};

sendTestEmail();