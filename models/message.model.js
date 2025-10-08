import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    attachments: [{
      url: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
      },
      mimeType: {
        type: String,
      }
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // Conversation thread identification
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ isRead: 1, recipient: 1 });
messageSchema.index({ isDeleted: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.sender, this.recipient];
});

// Pre-save middleware to generate conversation ID
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    // Create a consistent conversation ID by sorting user IDs
    const participants = [this.sender.toString(), this.recipient.toString()].sort();
    this.conversationId = participants.join('_');
  }
  next();
});

// Static method to get conversation ID from two user IDs
messageSchema.statics.getConversationId = function(userId1, userId2) {
  const participants = [userId1.toString(), userId2.toString()].sort();
  return participants.join('_');
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
