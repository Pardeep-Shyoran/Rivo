import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // When created by an artist, these are populated; optional for listener-created playlists
    artist: {
      type: String,
      required: false,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    // Owner of the playlist (artist or listener)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    coverImageKey: {
      type: String,
      required: false,
    },
    musics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "music",
      },
    ],
  },
  { timestamps: true }
);

// Add text indexes for better search performance
playlistSchema.index({ title: 'text', artist: 'text', description: 'text' });
playlistSchema.index({ title: 1 });
playlistSchema.index({ artist: 1 });
playlistSchema.index({ artistId: 1 });
playlistSchema.index({ userId: 1 });

const playlist = mongoose.model("playlist", playlistSchema);

export default playlist;
