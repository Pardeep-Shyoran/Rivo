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
    role: {
      type: String,
      enum: ["listener", "artist"],
      default: "listener",
    },
  },
  { collection: "users" }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
