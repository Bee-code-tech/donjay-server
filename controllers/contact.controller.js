import { sendContactFormEmail } from "../utils/emailNotifications.js";

// Contact form submission handler
export const submitContactForm = async (req, res) => {
  try {
    console.log(`[CONTACT-FORM] New contact form submission received`);
    
    const { fullName, email, subject, message } = req.body;

    // Validation
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        error: "Full name, email, subject, and message are required"
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Please provide a valid email address"
      });
    }

    // Basic sanitization to prevent injection
    const sanitizedFullName = fullName.trim().substring(0, 100);
    const sanitizedEmail = email.trim().substring(0, 100);
    const sanitizedSubject = subject.trim().substring(0, 200);
    const sanitizedMessage = message.trim().substring(0, 2000);

    // Send email to admin
    await sendContactFormEmail(sanitizedFullName, sanitizedEmail, sanitizedSubject, sanitizedMessage);

    console.log(`[CONTACT-FORM] Success - Contact form submitted by: ${sanitizedFullName} (${sanitizedEmail})`);
    
    res.status(200).json({
      message: "Thank you for contacting us. We'll get back to you soon!",
      success: true
    });
  } catch (error) {
    console.log(`[CONTACT-FORM] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};