// Car notification templates
export const carApprovedTemplate = (carName, customerName) => ({
  subject: '✅ Your Car Listing Has Been Approved',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Car Listing Approved!</h2>
      <p>Hi ${customerName},</p>
      <p>Great news! Your car listing for <strong>${carName}</strong> has been approved and is now live on our platform.</p>
      <p>Your listing is now visible to potential buyers. You can expect to receive inquiries and deal requests soon.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const carRejectedTemplate = (carName, customerName, reason) => ({
  subject: '❌ Your Car Listing Needs Attention',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Car Listing Requires Updates</h2>
      <p>Hi ${customerName},</p>
      <p>Your car listing for <strong>${carName}</strong> needs some updates before we can approve it.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please update your listing and resubmit for review.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const newCarSubmittedTemplate = (carName, customerName) => ({
  subject: '🚗 New Car Listing Submitted for Review',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">New Car Listing Pending Review</h2>
      <p>A new car listing requires your review:</p>
      <ul>
        <li><strong>Car:</strong> ${carName}</li>
        <li><strong>Owner:</strong> ${customerName}</li>
      </ul>
      <p>Please review and approve/reject the listing.</p>
      <p>Admin Team</p>
    </div>
  `
});

// Deal notification templates
export const dealCreatedTemplate = (dealType, carName, customerName) => ({
  subject: `🤝 New ${dealType.charAt(0).toUpperCase() + dealType.slice(1)} Deal Created`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">New Deal Pending Review</h2>
      <p>A new ${dealType} deal requires your attention:</p>
      <ul>
        <li><strong>Type:</strong> ${dealType.toUpperCase()}</li>
        <li><strong>Car:</strong> ${carName}</li>
        <li><strong>Customer:</strong> ${customerName}</li>
      </ul>
      <p>Please review and approve/reject the deal.</p>
      <p>Admin Team</p>
    </div>
  `
});

export const dealApprovedTemplate = (dealType, carName, customerName) => ({
  subject: '✅ Your Deal Has Been Approved',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Deal Approved!</h2>
      <p>Hi ${customerName},</p>
      <p>Great news! Your ${dealType} deal for <strong>${carName}</strong> has been approved.</p>
      <p>Our team will contact you shortly to proceed with the next steps.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const dealRejectedTemplate = (dealType, carName, customerName, reason) => ({
  subject: '❌ Deal Update Required',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Deal Requires Attention</h2>
      <p>Hi ${customerName},</p>
      <p>Your ${dealType} deal for <strong>${carName}</strong> could not be approved at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please contact us if you have any questions.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const dealCompletedTemplate = (dealType, carName, customerName) => ({
  subject: '🎉 Deal Completed Successfully',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Deal Completed!</h2>
      <p>Hi ${customerName},</p>
      <p>Congratulations! Your ${dealType} deal for <strong>${carName}</strong> has been completed successfully.</p>
      <p>Thank you for using our platform. We hope you had a great experience!</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

// Inspection notification templates
export const inspectionBookedTemplate = (carName, customerName, date, timeSlot) => ({
  subject: '📅 New Inspection Booking',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">New Inspection Booking</h2>
      <p>A new inspection has been booked:</p>
      <ul>
        <li><strong>Car:</strong> ${carName}</li>
        <li><strong>Customer:</strong> ${customerName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime} (${timeSlot.period})</li>
      </ul>
      <p>Please confirm the inspection and assign an inspector.</p>
      <p>Admin Team</p>
    </div>
  `
});

export const inspectionConfirmedTemplate = (carName, customerName, date, timeSlot) => ({
  subject: '✅ Inspection Confirmed',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Inspection Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Your inspection for <strong>${carName}</strong> has been confirmed:</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</li>
      </ul>
      <p>Please be available at the scheduled time. Our inspector will contact you shortly.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const inspectionCompletedTemplate = (carName, customerName, overallCondition) => ({
  subject: '🔍 Inspection Completed',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Inspection Completed!</h2>
      <p>Hi ${customerName},</p>
      <p>The inspection for <strong>${carName}</strong> has been completed.</p>
      <p><strong>Overall Condition:</strong> ${overallCondition}</p>
      <p>You can view the detailed inspection report in your dashboard.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

export const inspectionRescheduledTemplate = (carName, customerName, newDate, newTimeSlot) => ({
  subject: '📅 Inspection Rescheduled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">Inspection Rescheduled</h2>
      <p>Hi ${customerName},</p>
      <p>Your inspection for <strong>${carName}</strong> has been rescheduled:</p>
      <ul>
        <li><strong>New Date:</strong> ${newDate}</li>
        <li><strong>New Time:</strong> ${newTimeSlot.startTime} - ${newTimeSlot.endTime}</li>
      </ul>
      <p>Please make note of the new schedule.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});

// Message notification templates
export const newMessageTemplate = (senderName, messageContent, recipientName) => ({
  subject: '💬 New Message Received',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">New Message</h2>
      <p>Hi ${recipientName},</p>
      <p>You have received a new message from <strong>${senderName}</strong>:</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3;">
        ${messageContent}
      </div>
      <p>Please log in to your account to reply.</p>
      <p>Best regards,<br>Car Listing Team</p>
    </div>
  `
});