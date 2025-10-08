import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  getCustomersForAdmin
} from "../controllers/message.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// All message routes require authentication
router.use(protectRoute);

// Send a new message
router.post("/send", sendMessage);

// Get conversations list for current user
router.get("/conversations", getConversations);

// Get messages from a specific conversation
router.get("/conversation/:userId", getMessages);

// Mark message as read
router.put("/:messageId/read", markAsRead);

// Delete a message (soft delete)
router.delete("/:messageId", deleteMessage);

// Get unread messages count
router.get("/unread-count", getUnreadCount);

// Admin only routes
// Get all customers for admin to start conversations
router.get("/customers", adminOnly, getCustomersForAdmin);

export default router;