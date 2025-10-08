# Messaging API Documentation

## Overview
The messaging system enables communication between administrators and customers. It provides real-time messaging capabilities with features like read receipts, typing indicators, and conversation management.

## Base URL
```
/api/messages
```

## Authentication
All messaging endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Message Types
- **text**: Plain text messages
- **image**: Image attachments
- **file**: File attachments

## User Roles
- **admin**: Can message any customer
- **customer**: Can only message admins

---

## Endpoints

### 1. Send Message
**POST** `/send`

Send a new message to another user.

#### Request Body
```json
{
  "recipientId": "string (required)",
  "content": "string (required, max 2000 chars)",
  "messageType": "string (optional, default: 'text')",
  "replyTo": "string (optional, message ID being replied to)",
  "attachments": [
    {
      "url": "string (required)",
      "fileName": "string (required)",
      "fileSize": "number (optional)",
      "mimeType": "string (optional)"
    }
  ]
}
```

#### Response
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "sender": {
      "_id": "sender_id",
      "name": "Sender Name",
      "email": "sender@email.com",
      "role": "admin|customer",
      "profilePic": "profile_pic_url"
    },
    "recipient": {
      "_id": "recipient_id",
      "name": "Recipient Name",
      "email": "recipient@email.com",
      "role": "admin|customer",
      "profilePic": "profile_pic_url"
    },
    "content": "Message content",
    "messageType": "text",
    "attachments": [],
    "isRead": false,
    "conversationId": "user1_user2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Email Notifications:**
- Recipient receives email notification if offline (no real-time delivery)

---

### 2. Get Conversations
**GET** `/conversations`

Get a list of all conversations for the current user.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Number of conversations per page

#### Response
```json
{
  "conversations": [
    {
      "conversationId": "user1_user2",
      "lastMessage": {
        "_id": "message_id",
        "content": "Last message content",
        "messageType": "text",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isRead": true,
        "sender": {
          "_id": "sender_id",
          "name": "Sender Name",
          "role": "admin",
          "profilePic": "profile_pic_url"
        },
        "recipient": {
          "_id": "recipient_id",
          "name": "Recipient Name",
          "role": "customer",
          "profilePic": "profile_pic_url"
        }
      },
      "otherParticipant": {
        "_id": "other_user_id",
        "name": "Other User Name",
        "role": "admin|customer",
        "profilePic": "profile_pic_url",
        "email": "other@email.com"
      },
      "unreadCount": 3
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Messages
**GET** `/conversation/:userId`

Get all messages from a specific conversation.

#### Path Parameters
- `userId`: The ID of the other user in the conversation

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Number of messages per page

#### Response
```json
{
  "messages": [
    {
      "_id": "message_id",
      "sender": {
        "_id": "sender_id",
        "name": "Sender Name",
        "email": "sender@email.com",
        "role": "admin",
        "profilePic": "profile_pic_url"
      },
      "recipient": {
        "_id": "recipient_id",
        "name": "Recipient Name",
        "email": "recipient@email.com",
        "role": "customer",
        "profilePic": "profile_pic_url"
      },
      "content": "Message content",
      "messageType": "text",
      "attachments": [],
      "isRead": true,
      "readAt": "2024-01-01T00:00:00.000Z",
      "conversationId": "user1_user2",
      "replyTo": {
        "_id": "replied_message_id",
        "content": "Original message being replied to",
        "sender": "original_sender_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "otherUser": {
    "_id": "other_user_id",
    "name": "Other User Name",
    "role": "admin|customer",
    "profilePic": "profile_pic_url",
    "email": "other@email.com"
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalMessages": 127,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 4. Mark Message as Read
**PUT** `/:messageId/read`

Mark a specific message as read (only by the recipient).

#### Path Parameters
- `messageId`: The ID of the message to mark as read

#### Response
```json
{
  "message": "Message marked as read"
}
```

---

### 5. Delete Message
**DELETE** `/:messageId`

Soft delete a message (only by the sender).

#### Path Parameters
- `messageId`: The ID of the message to delete

#### Response
```json
{
  "message": "Message deleted successfully"
}
```

---

### 6. Get Unread Count
**GET** `/unread-count`

Get the total number of unread messages for the current user.

#### Response
```json
{
  "unreadCount": 5
}
```

---

### 7. Get Customers for Admin
**GET** `/customers` (Admin Only)

Get a list of all customers that an admin can message.

#### Query Parameters
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Number of customers per page
- `search` (optional): Search by customer name or email

#### Response
```json
{
  "customers": [
    {
      "_id": "customer_id",
      "name": "Customer Name",
      "email": "customer@email.com",
      "profilePic": "profile_pic_url",
      "phoneNumber": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCustomers": 195,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Real-time Events (Socket.IO)

### Client Events (Send to Server)

#### 1. Join Conversation
```javascript
socket.emit("joinConversation", conversationId);
```

#### 2. Leave Conversation
```javascript
socket.emit("leaveConversation", conversationId);
```

#### 3. Typing Indicator
```javascript
socket.emit("typing", {
  conversationId: "user1_user2",
  isTyping: true // or false
});
```

#### 4. Message Read Receipt
```javascript
socket.emit("messageRead", {
  messageId: "message_id",
  conversationId: "user1_user2"
});
```

### Server Events (Receive from Server)

#### 1. New Message
```javascript
socket.on("newMessage", (message) => {
  // Handle new incoming message
  console.log("New message received:", message);
});
```

#### 2. User Typing
```javascript
socket.on("userTyping", (data) => {
  // Handle typing indicator
  console.log(`User ${data.userId} is typing: ${data.isTyping}`);
});
```

#### 3. Message Read Receipt
```javascript
socket.on("messageReadReceipt", (data) => {
  // Handle read receipt
  console.log(`Message ${data.messageId} read by ${data.readBy} at ${data.readAt}`);
});
```

#### 4. Online Users
```javascript
socket.on("getOnlineUsers", (userIds) => {
  // Handle list of online users
  console.log("Online users:", userIds);
});
```

---

## Email Notifications

The messaging system includes email notifications:

- **New Message**: Recipient receives email notification if they are offline (no real-time delivery)

**Note**: Emails are only sent when the recipient is not connected via WebSocket to avoid duplicate notifications.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Recipient ID and content are required"
}
```

### 403 Forbidden
```json
{
  "error": "Messages are only allowed between admin and customers"
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

### 1. Send a Text Message
```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    recipientId: '607d1f77bcf86cd799439011',
    content: 'Hello! How can I help you today?',
    messageType: 'text'
  })
});
```

### 2. Send a Message with Attachment
```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    recipientId: '607d1f77bcf86cd799439011',
    content: 'Here is the document you requested.',
    messageType: 'file',
    attachments: [{
      url: 'https://example.com/document.pdf',
      fileName: 'invoice.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf'
    }]
  })
});
```

### 3. Reply to a Message
```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    recipientId: '607d1f77bcf86cd799439011',
    content: 'Yes, that works for me!',
    replyTo: '607d1f77bcf86cd799439099'
  })
});
```

### 4. Get Conversations with Pagination
```javascript
const response = await fetch('/api/messages/conversations?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});
```

---

## WebSocket Connection Setup

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  query: {
    userId: 'your_user_id'
  }
});

// Join a conversation
socket.emit('joinConversation', 'user1_user2');

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Send typing indicator
socket.emit('typing', {
  conversationId: 'user1_user2',
  isTyping: true
});
```

---

## Best Practices

1. **Always validate user permissions** before allowing message access
2. **Use pagination** for conversations and messages to improve performance
3. **Implement proper error handling** for network failures
4. **Cache conversation lists** on the client side for better UX
5. **Implement message delivery status** for better user feedback
6. **Use WebSocket events** for real-time features like typing indicators
7. **Regularly clean up old deleted messages** from the database
8. **Implement message encryption** for sensitive conversations
9. **Add rate limiting** to prevent spam
10. **Monitor and log** messaging activities for security purposes