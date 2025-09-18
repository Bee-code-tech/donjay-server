# Authentication API Documentation

**Base URLs:**
- Development: `http://localhost:5000/api/auth`
- Production: `https://donjay.onrender.com/api/auth`

## Endpoints

### 1. Sign Up
**POST** `/signup`

Creates a new user account and sends OTP verification email.

**Request Body:**
```json
{
  "username": "string (5+ characters, not email format)",
  "email": "string (valid email)",
  "password": "string (6+ characters)",
  "confirmPassword": "string (must match password)",
  "country": "string (optional)",
  "code": "string (optional)"
}
```

**Test Data:**
```json
{
  "username": "testuser123",
  "email": "testuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "country": "United States",
  "code": "+1"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your email, please verify to complete registration."
}
```

**Error Responses:**
- `400`: Username can't be in email format
- `400`: Passwords don't match
- `400`: Username must be at least 5 characters
- `400`: Username already exists
- `400`: Email already exists
- `500`: Internal Server Error

---

### 2. Verify OTP
**POST** `/verify-otp`

Verifies the OTP sent to user's email and completes registration.

**Request Body:**
```json
{
  "email": "string",
  "otp": "string (6-digit code)"
}
```

**Test Data:**
```json
{
  "email": "testuser@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "profilePic": "",
  "email": "testuser@example.com",
  "profileCode": "USER-ABCD-EFGH",
  "country": "United States",
  "token": "jwt_token_here",
  "message": "User verified successfully"
}
```

**Error Responses:**
- `400`: Invalid email or OTP
- `400`: User is already verified
- `400`: OTP is invalid or expired
- `500`: Internal Server Error

---

### 3. Login
**POST** `/login`

Authenticates user with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Test Data:**
```json
{
  "username": "testuser123",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "fullName": "User Full Name",
  "username": "testuser123",
  "profilePic": "",
  "token": "jwt_token_here",
  "notifications": [],
  "country": "United States",
  "profileCode": "USER-ABCD-EFGH"
}
```

**Error Responses:**
- `400`: Invalid username or password
- `500`: Internal Server Error

---

### 4. Logout
**POST** `/logout`

Logs out the current user.

**Request Body:** None required

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `500`: Internal Server Error

---

### 5. Forgot Password
**POST** `/forgot-password`

Sends password reset link to user's email.

**Request Body:**
```json
{
  "email": "string"
}
```

**Test Data:**
```json
{
  "email": "testuser@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email."
}
```

**Error Responses:**
- `404`: No user found with this email
- `500`: Internal Server Error

---

### 6. Reset Password
**PUT** `/reset-password?token=reset_token`

Resets user password using the token from email.

**Query Parameters:**
- `token`: JWT token from reset email

**Request Body:**
```json
{
  "newPassword": "string (6+ characters)",
  "confirmPassword": "string (must match newPassword)"
}
```

**Test Data:**
```json
{
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully.",
  "success": true
}
```

**Error Responses:**
- `400`: Please provide both passwords
- `400`: Passwords do not match
- `400`: Invalid or expired token
- `400`: New password must be different from the old password
- `404`: User not found
- `500`: Internal Server Error

---

### 7. Change Password (Protected)
**PUT** `/changePass`

Changes user's password (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Test Data:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password Changed successfully"
}
```

**Error Responses:**
- `401`: Your Old Password did not match
- `500`: Internal Server Error

---

## Authentication Flow

1. **Registration Flow:**
   - POST `/signup` → sends OTP to email
   - POST `/verify-otp` → completes registration and returns JWT token

2. **Login Flow:**
   - POST `/login` → returns JWT token

3. **Password Reset Flow:**
   - POST `/forgot-password` → sends reset link to email
   - PUT `/reset-password?token=...` → resets password

4. **Change Password Flow:**
   - PUT `/changePass` (with JWT token) → changes password

## Notes

- All passwords must be at least 6 characters long
- Usernames must be at least 5 characters and cannot be in email format
- OTP expires after 10 minutes
- Password reset tokens expire after 1 hour
- JWT tokens are set as HTTP-only cookies for security
- Profile codes are automatically generated in format: `USER-XXXX-XXXX`

## Testing with cURL

### Sign Up Example:
```bash
# Development
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "testuser@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "country": "United States",
    "code": "+1"
  }'

# Production
curl -X POST https://donjay.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "testuser@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "country": "United States",
    "code": "+1"
  }'
```

### Login Example:
```bash
# Development
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "password123"
  }'

# Production
curl -X POST https://donjay.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "password123"
  }'
```