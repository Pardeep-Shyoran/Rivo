import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
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
    required: true,
  },
  musics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "music",
    },
  ],
});

// Add text indexes for better search performance
playlistSchema.index({ title: 'text', artist: 'text' });
playlistSchema.index({ title: 1 });
playlistSchema.index({ artist: 1 });
playlistSchema.index({ artistId: 1 });

const playlist = mongoose.model("playlist", playlistSchema);

export default playlist;
