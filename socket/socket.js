import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express(); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ 
    "http://localhost:3000",],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // Join user to their personal room for direct messages
  if (userId != "undefined") {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room`);
  }

  // Handle joining conversation rooms for messaging
  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  // Handle leaving conversation rooms
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  // Handle message typing indicators
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conversation_${conversationId}`).emit("userTyping", {
      userId,
      isTyping
    });
  });

  // Handle message read receipts
  socket.on("messageRead", ({ messageId, conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit("messageReadReceipt", {
      messageId,
      readBy: userId,
      readAt: new Date()
    });
  });

   socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${userId} joined group ${groupId}`);
  });

   // Handle leaving a group
  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${userId} left group ${groupId}`);
  });

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
