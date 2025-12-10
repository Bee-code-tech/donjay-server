# Admin Invitation API Documentation

## Overview
The admin invitation system allows existing administrators to invite new administrators to the platform. When an admin is invited, a new account is automatically created with a default password and an invitation email is sent.

## Base URL
```
/api/invite
```

## Authentication
All endpoints require authentication with a valid JWT token and admin privileges.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_admin_jwt_token>
```

## User Roles
- **admin**: Can invite new administrators

---

## Endpoints

### 1. Invite New Administrator
**POST** `/`

Invite a new administrator by email. The system will automatically create an account and send an invitation email.

#### Request Body
```json
{
  "email": "string (required, valid email format)"
}
```

#### Process Details
1. Validates the email format
2. Checks if user with this email already exists
3. Generates username from email domain (e.g., admin@gmail for test@gmail.com)
4. Checks if username already exists
5. Creates new admin user with:
   - Auto-generated username
   - Default password: "password@123"
   - Role: "admin"
   - Auto-verified status
6. Sends invitation email with login credentials

#### Response
```json
{
  "message": "Admin user invited successfully. Invitation email sent.",
  "user": {
    "_id": "user_id",
    "name": "admin@domain",
    "email": "newadmin@email.com",
    "role": "admin"
  }
}
```

#### Sample Invitation Email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2196F3;">Welcome to DonJay Autos Platform</h2>
  <p>Hello,</p>
  <p>You have been invited to join DonJay Autos platform as an administrator.</p>
  <p>Your login credentials are:</p>
  <ul>
    <li><strong>Email:</strong> newadmin@email.com</li>
    <li><strong>Username:</strong> admin@email</li>
    <li><strong>Password:</strong> password@123</li>
  </ul>
  <p>
    <a href="http://localhost:3000/auth/login" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Login to Dashboard
    </a>
  </p>
  <p>
    For security reasons, we recommend changing your password after your first login.
  </p>
  <p>Best regards,<br>DonJay Autos Team</p>
</div>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Please provide a valid email address"
}
```

```json
{
  "error": "User with this email already exists"
}
```

```json
{
  "error": "Username already exists"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied. Authentication required."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Usage Examples

### Invite New Admin
```javascript
const response = await fetch('/api/invite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_jwt_token'
  },
  body: JSON.stringify({
    email: 'newadmin@email.com'
  })
});
```

### Expected Response
```json
{
  "message": "Admin user invited successfully. Invitation email sent.",
  "user": {
    "_id": "607d1f77bcf86cd799439011",
    "name": "admin@email",
    "email": "newadmin@email.com",
    "role": "admin"
  }
}
```

---

## Security Notes

1. **Default Password**: All invited admins receive the same default password ("password@123"). They should change it immediately after first login.

2. **Auto-verification**: Invited admins are automatically verified and don't need to go through the OTP verification process.

3. **Role Restriction**: Only existing admins can invite new admins.

4. **Email Validation**: The system validates email format before processing invitations.

5. **Duplicate Prevention**: The system prevents duplicate users by checking both email and username availability.