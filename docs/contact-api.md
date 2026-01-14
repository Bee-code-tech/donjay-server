# Contact API Documentation

## Overview
The Contact API allows users to submit contact form information which gets sent to the admin email.

## Endpoints

### Submit Contact Form
**POST** `/api/contact/submit`

#### Description
Submit a contact form with user information and message. This endpoint accepts contact information and sends an email to the admin.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | Yes | User's full name |
| email | String | Yes | User's email address |
| subject | String | Yes | Subject of the message |
| message | String | Yes | Main message content |

#### Example Request
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Inquiry about services",
  "message": "Hello, I would like to know more about your services..."
}
```

#### Responses
- **200 OK**: Contact form submitted successfully
```json
{
  "message": "Thank you for contacting us. We'll get back to you soon!",
  "success": true
}
```

- **400 Bad Request**: Validation error
```json
{
  "error": "Full name, email, subject, and message are required"
}
```

- **500 Internal Server Error**: Server error
```json
{
  "error": "Internal Server Error"
}
```

## Email Notification
Upon successful form submission, an email is sent to `Lawalemma24@gmail.com` containing the contact information and message.