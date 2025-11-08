import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    musicKey: {
      type: String,
      required: true,
    },
    coverImageKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add text indexes for better search performance
musicSchema.index({ title: 'text', artist: 'text' });
musicSchema.index({ title: 1 });
musicSchema.index({ artist: 1 });
musicSchema.index({ artistId: 1 });

const music = mongoose.model("music", musicSchema);

export default music;
