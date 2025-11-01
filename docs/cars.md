# Car Listing API Documentation

**Base URLs:**
- Development: `http://localhost:5000/api/cars`
- Production: `https://donjay-server.vercel.app/api/cars`

## Overview

The Car Listing API provides comprehensive CRUD operations for managing car listings on a car marketplace platform. It supports role-based access control with customers and admin users.

### Authentication

Most endpoints require authentication via JWT token in:
- Cookie: `jwt=your_token_here`
- Header: `Authorization: Bearer your_token_here`

### User Roles

- **Customer**: Can create, view their own cars, and update their cars
- **Admin**: Can view all cars, approve/reject listings, and delete any car

---

## Endpoints

### 1. Create Car Listing
**POST** `/`

Creates a new car listing. Admin cars are auto-approved, customer cars are pending.

**Authentication:** Required

**Request Body:**
```json
{
  "carName": "string (required)",
  "year": "number (required, 1900-current+1)",
  "condition": "string (required: new, used, certified pre-owned)",
  "transmission": "string (required: automatic, manual, cvt)",
  "fuelType": "string (required: petrol, diesel, electric, hybrid, cng, lpg)",
  "engine": "string (required)",
  "mileage": "number (required, min: 0)",
  "price": "number (required, min: 0)",
  "note": "string (optional, max: 1000 chars)",
  "images": ["string (required, array of image URLs)"]
}
```

**Test Data:**
```json
{
  "carName": "Toyota Camry",
  "year": 2022,
  "condition": "used",
  "transmission": "automatic",
  "fuelType": "hybrid",
  "engine": "2.5L 4-Cylinder Hybrid",
  "mileage": 15000,
  "price": 28500,
  "note": "Excellent condition, single owner, full service history",
  "images": [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg"
  ]
}
```

**Response (201):**
```json
{
  "message": "Car listing created successfully and pending approval",
  "car": {
    "_id": "car_id",
    "carName": "Toyota Camry",
    "year": 2022,
    "condition": "used",
    "transmission": "automatic",
    "fuelType": "hybrid",
    "engine": "2.5L 4-Cylinder Hybrid",
    "mileage": 15000,
    "price": 28500,
    "note": "Excellent condition, single owner",
    "images": ["https://example.com/car1.jpg"],
    "status": "pending",
    "owner": {
      "_id": "user_id",
      "name": "john_doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Authentication required
- `500`: Internal Server Error

---

### 2. Get Approved Cars (Public)
**GET** `/approved`

Returns all approved car listings. Public endpoint with optional filtering.

**Authentication:** Not required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `year`: Filter by year
- `condition`: Filter by condition
- `transmission`: Filter by transmission
- `fuelType`: Filter by fuel type

**Example Request:**
```
GET /approved?page=1&limit=10&minPrice=20000&maxPrice=50000&condition=used
```

**Response (200):**
```json
{
  "cars": [
    {
      "_id": "car_id",
      "carName": "Toyota Camry",
      "year": 2022,
      "condition": "used",
      "transmission": "automatic",
      "fuelType": "hybrid",
      "engine": "2.5L 4-Cylinder Hybrid",
      "mileage": 15000,
      "price": 28500,
      "note": "Excellent condition",
      "images": ["https://example.com/car1.jpg"],
      "status": "approved",
      "owner": {
        "_id": "user_id",
        "name": "john_doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "formattedPrice": "$28,500.00"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCars": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Single Car
**GET** `/:id`

Returns details of a specific car. Pending cars only visible to owner/admin.

**Authentication:** Optional (required for pending cars)

**Response (200):**
```json
{
  "car": {
    "_id": "car_id",
    "carName": "Toyota Camry",
    "year": 2022,
    "condition": "used",
    "transmission": "automatic",
    "fuelType": "hybrid",
    "engine": "2.5L 4-Cylinder Hybrid",
    "mileage": 15000,
    "price": 28500,
    "note": "Excellent condition",
    "images": ["https://example.com/car1.jpg"],
    "status": "approved",
    "owner": {
      "_id": "user_id",
      "name": "john_doe",
      "email": "john@example.com",
      "role": "customer",
      "phoneNumber": "+1234567890"
    },
    "approvedBy": {
      "_id": "admin_id",
      "name": "admin_user",
      "email": "admin@example.com"
    },
    "approvedAt": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Car not found
- `403`: Access denied (pending car, not owner/admin)

---

### 4. Get My Cars
**GET** `/user/my-cars`

Returns current user's car listings.

**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "cars": [
    {
      "_id": "car_id",
      "carName": "Toyota Camry",
      "status": "approved",
      "price": 28500,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCars": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 5. Update Car
**PUT** `/:id`

Updates a car listing. Only owner can update. Approved cars return to pending after update (unless updated by admin).

**Authentication:** Required (owner only)

**Request Body:** Same as create car (all fields optional)

**Response (200):**
```json
{
  "message": "Car updated successfully",
  "car": {
    "_id": "car_id",
    "carName": "Toyota Camry Hybrid",
    "status": "pending",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Car not found
- `403`: Access denied (not owner)

---

### 6. Get All Cars (Admin Only)
**GET** `/admin/all`

Returns all car listings including pending ones.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "cars": [
    {
      "_id": "car_id",
      "carName": "Toyota Camry",
      "status": "pending",
      "owner": {
        "_id": "user_id",
        "name": "john_doe",
        "email": "john@example.com",
        "role": "customer"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalCars": 73,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: Admin privileges required

---

### 7. Approve Car (Admin Only)
**PUT** `/admin/:id/approve`

Approves a pending car listing.

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "message": "Car approved successfully",
  "car": {
    "_id": "car_id",
    "carName": "Toyota Camry",
    "status": "approved",
    "approvedBy": {
      "_id": "admin_id",
      "name": "admin_user",
      "email": "admin@example.com"
    },
    "approvedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Car not found
- `400`: Car already approved
- `403`: Admin privileges required

---

### 8. Reject Car (Admin Only)
**PUT** `/admin/:id/reject`

Rejects a car listing with optional reason.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Car rejected successfully",
  "car": {
    "_id": "car_id",
    "status": "rejected",
    "rejectionReason": "Images quality too low",
    "rejectedBy": {
      "_id": "admin_id",
      "name": "admin_user",
      "email": "admin@example.com"
    },
    "rejectedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 9. Delete Car
**DELETE** `/:id`

Soft deletes a car listing. Admin can delete any car, users can only delete their own.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Car deleted successfully"
}
```

**Error Responses:**
- `404`: Car not found
- `403`: Access denied

---

## Status Flow

1. **Customer creates car** → Status: `pending`
2. **Admin creates car** → Status: `approved` (auto-approved)
3. **Admin approves car** → Status: `pending` → `approved`
4. **Admin rejects car** → Status: `pending` → `rejected`
5. **Customer updates approved car** → Status: `approved` → `pending` (re-approval needed)
6. **Admin updates any car** → Status remains unchanged

## Field Validations

### Car Name
- Required
- String type
- Trimmed

### Year
- Required
- Number between 1900 and current year + 1

### Condition
- Required
- Enum: `["new", "used", "certified pre-owned"]`

### Transmission
- Required
- Enum: `["automatic", "manual", "cvt"]`

### Fuel Type
- Required
- Enum: `["petrol", "diesel", "electric", "hybrid", "cng", "lpg"]`

### Engine
- Required
- String type
- Trimmed

### Mileage
- Required
- Number, minimum 0

### Price
- Required
- Number, minimum 0

### Note
- Optional
- Maximum 1000 characters
- Trimmed

### Images
- Required
- Array of strings
- At least one image required

## Testing with cURL

### Create Car Example:
```bash
# Development
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "carName": "Toyota Camry",
    "year": 2022,
    "condition": "used",
    "transmission": "automatic",
    "fuelType": "hybrid",
    "engine": "2.5L 4-Cylinder",
    "mileage": 15000,
    "price": 28500,
    "note": "Excellent condition",
    "images": ["https://example.com/car1.jpg"]
  }'
```

### Get Approved Cars Example:
```bash
# Development
curl -X GET "http://localhost:5000/api/cars/approved?page=1&limit=10&minPrice=20000"
```

### Approve Car (Admin) Example:
```bash
# Development
curl -X PUT http://localhost:5000/api/cars/admin/car_id_here/approve \
  -H "Authorization: Bearer admin_jwt_token"
```