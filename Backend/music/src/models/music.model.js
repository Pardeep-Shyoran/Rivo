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

const music = mongoose.model("music", musicSchema);

export default music;
