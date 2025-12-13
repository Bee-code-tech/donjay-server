# DonJay Autos - Car Marketplace Platform

Welcome to the DonJay Autos backend API documentation. This platform facilitates car buying, selling, and swapping with integrated communication and vehicle inspection services.

## Table of Contents

1. [Authentication API](./docs/auth.md)
2. [Car Listings API](./docs/cars.md)
3. [Deal Management API](./docs/deal-api.md)
4. [Messaging API](./docs/messaging-api.md)
5. [Inspection Booking API](./docs/inspection-api.md)
6. [Users Management API](./docs/users-api.md)
7. [Admin Invitation API](./docs/invite-api.md)

## Core Features

### User Authentication System
- Complete user registration with OTP email verification
- Secure login/logout functionality
- Password reset and change capabilities
- Role-based access control (customer/admin)
- JWT token authentication with HTTP-only cookies

### Car Listing Management
- Create, view, update, and delete car listings
- Approval workflow for car listings (pending → approved/rejected)
- Detailed car information (make, model, year, condition, transmission, fuel type, etc.)
- Image upload integration with Cloudinary
- Filtering and search capabilities

### Deal Management System
- Three deal types: Buy, Sell, and Swap
- Complete workflow: pending → approved → completed or pending → rejected
- Real-time notifications via Socket.IO
- Email notifications for all deal events
- Priority levels and tagging system
- Admin oversight with statistics dashboard

### Messaging System
- Real-time chat between customers and admins
- Message types: text, images, and file attachments
- Read receipts and typing indicators
- Conversation management
- Email notifications for offline users

### Vehicle Inspection Booking
- Schedule car inspections with time slot management
- Automated time slot generation (morning, afternoon, night periods)
- Inspection workflow: pending → confirmed → in-progress → completed
- Detailed inspection reports with condition ratings
- Rescheduling capabilities

### User Management (Admin Only)
- View all users on the platform
- Get detailed information about specific users
- Suspend/un-suspend user accounts
- Delete user accounts permanently

### Admin Invitation System (Admin Only)
- Invite new administrators via email
- Automatic account creation with default credentials
- Welcome email with login information

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Real-time Communication**: Socket.IO
- **File Storage**: Cloudinary (via multer-storage-cloudinary)
- **Email Service**: Nodemailer
- **Environment Management**: dotenv

### Key Integrations
- **Cloudinary**: For image and file storage
- **Socket.IO**: For real-time messaging and notifications
- **Nodemailer**: For email notifications

## Getting Started

### Prerequisites
- Node.js v14 or higher
- MongoDB database
- Cloudinary account
- Gmail account for email notifications

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start the development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo (Sendinblue) API Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email@donjayautos.com
```

## API Endpoints Overview

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `/api/auth` | User authentication and account management |
| Cars | `/api/cars` | Car listing operations |
| Deals | `/api/deals` | Transaction/offer handling |
| Messages | `/api/messages` | Real-time chat functionality |
| Inspections | `/api/inspections` | Vehicle inspection booking |
| Users | `/api/users` | User management (admin only) |
| Invite | `/api/invite` | Admin invitation system (admin only) |

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or open an issue in the repository.