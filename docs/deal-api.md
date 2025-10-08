# Deal Management API Documentation

## Overview
The deal management system handles buy, sell, and swap transactions for cars. It provides a complete workflow from deal creation to completion with admin oversight and real-time notifications.

## Base URL
```
/api/deals
```

## Authentication
All deal endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Deal Types
- **buy**: Customer wants to purchase a car
- **sell**: Customer wants to sell their car
- **swap**: Customer wants to exchange their car for another

## Deal Status Flow
```
pending → approved → completed
pending → rejected
pending → cancelled (deleted)
```

## User Permissions
- **Customers**: Can create, view, and update their own pending deals
- **Admins**: Can view all deals, approve/reject/complete deals, and get statistics

---

## Endpoints

### 1. Create Deal
**POST** `/`

Create a new deal (buy, sell, or swap).

#### Request Body
```json
{
  "dealType": "buy|sell|swap (required)",
  "primaryCarId": "string (required)",
  "secondaryCarId": "string (required for swap deals)",
  "offerPrice": "number (required)",
  "additionalAmount": "number (optional, default: 0)",
  "customerNote": "string (optional, max 1000 chars)",
  "customerContact": {
    "phone": "string (required)",
    "email": "string (required)", 
    "preferredContactMethod": "phone|email|both (optional, default: both)"
  },
  "priority": "low|medium|high|urgent (optional, default: medium)",
  "tags": ["string array (optional)"],
  "expiresAt": "ISO date string (optional)"
}
```

#### Deal Type Rules:
- **Buy Deal**: `primaryCarId` = car customer wants to buy (cannot be own car)
- **Sell Deal**: `primaryCarId` = car customer wants to sell (must be own car)
- **Swap Deal**: `primaryCarId` = car offering, `secondaryCarId` = car wanting

#### Response
```json
{
  "message": "Deal created successfully",
  "deal": {
    "_id": "deal_id",
    "dealRef": "BUY-A1B2C3",
    "dealType": "buy",
    "status": "pending",
    "customer": {
      "_id": "customer_id",
      "name": "Customer Name",
      "email": "customer@email.com",
      "role": "customer",
      "profilePic": "profile_pic_url",
      "phoneNumber": "+1234567890"
    },
    "primaryCar": {
      "_id": "car_id",
      "carName": "Toyota Camry",
      "year": 2020,
      "price": 25000,
      "images": ["image_url"],
      "owner": "owner_id"
    },
    "secondaryCar": null,
    "offerPrice": 23000,
    "additionalAmount": 0,
    "customerNote": "Interested in this car",
    "customerContact": {
      "phone": "+1234567890",
      "email": "customer@email.com",
      "preferredContactMethod": "both"
    },
    "priority": "medium",
    "tags": [],
    "dealHistory": [
      {
        "action": "Deal created - buy",
        "performedBy": "customer_id",
        "performedAt": "2024-01-01T00:00:00.000Z",
        "note": "Interested in this car"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Email Notifications:**
- All admins receive email notification about the new deal

---

### 2. Get All Deals (Admin Only)
**GET** `/admin/all`

Get all deals with filtering and pagination.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of deals per page
- `dealType` (optional): Filter by deal type (buy|sell|swap)
- `status` (optional): Filter by status (pending|approved|rejected|completed|cancelled)
- `priority` (optional): Filter by priority (low|medium|high|urgent)
- `customer` (optional): Filter by customer ID
- `startDate` (optional): Filter deals created after this date
- `endDate` (optional): Filter deals created before this date

#### Response
```json
{
  "deals": [
    {
      "_id": "deal_id",
      "dealRef": "BUY-A1B2C3",
      "dealType": "buy",
      "status": "pending",
      "customer": {
        "_id": "customer_id",
        "name": "Customer Name",
        "email": "customer@email.com",
        "role": "customer",
        "profilePic": "profile_pic_url",
        "phoneNumber": "+1234567890"
      },
      "primaryCar": {
        "_id": "car_id",
        "carName": "Toyota Camry",
        "year": 2020,
        "price": 25000,
        "images": ["image_url"],
        "owner": "owner_id",
        "condition": "used",
        "mileage": 45000
      },
      "offerPrice": 23000,
      "customerNote": "Interested in this car",
      "priority": "medium",
      "dealAge": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDeals": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Single Deal
**GET** `/:id`

Get details of a specific deal. Customers can only view their own deals.

#### Response
```json
{
  "deal": {
    "_id": "deal_id",
    "dealRef": "SWP-D4E5F6",
    "dealType": "swap",
    "status": "approved",
    "customer": {
      "_id": "customer_id",
      "name": "Customer Name",
      "email": "customer@email.com",
      "role": "customer",
      "profilePic": "profile_pic_url",
      "phoneNumber": "+1234567890"
    },
    "primaryCar": {
      "_id": "primary_car_id",
      "carName": "Honda Civic",
      "year": 2019,
      "price": 22000
    },
    "secondaryCar": {
      "_id": "secondary_car_id", 
      "carName": "Toyota Corolla",
      "year": 2021,
      "price": 24000
    },
    "offerPrice": 22000,
    "additionalAmount": 2000,
    "customerNote": "Looking to upgrade",
    "adminNote": "Good swap deal",
    "processedBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "role": "admin"
    },
    "processedAt": "2024-01-02T00:00:00.000Z",
    "dealHistory": [
      {
        "action": "Deal created - swap",
        "performedBy": {
          "_id": "customer_id",
          "name": "Customer Name",
          "role": "customer"
        },
        "performedAt": "2024-01-01T00:00:00.000Z",
        "note": "Looking to upgrade"
      },
      {
        "action": "Status changed to approved",
        "performedBy": {
          "_id": "admin_id",
          "name": "Admin Name", 
          "role": "admin"
        },
        "performedAt": "2024-01-02T00:00:00.000Z",
        "note": "Good swap deal"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 4. Get My Deals
**GET** `/my-deals`

Get current user's deals with filtering and pagination.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of deals per page
- `dealType` (optional): Filter by deal type
- `status` (optional): Filter by status

#### Response
```json
{
  "deals": [
    {
      "_id": "deal_id",
      "dealRef": "SEL-G7H8I9",
      "dealType": "sell",
      "status": "pending",
      "primaryCar": {
        "_id": "car_id",
        "carName": "BMW X5",
        "year": 2018,
        "price": 45000,
        "images": ["image_url"],
        "condition": "used",
        "mileage": 65000
      },
      "offerPrice": 42000,
      "customerNote": "Need to sell quickly",
      "priority": "high",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalDeals": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 5. Update Deal
**PUT** `/:id`

Update a deal. Customers can only update their pending deals, admins can update any deal.

#### Request Body
```json
{
  "offerPrice": 24000,
  "additionalAmount": 1000,
  "customerNote": "Updated offer",
  "priority": "high",
  "tags": ["urgent", "negotiable"],
  "expiresAt": "2024-02-01T00:00:00.000Z"
}
```

#### Response
```json
{
  "message": "Deal updated successfully",
  "deal": {
    // Updated deal object
  }
}
```

---

### 6. Approve Deal (Admin Only)
**PUT** `/admin/:id/approve`

Approve a pending deal.

#### Request Body
```json
{
  "adminNote": "Good deal, customer approved for financing"
}
```

#### Response
```json
{
  "message": "Deal approved successfully",
  "deal": {
    // Updated deal with approved status
  }
}
```

**Email Notifications:**
- Customer receives email confirmation of deal approval

---

### 7. Reject Deal (Admin Only)
**PUT** `/admin/:id/reject`

Reject a pending deal.

#### Request Body
```json
{
  "rejectionReason": "Car no longer available"
}
```

#### Response
```json
{
  "message": "Deal rejected successfully", 
  "deal": {
    // Updated deal with rejected status
  }
}
```

**Email Notifications:**
- Customer receives email notification with rejection reason

---

### 8. Complete Deal (Admin Only)
**PUT** `/admin/:id/complete`

Mark an approved deal as completed.

#### Request Body
```json
{
  "adminNote": "Payment received, ownership transferred"
}
```

#### Response
```json
{
  "message": "Deal completed successfully",
  "deal": {
    // Updated deal with completed status
  }
}
```

**Email Notifications:**
- Customer receives email confirmation of deal completion

---

### 9. Delete Deal
**DELETE** `/:id`

Soft delete a deal (marks as cancelled). Customers can only delete pending deals.

#### Response
```json
{
  "message": "Deal deleted successfully"
}
```

---

### 10. Get Deal Statistics (Admin Only)
**GET** `/admin/stats`

Get comprehensive deal statistics and analytics.

#### Response
```json
{
  "dealTypeStats": [
    {
      "_id": "buy",
      "statuses": [
        {
          "status": "pending",
          "count": 15,
          "totalValue": 375000
        },
        {
          "status": "completed",
          "count": 8,
          "totalValue": 200000
        }
      ],
      "totalDeals": 23,
      "totalValue": 575000
    }
  ],
  "summary": {
    "totalDeals": 156,
    "pendingDeals": 42,
    "completedDeals": 67,
    "rejectedDeals": 23,
    "approvedDeals": 24
  },
  "recentDeals": [
    {
      "_id": "deal_id",
      "dealType": "buy",
      "status": "pending",
      "offerPrice": 25000,
      "customer": {
        "_id": "customer_id",
        "name": "John Doe",
        "email": "john@email.com"
      },
      "primaryCar": {
        "_id": "car_id",
        "carName": "Toyota Camry",
        "year": 2020,
        "price": 27000
      },
      "createdAt": "2024-01-05T00:00:00.000Z"
    }
  ]
}
```

---

## Real-time Events (Socket.IO)

### Client Events (Send to Server)

#### 1. Join Deal Room
```javascript
socket.emit("joinDealRoom", dealId);
```

#### 2. Leave Deal Room
```javascript
socket.emit("leaveDealRoom", dealId);
```

#### 3. Deal Status Update
```javascript
socket.emit("dealStatusUpdate", {
  dealId: "deal_id",
  status: "approved",
  note: "Admin notes"
});
```

### Server Events (Receive from Server)

#### 1. New Deal Created
```javascript
socket.on("newDeal", (data) => {
  console.log("New deal created:", data.deal);
  console.log("Message:", data.message);
});
```

#### 2. Deal Status Updates
```javascript
socket.on("dealStatusUpdate", (data) => {
  console.log(`Deal ${data.dealId} status: ${data.newStatus}`);
  console.log("Message:", data.message);
});
```

#### 3. Deal Approved
```javascript
socket.on("dealApproved", (data) => {
  console.log("Deal approved:", data.deal);
  console.log("Message:", data.message);
});
```

#### 4. Deal Rejected
```javascript
socket.on("dealRejected", (data) => {
  console.log("Deal rejected:", data.deal);
  console.log("Reason:", data.reason);
});
```

#### 5. Deal Completed
```javascript
socket.on("dealCompleted", (data) => {
  console.log("Deal completed:", data.deal);
  console.log("Message:", data.message);
});
```

#### 6. Deal Status Changed
```javascript
socket.on("dealStatusChanged", (data) => {
  console.log(`Deal ${data.dealId} status changed to ${data.status}`);
  console.log(`Updated by: ${data.updatedBy} at ${data.updatedAt}`);
});
```

---

## Email Notifications

The system automatically sends email notifications for key deal events:

- **Deal Created**: All admins receive email notification about new deals
- **Deal Approved**: Customer receives email confirmation of approval
- **Deal Rejected**: Customer receives email with rejection reason
- **Deal Completed**: Customer receives email confirmation of completion

**Note**: All emails are sent asynchronously and failures won't affect API responses.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: dealType, primaryCarId, offerPrice, customerContact"
}
```

### 403 Forbidden
```json
{
  "error": "You can only create sell deals for cars you own"
}
```

### 404 Not Found
```json
{
  "error": "Primary car not found or not approved"
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

### 1. Create a Buy Deal
```javascript
const response = await fetch('/api/deals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    dealType: 'buy',
    primaryCarId: '607d1f77bcf86cd799439011',
    offerPrice: 23000,
    customerContact: {
      phone: '+1234567890',
      email: 'customer@email.com',
      preferredContactMethod: 'both'
    },
    customerNote: 'Very interested in this car',
    priority: 'high'
  })
});
```

### 2. Create a Swap Deal
```javascript
const response = await fetch('/api/deals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    dealType: 'swap',
    primaryCarId: '607d1f77bcf86cd799439011', // Car offering
    secondaryCarId: '607d1f77bcf86cd799439022', // Car wanting
    offerPrice: 22000,
    additionalAmount: 2000, // Additional money offering
    customerContact: {
      phone: '+1234567890',
      email: 'customer@email.com'
    },
    customerNote: 'Looking to swap my car for this one',
    tags: ['swap', 'upgrade']
  })
});
```

### 3. Admin: Get All Pending Deals
```javascript
const response = await fetch('/api/deals/admin/all?status=pending&page=1&limit=20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer admin_jwt_token'
  }
});
```

### 4. Admin: Approve a Deal
```javascript
const response = await fetch('/api/deals/admin/deal_id/approve', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_jwt_token'
  },
  body: JSON.stringify({
    adminNote: 'Customer verification completed, deal approved'
  })
});
```

---

## Business Logic Rules

### Deal Creation Rules:
1. **Buy Deals**: Customer cannot buy their own car
2. **Sell Deals**: Customer can only sell cars they own
3. **Swap Deals**: Both cars must be approved and active
4. All referenced cars must have `status: 'approved'` and `isActive: true`

### Permission Rules:
1. **Customers**: Can only view/edit their own deals
2. **Customers**: Can only update/delete pending deals
3. **Admins**: Can view and modify all deals
4. **Admins**: Can approve/reject/complete deals

### Status Transition Rules:
1. `pending` → `approved` (admin only)
2. `pending` → `rejected` (admin only) 
3. `approved` → `completed` (admin only)
4. `pending` → `cancelled` (delete action)

### Validation Rules:
1. Offer price must be positive number
2. Customer contact information required
3. Secondary car required for swap deals
4. Rejection reason required when rejecting deals

---

## WebSocket Connection Setup

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  query: {
    userId: 'your_user_id'
  }
});

// Join a deal room for real-time updates
socket.emit('joinDealRoom', 'deal_id');

// Listen for deal updates
socket.on('dealStatusUpdate', (data) => {
  console.log('Deal status updated:', data);
});

socket.on('newDeal', (data) => {
  console.log('New deal created:', data);
});
```

---

## Best Practices

1. **Always validate car ownership** for sell deals
2. **Check car approval status** before deal creation
3. **Use pagination** for deal lists to improve performance
4. **Implement proper error handling** for all API calls
5. **Cache deal statistics** for admin dashboards
6. **Use real-time events** for better user experience
7. **Implement deal expiry** for time-sensitive offers
8. **Add deal history tracking** for audit purposes
9. **Use deal reference numbers** for customer communication
10. **Monitor deal conversion rates** for business insights