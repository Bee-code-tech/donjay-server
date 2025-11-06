import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import { sendNewMessageEmail } from "../utils/emailNotifications.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    console.log(`[SEND-MESSAGE] Request from user: ${req.user._id}`);
    
    const { recipientId, content, messageType = "text", replyTo, attachments } = req.body;

    // Validation
    if (!recipientId || !content) {
      return res.status(400).json({
        error: "Recipient ID and content are required"
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Check if messaging is allowed between admin and customer only
    const sender = req.user;
    const isValidConversation = 
      (sender.role === 'admin' && recipient.role === 'customer') ||
      (sender.role === 'customer' && recipient.role === 'admin');

    if (!isValidConversation) {
      return res.status(403).json({ 
        error: "Messages are only allowed between admin and customers" 
      });
    }

    // Create conversation ID
    const conversationId = Message.getConversationId(sender._id, recipientId);

    const newMessage = new Message({
      sender: sender._id,
      recipient: recipientId,
      content,
      messageType,
      attachments: attachments || [],
      replyTo: replyTo || undefined,
      conversationId
    });

    await newMessage.save();
    await newMessage.populate([
      { path: 'sender', select: 'name email role profilePic' },
      { path: 'recipient', select: 'name email role profilePic' },
      { path: 'replyTo', select: 'content sender createdAt' }
    ]);

    // Send real-time notification via socket
    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      // Send email if recipient is offline
      await sendNewMessageEmail(sender, recipient, content).catch(console.error);
    }

    console.log(`[SEND-MESSAGE] Success - Message sent: ${newMessage._id}`);
    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.log(`[SEND-MESSAGE] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get conversations list for current user
export const getConversations = async (req, res) => {
  try {
    console.log(`[GET-CONVERSATIONS] Request from user: ${req.user._id}`);
    
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get unique conversations with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "lastMessage.sender"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.recipient",
          foreignField: "_id",
          as: "lastMessage.recipient"
        }
      },
      {
        $addFields: {
          "lastMessage.sender": { $arrayElemAt: ["$lastMessage.sender", 0] },
          "lastMessage.recipient": { $arrayElemAt: ["$lastMessage.recipient", 0] },
          "otherParticipant": {
            $cond: [
              { $eq: ["$lastMessage.sender._id", userId] },
              { $arrayElemAt: ["$lastMessage.recipient", 0] },
              { $arrayElemAt: ["$lastMessage.sender", 0] }
            ]
          }
        }
      },
      {
        $project: {
          conversationId: "$_id",
          lastMessage: {
            _id: 1,
            content: 1,
            messageType: 1,
            createdAt: 1,
            isRead: 1,
            sender: { _id: 1, name: 1, role: 1, profilePic: 1 },
            recipient: { _id: 1, name: 1, role: 1, profilePic: 1 }
          },
          otherParticipant: { _id: 1, name: 1, role: 1, profilePic: 1, email: 1 },
          unreadCount: 1
        }
      }
    ]);

    console.log(`[GET-CONVERSATIONS] Success - Retrieved ${conversations.length} conversations`);
    res.status(200).json({
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(conversations.length / limit),
        hasNextPage: conversations.length === limit,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-CONVERSATIONS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get messages from a specific conversation
export const getMessages = async (req, res) => {
  try {
    console.log(`[GET-MESSAGES] Request from user: ${req.user._id}`);
    
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if conversation is allowed
    const isValidConversation = 
      (req.user.role === 'admin' && otherUser.role === 'customer') ||
      (req.user.role === 'customer' && otherUser.role === 'admin') ||
      (req.user.role === 'admin' && otherUser.role === 'admin') ||
      (req.user.role === 'customer' && otherUser.role === 'customer'); 

    if (!isValidConversation) {
      return res.status(403).json({ 
        error: "Messages are only allowed between admin and customers" 
      });
    }

    const conversationId = Message.getConversationId(currentUserId, otherUserId);

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .populate('sender', 'name email role profilePic')
    .populate('recipient', 'name email role profilePic')
    .populate('replyTo', 'content sender createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Message.countDocuments({ conversationId, isDeleted: false });

    // Mark messages as read for current user
    await Message.updateMany(
      {
        conversationId,
        recipient: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    console.log(`[GET-MESSAGES] Success - Retrieved ${messages.length} messages`);
    res.status(200).json({
      messages: messages.reverse(), 
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        role: otherUser.role,
        profilePic: otherUser.profilePic,
        email: otherUser.email
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-MESSAGES] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    console.log(`[MARK-READ] Request from user: ${req.user._id}`);
    
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only recipient can mark message as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    console.log(`[MARK-READ] Success - Message marked as read: ${messageId}`);
    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.log(`[MARK-READ] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    console.log(`[DELETE-MESSAGE] Request from user: ${req.user._id}`);
    
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied. You can only delete your own messages." });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    console.log(`[DELETE-MESSAGE] Success - Message deleted: ${messageId}`);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(`[DELETE-MESSAGE] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
  try {
    console.log(`[GET-UNREAD-COUNT] Request from user: ${req.user._id}`);
    
    const unreadCount = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDeleted: false
    });

    console.log(`[GET-UNREAD-COUNT] Success - Unread count: ${unreadCount}`);
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.log(`[GET-UNREAD-COUNT] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all customers for admin to start conversations
export const getCustomersForAdmin = async (req, res) => {
  try {
    console.log(`[GET-CUSTOMERS] Request from admin: ${req.user._id}`);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const searchFilter = search ? {
      role: 'customer',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : { role: 'customer' };

    const customers = await User.find(searchFilter)
      .select('name email profilePic phoneNumber createdAt')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(searchFilter);

    console.log(`[GET-CUSTOMERS] Success - Retrieved ${customers.length} customers`);
    res.status(200).json({
      customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-CUSTOMERS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
