import { sendOTPEmail } from "./nodemailer.js";
import User from "../models/user.model.js";
import {
  carApprovedTemplate,
  carRejectedTemplate,
  newCarSubmittedTemplate,
  dealCreatedTemplate,
  dealApprovedTemplate,
  dealRejectedTemplate,
  dealCompletedTemplate,
  inspectionBookedTemplate,
  inspectionConfirmedTemplate,
  inspectionCompletedTemplate,
  inspectionRescheduledTemplate,
  newMessageTemplate
} from "./emailTemplates.js";

// Generic email sender
const sendEmail = async (to, subject, html) => {
  try {
    // Reuse existing nodemailer setup
    const emailSent = await sendOTPEmail(to, html, subject);
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return emailSent;
  } catch (error) {
    console.log(`[EMAIL] Failed to send to ${to}: ${error.message}`);
    throw error;
  }
};
// Car notification functions
export const sendCarApprovedEmail = async (car, owner) => {
  try {
    const template = carApprovedTemplate(car.carName, owner.name);
    await sendEmail(owner.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Car approved email failed: ${error.message}`);
  }
};

export const sendCarRejectedEmail = async (car, owner, reason) => {
  try {
    const template = carRejectedTemplate(car.carName, owner.name, reason);
    await sendEmail(owner.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Car rejected email failed: ${error.message}`);
  }
};

export const sendNewCarSubmittedEmail = async (car, owner) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    const template = newCarSubmittedTemplate(car.carName, owner.name);
    
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, template.subject, template.html)
    );
    
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.log(`[EMAIL] New car submitted emails failed: ${error.message}`);
  }
};

// Deal notification functions
export const sendDealCreatedEmail = async (deal, customer, car) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    const template = dealCreatedTemplate(deal.dealType, car.carName, customer.name);
    
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, template.subject, template.html)
    );
    
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.log(`[EMAIL] Deal created emails failed: ${error.message}`);
  }
};

export const sendDealApprovedEmail = async (deal, customer, car) => {
  try {
    const template = dealApprovedTemplate(deal.dealType, car.carName, customer.name);
    await sendEmail(customer.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Deal approved email failed: ${error.message}`);
  }
};

export const sendDealRejectedEmail = async (deal, customer, car, reason) => {
  try {
    const template = dealRejectedTemplate(deal.dealType, car.carName, customer.name, reason);
    await sendEmail(customer.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Deal rejected email failed: ${error.message}`);
  }
};

export const sendDealCompletedEmail = async (deal, customer, car) => {
  try {
    const template = dealCompletedTemplate(deal.dealType, car.carName, customer.name);
    await sendEmail(customer.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Deal completed email failed: ${error.message}`);
  }
};

// Inspection notification functions
export const sendInspectionBookedEmail = async (inspection, customer, car) => {
  try {
    const dateStr = inspection.inspectionDate.toLocaleDateString();
    
    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('email');
    const adminTemplate = inspectionBookedTemplate(car.carName, customer.name, dateStr, inspection.timeSlot);
    
    const adminEmailPromises = admins.map(admin => 
      sendEmail(admin.email, adminTemplate.subject, adminTemplate.html)
    );
    
    // Notify car owner if different from customer
    if (car.owner.toString() !== customer._id.toString()) {
      const carOwner = await User.findById(car.owner).select('email name');
      if (carOwner) {
        const ownerTemplate = inspectionBookedTemplate(car.carName, customer.name, dateStr, inspection.timeSlot);
        adminEmailPromises.push(
          sendEmail(carOwner.email, `🔍 Inspection Booked for Your Car`, ownerTemplate.html)
        );
      }
    }
    
    await Promise.allSettled(adminEmailPromises);
  } catch (error) {
    console.log(`[EMAIL] Inspection booked emails failed: ${error.message}`);
  }
};

export const sendInspectionConfirmedEmail = async (inspection, customer, car) => {
  try {
    const dateStr = inspection.inspectionDate.toLocaleDateString();
    const template = inspectionConfirmedTemplate(car.carName, customer.name, dateStr, inspection.timeSlot);
    await sendEmail(customer.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] Inspection confirmed email failed: ${error.message}`);
  }
};

export const sendInspectionCompletedEmail = async (inspection, customer, car) => {
  try {
    const overallCondition = inspection.inspectionReport?.overallCondition || 'Completed';
    
    // Notify customer
    const customerTemplate = inspectionCompletedTemplate(car.carName, customer.name, overallCondition);
    const emailPromises = [
      sendEmail(customer.email, customerTemplate.subject, customerTemplate.html)
    ];
    
    // Notify car owner if different from customer
    if (car.owner.toString() !== customer._id.toString()) {
      const carOwner = await User.findById(car.owner).select('email name');
      if (carOwner) {
        const ownerTemplate = inspectionCompletedTemplate(car.carName, carOwner.name, overallCondition);
        emailPromises.push(
          sendEmail(carOwner.email, `🔍 Inspection Completed for Your Car`, ownerTemplate.html)
        );
      }
    }
    
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.log(`[EMAIL] Inspection completed emails failed: ${error.message}`);
  }
};

export const sendInspectionRescheduledEmail = async (inspection, customer, car) => {
  try {
    const newDateStr = inspection.inspectionDate.toLocaleDateString();
    
    // Notify customer
    const customerTemplate = inspectionRescheduledTemplate(car.carName, customer.name, newDateStr, inspection.timeSlot);
    const emailPromises = [
      sendEmail(customer.email, customerTemplate.subject, customerTemplate.html)
    ];
    
    // Notify car owner if different from customer
    if (car.owner.toString() !== customer._id.toString()) {
      const carOwner = await User.findById(car.owner).select('email name');
      if (carOwner) {
        const ownerTemplate = inspectionRescheduledTemplate(car.carName, carOwner.name, newDateStr, inspection.timeSlot);
        emailPromises.push(
          sendEmail(carOwner.email, `📅 Inspection Rescheduled for Your Car`, ownerTemplate.html)
        );
      }
    }
    
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.log(`[EMAIL] Inspection rescheduled emails failed: ${error.message}`);
  }
};

// Message notification functions
export const sendNewMessageEmail = async (sender, recipient, messageContent) => {
  try {
    // Only send email if recipient is offline (basic implementation)
    const template = newMessageTemplate(sender.name, messageContent, recipient.name);
    await sendEmail(recipient.email, template.subject, template.html);
  } catch (error) {
    console.log(`[EMAIL] New message email failed: ${error.message}`);
  }
};

// Contact form notification function
export const sendContactFormEmail = async (fullName, email, subject, message) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">New Contact Form Submission</h2>
        <p>You have received a new message from your website contact form:</p>
        <ul>
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Message:</strong> ${message}</li>
        </ul>
        <p>Please respond to the customer as soon as possible.</p>
        <p>Website Contact System</p>
      </div>
    `;
    
    const result = await sendEmail('Lawalemma24@gmail.com', subject, htmlContent);
    console.log(`[EMAIL] Contact form email sent successfully from ${email} with subject: ${subject}`);
    return result;
  } catch (error) {
    console.log(`[EMAIL] Contact form email failed: ${error.message}`);
    throw error;
  }
};

// Utility function to get user by ID with email
export const getUserWithEmail = async (userId) => {
  return await User.findById(userId).select('name email');
};