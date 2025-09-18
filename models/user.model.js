import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {   
    username: {
      type: String,
      required: true,
      unique: true,
    },
    lastName: {
      type: String,
    },
    firstName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    hand: {
      type: Number,
      default: 0,
    },
    profileCode: {
      type: String,
    },
    email: {
      type: String,
    },
    designation: {
      type: String,
    },
    DateOfBirth: {
      type: Date,
    },
    phoneNumber: {
      type: String,
    },
    contactAddress: {
      type: String,
    },
    connectStatus: {
      type: String,
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    notifications: [
      {
        name: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        profilePic: {
          type: String,
        },
        type: {
          type: Boolean,
          required: true,
        },
        status: {
          type: String,
          default: 'pending',
        },
        friendId: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: String,
      default: null,
    },
    sender: {
      type: String,
      default: null
    },
    messageSendTime: {
      type: Date,
      default: null
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
