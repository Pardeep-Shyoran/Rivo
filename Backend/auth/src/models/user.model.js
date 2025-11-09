import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },
    password: {
      type: String,
      required: function() { return !this.googleId; },
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["listener", "artist"],
      default: "listener",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePictureFileId: {
      type: String,
      default: "",
    },
    preferences: {
      theme: {
        type: String,
        enum: ["dark", "light", "auto"],
        default: "dark",
      },
      language: {
        type: String,
        default: "en",
      },
      audioQuality: {
        type: String,
        enum: ["high", "normal", "low"],
        default: "high",
      },
      explicitContent: {
        type: Boolean,
        default: false,
      },
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      recommendations: {
        type: Boolean,
        default: true,
      },
      analytics: {
        type: Boolean,
        default: true,
      },
      fanMessages: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    privacy: {
      publicProfile: {
        type: Boolean,
        default: true,
      },
      showActivity: {
        type: Boolean,
        default: true,
      },
      shareData: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
