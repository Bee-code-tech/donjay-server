# Users Management API Documentation

## Overview
The users management system provides administrative endpoints for managing platform users. Admins can retrieve user information, suspend accounts, and delete users.

## Base URL
```
/api/users
```

## Authentication
All endpoints require authentication with a valid JWT token and admin privileges.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_admin_jwt_token>
```

## User Roles
- **admin**: Can access all user management endpoints

---

## Endpoints

### 1. Get All Users
**GET** `/`

Retrieve a paginated list of all users with optional filtering.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of users per page
- `role` (optional): Filter by user role ('customer' or 'admin')
- `search` (optional): Search by name or email

#### Response
```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "username",
      "email": "user@email.com",
      "role": "customer|admin",
      "profilePic": "profile_pic_url",
      "isVerified": true,
      "isSuspended": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Single User
**GET** `/:id`

Retrieve details of a specific user by ID.

#### Path Parameters
- `id`: The user ID

#### Response
```json
{
  "user": {
    "_id": "user_id",
    "name": "username",
    "email": "user@email.com",
    "role": "customer|admin",
    "profilePic": "profile_pic_url",
    "phoneNumber": "+1234567890",
    "address": "User address",
    "isVerified": true,
    "isSuspended": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Update User
**PUT** `/:id`

Update details of a specific user by ID. Users can update their own profiles, and admins can update any user's profile.

#### Path Parameters
- `id`: The user ID

#### Request Body
| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| name | String | Yes | User's full name |
| email | String | Yes | User's email address (must be unique) |
| role | String | Yes | User's role ('customer' or 'admin') - Only admins can change roles |
| phoneNumber | String | Yes | User's phone number |
| address | String | Yes | User's address |
| isVerified | Boolean | Yes | Verification status - Only admins can update |
| isSuspended | Boolean | Yes | Suspension status - Only admins can update |

#### Example Request
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phoneNumber": "+1234567890",
  "address": "Updated Address"
}
```

#### Response
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "user_id",
    "name": "Updated Name",
    "email": "updated@email.com",
    "role": "customer",
    "profilePic": "profile_pic_url",
    "phoneNumber": "+1234567890",
    "address": "Updated Address",
    "isVerified": false,
    "isSuspended": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Access Control
- Regular users can only update their own profile
- Admins can update any user's profile and have additional permissions to modify role, verification, and suspension status

---

### 4. Suspend/Unsuspend User
**PUT** `/:id/suspend`

Toggle the suspension status of a user. Suspended users cannot log in to the platform.

#### Path Parameters
- `id`: The user ID

#### Response
```json
{
  "message": "User suspended successfully",
  "user": {
    "_id": "user_id",
    "_id": "user_id",
    "name": "username",
    "email": "user@email.com",
    "isSuspended": true
  }
}
```

---

### 5. Delete User
**DELETE** `/:id`

Permanently delete a user account.

#### Path Parameters
- `id`: The user ID

#### Response
```json
{
  "message": "User deleted successfully"
}
```

---

## Error Responses

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

### 404 Not Found
```json
{
  "error": "User not found"
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

### Get All Users (Paginated)
```javascript
const response = await fetch('/api/users?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer admin_jwt_token'
  }
});
```

### Suspend a User
```javascript
const response = await fetch('/api/users/user_id/suspend', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer admin_jwt_token'
  }
});
```

### Delete a User
```javascript
const response = await fetch('/api/users/user_id', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer admin_jwt_token'
  }
});
```