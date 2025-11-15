import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    listenerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    artistName: {
      type: String,
      default: null,
      trim: true,
    },
    listenerName: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ listenerId: 1, artistId: 1 }, { unique: true });

const followModel = mongoose.model("follow", followSchema);

export default followModel;
