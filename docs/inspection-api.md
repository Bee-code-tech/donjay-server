# Inspection Booking API Documentation

## Overview
The inspection booking system allows customers to schedule car inspections with automatic time slot management and admin oversight.

## Base URL
```
/api/inspections
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Time Periods
- **morning**: 9:00 AM - 12:00 PM (6 slots)
- **afternoon**: 1:00 PM - 5:00 PM (8 slots)  
- **night**: 6:00 PM - 8:00 PM (4 slots)

## Inspection Status Flow
```
pending → confirmed → in-progress → completed
pending → cancelled
pending → rescheduled → confirmed
```

---

## Endpoints

### 1. Book Inspection
**POST** `/book`

Book a new inspection for an approved car.

#### Request Body
```json
{
  "carId": "string (required)",
  "inspectionDate": "2024-01-15 (required)",
  "timeSlot": {
    "startTime": "10:00 (required)",
    "endTime": "10:30 (required)",
    "period": "morning|afternoon|night (required)"
  },
  "customerNotes": "string (optional, max 500 chars)"
}
```

#### Response
```json
{
  "message": "Inspection booked successfully",
  "inspection": {
    "_id": "inspection_id",
    "inspectionRef": "INS-20240115-A1B2",
    "customer": {
      "_id": "customer_id",
      "name": "John Doe",
      "email": "john@email.com",
      "phoneNumber": "+1234567890"
    },
    "car": {
      "_id": "car_id",
      "carName": "Toyota Camry",
      "year": 2020,
      "price": 25000,
      "images": ["image_url"],
      "owner": "owner_id"
    },
    "inspectionDate": "2024-01-15T00:00:00.000Z",
    "timeSlot": {
      "startTime": "10:00",
      "endTime": "10:30",
      "period": "morning"
    },
    "status": "pending",
    "customerNotes": "First time inspection",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get Available Time Slots
**GET** `/available-slots?date=2024-01-15`

Get available time slots for a specific date.

#### Query Parameters
- `date` (required): Date in YYYY-MM-DD format

#### Response
```json
{
  "date": "2024-01-15",
  "slots": [
    {
      "period": "morning",
      "availableSlots": [
        {
          "startTime": "09:00",
          "endTime": "09:30",
          "isBooked": false
        },
        {
          "startTime": "09:30",
          "endTime": "10:00",
          "isBooked": false
        }
      ],
      "totalSlots": 6,
      "bookedSlots": 1
    },
    {
      "period": "afternoon",
      "availableSlots": [
        {
          "startTime": "13:00",
          "endTime": "13:30",
          "isBooked": false
        }
      ],
      "totalSlots": 8,
      "bookedSlots": 3
    },
    {
      "period": "night",
      "availableSlots": [
        {
          "startTime": "18:00",
          "endTime": "18:30",
          "isBooked": false
        }
      ],
      "totalSlots": 4,
      "bookedSlots": 0
    }
  ]
}
```

---

### 3. Get My Inspections
**GET** `/my-inspections`

Get current user's inspections with pagination.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of inspections per page
- `status` (optional): Filter by status

#### Response
```json
{
  "inspections": [
    {
      "_id": "inspection_id",
      "inspectionRef": "INS-20240115-A1B2",
      "car": {
        "_id": "car_id",
        "carName": "Honda Civic",
        "year": 2019,
        "price": 22000,
        "images": ["image_url"],
        "owner": "owner_id",
        "condition": "used"
      },
      "inspectionDate": "2024-01-15T00:00:00.000Z",
      "timeSlot": {
        "startTime": "14:00",
        "endTime": "14:30",
        "period": "afternoon"
      },
      "status": "confirmed",
      "customerNotes": "Need thorough check",
      "inspector": {
        "_id": "inspector_id",
        "name": "Inspector Name",
        "email": "inspector@email.com"
      },
      "confirmedAt": "2024-01-02T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalInspections": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 4. Get Inspection by ID
**GET** `/:id`

Get details of a specific inspection.

#### Response
```json
{
  "inspection": {
    "_id": "inspection_id",
    "inspectionRef": "INS-20240115-A1B2",
    "customer": {
      "_id": "customer_id",
      "name": "John Doe",
      "email": "john@email.com",
      "phoneNumber": "+1234567890"
    },
    "car": {
      "_id": "car_id",
      "carName": "BMW X5",
      "year": 2018,
      "price": 45000,
      "images": ["image_url"],
      "condition": "used",
      "mileage": 65000
    },
    "inspectionDate": "2024-01-15T00:00:00.000Z",
    "timeSlot": {
      "startTime": "10:00",
      "endTime": "10:30",
      "period": "morning"
    },
    "status": "completed",
    "customerNotes": "Interested in purchasing",
    "inspectorNotes": "Overall good condition",
    "inspectionReport": {
      "overallCondition": "good",
      "exteriorCondition": "good",
      "interiorCondition": "excellent",
      "engineCondition": "good",
      "issues": ["Minor scratches on bumper"],
      "recommendations": ["Replace brake pads soon"],
      "images": ["report_image_url"],
      "estimatedValue": 42000
    },
    "inspector": {
      "_id": "inspector_id",
      "name": "Inspector Name",
      "email": "inspector@email.com"
    },
    "confirmedAt": "2024-01-02T00:00:00.000Z",
    "completedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Reschedule Inspection
**PUT** `/:id/reschedule`

Reschedule an existing inspection to a new date/time.

#### Request Body
```json
{
  "newDate": "2024-01-16 (required)",
  "newTimeSlot": {
    "startTime": "14:00 (required)",
    "endTime": "14:30 (required)",
    "period": "afternoon (required)"
  },
  "reason": "string (required, max 300 chars)"
}
```

#### Response
```json
{
  "message": "Inspection rescheduled successfully",
  "inspection": {
    "_id": "inspection_id",
    "inspectionDate": "2024-01-16T00:00:00.000Z",
    "timeSlot": {
      "startTime": "14:00",
      "endTime": "14:30",
      "period": "afternoon"
    },
    "status": "rescheduled",
    "rescheduledFrom": {
      "originalDate": "2024-01-15T00:00:00.000Z",
      "originalTimeSlot": {
        "startTime": "10:00",
        "endTime": "10:30",
        "period": "morning"
      },
      "reason": "Schedule conflict"
    }
  }
}
```

**Email Notifications:**
- Customer and car owner receive email with new schedule details

**Email Notifications:**
- Customer and car owner receive email with new schedule details

---

### 6. Cancel Inspection
**PUT** `/:id/cancel`

Cancel an inspection.

#### Request Body
```json
{
  "reason": "string (optional)"
}
```

#### Response
```json
{
  "message": "Inspection cancelled successfully"
}
```

---

### 7. Get All Inspections (Admin Only)
**GET** `/admin/all`

Get all inspections with filtering and pagination.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of inspections per page
- `status` (optional): Filter by status
- `customer` (optional): Filter by customer ID
- `inspector` (optional): Filter by inspector ID
- `startDate` (optional): Filter inspections after this date
- `endDate` (optional): Filter inspections before this date

#### Response
```json
{
  "inspections": [
    {
      "_id": "inspection_id",
      "inspectionRef": "INS-20240115-A1B2",
      "customer": {
        "_id": "customer_id",
        "name": "John Doe",
        "email": "john@email.com",
        "phoneNumber": "+1234567890"
      },
      "car": {
        "_id": "car_id",
        "carName": "Toyota Camry",
        "year": 2020,
        "price": 25000,
        "images": ["image_url"],
        "owner": "owner_id",
        "condition": "used"
      },
      "inspectionDate": "2024-01-15T00:00:00.000Z",
      "timeSlot": {
        "startTime": "10:00",
        "endTime": "10:30",
        "period": "morning"
      },
      "status": "pending",
      "customerNotes": "First inspection",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalInspections": 147,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 8. Confirm Inspection (Admin Only)
**PUT** `/admin/:id/confirm`

Confirm a pending inspection and assign an inspector.

#### Request Body
```json
{
  "inspectorId": "string (optional)"
}
```

#### Response
```json
{
  "message": "Inspection confirmed successfully",
  "inspection": {
    "_id": "inspection_id",
    "status": "confirmed",
    "inspector": {
      "_id": "inspector_id",
      "name": "Inspector Name",
      "email": "inspector@email.com"
    },
    "confirmedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Email Notifications:**
- Customer receives email confirmation with inspection details

---

### 9. Complete Inspection (Admin Only)
**PUT** `/admin/:id/complete`

Complete an inspection with a detailed report.

#### Request Body
```json
{
  "inspectionReport": {
    "overallCondition": "excellent|good|fair|poor (required)",
    "exteriorCondition": "excellent|good|fair|poor (required)",
    "interiorCondition": "excellent|good|fair|poor (required)",
    "engineCondition": "excellent|good|fair|poor (required)",
    "issues": ["string array (optional)"],
    "recommendations": ["string array (optional)"],
    "images": ["string array (optional)"],
    "estimatedValue": "number (optional)"
  },
  "inspectorNotes": "string (optional, max 1000 chars)"
}
```

#### Response
```json
{
  "message": "Inspection completed successfully",
  "inspection": {
    "_id": "inspection_id",
    "status": "completed",
    "inspectionReport": {
      "overallCondition": "good",
      "exteriorCondition": "good",
      "interiorCondition": "excellent",
      "engineCondition": "fair",
      "issues": ["Engine oil needs change", "Front tire wear"],
      "recommendations": ["Service due in 2 months", "Replace tires"],
      "images": ["report1.jpg", "report2.jpg"],
      "estimatedValue": 23000
    },
    "inspectorNotes": "Comprehensive inspection completed",
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Email Notifications:**
- Customer and car owner receive email notification with inspection report

---

## Real-time Events (Socket.IO)

### Client Events (Send to Server)

#### 1. Join Inspection Room
```javascript
socket.emit("joinInspectionRoom", inspectionId);
```

#### 2. Leave Inspection Room
```javascript
socket.emit("leaveInspectionRoom", inspectionId);
```

### Server Events (Receive from Server)

#### 1. New Inspection Booked
```javascript
socket.on("newInspectionBooked", (data) => {
  console.log("New inspection booked:", data.inspection);
  console.log("Message:", data.message);
});
```

#### 2. Inspection Confirmed
```javascript
socket.on("inspectionConfirmed", (data) => {
  console.log("Inspection confirmed:", data.inspection);
  console.log("Message:", data.message);
});
```

#### 3. Inspection Completed
```javascript
socket.on("inspectionCompleted", (data) => {
  console.log("Inspection completed:", data.inspection);
  console.log("Message:", data.message);
});
```

#### 4. Inspection Rescheduled
```javascript
socket.on("inspectionRescheduled", (data) => {
  console.log("Inspection rescheduled:", data.inspection);
  console.log("Message:", data.message);
});
```

---

## Email Notifications

The system automatically sends email notifications for inspection events:

- **Inspection Booked**: All admins and car owner (if different from customer) receive notification
- **Inspection Confirmed**: Customer receives email confirmation with details
- **Inspection Completed**: Customer and car owner receive email with inspection report
- **Inspection Rescheduled**: Customer and car owner receive email with new schedule

**Note**: All emails are sent asynchronously and failures won't affect API responses.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: carId, inspectionDate, timeSlot"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Car not found or not approved"
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

### 1. Book Morning Inspection
```javascript
const response = await fetch('/api/inspections/book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    carId: '607d1f77bcf86cd799439011',
    inspectionDate: '2024-01-15',
    timeSlot: {
      startTime: '09:30',
      endTime: '10:00',
      period: 'morning'
    },
    customerNotes: 'Interested in buying this car'
  })
});
```

### 2. Check Available Slots
```javascript
const response = await fetch('/api/inspections/available-slots?date=2024-01-15', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});
```

### 3. Reschedule Inspection
```javascript
const response = await fetch('/api/inspections/inspection_id/reschedule', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    newDate: '2024-01-16',
    newTimeSlot: {
      startTime: '14:00',
      endTime: '14:30',
      period: 'afternoon'
    },
    reason: 'Previous appointment conflict'
  })
});
```

### 4. Admin: Complete Inspection
```javascript
const response = await fetch('/api/inspections/admin/inspection_id/complete', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_jwt_token'
  },
  body: JSON.stringify({
    inspectionReport: {
      overallCondition: 'good',
      exteriorCondition: 'good',
      interiorCondition: 'excellent',
      engineCondition: 'fair',
      issues: ['Minor exterior scratches'],
      recommendations: ['Regular maintenance recommended'],
      estimatedValue: 23000
    },
    inspectorNotes: 'Thorough inspection completed successfully'
  })
});
```

---

## Time Slot Management

### Automatic Slot Generation
The system automatically generates time slots for each day:

**Morning (9:00 AM - 12:00 PM):**
- 09:00-09:30, 09:30-10:00, 10:00-10:30
- 10:30-11:00, 11:00-11:30, 11:30-12:00

**Afternoon (1:00 PM - 5:00 PM):**
- 13:00-13:30, 13:30-14:00, 14:00-14:30, 14:30-15:00
- 15:00-15:30, 15:30-16:00, 16:00-16:30, 16:30-17:00

**Night (6:00 PM - 8:00 PM):**
- 18:00-18:30, 18:30-19:00, 19:00-19:30, 19:30-20:00

### Slot Release Rules
- Slots are released when inspection is completed
- Slots are released when inspection is cancelled
- Rescheduling releases old slot and books new slot
- No manual slot management required

---

## Business Rules

### Booking Rules
1. Can only book inspections for approved cars
2. Cannot book inspections for past dates
3. Each time slot is exactly 30 minutes
4. Maximum one inspection per time slot
5. Customers can book multiple inspections for different cars

### Rescheduling Rules
1. Cannot reschedule completed inspections
2. Must provide reason for rescheduling
3. New slot must be available and in the future
4. Original slot is automatically released

### Access Control
1. Customers can only view/modify their own inspections
2. Admins can view and manage all inspections
3. Only admins can confirm and complete inspections
4. Both customers and admins can cancel inspections

---

## WebSocket Connection Setup

```javascript
import io from 'socket.io-client';

// Development
const socket = io('http://localhost:5000', {
  query: {
    userId: 'your_user_id'
  }
});

// Production
// const socket = io('https://donjay-server.vercel.app', {
//   query: {
//     userId: 'your_user_id'
//   }
// });

// Join inspection room for real-time updates
socket.emit('joinInspectionRoom', 'inspection_id');

// Listen for inspection updates
socket.on('inspectionConfirmed', (data) => {
  console.log('Inspection confirmed:', data);
});

socket.on('inspectionCompleted', (data) => {
  console.log('Inspection completed:', data);
});
```